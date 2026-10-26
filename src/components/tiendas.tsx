import { Pressable, StyleSheet, Text, View } from 'react-native';
import { TIENDAS, TODAS_TIENDAS, type TiendaId } from '../domain/types';
import { useApp } from '../state/AppState';
import { colores } from './ui';

const ICONO: Record<TiendaId, string> = { walmart: '🛒', latorre: '🏪', pricesmart: '📦' };

// Elegir en qué supermercados vas a comprar. Siempre queda al menos uno.
export function SelectorTiendas() {
  const { tiendas, setTiendas } = useApp();
  const alternar = (t: TiendaId) =>
    setTiendas(tiendas.includes(t) ? tiendas.filter((x) => x !== t) : [...tiendas, t]);
  return (
    <View style={s.fila}>
      {TODAS_TIENDAS.map((t) => {
        const activa = tiendas.includes(t);
        return (
          <Pressable
            key={t}
            role="checkbox"
            aria-checked={activa}
            aria-label={TIENDAS[t]}
            onPress={() => alternar(t)}
            style={[s.tienda, activa && s.activa]}
          >
            <Text style={{ fontSize: 22 }}>{ICONO[t]}</Text>
            <Text style={[s.nombre, activa && { color: colores.primario }]}>{TIENDAS[t]}</Text>
            <Text style={{ fontSize: 12, color: activa ? colores.primario : colores.suave }}>
              {activa ? '✓ Voy' : 'No voy'}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  fila: { flexDirection: 'row', gap: 8 },
  tienda: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colores.borde,
    backgroundColor: colores.tarjeta,
  },
  activa: { borderColor: colores.primario, backgroundColor: colores.primarioSuave },
  nombre: { fontWeight: '700', color: colores.texto },
});
