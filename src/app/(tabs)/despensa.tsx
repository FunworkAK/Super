import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Boton, Chip, Suave, colores, estilos } from '../../components/ui';
import { INGREDIENTES } from '../../data/ingredientes';
import { EMOJI_INGREDIENTE, PRESETS } from '../../data/visual';
import { formatoCantidad } from '../../domain/planificador';
import type { Ingrediente, Pasillo } from '../../domain/types';
import { useApp } from '../../state/AppState';

const PASILLOS: Pasillo[] = [
  'Frutas y verduras',
  'Carnes y pescado',
  'Lácteos y huevos',
  'Granos y abarrotes',
  'Panadería',
  'Condimentos y salsas',
  'Congelados',
];

export default function Despensa() {
  const { inventario, setCantidad } = useApp();
  const [busqueda, setBusqueda] = useState('');
  const [pasillo, setPasillo] = useState<Pasillo | 'mios' | null>(null);
  const [editando, setEditando] = useState<Ingrediente | null>(null);

  const visibles = useMemo(() => {
    const q = normalizar(busqueda.trim());
    return INGREDIENTES.filter(
      (i) =>
        (!q || normalizar(i.nombre).includes(q)) &&
        (pasillo === null || (pasillo === 'mios' ? inventario[i.id] > 0 : i.pasillo === pasillo)),
    );
  }, [busqueda, pasillo, inventario]);

  const grupos = PASILLOS.map((p) => ({ pasillo: p, items: visibles.filter((i) => i.pasillo === p) })).filter(
    (g) => g.items.length > 0,
  );
  const cuantos = Object.keys(inventario).length;

  const tocar = (ing: Ingrediente) => {
    if (!(inventario[ing.id] > 0)) setCantidad(ing.id, ing.paso);
    setEditando(ing);
  };

  return (
    <View style={estilos.pantalla}>
      <ScrollView contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled">
        <Text style={s.titular}>¿Qué tienes en casa?</Text>
        <Suave>Toca un ingrediente para agregarlo y ajusta cuánto tienes. Lo descontamos de tu lista del super.</Suave>

        <TextInput
          style={estilos.input}
          placeholder="Buscar ingrediente…"
          placeholderTextColor={colores.suave}
          value={busqueda}
          onChangeText={setBusqueda}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          <Chip texto="Todo" activo={pasillo === null} onPress={() => setPasillo(null)} />
          <Chip texto={`En mi despensa (${cuantos})`} activo={pasillo === 'mios'} onPress={() => setPasillo('mios')} />
          {PASILLOS.map((p) => (
            <Chip key={p} texto={p} activo={pasillo === p} onPress={() => setPasillo(p)} />
          ))}
        </ScrollView>

        {grupos.length === 0 && <Suave>No hay ingredientes que coincidan.</Suave>}
        {grupos.map((g) => (
          <View key={g.pasillo} style={{ gap: 8 }}>
            <Text style={s.seccion}>{g.pasillo}</Text>
            <View style={s.rejilla}>
              {g.items.map((ing) => {
                const cant = inventario[ing.id] ?? 0;
                const tengo = cant > 0;
                return (
                  <Pressable
                    key={ing.id}
                    onPress={() => tocar(ing)}
                    role="button"
                    aria-label={`${ing.nombre}${tengo ? `, tienes ${formatoCantidad(cant, ing.unidad)}` : ''}`}
                    style={({ pressed }) => [s.ficha, tengo && s.fichaActiva, pressed && { transform: [{ scale: 0.96 }] }]}
                  >
                    {tengo && <Text style={s.check}>✓</Text>}
                    <Text style={s.emoji}>{EMOJI_INGREDIENTE[ing.id] ?? '🛒'}</Text>
                    <Text style={s.nombre} numberOfLines={2}>
                      {ing.nombre}
                    </Text>
                    <Text style={[s.cantidad, !tengo && { color: colores.suave }]}>
                      {tengo ? formatoCantidad(cant, ing.unidad) : 'Agregar'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>

      <EditorCantidad
        ingrediente={editando}
        cantidad={editando ? (inventario[editando.id] ?? 0) : 0}
        onCambiar={(n) => editando && setCantidad(editando.id, n)}
        onCerrar={() => setEditando(null)}
      />
    </View>
  );
}

function EditorCantidad({
  ingrediente,
  cantidad,
  onCambiar,
  onCerrar,
}: {
  ingrediente: Ingrediente | null;
  cantidad: number;
  onCambiar: (n: number) => void;
  onCerrar: () => void;
}) {
  if (!ingrediente) return null;
  const paso = ingrediente.unidad === 'g' ? 113.4 : ingrediente.unidad === 'ml' ? 250 : 1;
  return (
    <Modal transparent animationType="slide" visible onRequestClose={onCerrar}>
      <Pressable style={s.velo} onPress={onCerrar} />
      <View style={s.hoja}>
        <View style={s.asa} />
        <Text style={{ fontSize: 56, textAlign: 'center' }}>{EMOJI_INGREDIENTE[ingrediente.id]}</Text>
        <Text style={[s.titular, { textAlign: 'center' }]}>{ingrediente.nombre}</Text>

        <View style={[estilos.fila, { justifyContent: 'center', gap: 20, marginVertical: 8 }]}>
          <Pressable style={s.redondo} onPress={() => onCambiar(Math.max(0, cantidad - paso))}>
            <Text style={s.redondoTexto}>−</Text>
          </Pressable>
          <Text style={s.grande}>{cantidad > 0 ? formatoCantidad(cantidad, ingrediente.unidad) : '0'}</Text>
          <Pressable style={s.redondo} onPress={() => onCambiar(cantidad + paso)}>
            <Text style={s.redondoTexto}>+</Text>
          </Pressable>
        </View>

        <Text style={[estilos.suave, { textAlign: 'center' }]}>Cantidad rápida</Text>
        <View style={[estilos.fila, { justifyContent: 'center', flexWrap: 'wrap' }]}>
          {PRESETS[ingrediente.unidad].map((p) => (
            <Chip
              key={p.etiqueta}
              texto={p.etiqueta}
              activo={Math.abs(cantidad - p.valor) < 0.5}
              onPress={() => onCambiar(p.valor)}
            />
          ))}
        </View>

        <View style={[estilos.fila, { marginTop: 12 }]}>
          <View style={{ flex: 1 }}>
            <Boton
              tipo="peligro"
              titulo="Ya no tengo"
              onPress={() => {
                onCambiar(0);
                onCerrar();
              }}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Boton titulo="Listo" onPress={onCerrar} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function normalizar(t: string) {
  return t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

const s = StyleSheet.create({
  titular: { fontSize: 22, fontWeight: '700', color: colores.texto },
  seccion: { fontSize: 13, fontWeight: '700', color: colores.suave, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 6 },
  rejilla: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  ficha: {
    width: 104,
    minHeight: 112,
    backgroundColor: colores.tarjeta,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colores.borde,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    gap: 2,
  },
  fichaActiva: { borderColor: colores.primario, backgroundColor: colores.primarioSuave },
  check: {
    position: 'absolute',
    top: 6,
    right: 8,
    color: colores.primario,
    fontWeight: '800',
  },
  emoji: { fontSize: 34 },
  nombre: { fontSize: 13, textAlign: 'center', color: colores.texto },
  cantidad: { fontSize: 13, fontWeight: '700', color: colores.primario },
  velo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
  hoja: {
    backgroundColor: colores.fondo,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 32,
    gap: 8,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  asa: { width: 40, height: 4, borderRadius: 2, backgroundColor: colores.borde, alignSelf: 'center' },
  redondo: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colores.primarioSuave,
    alignItems: 'center',
    justifyContent: 'center',
  },
  redondoTexto: { fontSize: 28, color: colores.primario, fontWeight: '600' },
  grande: { fontSize: 30, fontWeight: '700', color: colores.texto, minWidth: 120, textAlign: 'center' },
});
