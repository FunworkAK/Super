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
import type { ProductoTienda, Unidad } from '../src/domain/types';
import { BUSQUEDAS } from './busquedas';
import { tamanoDesdeNombre } from './tamano';

const BASE = process.env.WALMART_GT_URL ?? 'https://www.walmart.com.gt';
const SALIDA = join(__dirname, '..', 'src', 'data', 'precios-extraidos.json');
const PAUSA_MS = 1500; // ser amables con el sitio

interface ProductoVtex {
  productName: string;
  items: {
    name: string;
    measurementUnit?: string;
    unitMultiplier?: number;
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

function tamanoItem(item: ProductoVtex['items'][number], nombre: string, unidad: Unidad): number | null {
  // Productos a granel (frutas, carnes) vienen por kg/lb con unitMultiplier.
  const mu = item.measurementUnit?.toLowerCase();
  const mult = item.unitMultiplier ?? 1;
  if (unidad === 'g' && mu === 'kg') return 1000 * mult;
  if (unidad === 'g' && mu === 'lb') return 453.6 * mult;
  if (unidad === 'g' && mu === 'g') return mult;
  return tamanoDesdeNombre(nombre, unidad);
}

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
          const tamano = tamanoItem(item, `${p.productName} ${item.name}`, ing.unidad);
          if (!tamano) continue;
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
