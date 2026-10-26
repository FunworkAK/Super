// Unidad base de cada ingrediente. Todas las cantidades (recetas, inventario,
// presentaciones de tienda) se guardan en esta unidad para poder sumarlas.
export type Unidad = 'g' | 'ml' | 'u';

export type Pasillo =
  | 'Frutas y verduras'
  | 'Carnes y pescado'
  | 'Lácteos y huevos'
  | 'Granos y abarrotes'
  | 'Panadería'
  | 'Condimentos y salsas'
  | 'Congelados';

export interface Ingrediente {
  id: string;
  nombre: string;
  unidad: Unidad;
  pasillo: Pasillo;
  // Cantidad que se suma al tocar "+" en el inventario.
  paso: number;
}

export interface IngredienteReceta {
  id: string;
  cantidad: number;
}

export type Comida = 'desayuno' | 'almuerzo' | 'cena' | 'snack' | 'lonchera';

export const COMIDAS: Record<Comida, string> = {
  desayuno: 'Desayuno',
  almuerzo: 'Almuerzo',
  cena: 'Cena',
  snack: 'Snack',
  lonchera: 'Lonchera',
};

export interface Receta {
  id: string;
  nombre: string;
  comidas: Comida[];
  // Sitio web del que se tomó o adaptó la receta.
  fuente?: { sitio: string; url: string };
  porciones: number;
  minutos: number;
  etiquetas: string[];
  ingredientes: IngredienteReceta[];
  pasos: string[];
}

export type TiendaId = 'walmart' | 'latorre' | 'pricesmart';

export const TIENDAS: Record<TiendaId, string> = {
  walmart: 'Walmart',
  latorre: 'La Torre',
  pricesmart: 'PriceSmart',
};

// Una presentación concreta que vende una tienda (p. ej. "Arroz 2 lb" a Q14.50).
export interface ProductoTienda {
  tienda: TiendaId;
  ingredienteId: string;
  nombre: string;
  tamano: number; // en la unidad base del ingrediente
  precio: number; // quetzales
  actualizado: string; // fecha ISO
  fuente: 'estimado' | 'extractor';
}

export interface ItemPlan {
  recetaId: string;
  porciones: number;
  dia?: number; // 0 = lunes … 6 = domingo; sin día = receta extra
  comida?: Comida;
}

export const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export interface ConfigMenu {
  personas: number;
  ninos: number; // para las loncheras
  dias: number[];
  comidas: Comida[];
}

// Cantidad disponible en casa por ingrediente, en unidad base.
export type Inventario = Record<string, number>;

// Tiendas donde la persona quiere comprar; se elige la más barata entre ellas.
export type Estrategia = TiendaId[];

export const TODAS_TIENDAS: TiendaId[] = ['walmart', 'latorre', 'pricesmart'];
