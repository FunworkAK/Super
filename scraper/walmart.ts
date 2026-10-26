/// <reference types="node" />
// Extractor de precios de Walmart Guatemala (walmart.com.gt).
//
// Walmart Centroamérica usa la plataforma VTEX, que expone un buscador de
// catálogo público en JSON. Por cada ingrediente de busquedas.ts se busca el
// término, se filtran los resultados por palabras clave, se calcula el tamaño
// de la presentación y se guarda la más barata por unidad.
//
// Uso: npm run precios:walmart
// Escribe src/data/precios-extraidos.json (conserva los de otras tiendas).

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { INGREDIENTES_POR_ID } from '../src/data/ingredientes';
import { PRECIOS_ESTIMADOS } from '../src/data/precios';
import type { ProductoTienda } from '../src/domain/types';
import { BUSQUEDAS } from './busquedas';
import { tamanoDesdeNombre } from './tamano';

const BASE = process.env.WALMART_GT_URL ?? 'https://www.walmart.com.gt';
const SALIDA = join(__dirname, '..', 'src', 'data', 'precios-extraidos.json');
const PAUSA_MS = 1500; // ser amables con el sitio

interface ProductoVtex {
  productName: string;
  items: {
    name: string;
    sellers: { commertialOffer: { Price: number; AvailableQuantity: number } }[];
  }[];
}

async function buscar(termino: string): Promise<ProductoVtex[]> {
  const url = `${BASE}/api/catalog_system/pub/products/search?ft=${encodeURIComponent(termino)}&_from=0&_to=29`;
  const res = await fetch(url, {
    headers: { 'user-agent': 'super-recetas/0.1 (comparador de precios personal)', accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} en ${url}`);
  return (await res.json()) as ProductoVtex[];
}

// Precio de referencia por unidad base, para descartar coincidencias absurdas
// (p. ej. "Ayote Mantequilla" al buscar mantequilla).
function referencia(ingredienteId: string): number | null {
  const p = PRECIOS_ESTIMADOS.find((x) => x.tienda === 'walmart' && x.ingredienteId === ingredienteId);
  return p ? p.precio / p.tamano : null;
}
const RANGO_ACEPTABLE = [0.25, 4];

const dormir = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const hoy = new Date().toISOString().slice(0, 10);
  const encontrados: ProductoTienda[] = [];
  const fallidos: string[] = [];

  for (const b of BUSQUEDAS) {
    const ing = INGREDIENTES_POR_ID[b.ingredienteId];
    if (!ing) throw new Error(`Ingrediente desconocido en busquedas.ts: ${b.ingredienteId}`);
    try {
      const productos = await buscar(b.termino);
      let mejor: ProductoTienda | null = null;
      for (const p of productos) {
        const nombre = p.productName.toLowerCase();
        if (!b.incluir.every((k) => nombre.includes(k))) continue;
        if (b.excluir?.some((k) => nombre.includes(k))) continue;
        for (const item of p.items) {
          const oferta = item.sellers[0]?.commertialOffer;
          if (!oferta || oferta.AvailableQuantity <= 0 || oferta.Price <= 0) continue;
          // measurementUnit/unitMultiplier de VTEX no son confiables en este
          // sitio; el tamaño se lee del nombre.
          const tamano = tamanoDesdeNombre(p.productName, ing.unidad) ?? tamanoDesdeNombre(item.name, ing.unidad);
          if (!tamano) continue;
          const ref = referencia(ing.id);
          const proporcion = ref ? oferta.Price / tamano / ref : 1;
          if (proporcion < RANGO_ACEPTABLE[0] || proporcion > RANGO_ACEPTABLE[1]) {
            console.log(`  descartado (${proporcion.toFixed(2)}× la referencia): ${p.productName}`);
            continue;
          }
          const candidato: ProductoTienda = {
            tienda: 'walmart',
            ingredienteId: ing.id,
            nombre: p.productName,
            tamano,
            precio: oferta.Price,
            actualizado: hoy,
            fuente: 'extractor',
          };
          if (!mejor || candidato.precio / candidato.tamano < mejor.precio / mejor.tamano) mejor = candidato;
        }
      }
      if (mejor) {
        encontrados.push(mejor);
        console.log(`✓ ${ing.nombre}: ${mejor.nombre} Q${mejor.precio}`);
      } else {
        fallidos.push(ing.nombre);
        console.log(`✗ ${ing.nombre}: sin coincidencias para "${b.termino}"`);
      }
    } catch (e) {
      fallidos.push(ing.nombre);
      console.error(`✗ ${ing.nombre}: ${(e as Error).message}`);
    }
    await dormir(PAUSA_MS);
  }

  const previos = JSON.parse(readFileSync(SALIDA, 'utf8')) as ProductoTienda[];
  const otros = previos.filter((p) => p.tienda !== 'walmart');
  writeFileSync(SALIDA, JSON.stringify([...otros, ...encontrados], null, 2) + '\n');
  console.log(`\n${encontrados.length} precios guardados, ${fallidos.length} sin resultado.`);
  if (encontrados.length === 0) process.exitCode = 1;
}

main();
