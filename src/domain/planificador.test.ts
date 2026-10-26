/// <reference types="node" />
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  agregarCompras,
  armarLista,
  cotizar,
  descontarReceta,
  faltantes,
  ingredientesNecesarios,
  sugerirCambios,
  type Catalogo,
} from './planificador';
import type { ProductoTienda } from './types';
import { INGREDIENTES_POR_ID } from '../data/ingredientes';
import { RECETAS, RECETAS_POR_ID } from '../data/recetas';
import { PRECIOS_ESTIMADOS, combinarPrecios } from '../data/precios';

const prod = (p: Partial<ProductoTienda>): ProductoTienda => ({
  tienda: 'walmart',
  ingredienteId: 'arroz',
  nombre: 'x',
  tamano: 1000,
  precio: 10,
  actualizado: '2026-01-01',
  fuente: 'estimado',
  ...p,
});

const catPequeno: Catalogo = {
  ingredientes: INGREDIENTES_POR_ID,
  recetas: {
    a: { id: 'a', nombre: 'A', comidas: ['almuerzo'], porciones: 2, minutos: 1, etiquetas: [], pasos: [], ingredientes: [{ id: 'arroz', cantidad: 500 }, { id: 'huevo', cantidad: 2 }] },
    b: { id: 'b', nombre: 'B', comidas: ['almuerzo'], porciones: 2, minutos: 1, etiquetas: [], pasos: [], ingredientes: [{ id: 'arroz', cantidad: 300 }] },
    c: { id: 'c', nombre: 'C', comidas: ['almuerzo'], porciones: 2, minutos: 1, etiquetas: [], pasos: [], ingredientes: [{ id: 'huevo', cantidad: 1 }] },
  },
  precios: [
    prod({ tienda: 'walmart', ingredienteId: 'arroz', tamano: 1000, precio: 10 }),
    prod({ tienda: 'pricesmart', ingredienteId: 'arroz', tamano: 5000, precio: 40 }),
    prod({ tienda: 'walmart', ingredienteId: 'huevo', tamano: 15, precio: 25 }),
    prod({ tienda: 'latorre', ingredienteId: 'huevo', tamano: 15, precio: 24 }),
  ],
};

test('escala ingredientes según porciones y suma recetas', () => {
  const r = ingredientesNecesarios(
    [{ recetaId: 'a', porciones: 4 }, { recetaId: 'b', porciones: 2 }],
    catPequeno,
  );
  assert.deepEqual(r, { arroz: 1300, huevo: 4 });
});

test('resta el inventario y omite lo que ya alcanza', () => {
  assert.deepEqual(faltantes({ arroz: 1300, huevo: 4 }, { arroz: 300, huevo: 10 }), { arroz: 1000 });
});

test('cotiza paquetes enteros', () => {
  const c = cotizar(1001, prod({ tamano: 1000, precio: 10 }));
  assert.equal(c.paquetes, 2);
  assert.equal(c.costo, 20);
});

test('elige la tienda más barata entre las elegidas', () => {
  const l = armarLista([{ recetaId: 'a', porciones: 2 }], {}, catPequeno, ['walmart', 'latorre', 'pricesmart']);
  // arroz 500 g: Walmart Q10 vs PriceSmart Q40 → Walmart; huevo: La Torre Q24
  assert.equal(l.total, 34);
  assert.equal(l.porTienda.walmart, 10);
  assert.equal(l.porTienda.latorre, 24);
});

test('una sola tienda marca lo que no vende', () => {
  const l = armarLista([{ recetaId: 'a', porciones: 2 }], {}, catPequeno, ['pricesmart']);
  assert.equal(l.sinPrecio.length, 1);
  assert.equal(l.sinPrecio[0].ingrediente.id, 'huevo');
});

test('sugiere cambiar a una receta más barata', () => {
  const s = sugerirCambios([{ recetaId: 'a', porciones: 2 }], {}, catPequeno, ['walmart', 'latorre', 'pricesmart']);
  assert.equal(s[0].poner.id, 'b');
  assert.equal(s[0].ahorro, 24);
});

test('comprar suma al inventario y cocinar descuenta', () => {
  const l = armarLista([{ recetaId: 'a', porciones: 2 }], {}, catPequeno, ['walmart', 'latorre']);
  const inv = agregarCompras({}, l.lineas);
  assert.deepEqual(inv, { arroz: 1000, huevo: 15 });
  assert.deepEqual(descontarReceta(inv, { recetaId: 'a', porciones: 2 }, catPequeno), { arroz: 500, huevo: 13 });
});

test('los precios del extractor reemplazan al estimado', () => {
  const r = combinarPrecios(
    [prod({ precio: 10 }), prod({ tienda: 'latorre', precio: 11 })],
    [prod({ precio: 9, fuente: 'extractor' })],
  );
  assert.equal(r.length, 2);
  assert.equal(r.find((p) => p.tienda === 'walmart')?.precio, 9);
});

test('todas las recetas usan ingredientes conocidos con precio', () => {
  const conPrecio = new Set(PRECIOS_ESTIMADOS.map((p) => p.ingredienteId));
  for (const r of RECETAS) {
    for (const ing of r.ingredientes) {
      assert.ok(INGREDIENTES_POR_ID[ing.id], `${r.id}: ingrediente ${ing.id} no existe`);
      assert.ok(conPrecio.has(ing.id), `${r.id}: ${ing.id} sin precio`);
    }
  }
  assert.equal(Object.keys(RECETAS_POR_ID).length, RECETAS.length, 'ids de receta repetidos');
});

test('macros por porción y del plan', async () => {
  const { macrosPorPorcion, macrosPlan } = await import('./macros');
  const receta = {
    id: 'x', nombre: 'X', comidas: ['almuerzo' as const], porciones: 2, minutos: 1, etiquetas: [], pasos: [],
    ingredientes: [{ id: 'huevo', cantidad: 4 }, { id: 'arroz', cantidad: 200 }],
  };
  // 4 huevos (72 kcal, 6.3 g prot) + 200 g arroz (365 kcal/100 g) entre 2 porciones
  const m = macrosPorPorcion(receta, INGREDIENTES_POR_ID);
  assert.equal(Math.round(m.kcal), Math.round((4 * 72 + 2 * 365) / 2));
  assert.equal(+m.proteina.toFixed(1), +((4 * 6.3 + 2 * 7) / 2).toFixed(1));
  const p = macrosPlan([{ recetaId: 'x', porciones: 3 }], { x: receta }, INGREDIENTES_POR_ID);
  assert.equal(Math.round(p.kcal), Math.round(m.kcal * 3));
});

test('muestra libras para cantidades de super', async () => {
  const { formatoCantidad } = await import('./planificador');
  assert.equal(formatoCantidad(453.6, 'g'), '1 lb');
  assert.equal(formatoCantidad(50, 'g'), '50 g');
  assert.equal(formatoCantidad(1500, 'ml'), '1.5 L');
  assert.equal(formatoCantidad(6, 'u'), '6 u');
});

test('el menú llena cada día y comida elegida, sin repetir en el mismo día', async () => {
  const { generarMenu, huecosDelMenu } = await import('./menu');
  const { RECETAS_POR_ID } = await import('../data/recetas');
  const cat: Catalogo = { recetas: RECETAS_POR_ID, ingredientes: INGREDIENTES_POR_ID, precios: PRECIOS_ESTIMADOS };
  const config = { personas: 3, dias: [0, 1, 2, 3, 4, 5], comidas: ['desayuno' as const, 'cena' as const] };
  // 6 días × (desayuno + cena)
  assert.equal(huecosDelMenu(config).length, 12);
  const menu = generarMenu(config, cat, {}, ['walmart', 'latorre', 'pricesmart'], 0, 7);
  assert.equal(menu.length, 12);
  for (const m of menu) {
    assert.ok(RECETAS_POR_ID[m.recetaId].comidas.includes(m.comida!), `${m.recetaId} no es de ${m.comida}`);
    assert.equal(m.porciones, 3);
  }
  for (let d = 0; d < 6; d++) {
    const ids = menu.filter((m) => m.dia === d).map((m) => m.recetaId);
    assert.equal(new Set(ids).size, ids.length);
  }
});

test('el menú se ajusta para no pasarse del presupuesto si se puede', async () => {
  const { generarMenu } = await import('./menu');
  const { RECETAS_POR_ID } = await import('../data/recetas');
  const cat: Catalogo = { recetas: RECETAS_POR_ID, ingredientes: INGREDIENTES_POR_ID, precios: PRECIOS_ESTIMADOS };
  const config = { personas: 4, dias: [0, 1, 2, 3, 4], comidas: ['almuerzo' as const] };
  const tiendas = ['walmart' as const];
  const libre = armarLista(generarMenu(config, cat, {}, tiendas, 0, 3), {}, cat, tiendas).total;
  const ajustado = armarLista(generarMenu(config, cat, {}, tiendas, libre * 0.7, 3), {}, cat, tiendas).total;
  assert.ok(ajustado < libre, `${ajustado} debería ser menor que ${libre}`);
});

test('solo sugiere recetas que se pueden hacer con los aparatos elegidos', async () => {
  const { generarMenu, candidatas } = await import('./menu');
  const { puedeHacer } = await import('./aparatos');
  const cat: Catalogo = { recetas: RECETAS_POR_ID, ingredientes: INGREDIENTES_POR_ID, precios: PRECIOS_ESTIMADOS };
  const pollo = RECETAS_POR_ID['pollo-asado'];
  assert.equal(puedeHacer(pollo, ['estufa']), false);
  assert.equal(puedeHacer(pollo, ['estufa', 'freidora']), true); // la freidora de aire también asa
  assert.equal(puedeHacer(RECETAS_POR_ID['pepian-pollo'], ['estufa']), false); // hay que licuar
  assert.equal(puedeHacer(RECETAS_POR_ID['pepian-pollo'], ['thermomix']), true); // licúa y cocina
  assert.equal(puedeHacer(pollo, undefined), true); // sin aparatos guardados no se filtra

  const config = { personas: 2, dias: [0, 1, 2, 3, 4, 5, 6], comidas: ['almuerzo' as const, 'cena' as const], aparatos: ['estufa' as const] };
  const menu = generarMenu(config, cat, {}, ['walmart'], 0, 5);
  assert.equal(menu.length, 14);
  for (const m of menu) assert.ok(puedeHacer(RECETAS_POR_ID[m.recetaId], ['estufa']), m.recetaId);
  assert.ok(candidatas(cat, 'cena', ['parrilla', 'estufa']).some((r) => r.id === 'carne-asada'));
});
