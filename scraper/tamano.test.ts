/// <reference types="node" />
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tamanoDesdeNombre } from './tamano';

test('lee tamaños comunes de etiquetas', () => {
  assert.equal(tamanoDesdeNombre('Arroz Gallo Dorado 2 lb', 'g'), 907.2);
  assert.equal(tamanoDesdeNombre('Leche Entera Dos Pinos 946 ml', 'ml'), 946);
  assert.equal(tamanoDesdeNombre('Aceite Ideal 1.5 L', 'ml'), 1500);
  assert.equal(tamanoDesdeNombre('Huevos blancos 15 unidades', 'u'), 15);
  assert.equal(tamanoDesdeNombre('Atún Sardimar 4 x 140 g', 'g'), 560);
  assert.equal(tamanoDesdeNombre('Pasta Ina 200g', 'g'), 200);
  assert.equal(tamanoDesdeNombre('Sopa 6 pack', 'u'), 6);
  assert.equal(tamanoDesdeNombre('Producto sin tamaño', 'g'), null);
});
