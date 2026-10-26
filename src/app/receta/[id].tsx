import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MacrosFila, Portada } from '../../components/receta';
import { Boton, Suave, colores, estilos } from '../../components/ui';
import { RECETAS } from '../../data/recetas';
import { EMOJI_INGREDIENTE } from '../../data/visual';
import { macrosPorPorcion } from '../../domain/macros';
import { costoPorPorcion, formatoCantidad } from '../../domain/planificador';
import { useApp } from '../../state/AppState';

export function generateStaticParams() {
  return RECETAS.map((r) => ({ id: r.id }));
}

export default function DetalleReceta() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { catalogo, inventario, plan, setPlan, agregarAlPlan } = useApp();
  const receta = catalogo.recetas[id ?? ''];
  const enPlan = plan.findIndex((p) => p.recetaId === id);
  const [porciones, setPorciones] = useState(enPlan >= 0 ? plan[enPlan].porciones : (receta?.porciones ?? 4));

  if (!receta) {
    return (
      <View style={[estilos.pantalla, estilos.contenido]}>
        <Suave>No encontré esa receta.</Suave>
      </View>
    );
  }

  const factor = porciones / receta.porciones;
  const macros = macrosPorPorcion(receta, catalogo.ingredientes);
  const costo = costoPorPorcion(receta, catalogo);
  const tengo = receta.ingredientes.filter((i) => (inventario[i.id] ?? 0) >= i.cantidad * factor).length;

  const cambiar = (n: number) => {
    const nuevo = Math.max(1, n);
    setPorciones(nuevo);
    if (enPlan >= 0) setPlan(plan.map((p, j) => (j === enPlan ? { ...p, porciones: nuevo } : p)));
  };

  return (
    <View style={estilos.pantalla}>
      <ScrollView contentContainerStyle={[estilos.contenido, { paddingTop: 0, paddingHorizontal: 0 }]}>
        <Portada receta={receta} alto={220} grande />
        <View style={{ paddingHorizontal: 16, gap: 14 }}>
          <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/recetas'))}>
            <Text style={{ color: colores.primario, fontWeight: '600' }}>‹ Recetas</Text>
          </Pressable>
          <Text style={s.titulo}>{receta.nombre}</Text>
          <Text style={s.meta}>
            ⏱ {receta.minutos} min{costo !== null ? ` · Q${costo.toFixed(2)} por porción` : ''}
            {receta.etiquetas.length ? ` · ${receta.etiquetas.join(', ')}` : ''}
          </Text>

          <Text style={s.seccion}>Macros por porción</Text>
          <MacrosFila m={macros} />
          <Suave>Valores aproximados.</Suave>

          <View style={[estilos.fila, { justifyContent: 'space-between' }]}>
            <Text style={s.seccion}>Ingredientes</Text>
            <View style={estilos.fila}>
              <Pressable style={s.mini} onPress={() => cambiar(porciones - 1)}>
                <Text style={s.miniTexto}>−</Text>
              </Pressable>
              <Text style={{ fontWeight: '600', color: colores.texto }}>{porciones} porciones</Text>
              <Pressable style={s.mini} onPress={() => cambiar(porciones + 1)}>
                <Text style={s.miniTexto}>+</Text>
              </Pressable>
            </View>
          </View>
          <Suave>
            Tienes {tengo} de {receta.ingredientes.length} en tu despensa.
          </Suave>
          <View style={s.caja}>
            {receta.ingredientes.map((i, n) => {
              const ing = catalogo.ingredientes[i.id];
              const necesito = i.cantidad * factor;
              const ok = (inventario[i.id] ?? 0) >= necesito;
              return (
                <View key={i.id} style={[s.ingrediente, n > 0 && { borderTopWidth: 1, borderTopColor: colores.borde }]}>
                  <Text style={{ fontSize: 22 }}>{EMOJI_INGREDIENTE[i.id]}</Text>
                  <Text style={[estilos.texto, { flex: 1 }]}>{ing?.nombre ?? i.id}</Text>
                  <Text style={s.cant}>{ing ? formatoCantidad(necesito, ing.unidad) : necesito}</Text>
                  <Text style={{ width: 20, textAlign: 'center', color: ok ? colores.primario : colores.suave }}>
                    {ok ? '✓' : '○'}
                  </Text>
                </View>
              );
            })}
          </View>

          <Text style={s.seccion}>Preparación</Text>
          {receta.pasos.map((p, n) => (
            <View key={n} style={[estilos.fila, { alignItems: 'flex-start' }]}>
              <View style={s.numero}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>{n + 1}</Text>
              </View>
              <Text style={[estilos.texto, { flex: 1, lineHeight: 22 }]}>{p}</Text>
            </View>
          ))}

          <View style={{ gap: 8, marginTop: 8 }}>
            <Boton titulo="👩‍🍳  Modo cocina" onPress={() => router.push(`/cocina/${receta.id}`)} />
            {enPlan >= 0 ? (
              <Boton
                tipo="peligro"
                titulo="Quitar de mi semana"
                onPress={() => setPlan(plan.filter((_, j) => j !== enPlan))}
              />
            ) : (
              <Boton tipo="secundario" titulo="♥  Agregar a mi semana" onPress={() => agregarAlPlan(receta.id, porciones)} />
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  titulo: { fontSize: 26, fontWeight: '800', color: colores.texto },
  meta: { fontSize: 14, color: colores.suave },
  seccion: { fontSize: 17, fontWeight: '700', color: colores.texto, marginTop: 6 },
  caja: { backgroundColor: colores.tarjeta, borderRadius: 14, borderWidth: 1, borderColor: colores.borde },
  ingrediente: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 10 },
  cant: { fontSize: 14, color: colores.suave, fontWeight: '600' },
  mini: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colores.primarioSuave,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniTexto: { fontSize: 18, color: colores.primario, fontWeight: '700' },
  numero: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colores.primario,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
