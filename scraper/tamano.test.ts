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

test('productos a granel de Walmart se toman por libra', () => {
  assert.equal(tamanoDesdeNombre('Tomate De Cocina En Red 3 Libras - 5 a 7 Unidades Aproximadamente', 'g'), 1360.8);
  assert.equal(tamanoDesdeNombre('Papa Hortifruti Super Red - 10 a 13 Unidades por Libra Aproximadamente', 'g'), 453.6);
  assert.equal(tamanoDesdeNombre('Filete Pechuga de Pollo Pio Lindo Porcionaditos Precio por Libra', 'g'), 453.6);
  assert.equal(tamanoDesdeNombre('Brocoli Entero Libra - Unidad contiene 1Lb Aproximadamente', 'g'), 453.6);
  assert.equal(tamanoDesdeNombre('Chuleta De Cerdo Ahumada lb', 'g'), 453.6);
  // Por unidad no se puede convertir una libra de plátanos.
  assert.equal(tamanoDesdeNombre('Platano Libra', 'u'), null);
  assert.equal(tamanoDesdeNombre('Aguacate hass en malla - 9 a 10 Unidades Aproximadamente', 'u'), 10);
});
