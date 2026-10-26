import type { Ingrediente, Pasillo, Unidad } from '../domain/types';

const FV: Pasillo = 'Frutas y verduras';
const CP: Pasillo = 'Carnes y pescado';
const LH: Pasillo = 'Lácteos y huevos';
const GA: Pasillo = 'Granos y abarrotes';
const PA: Pasillo = 'Panadería';
const CS: Pasillo = 'Condimentos y salsas';
const CO: Pasillo = 'Congelados';

const filas: [string, string, Unidad, Pasillo, number][] = [
  ['tomate', 'Tomate', 'g', FV, 454],
  ['cebolla', 'Cebolla', 'g', FV, 454],
  ['ajo', 'Ajo', 'g', FV, 50],
  ['chile-pimiento', 'Chile pimiento', 'u', FV, 1],
  ['papa', 'Papa', 'g', FV, 454],
  ['zanahoria', 'Zanahoria', 'g', FV, 454],
  ['guisquil', 'Güisquil', 'u', FV, 1],
  ['ejote', 'Ejote', 'g', FV, 454],
  ['aguacate', 'Aguacate', 'u', FV, 1],
  ['limon', 'Limón', 'u', FV, 5],
  ['cilantro', 'Cilantro', 'g', FV, 50],
  ['platano', 'Plátano', 'u', FV, 1],
  ['banano', 'Banano', 'u', FV, 5],
  ['lechuga', 'Lechuga', 'u', FV, 1],
  ['brocoli', 'Brócoli', 'g', FV, 454],
  ['miltomate', 'Miltomate', 'g', FV, 454],
  ['pollo-pechuga', 'Pechuga de pollo', 'g', CP, 454],
  ['pollo-piezas', 'Pollo en piezas', 'g', CP, 454],
  ['res-molida', 'Carne molida de res', 'g', CP, 454],
  ['res-guisar', 'Carne de res para guisar', 'g', CP, 454],
  ['cerdo', 'Carne de cerdo', 'g', CP, 454],
  ['jamon', 'Jamón', 'g', CP, 200],
  ['atun', 'Atún en lata', 'u', CP, 1],
  ['huevo', 'Huevos', 'u', LH, 6],
  ['leche', 'Leche', 'ml', LH, 1000],
  ['crema', 'Crema', 'ml', LH, 200],
  ['queso-fresco', 'Queso fresco', 'g', LH, 454],
  ['queso-mozzarella', 'Queso mozzarella', 'g', LH, 200],
  ['mantequilla', 'Mantequilla', 'g', LH, 100],
  ['arroz', 'Arroz', 'g', GA, 454],
  ['frijol-negro', 'Frijol negro', 'g', GA, 454],
  ['pasta', 'Pasta', 'g', GA, 200],
  ['avena', 'Avena', 'g', GA, 400],
  ['harina-maiz', 'Harina de maíz (Maseca)', 'g', GA, 454],
  ['aceite', 'Aceite', 'ml', GA, 500],
  ['azucar', 'Azúcar', 'g', GA, 454],
  ['tortillas', 'Tortillas', 'u', PA, 10],
  ['pan-frances', 'Pan francés', 'u', PA, 6],
  ['pan-molde', 'Pan de molde', 'u', PA, 1],
  ['sal', 'Sal', 'g', CS, 100],
  ['pimienta', 'Pimienta', 'g', CS, 20],
  ['consome', 'Consomé de pollo', 'g', CS, 50],
  ['salsa-tomate', 'Salsa de tomate', 'g', CS, 200],
  ['salsa-inglesa', 'Salsa inglesa', 'ml', CS, 100],
  ['pepitoria', 'Pepitoria', 'g', CS, 100],
  ['ajonjoli', 'Ajonjolí', 'g', CS, 100],
  ['vegetales-congelados', 'Vegetales mixtos congelados', 'g', CO, 454],
];

export const INGREDIENTES: Ingrediente[] = filas.map(([id, nombre, unidad, pasillo, paso]) => ({
  id,
  nombre,
  unidad,
  pasillo,
  paso,
}));

export const INGREDIENTES_POR_ID: Record<string, Ingrediente> = Object.fromEntries(
  INGREDIENTES.map((i) => [i.id, i]),
);
