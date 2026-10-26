import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Boton, Suave, Tarjeta, Titulo, colores, estilos } from '../components/ui';
import { INGREDIENTES } from '../data/ingredientes';
import { formatoCantidad } from '../domain/planificador';
import { useApp } from '../state/AppState';

export default function Despensa() {
  const { inventario, setCantidad, catalogo } = useApp();
  const [busqueda, setBusqueda] = useState('');

  const enCasa = Object.entries(inventario)
    .map(([id, cantidad]) => ({ ing: catalogo.ingredientes[id], cantidad }))
    .filter((x) => x.ing)
    .sort((a, b) => a.ing.nombre.localeCompare(b.ing.nombre));

  const resultados = useMemo(() => {
    const q = normalizar(busqueda.trim());
    if (!q) return [];
    return INGREDIENTES.filter((i) => normalizar(i.nombre).includes(q)).slice(0, 8);
  }, [busqueda]);

  return (
    <ScrollView style={estilos.pantalla} contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled">
      <Suave>Anota lo que ya tienes en casa. La lista del super lo descuenta automáticamente.</Suave>

      <TextInput
        style={estilos.input}
        placeholder="Buscar ingrediente para agregar (p. ej. arroz)"
        placeholderTextColor={colores.suave}
        value={busqueda}
        onChangeText={setBusqueda}
      />
      {resultados.map((ing) => (
        <Pressable
          key={ing.id}
          onPress={() => {
            setCantidad(ing.id, (inventario[ing.id] ?? 0) + ing.paso);
            setBusqueda('');
          }}
        >
          <Tarjeta style={estilos.fila}>
            <Text style={[estilos.texto, { flex: 1 }]}>{ing.nombre}</Text>
            <Text style={{ color: colores.primario }}>+ {formatoCantidad(ing.paso, ing.unidad)}</Text>
          </Tarjeta>
        </Pressable>
      ))}

      <Titulo>En mi despensa ({enCasa.length})</Titulo>
      {enCasa.length === 0 && <Suave>Todavía no has agregado nada.</Suave>}
      {enCasa.map(({ ing, cantidad }) => (
        <Tarjeta key={ing.id}>
          <View style={estilos.fila}>
            <View style={{ flex: 1 }}>
              <Text style={estilos.texto}>{ing.nombre}</Text>
              <Suave>{ing.pasillo}</Suave>
            </View>
            <Boton pequeno tipo="secundario" titulo="−" onPress={() => setCantidad(ing.id, cantidad - ing.paso)} />
            <TextInput
              style={[estilos.input, { width: 72, textAlign: 'center', paddingVertical: 6 }]}
              keyboardType="numeric"
              value={String(Math.round(cantidad * 100) / 100)}
              onChangeText={(t) => {
                const n = Number(t.replace(',', '.'));
                if (!Number.isNaN(n)) setCantidad(ing.id, n);
              }}
            />
            <Text style={[estilos.suave, { width: 22 }]}>{ing.unidad}</Text>
            <Boton pequeno tipo="secundario" titulo="+" onPress={() => setCantidad(ing.id, cantidad + ing.paso)} />
          </View>
        </Tarjeta>
      ))}
    </ScrollView>
  );
}

function normalizar(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}
