import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MacrosFila } from '../../components/receta';
import { Boton, Suave, Titulo, colores, confirmar, estilos } from '../../components/ui';
import { EMOJI_RECETA, fondoReceta } from '../../data/visual';
import { macrosPlan, macrosPorPorcion } from '../../domain/macros';
import { armarLista, descontarReceta, formatoQ } from '../../domain/planificador';
import { useApp } from '../../state/AppState';

export default function Plan() {
  const { plan, setPlan, catalogo, inventario, setInventario, estrategia } = useApp();

  const cambiarPorciones = (i: number, delta: number) =>
    setPlan(plan.map((p, j) => (j === i ? { ...p, porciones: Math.max(1, p.porciones + delta) } : p)));
  const quitar = (i: number) => setPlan(plan.filter((_, j) => j !== i));
  const cocinada = (i: number) => {
    setInventario(descontarReceta(inventario, plan[i], catalogo));
    quitar(i);
  };

  const porciones = plan.reduce((s, p) => s + p.porciones, 0);
  const total = macrosPlan(plan, catalogo.recetas, catalogo.ingredientes);
  const promedio = porciones
    ? { kcal: total.kcal / porciones, proteina: total.proteina / porciones, carbos: total.carbos / porciones, grasa: total.grasa / porciones }
    : total;
  const costo = armarLista(plan, inventario, catalogo, estrategia).total;

  if (plan.length === 0) {
    return (
      <View style={[estilos.pantalla, { alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 }]}>
        <Text style={{ fontSize: 56 }}>📅</Text>
        <Titulo>Tu semana está vacía</Titulo>
        <Suave>Elige recetas deslizando en Descubrir.</Suave>
        <Boton titulo="Descubrir recetas" onPress={() => router.push('/recetas')} />
      </View>
    );
  }

  return (
    <ScrollView style={estilos.pantalla} contentContainerStyle={estilos.contenido}>
      <View style={s.resumen}>
        <Text style={s.resumenTitulo}>Tu semana</Text>
        <Text style={s.resumenMeta}>
          {plan.length} comidas · {porciones} porciones · lista {formatoQ(costo)}
        </Text>
        <Text style={[s.resumenMeta, { marginTop: 6 }]}>Promedio por porción</Text>
        <MacrosFila m={promedio} compacto />
        <Text style={[s.resumenMeta, { marginTop: 4 }]}>
          Total de la semana: {Math.round(total.kcal).toLocaleString('es-GT')} kcal · {Math.round(total.proteina)} g proteína
        </Text>
      </View>

      {plan.map((item, i) => {
        const receta = catalogo.recetas[item.recetaId];
        if (!receta) return null;
        const m = macrosPorPorcion(receta, catalogo.ingredientes);
        return (
          <View key={`${item.recetaId}-${i}`} style={s.fila}>
            <Pressable onPress={() => router.push(`/receta/${receta.id}`)} style={[s.miniatura, { backgroundColor: fondoReceta(receta.id) }]}>
              <Text style={{ fontSize: 34 }}>{EMOJI_RECETA[receta.id]}</Text>
            </Pressable>
            <View style={{ flex: 1, gap: 4 }}>
              <Pressable onPress={() => router.push(`/receta/${receta.id}`)}>
                <Text style={s.nombre}>{receta.nombre}</Text>
              </Pressable>
              <Text style={s.meta}>
                🔥 {Math.round(m.kcal)} kcal · 💪 {Math.round(m.proteina)} g · ⏱ {receta.minutos} min
              </Text>
              <View style={[estilos.fila, { gap: 6, flexWrap: 'wrap' }]}>
                <Pressable style={s.mini} onPress={() => cambiarPorciones(i, -1)}>
                  <Text style={s.miniTexto}>−</Text>
                </Pressable>
                <Text style={{ color: colores.texto, fontWeight: '600' }}>{item.porciones} porc.</Text>
                <Pressable style={s.mini} onPress={() => cambiarPorciones(i, 1)}>
                  <Text style={s.miniTexto}>+</Text>
                </Pressable>
                <Pressable onPress={() => router.push(`/cocina/${receta.id}`)}>
                  <Text style={s.accion}>👩‍🍳 Cocinar</Text>
                </Pressable>
                <Pressable
                  onPress={() =>
                    confirmar('¿Ya la cocinaste?', 'Se descontarán los ingredientes de tu despensa.', 'Sí', () => cocinada(i))
                  }
                >
                  <Text style={s.accion}>✓ Ya la hice</Text>
                </Pressable>
                <Pressable onPress={() => quitar(i)}>
                  <Text style={[s.accion, { color: colores.alerta }]}>Quitar</Text>
                </Pressable>
              </View>
            </View>
          </View>
        );
      })}

      <Boton titulo="🛒  Ver lista del super" onPress={() => router.push('/lista')} />
      <Boton tipo="peligro" titulo="Vaciar semana" onPress={() => confirmar('Vaciar semana', 'Se quitarán todas las recetas.', 'Vaciar', () => setPlan([]))} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  resumen: { backgroundColor: colores.primario, borderRadius: 18, padding: 16, gap: 4 },
  resumenTitulo: { color: '#fff', fontSize: 22, fontWeight: '800' },
  resumenMeta: { color: '#E3F1E8', fontSize: 13 },
  fila: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colores.tarjeta,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: 10,
  },
  miniatura: { width: 76, height: 76, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  nombre: { fontSize: 16, fontWeight: '700', color: colores.texto },
  meta: { fontSize: 12, color: colores.suave },
  mini: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colores.primarioSuave,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniTexto: { fontSize: 16, color: colores.primario, fontWeight: '700' },
  accion: { fontSize: 13, color: colores.primario, fontWeight: '600', paddingHorizontal: 4 },
});
