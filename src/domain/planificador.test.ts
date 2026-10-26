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
    a: { id: 'a', nombre: 'A', porciones: 2, minutos: 1, etiquetas: [], pasos: [], ingredientes: [{ id: 'arroz', cantidad: 500 }, { id: 'huevo', cantidad: 2 }] },
    b: { id: 'b', nombre: 'B', porciones: 2, minutos: 1, etiquetas: [], pasos: [], ingredientes: [{ id: 'arroz', cantidad: 300 }] },
    c: { id: 'c', nombre: 'C', porciones: 2, minutos: 1, etiquetas: [], pasos: [], ingredientes: [{ id: 'huevo', cantidad: 1 }] },
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

test('la estrategia "mejor" elige la tienda más barata por producto', () => {
  const l = armarLista([{ recetaId: 'a', porciones: 2 }], {}, catPequeno, 'mejor');
  // arroz 500 g: Walmart Q10 vs PriceSmart Q40 → Walmart; huevo: La Torre Q24
  assert.equal(l.total, 34);
  assert.equal(l.porTienda.walmart, 10);
  assert.equal(l.porTienda.latorre, 24);
});

test('una sola tienda marca lo que no vende', () => {
  const l = armarLista([{ recetaId: 'a', porciones: 2 }], {}, catPequeno, 'pricesmart');
  assert.equal(l.sinPrecio.length, 1);
  assert.equal(l.sinPrecio[0].ingrediente.id, 'huevo');
});

test('sugiere cambiar a una receta más barata', () => {
  const s = sugerirCambios([{ recetaId: 'a', porciones: 2 }], {}, catPequeno, 'mejor');
  assert.equal(s[0].poner.id, 'b');
  assert.equal(s[0].ahorro, 24);
});

test('comprar suma al inventario y cocinar descuenta', () => {
  const l = armarLista([{ recetaId: 'a', porciones: 2 }], {}, catPequeno, 'mejor');
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
