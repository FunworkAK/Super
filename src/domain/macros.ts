import { NUTRICION } from '../data/nutricion';
import type { Ingrediente, ItemPlan, Receta } from './types';

export interface Macros {
  kcal: number;
  proteina: number;
  carbos: number;
  grasa: number;
}

const CERO: Macros = { kcal: 0, proteina: 0, carbos: 0, grasa: 0 };

export function sumar(a: Macros, b: Macros, factor = 1): Macros {
  return {
    kcal: a.kcal + b.kcal * factor,
    proteina: a.proteina + b.proteina * factor,
    carbos: a.carbos + b.carbos * factor,
    grasa: a.grasa + b.grasa * factor,
  };
}

function macrosIngrediente(id: string, cantidad: number, unidad: Ingrediente['unidad']): Macros {
  const n = NUTRICION[id];
  if (!n) return CERO;
  const factor = unidad === 'u' ? cantidad : cantidad / 100;
  return { kcal: n[0] * factor, proteina: n[1] * factor, carbos: n[2] * factor, grasa: n[3] * factor };
}

// Macros de una porción de la receta.
export function macrosPorPorcion(receta: Receta, ingredientes: Record<string, Ingrediente>): Macros {
  let total = CERO;
  for (const i of receta.ingredientes) {
    const ing = ingredientes[i.id];
    if (ing) total = sumar(total, macrosIngrediente(i.id, i.cantidad, ing.unidad));
  }
  return sumar(CERO, total, 1 / receta.porciones);
}

// Macros totales del plan (todas las porciones de todas las recetas).
export function macrosPlan(
  plan: ItemPlan[],
  recetas: Record<string, Receta>,
  ingredientes: Record<string, Ingrediente>,
): Macros {
  let total = CERO;
  for (const item of plan) {
    const r = recetas[item.recetaId];
    if (r) total = sumar(total, macrosPorPorcion(r, ingredientes), item.porciones);
  }
  return total;
}
