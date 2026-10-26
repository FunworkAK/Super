import type { AparatoId, Funcion, Receta } from './types';

// Qué funciones cubre cada aparato. Varias marcas hacen lo mismo que otros
// aparatos: la Thermomix licúa y cocina, la Ninja Foodi hornea y fríe con aire.
export const FUNCIONES_APARATO: Record<AparatoId, Funcion[]> = {
  estufa: ['fuego'],
  horno: ['hornear', 'asar'],
  microondas: [],
  freidora: ['hornear', 'asar'],
  parrilla: ['asar'],
  licuadora: ['licuar'],
  procesador: ['licuar'],
  thermomix: ['licuar', 'batir', 'fuego'],
  'ninja-foodi': ['fuego', 'hornear', 'asar'],
  'ninja-licuadora': ['licuar'],
  kitchenaid: ['batir'],
  'olla-presion': ['fuego'],
};

export const NOMBRE_FUNCION: Record<Funcion, string> = {
  fuego: 'Cocinar al fuego',
  hornear: 'Hornear',
  asar: 'Asar',
  licuar: 'Licuar',
  batir: 'Batir',
};

export function necesita(receta: Receta): Funcion[] {
  return receta.necesita ?? ['fuego'];
}

// Aparatos de la lista que cubren una función.
export function aparatosPara(funcion: Funcion, aparatos: AparatoId[]): AparatoId[] {
  return aparatos.filter((a) => FUNCIONES_APARATO[a].includes(funcion));
}

// Sin aparatos elegidos (datos viejos) no se filtra nada.
export function puedeHacer(receta: Receta, aparatos?: AparatoId[]): boolean {
  if (!aparatos) return true;
  return necesita(receta).every((f) => aparatosPara(f, aparatos).length > 0);
}
