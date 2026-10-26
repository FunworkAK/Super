import { Pressable, StyleSheet, Text, View } from 'react-native';
import { EMOJI_RECETA, fondoReceta } from '../data/visual';
import type { Macros } from '../domain/macros';
import type { Receta } from '../domain/types';
import { colores } from './ui';

export function MacrosFila({ m, compacto }: { m: Macros; compacto?: boolean }) {
  const items: [string, string, string][] = [
    [`${Math.round(m.kcal)}`, 'kcal', '#B3412E'],
    [`${Math.round(m.proteina)} g`, 'proteína', '#2F7D4F'],
    [`${Math.round(m.carbos)} g`, 'carbos', '#C08A1E'],
    [`${Math.round(m.grasa)} g`, 'grasa', '#4F6DB3'],
  ];
  return (
    <View style={[s.macros, compacto && { gap: 6 }]}>
      {items.map(([valor, etiqueta, color]) => (
        <View key={etiqueta} style={[s.macro, compacto && s.macroCompacto]}>
          <Text style={[s.macroValor, compacto && { fontSize: 13 }, { color }]}>{valor}</Text>
          <Text style={s.macroEtiqueta}>{etiqueta}</Text>
        </View>
      ))}
    </View>
  );
}

export function Portada({ receta, alto = 140, grande }: { receta: Receta; alto?: number; grande?: boolean }) {
  return (
    <View style={[s.portada, { height: alto, backgroundColor: fondoReceta(receta.id) }]}>
      <Text style={{ fontSize: grande ? 96 : 56 }}>{EMOJI_RECETA[receta.id] ?? '🍽️'}</Text>
    </View>
  );
}

export function TarjetaReceta({
  receta,
  macros,
  costo,
  cobertura,
  enPlan,
  onPress,
}: {
  receta: Receta;
  macros: Macros;
  costo: number | null;
  cobertura: number;
  enPlan: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s.tarjeta, pressed && { opacity: 0.85 }]}>
      <Portada receta={receta} alto={110} />
      {enPlan && (
        <View style={s.etiquetaPlan}>
          <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>EN TU PLAN</Text>
        </View>
      )}
      <View style={{ padding: 10, gap: 4 }}>
        <Text style={s.nombre} numberOfLines={2}>
          {receta.nombre}
        </Text>
        <Text style={s.meta}>
          ⏱ {receta.minutos} min · 🔥 {Math.round(macros.kcal)} kcal · 💪 {Math.round(macros.proteina)} g
        </Text>
        <Text style={s.meta}>
          {costo !== null ? `Q${costo.toFixed(2)}/porción` : ''}
          {cobertura > 0 ? ` · tienes ${Math.round(cobertura * 100)}%` : ''}
        </Text>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  macros: { flexDirection: 'row', gap: 8 },
  macro: {
    flex: 1,
    backgroundColor: colores.tarjeta,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colores.borde,
    paddingVertical: 10,
    alignItems: 'center',
  },
  macroCompacto: { paddingVertical: 6 },
  macroValor: { fontSize: 17, fontWeight: '700' },
  macroEtiqueta: { fontSize: 11, color: colores.suave },
  portada: { alignItems: 'center', justifyContent: 'center', width: '100%' },
  tarjeta: {
    width: 160,
    flexGrow: 1,
    maxWidth: 340,
    backgroundColor: colores.tarjeta,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colores.borde,
  },
  etiquetaPlan: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colores.primario,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  nombre: { fontSize: 15, fontWeight: '700', color: colores.texto },
  meta: { fontSize: 12, color: colores.suave },
});
