import { armarLista, coberturaInventario, costoPorPorcion, type Catalogo } from './planificador';
import { puedeHacer } from './aparatos';
import type { AparatoId, Comida, ConfigMenu, Estrategia, Inventario, ItemPlan, Receta } from './types';

const ORDEN_COMIDAS: Comida[] = ['desayuno', 'almuerzo', 'cena'];

// Generador pseudoaleatorio con semilla, para que "otra sugerencia" cambie el
// menú pero el mismo número dé siempre el mismo resultado (y las pruebas sean estables).
function aleatorio(semilla: number) {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface Hueco {
  dia: number;
  comida: Comida;
  porciones: number;
}

// Los huecos del menú: un plato por día y comida elegida.
export function huecosDelMenu(config: ConfigMenu): Hueco[] {
  const huecos: Hueco[] = [];
  for (const dia of [...config.dias].sort((a, b) => a - b)) {
    for (const comida of ORDEN_COMIDAS) {
      if (!config.comidas.includes(comida)) continue;
      huecos.push({ dia, comida, porciones: config.personas });
    }
  }
  return huecos;
}

// Recetas de esa comida que se pueden hacer con los aparatos de la persona.
export function candidatas(cat: Catalogo, comida: Comida, aparatos?: AparatoId[]): Receta[] {
  return Object.values(cat.recetas).filter((r) => r.comidas.includes(comida) && puedeHacer(r, aparatos));
}

// Puntaje de una receta para un hueco: aprovecha la despensa, es barata y no
// se ha repetido. Un poco de azar da variedad.
function puntaje(receta: Receta, cat: Catalogo, inventario: Inventario, usos: number, azar: number, costoMax: number) {
  const costo = costoPorPorcion(receta, cat) ?? costoMax;
  return coberturaInventario(receta, inventario) * 2 - costo / costoMax - usos * 1.5 + azar * 0.8;
}

export function generarMenu(
  config: ConfigMenu,
  cat: Catalogo,
  inventario: Inventario,
  tiendas: Estrategia,
  presupuesto: number,
  semilla = 1,
): ItemPlan[] {
  const rnd = aleatorio(semilla);
  const costos = Object.values(cat.recetas).map((r) => costoPorPorcion(r, cat) ?? 0);
  const costoMax = Math.max(1, ...costos);
  const usos: Record<string, number> = {};
  const menu: ItemPlan[] = [];

  for (const h of huecosDelMenu(config)) {
    const delDia = new Set(menu.filter((m) => m.dia === h.dia).map((m) => m.recetaId));
    let mejor: Receta | null = null;
    let mejorPuntaje = -Infinity;
    for (const r of candidatas(cat, h.comida, config.aparatos)) {
      if (delDia.has(r.id)) continue;
      const p = puntaje(r, cat, inventario, usos[r.id] ?? 0, rnd(), costoMax);
      if (p > mejorPuntaje) {
        mejor = r;
        mejorPuntaje = p;
      }
    }
    if (!mejor) continue;
    usos[mejor.id] = (usos[mejor.id] ?? 0) + 1;
    menu.push({ recetaId: mejor.id, porciones: h.porciones, dia: h.dia, comida: h.comida });
  }

  return ajustarAPresupuesto(menu, cat, inventario, tiendas, presupuesto, config.aparatos);
}

// Si la lista se pasa del presupuesto, cambia los platos más caros por la
// alternativa más barata de la misma comida hasta que alcance o no se pueda más.
export function ajustarAPresupuesto(
  menu: ItemPlan[],
  cat: Catalogo,
  inventario: Inventario,
  tiendas: Estrategia,
  presupuesto: number,
  aparatos?: AparatoId[],
): ItemPlan[] {
  if (presupuesto <= 0) return menu;
  let actual = menu;
  let total = armarLista(actual, inventario, cat, tiendas).total;
  for (let vuelta = 0; vuelta < actual.length && total > presupuesto; vuelta++) {
    let mejorCambio: { i: number; recetaId: string; ahorro: number } | null = null;
    for (const [i, item] of actual.entries()) {
      const receta = cat.recetas[item.recetaId];
      if (!receta || !item.comida) continue;
      const costo = costoPorPorcion(receta, cat) ?? 0;
      const delDia = new Set(actual.filter((m) => m.dia === item.dia).map((m) => m.recetaId));
      for (const r of candidatas(cat, item.comida, aparatos)) {
        if (delDia.has(r.id)) continue;
        const ahorro = (costo - (costoPorPorcion(r, cat) ?? Infinity)) * item.porciones;
        if (ahorro > 0 && (!mejorCambio || ahorro > mejorCambio.ahorro)) mejorCambio = { i, recetaId: r.id, ahorro };
      }
    }
    if (!mejorCambio) break;
    const { i, recetaId } = mejorCambio;
    const nuevo = actual.map((m, j) => (j === i ? { ...m, recetaId } : m));
    const nuevoTotal = armarLista(nuevo, inventario, cat, tiendas).total;
    if (nuevoTotal >= total) break;
    actual = nuevo;
    total = nuevoTotal;
  }
  return actual;
}
