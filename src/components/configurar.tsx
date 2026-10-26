import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { COMIDAS, DIAS, type Comida, type ConfigMenu } from '../domain/types';
import { useApp } from '../state/AppState';
import { SelectorTiendas } from './tiendas';
import { Boton, Chip, Suave, colores, estilos } from './ui';

const PRINCIPALES: Comida[] = ['desayuno', 'almuerzo', 'cena'];
const EXTRAS: Comida[] = ['snack', 'lonchera'];
const ICONOS: Record<Comida, string> = { desayuno: '🍳', almuerzo: '🍲', cena: '🌙', snack: '🍎', lonchera: '🎒' };

// Preguntas antes de sugerir el menú: dónde compras, presupuesto, para
// cuántas personas, qué días y qué comidas.
export function ConfigurarMenu({ onListo, onCancelar }: { onListo: (c: ConfigMenu) => void; onCancelar?: () => void }) {
  const { config, presupuesto, setPresupuesto } = useApp();
  const [personas, setPersonas] = useState(config?.personas ?? 4);
  const [ninos, setNinos] = useState(config?.ninos ?? 1);
  const [dias, setDias] = useState<number[]>(config?.dias ?? [0, 1, 2, 3, 4]);
  const [comidas, setComidas] = useState<Comida[]>(config?.comidas ?? ['almuerzo']);
  const [textoPresupuesto, setTextoPresupuesto] = useState(String(presupuesto));

  const alternarDia = (d: number) => setDias(dias.includes(d) ? dias.filter((x) => x !== d) : [...dias, d]);
  const alternarComida = (c: Comida) =>
    setComidas(comidas.includes(c) ? comidas.filter((x) => x !== c) : [...comidas, c]);
  const principales = comidas.filter((c) => PRINCIPALES.includes(c)).length;
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
        <Suave>Elige 1, 2 o las 3 comidas principales ({principales} elegidas).</Suave>
        <View style={estilos.fila}>
          {PRINCIPALES.map((c) => (
            <Opcion key={c} comida={c} activa={comidas.includes(c)} onPress={() => alternarComida(c)} />
          ))}
        </View>
        <Suave>Extras</Suave>
        <View style={estilos.fila}>
          {EXTRAS.map((c) => (
            <Opcion key={c} comida={c} activa={comidas.includes(c)} onPress={() => alternarComida(c)} />
          ))}
        </View>
        {comidas.includes('lonchera') && (
          <View style={{ gap: 6, marginTop: 4 }}>
            <Suave>¿Para cuántos niños son las loncheras? (de lunes a viernes)</Suave>
            <Contador valor={ninos} onCambiar={setNinos} min={1} etiqueta={ninos === 1 ? 'niño' : 'niños'} />
          </View>
        )}
      </Paso>

      {!valido && <Text style={{ color: colores.alerta }}>Elige al menos un día y una comida.</Text>}
      <Boton
        titulo="✨  Sugerir mi menú"
        onPress={() => valido && onListo({ personas, ninos, dias: [...dias].sort((a, b) => a - b), comidas })}
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
});
