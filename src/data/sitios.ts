// Sitios con buenas recetas para buscar más ideas, por tema.
export interface Sitio {
  nombre: string;
  detalle: string;
  url: string;
}

export const SITIOS: { tema: string; emoji: string; sitios: Sitio[] }[] = [
  {
    tema: 'Comida sana',
    emoji: '🥗',
    sitios: [
      { nombre: 'Vitónica', detalle: 'Recetas saludables y ligeras', url: 'https://www.vitonica.com/recetas-saludables' },
      { nombre: 'EatingWell', detalle: 'Saludable, en inglés', url: 'https://www.eatingwell.com/' },
      { nombre: 'Guía Infantil', detalle: 'Recetas sanas para niños y familia', url: 'https://www.guiainfantil.com/recetas/' },
    ],
  },
  {
    tema: 'Internacional',
    emoji: '🌍',
    sitios: [
      { nombre: 'Directo al Paladar', detalle: 'Cocina española e internacional', url: 'https://www.directoalpaladar.com/' },
      { nombre: 'Recetas Gratis', detalle: 'Miles de recetas de todo el mundo', url: 'https://www.recetasgratis.net/' },
      { nombre: 'BBC Good Food', detalle: 'Recetas probadas, en inglés', url: 'https://www.bbcgoodfood.com/' },
      { nombre: 'Allrecipes', detalle: 'Recetas de la comunidad, en inglés', url: 'https://www.allrecipes.com/' },
    ],
  },
  {
    tema: 'Pollo asado',
    emoji: '🍗',
    sitios: [
      {
        nombre: 'Pollo al horno con verduras',
        detalle: 'Directo al Paladar',
        url: 'https://www.directoalpaladar.com/recetas-de-carnes-y-aves/pollo-al-horno',
      },
      { nombre: 'Más recetas de pollo asado', detalle: 'Directo al Paladar', url: 'https://www.directoalpaladar.com/tag/pollo-asado' },
      { nombre: 'Pollo asado en air fryer', detalle: 'Qué!', url: 'https://www.que.es/2026/07/27/receta-pollo-asado-airfryer-natalia/' },
    ],
  },
  {
    tema: 'Carne asada',
    emoji: '🥩',
    sitios: [
      { nombre: 'Chirmol guatemalteco', detalle: 'Living in Guatemala', url: 'https://livinginguatemala.com/es/recetas/chirmol/' },
      {
        nombre: 'Chirmol para carne asada',
        detalle: 'KCET · The Migrant Kitchen',
        url: 'https://www.kcet.org/shows/the-migrant-kitchen/chirmol-recipe-guatemalan-salsa-a-perfect-complement-to-carne-asada',
      },
      { nombre: 'Churrasco chapín', detalle: 'Revue Magazine', url: 'https://www.revuemag.com/?p=10907' },
    ],
  },
  {
    tema: 'Fácil de preparar',
    emoji: '⏱',
    sitios: [
      { nombre: 'Kiwilimón', detalle: 'Recetas mexicanas fáciles', url: 'https://www.kiwilimon.com/' },
      { nombre: 'Cookpad', detalle: 'Recetas caseras de la comunidad', url: 'https://cookpad.com/mx' },
      { nombre: 'The Foodie’s Kitchen', detalle: 'Cocina guatemalteca paso a paso', url: 'https://www.thefoodieskitchen.com/es/' },
    ],
  },
];
