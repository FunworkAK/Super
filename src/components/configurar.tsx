import { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { APARATOS, APARATOS_INICIALES } from '../data/aparatos';
import { FOTOS } from '../data/fotos';
import { COMIDAS, DIAS, type AparatoId, type Comida, type ConfigMenu } from '../domain/types';
import { useApp } from '../state/AppState';
import { Foto } from './foto';
import { SelectorTiendas } from './tiendas';
import { Boton, Chip, Suave, colores, estilos } from './ui';

const PRINCIPALES: Comida[] = ['desayuno', 'almuerzo', 'cena'];
const ICONOS: Record<Comida, string> = { desayuno: '🍳', almuerzo: '🍲', cena: '🌙' };

// Preguntas antes de sugerir el menú: dónde compras, presupuesto, para
// cuántas personas, qué días, qué comidas y con qué aparatos cocinas.
export function ConfigurarMenu({ onListo, onCancelar }: { onListo: (c: ConfigMenu) => void; onCancelar?: () => void }) {
  const { config, presupuesto, setPresupuesto } = useApp();
  const [personas, setPersonas] = useState(config?.personas ?? 4);
  const [dias, setDias] = useState<number[]>(config?.dias ?? [0, 1, 2, 3, 4]);
  const [comidas, setComidas] = useState<Comida[]>(config?.comidas ?? ['almuerzo']);
  const [verCreditos, setVerCreditos] = useState(false);
  const [aparatos, setAparatos] = useState<AparatoId[]>(config?.aparatos ?? APARATOS_INICIALES);
  const [textoPresupuesto, setTextoPresupuesto] = useState(String(presupuesto));

  const alternarDia = (d: number) => setDias(dias.includes(d) ? dias.filter((x) => x !== d) : [...dias, d]);
  const alternarComida = (c: Comida) =>
    setComidas(comidas.includes(c) ? comidas.filter((x) => x !== c) : [...comidas, c]);
  const alternarAparato = (a: AparatoId) =>
    setAparatos(aparatos.includes(a) ? aparatos.filter((x) => x !== a) : [...aparatos, a]);
  const valido = dias.length > 0 && comidas.length > 0;

  return (
    <ScrollView style={estilos.pantalla} contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled">
      <Text style={s.titular}>Armemos tu menú</Text>
      <Suave>Con esto te sugerimos recetas para cada día y calculamos cuánto vas a gastar.</Suave>

      <Paso n={1} titulo="¿Dónde vas a comprar?">
        <SelectorTiendas />
      </Paso>

      <Paso n={2} titulo="¿Cuánto quieres gastar en la semana?">
        <View style={estilos.fila}>
          <Text style={s.q}>Q</Text>
          <TextInput
            style={[estilos.input, { flex: 1, fontSize: 18 }]}
            keyboardType="numeric"
            value={textoPresupuesto}
            onChangeText={(t) => {
              setTextoPresupuesto(t);
              const n = Number(t.replace(',', '.'));
              if (!Number.isNaN(n) && n >= 0) setPresupuesto(n);
            }}
          />
        </View>
      </Paso>

      <Paso n={3} titulo="¿Para cuántas personas?">
        <Contador valor={personas} onCambiar={setPersonas} min={1} etiqueta={personas === 1 ? 'persona' : 'personas'} />
      </Paso>

      <Paso n={4} titulo="¿Qué días?">
        <View style={[estilos.fila, { flexWrap: 'wrap' }]}>
          {DIAS.map((d, i) => (
            <Pressable
              key={d}
              role="checkbox"
              aria-checked={dias.includes(i)}
              aria-label={d}
              onPress={() => alternarDia(i)}
              style={[s.dia, dias.includes(i) && s.activo]}
            >
              <Text style={[s.diaTexto, dias.includes(i) && { color: '#fff' }]}>{d.slice(0, 2)}</Text>
            </Pressable>
          ))}
        </View>
        <View style={estilos.fila}>
          <Chip texto="Lunes a viernes" onPress={() => setDias([0, 1, 2, 3, 4])} />
          <Chip texto="Toda la semana" onPress={() => setDias([0, 1, 2, 3, 4, 5, 6])} />
        </View>
      </Paso>

      <Paso n={5} titulo="¿Qué comidas necesitas?">
        <Suave>Elige 1, 2 o las 3 comidas ({comidas.length} elegidas).</Suave>
        <View style={estilos.fila}>
          {PRINCIPALES.map((c) => (
            <Opcion key={c} comida={c} activa={comidas.includes(c)} onPress={() => alternarComida(c)} />
          ))}
        </View>
      </Paso>

      <Paso n={6} titulo="¿Qué aparatos tienes en tu cocina?">
        <Suave>Toca los que tienes ({aparatos.length} elegidos). Solo te sugerimos recetas que puedas hacer con ellos.</Suave>
        <View style={s.aparatos}>
          {APARATOS.map((a) => {
            const activo = aparatos.includes(a.id);
            return (
              <Pressable
                key={a.id}
                role="checkbox"
                aria-checked={activo}
                aria-label={a.nombre}
                onPress={() => alternarAparato(a.id)}
                style={({ pressed }) => [s.aparato, activo && s.aparatoActivo, pressed && { opacity: 0.8 }]}
              >
                <Foto
                  clave={`aparato-${a.id}`}
                  emoji={a.emoji}
                  fondo={activo ? '#FFFFFF' : colores.fondo}
                  tamanoEmoji={34}
                  style={[s.aparatoFoto, !activo && { opacity: 0.55 }]}
                />
                <View style={[s.marca, activo && s.marcaActiva]}>
                  {activo && <Text style={{ color: '#fff', fontSize: 12, fontWeight: '800' }}>✓</Text>}
                </View>
                <Text style={[s.aparatoNombre, activo && { color: colores.primario }]} numberOfLines={1}>
                  {a.nombre}
                </Text>
                <Text style={s.aparatoDetalle} numberOfLines={1}>
                  {a.detalle}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Pressable onPress={() => setVerCreditos(!verCreditos)}>
          <Text style={s.creditos}>Fotos de Wikimedia Commons · {verCreditos ? 'ocultar' : 'ver'} créditos</Text>
        </Pressable>
        {verCreditos &&
          APARATOS.filter((a) => FOTOS[`aparato-${a.id}`]).map((a) => {
            const f = FOTOS[`aparato-${a.id}`];
            return (
              <Pressable key={a.id} onPress={() => Linking.openURL(f.pagina)}>
                <Text style={s.creditos}>
                  {a.nombre}: {f.autor} · {f.licencia} ↗
                </Text>
              </Pressable>
            );
          })}
      </Paso>

      {!valido && <Text style={{ color: colores.alerta }}>Elige al menos un día y una comida.</Text>}
      <Boton
        titulo="✨  Sugerir mi menú"
        onPress={() =>
          valido &&
          onListo({
            personas,
            dias: [...dias].sort((a, b) => a - b),
            comidas: PRINCIPALES.filter((c) => comidas.includes(c)),
            aparatos,
          })
        }
      />
      {onCancelar && <Boton tipo="secundario" titulo="Cancelar" onPress={onCancelar} />}
    </ScrollView>
  );
}

function Paso({ n, titulo, children }: { n: number; titulo: string; children: React.ReactNode }) {
  return (
    <View style={s.paso}>
      <View style={estilos.fila}>
        <View style={s.numero}>
          <Text style={{ color: '#fff', fontWeight: '800' }}>{n}</Text>
        </View>
        <Text style={s.pasoTitulo}>{titulo}</Text>
      </View>
      {children}
    </View>
  );
}

function Contador({
  valor,
  onCambiar,
  min,
  etiqueta,
}: {
  valor: number;
  onCambiar: (n: number) => void;
  min: number;
  etiqueta: string;
}) {
  return (
    <View style={[estilos.fila, { gap: 16 }]}>
      <Pressable aria-label="Menos" style={s.redondo} onPress={() => onCambiar(Math.max(min, valor - 1))}>
        <Text style={s.redondoTexto}>−</Text>
      </Pressable>
      <Text style={s.contador}>
        {valor} <Text style={{ fontSize: 15, fontWeight: '400' }}>{etiqueta}</Text>
      </Text>
      <Pressable aria-label="Más" style={s.redondo} onPress={() => onCambiar(valor + 1)}>
        <Text style={s.redondoTexto}>+</Text>
      </Pressable>
    </View>
  );
}

function Opcion({ comida, activa, onPress }: { comida: Comida; activa: boolean; onPress: () => void }) {
  return (
    <Pressable
      role="checkbox"
      aria-checked={activa}
      aria-label={COMIDAS[comida]}
      onPress={onPress}
      style={[s.opcion, activa && s.opcionActiva]}
    >
      <Text style={{ fontSize: 24 }}>{ICONOS[comida]}</Text>
      <Text style={[s.opcionTexto, activa && { color: colores.primario }]}>{COMIDAS[comida]}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  titular: { fontSize: 24, fontWeight: '800', color: colores.texto },
  paso: {
    backgroundColor: colores.tarjeta,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: 14,
    gap: 10,
  },
  numero: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colores.primario,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pasoTitulo: { fontSize: 16, fontWeight: '700', color: colores.texto, flex: 1 },
  q: { fontSize: 20, fontWeight: '700', color: colores.texto },
  dia: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: colores.borde,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colores.fondo,
  },
  activo: { backgroundColor: colores.primario, borderColor: colores.primario },
  diaTexto: { fontWeight: '700', color: colores.texto },
  redondo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colores.primarioSuave,
    alignItems: 'center',
    justifyContent: 'center',
  },
  redondoTexto: { fontSize: 24, color: colores.primario, fontWeight: '700' },
  contador: { fontSize: 24, fontWeight: '800', color: colores.texto, minWidth: 120, textAlign: 'center' },
  opcion: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colores.borde,
    backgroundColor: colores.fondo,
    gap: 2,
  },
  opcionActiva: { borderColor: colores.primario, backgroundColor: colores.primarioSuave },
  opcionTexto: { fontWeight: '700', color: colores.texto, fontSize: 13 },
  creditos: { fontSize: 11, color: colores.suave },
  aparatos: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  aparato: {
    width: 104,
    flexGrow: 1,
    maxWidth: 160,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colores.borde,
    backgroundColor: colores.fondo,
    overflow: 'hidden',
    paddingBottom: 8,
  },
  aparatoActivo: { borderColor: colores.primario, backgroundColor: colores.primarioSuave },
  aparatoFoto: { height: 78 },
  aparatoNombre: { fontWeight: '700', color: colores.texto, fontSize: 13, paddingHorizontal: 8, marginTop: 6 },
  aparatoDetalle: { color: colores.suave, fontSize: 11, paddingHorizontal: 8 },
  marca: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  marcaActiva: { backgroundColor: colores.primario },
});
