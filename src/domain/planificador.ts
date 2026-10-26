import type {
  Estrategia,
  Ingrediente,
  Inventario,
  ItemPlan,
  ProductoTienda,
  Receta,
  TiendaId,
} from './types';

export interface Catalogo {
  recetas: Record<string, Receta>;
  ingredientes: Record<string, Ingrediente>;
  precios: ProductoTienda[];
}

// Suma lo que piden todas las recetas del plan, escalado a las porciones elegidas.
export function ingredientesNecesarios(plan: ItemPlan[], cat: Catalogo): Record<string, number> {
  const total: Record<string, number> = {};
  for (const item of plan) {
    const receta = cat.recetas[item.recetaId];
    if (!receta) continue;
    const factor = item.porciones / receta.porciones;
    for (const ing of receta.ingredientes) {
      total[ing.id] = (total[ing.id] ?? 0) + ing.cantidad * factor;
    }
  }
  return total;
}

// Lo que falta comprar: lo necesario menos lo que ya hay en el inventario.
export function faltantes(necesarios: Record<string, number>, inventario: Inventario): Record<string, number> {
  const res: Record<string, number> = {};
  for (const [id, cant] of Object.entries(necesarios)) {
    const falta = cant - (inventario[id] ?? 0);
    if (falta > 1e-9) res[id] = falta;
  }
  return res;
}

export interface Compra {
  producto: ProductoTienda;
  paquetes: number;
  costo: number;
}

// Se compran paquetes enteros, así que el costo real es redondeando hacia arriba.
export function cotizar(cantidad: number, producto: ProductoTienda): Compra {
  const paquetes = Math.max(1, Math.ceil(cantidad / producto.tamano - 1e-9));
  return { producto, paquetes, costo: paquetes * producto.precio };
}

export function mejorCompra(
  ingredienteId: string,
  cantidad: number,
  precios: ProductoTienda[],
  estrategia: Estrategia,
): Compra | null {
  let mejor: Compra | null = null;
  for (const p of precios) {
    if (p.ingredienteId !== ingredienteId) continue;
    if (estrategia !== 'mejor' && p.tienda !== estrategia) continue;
    const c = cotizar(cantidad, p);
    if (!mejor || c.costo < mejor.costo) mejor = c;
  }
  return mejor;
}

export interface LineaLista {
  ingrediente: Ingrediente;
  cantidad: number;
  compra: Compra | null; // null si ninguna tienda (de la estrategia) lo vende
}

export interface ListaCompras {
  lineas: LineaLista[];
  total: number;
  sinPrecio: LineaLista[];
  porTienda: Partial<Record<TiendaId, number>>;
}

export function armarLista(
  plan: ItemPlan[],
  inventario: Inventario,
  cat: Catalogo,
  estrategia: Estrategia,
): ListaCompras {
  const falta = faltantes(ingredientesNecesarios(plan, cat), inventario);
  const lineas: LineaLista[] = [];
  const porTienda: Partial<Record<TiendaId, number>> = {};
  let total = 0;
  for (const [id, cantidad] of Object.entries(falta)) {
    const ingrediente = cat.ingredientes[id];
    if (!ingrediente) continue;
    const compra = mejorCompra(id, cantidad, cat.precios, estrategia);
    if (compra) {
      total += compra.costo;
      porTienda[compra.producto.tienda] = (porTienda[compra.producto.tienda] ?? 0) + compra.costo;
    }
    lineas.push({ ingrediente, cantidad, compra });
  }
  lineas.sort(
    (a, b) =>
      a.ingrediente.pasillo.localeCompare(b.ingrediente.pasillo) ||
      a.ingrediente.nombre.localeCompare(b.ingrediente.nombre),
  );
  return { lineas, total, sinPrecio: lineas.filter((l) => !l.compra), porTienda };
}

// Total de la lista para cada estrategia, para comparar tiendas.
export function compararTiendas(
  plan: ItemPlan[],
  inventario: Inventario,
  cat: Catalogo,
): { estrategia: Estrategia; total: number; sinPrecio: number }[] {
  const estrategias: Estrategia[] = ['mejor', 'walmart', 'latorre', 'pricesmart'];
  return estrategias.map((estrategia) => {
    const l = armarLista(plan, inventario, cat, estrategia);
    return { estrategia, total: l.total, sinPrecio: l.sinPrecio.length };
  });
}

export interface Sugerencia {
  quitar: Receta;
  poner: Receta;
  ahorro: number;
  nuevoTotal: number;
}

// Si la lista se pasa del presupuesto, busca cambios de una receta por otra
// (con las mismas porciones) que bajen el total. Devuelve los de mayor ahorro.
export function sugerirCambios(
  plan: ItemPlan[],
  inventario: Inventario,
  cat: Catalogo,
  estrategia: Estrategia,
  max = 3,
): Sugerencia[] {
  const base = armarLista(plan, inventario, cat, estrategia).total;
  const enPlan = new Set(plan.map((p) => p.recetaId));
  const sugerencias: Sugerencia[] = [];
  plan.forEach((item, i) => {
    const quitar = cat.recetas[item.recetaId];
    if (!quitar) return;
    let mejor: Sugerencia | null = null;
    for (const poner of Object.values(cat.recetas)) {
      if (enPlan.has(poner.id)) continue;
      const nuevoPlan = plan.map((p, j) => (j === i ? { recetaId: poner.id, porciones: p.porciones } : p));
      const lista = armarLista(nuevoPlan, inventario, cat, estrategia);
      if (lista.sinPrecio.length > 0) continue;
      const ahorro = base - lista.total;
      if (ahorro > 0.005 && (!mejor || ahorro > mejor.ahorro)) {
        mejor = { quitar, poner, ahorro, nuevoTotal: lista.total };
      }
    }
    if (mejor) sugerencias.push(mejor);
  });
  return sugerencias.sort((a, b) => b.ahorro - a.ahorro).slice(0, max);
}

// Qué tanto de una receta se cubre con lo que ya hay en casa (0 a 1).
export function coberturaInventario(receta: Receta, inventario: Inventario): number {
  if (receta.ingredientes.length === 0) return 0;
  let suma = 0;
  for (const ing of receta.ingredientes) {
    suma += Math.min(1, (inventario[ing.id] ?? 0) / ing.cantidad);
  }
  return suma / receta.ingredientes.length;
}

// Costo estimado de una porción comprando todo (sin contar el inventario),
// prorrateando el paquete para comparar recetas de forma justa.
export function costoPorPorcion(receta: Receta, cat: Catalogo): number | null {
  let total = 0;
  for (const ing of receta.ingredientes) {
    let mejor: number | null = null;
    for (const p of cat.precios) {
      if (p.ingredienteId !== ing.id) continue;
      const unitario = p.precio / p.tamano;
      if (mejor === null || unitario < mejor) mejor = unitario;
    }
    if (mejor === null) return null;
    total += mejor * ing.cantidad;
  }
  return total / receta.porciones;
}

// Recetas sugeridas: primero las que aprovechan el inventario, luego las más baratas.
export function recetasSugeridas(cat: Catalogo, inventario: Inventario) {
  return Object.values(cat.recetas)
    .map((receta) => ({
      receta,
      cobertura: coberturaInventario(receta, inventario),
      costo: costoPorPorcion(receta, cat),
    }))
    .sort(
      (a, b) =>
        b.cobertura - a.cobertura ||
        (a.costo ?? Infinity) - (b.costo ?? Infinity),
    );
}

// Inventario después de comprar la lista (se suman los paquetes completos).
export function agregarCompras(inventario: Inventario, lineas: LineaLista[]): Inventario {
  const nuevo = { ...inventario };
  for (const l of lineas) {
    if (!l.compra) continue;
    const id = l.ingrediente.id;
    nuevo[id] = (nuevo[id] ?? 0) + l.compra.paquetes * l.compra.producto.tamano;
  }
  return nuevo;
}

// Inventario después de cocinar una receta.
export function descontarReceta(inventario: Inventario, item: ItemPlan, cat: Catalogo): Inventario {
  const nuevo = { ...inventario };
  const necesarios = ingredientesNecesarios([item], cat);
  for (const [id, cant] of Object.entries(necesarios)) {
    if (nuevo[id] === undefined) continue;
    const resto = nuevo[id] - cant;
    if (resto > 1e-9) nuevo[id] = resto;
    else delete nuevo[id];
  }
  return nuevo;
}

export function formatoCantidad(cantidad: number, unidad: Ingrediente['unidad']): string {
  if (unidad === 'u') return `${Math.ceil(cantidad - 1e-9)} u`;
  if (cantidad >= 1000) return `${+(cantidad / 1000).toFixed(2)} ${unidad === 'g' ? 'kg' : 'L'}`;
  return `${Math.round(cantidad)} ${unidad}`;
}

export function formatoQ(monto: number): string {
  return `Q${monto.toFixed(2)}`;
}
