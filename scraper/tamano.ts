import type { Unidad } from '../src/domain/types';

// Factor para pasar cada unidad escrita en una etiqueta a la unidad base.
const A_GRAMOS: Record<string, number> = { kg: 1000, g: 1, gr: 1, grs: 1, lb: 453.6, lbs: 453.6, libra: 453.6, libras: 453.6, oz: 28.35 };
const A_ML: Record<string, number> = { l: 1000, lt: 1000, lts: 1000, litro: 1000, litros: 1000, ml: 1, gal: 3785, galon: 3785, 'galón': 3785, oz: 29.57, floz: 29.57 };
const A_UNIDADES: Record<string, number> = { u: 1, un: 1, und: 1, unidad: 1, unidades: 1, pza: 1, piezas: 1, uds: 1 };

// Lee el tamaño de una presentación desde su nombre, p. ej.
// "Arroz Gallo Dorado 2 lb" → 907 g, "Leche entera 946 ml" → 946 ml,
// "Huevos blancos 15 unidades" → 15, "Atún 4 x 140 g" → 560 g.
export function tamanoDesdeNombre(nombre: string, unidad: Unidad): number | null {
  const texto = nombre.toLowerCase().replace(/,/g, '.');
  const porLibra = /\b(libra|lb|lbs)\b/.test(texto);
  // Lo que se vende por libra no se puede convertir a unidades.
  if (unidad === 'u' && porLibra && !/\d+\s*(u|uds|unidades)\b/.test(texto)) return null;
  // "Bandeja de 5 lbs - Precio indicado por libra": el precio es de 1 lb.
  if (unidad === 'g' && /precio (indicado )?por (libra|lb)/.test(texto)) return A_GRAMOS.lb;
  const tabla = unidad === 'g' ? A_GRAMOS : unidad === 'ml' ? A_ML : A_UNIDADES;
  const re = /(?:(\d+)\s*[x×]\s*)?(\d+(?:\.\d+)?)\s*([a-zá]+)\b/g;
  for (const m of texto.matchAll(re)) {
    const factor = tabla[m[3]];
    if (factor === undefined) continue;
    const multiplo = m[1] ? Number(m[1]) : 1;
    return Math.round(multiplo * Number(m[2]) * factor * 100) / 100;
  }
  // Productos a granel: "Precio por libra", "Chuleta de cerdo lb", "Banano Libra".
  if (unidad === 'g' && porLibra) return A_GRAMOS.lb;
  // Paquetes como "pack 6" o "6 pack" para ingredientes por unidad.
  if (unidad === 'u') {
    const pack = texto.match(/(\d+)\s*pack|pack\s*(?:de\s*)?(\d+)/);
    if (pack) return Number(pack[1] ?? pack[2]);
  }
  return null;
}
