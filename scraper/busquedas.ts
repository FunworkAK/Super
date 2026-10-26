// Cómo buscar cada ingrediente en las tiendas. `incluir` y `excluir` son
// palabras (en minúsculas) que el nombre del producto debe o no contener,
// para no confundir, por ejemplo, "leche" con "leche condensada".
export interface Busqueda {
  ingredienteId: string;
  termino: string;
  incluir: string[];
  excluir?: string[];
  // El nombre debe empezar con alguna de estas palabras.
  empieza?: string[];
}

export const BUSQUEDAS: Busqueda[] = [
  { ingredienteId: 'tomate', termino: 'tomate', incluir: ['tomate'], excluir: ['salsa', 'pasta', 'pure', 'cherry'] },
  { ingredienteId: 'cebolla', termino: 'cebolla', incluir: ['cebolla'], excluir: ['polvo', 'sopa'] },
  { ingredienteId: 'ajo', termino: 'ajo', incluir: ['ajo'], excluir: ['polvo', 'sal', 'pasta', 'aceite', 'picado'], empieza: ['ajo'] },
  { ingredienteId: 'chile-pimiento', termino: 'chile pimiento', incluir: ['chile'] },
  { ingredienteId: 'papa', termino: 'papa', incluir: ['papa'], excluir: ['frita', 'tostada', 'chip', 'congelada'] },
  { ingredienteId: 'zanahoria', termino: 'zanahoria', incluir: ['zanahoria'], excluir: ['jugo', 'baby food'] },
  { ingredienteId: 'guisquil', termino: 'guisquil', incluir: ['guisquil'] },
  { ingredienteId: 'ejote', termino: 'ejote', incluir: ['ejote'], excluir: ['lata'] },
  { ingredienteId: 'aguacate', termino: 'aguacate', incluir: ['aguacate'], excluir: ['guacamol', 'aceite'] },
  { ingredienteId: 'limon', termino: 'limon', incluir: ['lim'], excluir: ['jugo', 'té', 'bebida', 'limonada'] },
  { ingredienteId: 'cilantro', termino: 'cilantro', incluir: ['cilantro'], excluir: ['seco'] },
  { ingredienteId: 'platano', termino: 'platano', incluir: ['pl'], excluir: ['chip', 'frito', 'tajada'] },
  { ingredienteId: 'banano', termino: 'banano', incluir: ['banano'], excluir: ['chip', 'baby'] },
  { ingredienteId: 'lechuga', termino: 'lechuga', incluir: ['lechuga'] },
  { ingredienteId: 'brocoli', termino: 'brocoli', incluir: ['br'], excluir: ['congelado'] },
  { ingredienteId: 'miltomate', termino: 'miltomate', incluir: ['miltomate'], excluir: ['salsa'] },
  { ingredienteId: 'pollo-pechuga', termino: 'pechuga de pollo', incluir: ['pechuga'], excluir: ['empanizada', 'nugget', 'jamón', 'jamon'] },
  { ingredienteId: 'pollo-piezas', termino: 'pollo piezas', incluir: ['pollo'], excluir: ['pechuga', 'empanizado', 'nugget', 'consom'] },
  { ingredienteId: 'res-molida', termino: 'carne molida res', incluir: ['molida'], excluir: ['cerdo', 'pavo', 'pollo', 'condimentada'] },
  { ingredienteId: 'res-guisar', termino: 'carne res guisar', incluir: ['res'], excluir: ['molida', 'consom', 'hueso'] },
  { ingredienteId: 'cerdo', termino: 'chuleta cerdo', incluir: ['cerdo'], excluir: ['molida', 'chicharr', 'salchicha'] },
  { ingredienteId: 'jamon', termino: 'jamon', incluir: ['jam'] },
  { ingredienteId: 'atun', termino: 'atun lata', incluir: ['at'], excluir: ['ensalada'] },
  { ingredienteId: 'huevo', termino: 'huevos', incluir: ['huevo'], excluir: ['chocolate', 'pascua'] },
  { ingredienteId: 'leche', termino: 'leche entera', incluir: ['leche'], excluir: ['condensada', 'evaporada', 'polvo', 'chocolate', 'fresa'] },
  { ingredienteId: 'crema', termino: 'crema', incluir: ['crema'], excluir: ['dental', 'corporal', 'batida', 'cacahuate', 'manos', 'peinar'] },
  { ingredienteId: 'queso-fresco', termino: 'queso fresco', incluir: ['queso', 'fresco'] },
  { ingredienteId: 'queso-mozzarella', termino: 'queso mozzarella', incluir: ['mozzarella'] },
  { ingredienteId: 'mantequilla', termino: 'mantequilla', incluir: ['mantequilla'], excluir: ['cacahuate', 'maní', 'galleta', 'ayote'], empieza: ['mantequilla'] },
  { ingredienteId: 'arroz', termino: 'arroz', incluir: ['arroz'], excluir: ['leche', 'galleta', 'harina', 'cereal', 'listo'] },
  { ingredienteId: 'frijol-negro', termino: 'frijol negro', incluir: ['frijol', 'negro'], excluir: ['volteado', 'lata', 'bolsa lista'] },
  { ingredienteId: 'pasta', termino: 'pasta espagueti', incluir: ['pasta'], excluir: ['dental', 'tomate', 'salsa'] },
  { ingredienteId: 'avena', termino: 'avena', incluir: ['avena'], excluir: ['galleta', 'bebida', 'barra'] },
  { ingredienteId: 'harina-maiz', termino: 'harina de maiz', incluir: ['harina'], excluir: ['trigo'] },
  { ingredienteId: 'aceite', termino: 'aceite vegetal', incluir: ['aceite'], excluir: ['oliva', 'motor', 'bebé', 'bebe', 'corporal', 'spray'] },
  { ingredienteId: 'azucar', termino: 'azucar', incluir: ['az'], excluir: ['glass', 'morena', 'sin azúcar', 'sin azucar'] },
  { ingredienteId: 'tortillas', termino: 'tortillas maiz', incluir: ['tortilla'], excluir: ['harina', 'chip', 'tostada'] },
  { ingredienteId: 'pan-frances', termino: 'pan frances', incluir: ['pan'] },
  { ingredienteId: 'pan-molde', termino: 'pan sandwich', incluir: ['pan'], excluir: ['dulce', 'hamburguesa', 'hot dog'] },
  { ingredienteId: 'sal', termino: 'sal', incluir: ['sal'], excluir: ['salsa', 'salchicha', 'salami', 'ajo', 'galleta'] },
  { ingredienteId: 'pimienta', termino: 'pimienta negra', incluir: ['pimienta'], excluir: ['sazonador', 'sal de mar'] },
  { ingredienteId: 'consome', termino: 'consome de pollo', incluir: ['consom'] },
  { ingredienteId: 'salsa-tomate', termino: 'salsa de tomate', incluir: ['salsa', 'tomate'], excluir: ['ketchup', 'kétchup'] },
  { ingredienteId: 'salsa-inglesa', termino: 'salsa inglesa', incluir: ['inglesa'] },
  { ingredienteId: 'pepitoria', termino: 'pepitoria', incluir: ['pepitoria'] },
  { ingredienteId: 'ajonjoli', termino: 'ajonjoli', incluir: ['ajonjol'], excluir: ['hamburguesa', 'pan', 'galleta'], empieza: ['ajonjol', 'semilla'] },
  { ingredienteId: 'vegetales-congelados', termino: 'vegetales mixtos congelados', incluir: ['vegetales'] },
];
