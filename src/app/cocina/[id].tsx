import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Boton, Suave, colores, confirmar, estilos } from '../../components/ui';
import { RECETAS } from '../../data/recetas';
import { EMOJI_INGREDIENTE, EMOJI_RECETA } from '../../data/visual';
import { descontarReceta, formatoCantidad } from '../../domain/planificador';
import { useApp } from '../../state/AppState';

export function generateStaticParams() {
  return RECETAS.map((r) => ({ id: r.id }));
}

// Modo cocina: un paso a la vez, con letra grande y los ingredientes a mano.
export default function ModoCocina() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { catalogo, plan, setPlan, inventario, setInventario } = useApp();
  const receta = catalogo.recetas[id ?? ''];
  const [paso, setPaso] = useState(-1); // -1 = ingredientes

  if (!receta) return <Suave>No encontré esa receta.</Suave>;

  const iPlan = plan.findIndex((p) => p.recetaId === receta.id);
  const item = iPlan >= 0 ? plan[iPlan] : { recetaId: receta.id, porciones: receta.porciones };
  const factor = item.porciones / receta.porciones;
  const total = receta.pasos.length;
  const ultimo = paso === total - 1;

  const terminar = () =>
    confirmar('¡Buen provecho!', 'Se descontarán los ingredientes de tu despensa.', 'Terminar', () => {
      setInventario(descontarReceta(inventario, item, catalogo));
      if (iPlan >= 0) setPlan(plan.filter((_, j) => j !== iPlan));
      router.replace('/');
    });

  return (
    <View style={[estilos.pantalla, { backgroundColor: '#1F2421' }]}>
      <View style={s.barra}>
        {[-1, ...receta.pasos.map((_, n) => n)].map((n) => (
          <View key={n} style={[s.segmento, n <= paso && { backgroundColor: '#7FD19B' }]} />
        ))}
      </View>
      <ScrollView contentContainerStyle={[estilos.contenido, { flexGrow: 1 }]}>
        <Pressable onPress={() => router.back()}>
          <Text style={{ color: '#7FD19B', fontWeight: '600' }}>‹ Salir</Text>
        </Pressable>
        <Text style={{ fontSize: 48 }}>{EMOJI_RECETA[receta.id]}</Text>
        {paso === -1 ? (
          <>
            <Text style={s.etiqueta}>ANTES DE EMPEZAR · {item.porciones} porciones</Text>
            <Text style={s.grande}>Ten a mano:</Text>
            {receta.ingredientes.map((i) => {
              const ing = catalogo.ingredientes[i.id];
              return (
                <Text key={i.id} style={s.ingrediente}>
                  {EMOJI_INGREDIENTE[i.id]} {ing?.nombre}: {ing ? formatoCantidad(i.cantidad * factor, ing.unidad) : ''}
                </Text>
              );
            })}
          </>
        ) : (
          <>
            <Text style={s.etiqueta}>
              PASO {paso + 1} DE {total}
            </Text>
            <Text style={s.grande}>{receta.pasos[paso]}</Text>
          </>
        )}
      </ScrollView>
      <View style={s.pie}>
        <View style={{ flex: 1 }}>
          {paso > -1 && <Boton tipo="secundario" titulo="‹ Anterior" onPress={() => setPaso(paso - 1)} />}
        </View>
        <View style={{ flex: 1 }}>
          {ultimo ? (
            <Boton titulo="✓ Terminé" onPress={terminar} />
          ) : (
            <Boton titulo={paso === -1 ? 'Empezar ›' : 'Siguiente ›'} onPress={() => setPaso(paso + 1)} />
          )}
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  barra: { flexDirection: 'row', gap: 4, padding: 12, width: '100%', maxWidth: 720, alignSelf: 'center' },
  segmento: { flex: 1, height: 4, borderRadius: 2, backgroundColor: '#3B423E' },
  etiqueta: { color: '#7FD19B', fontWeight: '700', letterSpacing: 1 },
  grande: { color: '#fff', fontSize: 28, lineHeight: 38, fontWeight: '600' },
  ingrediente: { color: '#E8ECE9', fontSize: 20, lineHeight: 30 },
  pie: { flexDirection: 'row', gap: 12, padding: 16, width: '100%', maxWidth: 720, alignSelf: 'center' },
});
