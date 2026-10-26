/// <reference types="node" />
// Busca fotos con licencia libre en Wikimedia Commons para cada receta y
// aparato de fotos-busquedas.ts, las guarda en assets/fotos/ y genera
// src/data/fotos.ts con la imagen y su crédito.
//
// Uso: npm run fotos            (solo busca las que faltan o cambiaron)
//      npm run fotos -- --todas  (vuelve a buscar todas)

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { BUSQUEDAS_FOTOS } from './fotos-busquedas';

const RAIZ = join(__dirname, '..');
const CARPETA = join(RAIZ, 'assets', 'fotos');
const ELEGIDAS = join(__dirname, 'fotos-elegidas.json');
const SALIDA = join(RAIZ, 'src', 'data', 'fotos.ts');
const API = 'https://commons.wikimedia.org/w/api.php';
const AGENTE = 'SuperRecetas/0.1 (https://github.com/FunworkAK/Super; app familiar de recetas)';
const ANCHO = 640;

interface Elegida {
  consulta: string;
  archivo: string;
  ruta: string;
  autor: string;
  licencia: string;
  pagina: string;
}

interface PaginaCommons {
  title: string;
  index: number;
  imageinfo?: {
    thumburl: string;
    thumbwidth: number;
    thumbheight: number;
    mime: string;
    descriptionurl: string;
    extmetadata?: Record<string, { value: string }>;
  }[];
}

const texto = (html = '') =>
  html
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

async function consultar(params: Record<string, string>): Promise<PaginaCommons[]> {
  const url = `${API}?${new URLSearchParams({
    action: 'query',
    format: 'json',
    prop: 'imageinfo',
    iiprop: 'url|mime|extmetadata',
    iiurlwidth: String(ANCHO),
    ...params,
  })}`;
  const res = await fetch(url, { headers: { 'user-agent': AGENTE } });
  if (!res.ok) throw new Error(`${res.status} en ${url}`);
  const json = (await res.json()) as { query?: { pages?: Record<string, PaginaCommons> } };
  return Object.values(json.query?.pages ?? {}).sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
}

// Fotos (no dibujos ni íconos) horizontales, con licencia libre.
function sirve(p: PaginaCommons): boolean {
  const info = p.imageinfo?.[0];
  if (!info || !/jpeg|png|webp/.test(info.mime)) return false;
  if (info.thumbwidth < 400 || info.thumbheight > info.thumbwidth * 1.1) return false;
  const licencia = info.extmetadata?.LicenseShortName?.value ?? '';
  return /cc|public domain|dominio público|pd/i.test(licencia);
}

async function buscar(termino: string): Promise<PaginaCommons | null> {
  if (termino.startsWith('File:')) return (await consultar({ titles: termino }))[0] ?? null;
  const paginas = await consultar({
    generator: 'search',
    gsrsearch: `${termino} filetype:bitmap`,
    gsrnamespace: '6',
    gsrlimit: '15',
  });
  return paginas.find(sirve) ?? null;
}

async function main() {
  const todas = process.argv.includes('--todas');
  const elegidas: Record<string, Elegida> = existsSync(ELEGIDAS) ? JSON.parse(readFileSync(ELEGIDAS, 'utf8')) : {};

  for (const [id, terminos] of Object.entries(BUSQUEDAS_FOTOS)) {
    const consulta = terminos.join(' | ');
    const previa = elegidas[id];
    if (!todas && previa?.consulta === consulta && existsSync(join(RAIZ, previa.ruta))) continue;

    let pagina: PaginaCommons | null = null;
    for (const t of terminos) {
      try {
        pagina = await buscar(t);
      } catch (e) {
        console.warn(`  ${id}: ${(e as Error).message}`);
      }
      if (pagina) break;
      await new Promise((r) => setTimeout(r, 300));
    }
    const info = pagina?.imageinfo?.[0];
    if (!pagina || !info) {
      console.log(`✗ ${id}: sin resultados`);
      delete elegidas[id];
      continue;
    }

    const ext = info.mime.includes('png') ? 'png' : info.mime.includes('webp') ? 'webp' : 'jpg';
    const ruta = `assets/fotos/${id}.${ext}`;
    const img = await fetch(info.thumburl, { headers: { 'user-agent': AGENTE } });
    if (!img.ok) {
      console.log(`✗ ${id}: no se pudo descargar (${img.status})`);
      continue;
    }
    writeFileSync(join(RAIZ, ruta), Buffer.from(await img.arrayBuffer()));
    const meta = info.extmetadata ?? {};
    elegidas[id] = {
      consulta,
      archivo: pagina.title,
      ruta,
      autor: texto(meta.Artist?.value) || 'Desconocido',
      licencia: texto(meta.LicenseShortName?.value),
      pagina: info.descriptionurl,
    };
    console.log(`✓ ${id}: ${pagina.title}`);
    await new Promise((r) => setTimeout(r, 300));
  }

  writeFileSync(ELEGIDAS, JSON.stringify(elegidas, null, 2) + '\n');

  const filas = Object.entries(elegidas)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(
      ([id, e]) =>
        `  '${id}': { src: require('../../${e.ruta}'), autor: ${JSON.stringify(e.autor)}, licencia: ${JSON.stringify(e.licencia)}, pagina: ${JSON.stringify(e.pagina)} },`,
    );
  writeFileSync(
    SALIDA,
    `// Generado por scraper/fotos.ts a partir de Wikimedia Commons. No editar a mano.\n` +
      `import type { ImageSourcePropType } from 'react-native';\n\n` +
      `export interface Foto {\n  src: ImageSourcePropType;\n  autor: string;\n  licencia: string;\n  pagina: string;\n}\n\n` +
      `export const FOTOS: Record<string, Foto> = {\n${filas.join('\n')}\n};\n`,
  );
  console.log(`${filas.length} fotos en src/data/fotos.ts`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
