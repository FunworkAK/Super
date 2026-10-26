// Valores nutricionales aproximados (tablas USDA / INCAP), por 100 g o 100 ml
// para ingredientes en g/ml, y por pieza para los que se cuentan en unidades.
// [kcal, proteína g, carbohidratos g, grasa g]
export type Nutrientes = [kcal: number, proteina: number, carbos: number, grasa: number];

export const NUTRICION: Record<string, Nutrientes> = {
  tomate: [18, 0.9, 3.9, 0.2],
  cebolla: [40, 1.1, 9.3, 0.1],
  ajo: [149, 6.4, 33, 0.5],
  'chile-pimiento': [24, 1, 5.5, 0.2], // pieza ~120 g
  papa: [77, 2, 17, 0.1],
  zanahoria: [41, 0.9, 10, 0.2],
  guisquil: [38, 1.6, 9, 0.3], // pieza ~200 g
  ejote: [31, 1.8, 7, 0.2],
  aguacate: [240, 3, 13, 22], // pieza ~150 g de pulpa
  limon: [9, 0.2, 3, 0.1],
  cilantro: [23, 2.1, 3.7, 0.5],
  platano: [220, 2.3, 57, 0.7], // pieza ~180 g
  banano: [105, 1.3, 27, 0.4],
  lechuga: [75, 6, 14, 1], // pieza ~500 g
  brocoli: [34, 2.8, 7, 0.4],
  miltomate: [32, 1, 6, 1],
  manzana: [95, 0.5, 25, 0.3], // pieza ~180 g
  pepino: [45, 2, 11, 0.3], // pieza ~300 g
  elote: [90, 3.3, 19, 1.4], // mazorca ~100 g de grano
  yuca: [160, 1.4, 38, 0.3],
  guicoy: [35, 2.5, 7, 0.4], // pieza ~200 g
  hierbabuena: [44, 3.3, 8, 0.7],
  'pollo-pechuga': [120, 22.5, 0, 2.6],
  'pollo-piezas': [160, 17, 0, 10], // con hueso, parte comestible
  'res-molida': [250, 17, 0, 20],
  'res-guisar': [160, 20, 0, 8],
  cerdo: [200, 19, 0, 13],
  jamon: [145, 17, 2, 7],
  atun: [140, 30, 0, 1.5], // lata escurrida ~120 g
  pavo: [105, 17, 3, 2.5],
  huevo: [72, 6.3, 0.4, 4.8],
  leche: [61, 3.2, 4.8, 3.3],
  crema: [250, 2.5, 3.5, 25],
  'queso-fresco': [300, 18, 3, 24],
  'queso-mozzarella': [300, 22, 2.2, 22],
  mantequilla: [717, 0.9, 0.1, 81],
  yogur: [61, 3.5, 4.7, 3.3],
  arroz: [365, 7, 80, 0.7],
  'frijol-negro': [341, 21.6, 62, 1.4],
  pasta: [371, 13, 75, 1.5],
  avena: [389, 17, 66, 7],
  'harina-maiz': [365, 9, 76, 4],
  aceite: [820, 0, 0, 92],
  azucar: [387, 0, 100, 0],
  'harina-trigo': [364, 10, 76, 1],
  'mantequilla-mani': [588, 25, 20, 50],
  granola: [470, 10, 64, 20],
  tortillas: [65, 1.7, 13.5, 0.8], // pieza ~30 g
  'pan-frances': [160, 5, 30, 2], // pieza ~60 g
  'pan-molde': [1450, 45, 270, 18], // bolsa ~550 g
  sal: [0, 0, 0, 0],
  pimienta: [251, 10, 64, 3],
  consome: [200, 10, 30, 5],
  'salsa-tomate': [30, 1.5, 6, 0.2],
  'salsa-inglesa': [78, 0, 19, 0],
  pepitoria: [560, 30, 11, 49],
  ajonjoli: [573, 18, 23, 50],
  'vegetales-congelados': [65, 3, 13, 0.5],
};
