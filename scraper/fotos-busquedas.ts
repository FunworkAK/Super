// Qué buscar en Wikimedia Commons para la foto de cada aparato de cocina.
// (Las fotos de recetas las sube cada persona desde la app.)
// Se prueban en orden; un término que empieza con "File:" fija ese archivo
// exacto (sirve para corregir una foto que no quedó bien). Una lista vacía
// deja el emoji en vez de foto.
export const BUSQUEDAS_FOTOS: Record<string, string[]> = {
  // Aparatos
  'aparato-estufa': ['gas stove burners', 'kitchen stove'],
  'aparato-horno': [],
  'aparato-microondas': ['microwave oven'],
  'aparato-freidora': ['File:Untraditional air fryer beignets in toaster oven.jpg'],
  'aparato-parrilla': ['barbecue grill meat', 'grilling steak charcoal'],
  'aparato-licuadora': ['kitchen blender', 'blender'],
  'aparato-procesador': ['food processor'],
  'aparato-thermomix': ['Thermomix TM6', 'Thermomix kitchen', 'Thermomix TM5'],
  'aparato-ninja-foodi': ['Ninja Foodi', 'multicooker'],
  'aparato-ninja-licuadora': ['Ninja blender', 'Nutri Ninja'],
  'aparato-kitchenaid': ['KitchenAid stand mixer', 'KitchenAid mixer'],
  'aparato-olla-presion': ['Instant Pot', 'electric pressure cooker'],
};
