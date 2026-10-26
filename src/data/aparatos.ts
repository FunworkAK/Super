import type { AparatoId } from '../domain/types';

// Aparatos que se pueden elegir en "Armemos tu menú". La foto sale de
// FOTOS['aparato-<id>']; el emoji se usa mientras no haya foto.
export const APARATOS: { id: AparatoId; nombre: string; detalle: string; emoji: string }[] = [
  { id: 'estufa', nombre: 'Estufa', detalle: 'Gas o eléctrica', emoji: '🔥' },
  { id: 'horno', nombre: 'Horno', detalle: 'Hornear y asar', emoji: '♨️' },
  { id: 'microondas', nombre: 'Microondas', detalle: 'Calentar', emoji: '📦' },
  { id: 'freidora', nombre: 'Freidora de aire', detalle: 'Air fryer', emoji: '🍟' },
  { id: 'parrilla', nombre: 'Parrilla', detalle: 'Churrasco', emoji: '🥩' },
  { id: 'licuadora', nombre: 'Licuadora', detalle: 'Salsas y licuados', emoji: '🥤' },
  { id: 'procesador', nombre: 'Procesador', detalle: 'Picar y moler', emoji: '🔪' },
  { id: 'thermomix', nombre: 'Thermomix', detalle: 'Licúa y cocina', emoji: '🤖' },
  { id: 'ninja-foodi', nombre: 'Ninja Foodi', detalle: 'Multicocina y air fryer', emoji: '🥘' },
  { id: 'ninja-licuadora', nombre: 'Licuadora Ninja', detalle: 'Ninja / Nutri Ninja', emoji: '🌀' },
  { id: 'kitchenaid', nombre: 'KitchenAid', detalle: 'Batidora de pedestal', emoji: '🎂' },
  { id: 'olla-presion', nombre: 'Olla de presión', detalle: 'Instant Pot', emoji: '🍲' },
];

export const APARATOS_POR_ID = Object.fromEntries(APARATOS.map((a) => [a.id, a])) as Record<
  AparatoId,
  (typeof APARATOS)[number]
>;

export const APARATOS_INICIALES: AparatoId[] = ['estufa', 'horno', 'licuadora', 'microondas'];
