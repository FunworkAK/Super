import { Alert, ScrollView, Text, View } from 'react-native';
import { Boton, Suave, Tarjeta, Titulo, estilos } from '../components/ui';
import { descontarReceta } from '../domain/planificador';
import { useApp } from '../state/AppState';

export default function Plan() {
  const { plan, setPlan, catalogo, inventario, setInventario } = useApp();

  const cambiarPorciones = (i: number, delta: number) =>
    setPlan(plan.map((p, j) => (j === i ? { ...p, porciones: Math.max(1, p.porciones + delta) } : p)));

  const quitar = (i: number) => setPlan(plan.filter((_, j) => j !== i));

  const cocinada = (i: number) => {
    setInventario(descontarReceta(inventario, plan[i], catalogo));
    quitar(i);
  };

  return (
    <ScrollView style={estilos.pantalla} contentContainerStyle={estilos.contenido}>
      <Suave>
        {plan.length === 0
          ? 'Agrega recetas desde la pestaña Recetas.'
          : `${plan.length} comidas, ${plan.reduce((s, p) => s + p.porciones, 0)} porciones en total.`}
      </Suave>

      {plan.map((item, i) => {
        const receta = catalogo.recetas[item.recetaId];
        if (!receta) return null;
        return (
          <Tarjeta key={`${item.recetaId}-${i}`}>
            <Titulo>{receta.nombre}</Titulo>
            <View style={estilos.fila}>
              <Boton pequeno tipo="secundario" titulo="−" onPress={() => cambiarPorciones(i, -1)} />
              <Text style={estilos.texto}>{item.porciones} porciones</Text>
              <Boton pequeno tipo="secundario" titulo="+" onPress={() => cambiarPorciones(i, 1)} />
            </View>
            <View style={[estilos.fila, { marginTop: 4 }]}>
              <Boton
                pequeno
                titulo="Ya la cociné"
                onPress={() =>
                  Alert.alert('¿Ya la cocinaste?', 'Se descontarán los ingredientes de tu despensa.', [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Sí', onPress: () => cocinada(i) },
                  ])
                }
              />
              <Boton pequeno tipo="peligro" titulo="Quitar" onPress={() => quitar(i)} />
            </View>
          </Tarjeta>
        );
      })}

      {plan.length > 0 && <Boton tipo="peligro" titulo="Vaciar plan" onPress={() => setPlan([])} />}
    </ScrollView>
  );
}
