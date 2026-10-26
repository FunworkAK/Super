import type { ProductoTienda, TiendaId } from '../domain/types';
import { INGREDIENTES_POR_ID } from './ingredientes';

// Precios ESTIMADOS de referencia (quetzales), escritos a mano para poder
// probar la app. Se reemplazan por los que traen los extractores
// (scraper/), que generan src/data/precios-extraidos.json.
const ESTIMADO = '2026-10-26';

type Presentacion = [tamano: number, precio: number] | null;

// ingrediente: [Walmart, La Torre, PriceSmart]
const tabla: Record<string, [Presentacion, Presentacion, Presentacion]> = {
  tomate: [[454, 6.5], [454, 6.0], [2270, 27.0]],
  cebolla: [[454, 6.0], [454, 5.75], [2270, 24.0]],
  ajo: [[100, 6.5], [100, 6.0], [454, 24.0]],
  'chile-pimiento': [[1, 3.5], [1, 3.25], [6, 18.0]],
  papa: [[454, 6.0], [454, 5.5], [2270, 25.0]],
  zanahoria: [[454, 5.0], [454, 4.75], [2270, 20.0]],
  guisquil: [[1, 3.0], [1, 2.75], null],
  ejote: [[454, 9.0], [454, 8.5], null],
  aguacate: [[1, 7.0], [1, 6.5], [6, 36.0]],
  limon: [[10, 6.0], [10, 5.5], [50, 25.0]],
  cilantro: [[50, 2.5], [50, 2.0], null],
  platano: [[1, 2.5], [1, 2.25], [10, 22.0]],
  banano: [[10, 9.0], [10, 8.0], [30, 24.0]],
  lechuga: [[1, 7.0], [1, 6.5], [3, 19.0]],
  brocoli: [[454, 12.0], [454, 11.5], [1360, 32.0]],
  miltomate: [[454, 8.0], [454, 7.5], null],
  manzana: [[1, 4.5], [1, 4.25], [12, 45.0]],
  pepino: [[1, 2.5], [1, 2.25], [6, 12.0]],
  elote: [[1, 3.5], [1, 3.0], [6, 18.0]],
  yuca: [[454, 6.0], [454, 5.5], null],
  guicoy: [[1, 3.0], [1, 2.75], null],
  hierbabuena: [[30, 2.5], [30, 2.0], null],
  'pollo-pechuga': [[454, 27.0], [454, 26.0], [2270, 119.0]],
  'pollo-piezas': [[454, 17.0], [454, 16.5], [2270, 79.0]],
  'res-molida': [[454, 32.0], [454, 31.0], [1360, 89.0]],
  'res-guisar': [[454, 38.0], [454, 37.0], [1360, 105.0]],
  cerdo: [[454, 30.0], [454, 29.0], [1360, 84.0]],
  jamon: [[227, 18.0], [227, 18.5], [907, 62.0]],
  atun: [[1, 11.0], [1, 11.5], [6, 58.0]],
  pavo: [[227, 28.0], [227, 29.0], [907, 89.0]],
  huevo: [[15, 25.0], [15, 24.5], [30, 44.0]],
  leche: [[946, 14.0], [946, 14.5], [5676, 78.0]],
  crema: [[454, 18.0], [454, 18.5], [907, 32.0]],
  'queso-fresco': [[454, 30.0], [454, 29.0], [907, 55.0]],
  'queso-mozzarella': [[227, 26.0], [227, 27.0], [907, 79.0]],
  mantequilla: [[454, 34.0], [454, 35.0], [907, 59.0]],
  yogur: [[1000, 28.0], [1000, 29.0], [2000, 45.0]],
  arroz: [[907, 13.0], [907, 13.5], [4536, 55.0]],
  'frijol-negro': [[907, 18.0], [907, 18.5], [4536, 79.0]],
  pasta: [[200, 4.5], [200, 4.75], [2700, 45.0]],
  avena: [[400, 12.0], [400, 12.5], [2000, 45.0]],
  'harina-maiz': [[907, 12.0], [907, 12.5], [4536, 49.0]],
  aceite: [[900, 26.0], [900, 26.5], [3800, 89.0]],
  azucar: [[907, 9.0], [907, 9.5], [4536, 39.0]],
  'harina-trigo': [[907, 11.0], [907, 11.5], [4536, 45.0]],
  'mantequilla-mani': [[340, 28.0], [340, 29.0], [1360, 79.0]],
  granola: [[400, 32.0], [400, 33.0], [1130, 75.0]],
  tortillas: [[30, 10.0], [30, 10.0], [90, 26.0]],
  'pan-frances': [[10, 10.0], [10, 9.5], [24, 22.0]],
  'pan-molde': [[1, 17.0], [1, 17.5], [2, 30.0]],
  sal: [[454, 3.5], [454, 3.75], [1360, 9.0]],
  pimienta: [[50, 10.0], [50, 10.5], [400, 49.0]],
  consome: [[100, 10.0], [100, 10.5], [907, 59.0]],
  'salsa-tomate': [[400, 9.0], [400, 9.5], [2400, 45.0]],
  'salsa-inglesa': [[145, 12.0], [145, 12.5], [600, 35.0]],
  pepitoria: [[100, 8.0], [100, 7.5], null],
  ajonjoli: [[100, 7.0], [100, 6.5], null],
  'vegetales-congelados': [[454, 15.0], [454, 15.5], [2270, 55.0]],
};

const ORDEN: TiendaId[] = ['walmart', 'latorre', 'pricesmart'];

function etiquetaTamano(tamano: number, unidad: string): string {
  if (unidad === 'u') return `${tamano} u`;
  if (tamano >= 1000) return `${+(tamano / 1000).toFixed(2)} ${unidad === 'g' ? 'kg' : 'L'}`;
  return `${tamano} ${unidad}`;
}

export const PRECIOS_ESTIMADOS: ProductoTienda[] = Object.entries(tabla).flatMap(
  ([ingredienteId, presentaciones]) =>
    presentaciones.flatMap((p, i) => {
      if (!p) return [];
      const ing = INGREDIENTES_POR_ID[ingredienteId];
      return [
        {
          tienda: ORDEN[i],
          ingredienteId,
          nombre: `${ing.nombre} ${etiquetaTamano(p[0], ing.unidad)}`,
          tamano: p[0],
          precio: p[1],
          actualizado: ESTIMADO,
          fuente: 'estimado' as const,
        },
      ];
    }),
);

// Los precios del extractor reemplazan al estimado de la misma tienda e ingrediente.
export function combinarPrecios(
  estimados: ProductoTienda[],
  extraidos: ProductoTienda[],
): ProductoTienda[] {
  const clave = (p: ProductoTienda) => `${p.tienda}:${p.ingredienteId}`;
  const conExtractor = new Set(extraidos.map(clave));
  return [...estimados.filter((p) => !conExtractor.has(clave(p))), ...extraidos];
}
