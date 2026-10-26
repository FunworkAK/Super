import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { TarjetaReceta } from '../../components/receta';
import { Boton, Suave, colores, estilos } from '../../components/ui';
import { macrosPorPorcion } from '../../domain/macros';
import { candidatas } from '../../domain/menu';
import { coberturaInventario, costoPorPorcion } from '../../domain/planificador';
import type { Comida } from '../../domain/types';
import { useApp } from '../../state/AppState';

const SECCIONES: { comida: Comida; titulo: string; texto: string }[] = [
  { comida: 'lonchera', titulo: '🎒 Loncheras para el colegio', texto: 'Fáciles de empacar y que aguantan hasta el recreo.' },
  { comida: 'snack', titulo: '🍎 Snacks', texto: 'Para la tarde o entre comidas.' },
];

export default function Snacks() {
  const { catalogo, inventario, plan, config } = useApp();
  const enPlan = new Set(plan.map((p) => p.recetaId));
  const conLoncheras = config?.comidas.includes('lonchera');

  return (
    <ScrollView style={estilos.pantalla} contentContainerStyle={estilos.contenido}>
      {!conLoncheras && (
        <View style={s.aviso}>
          <Text style={s.avisoTexto}>
            ¿Quieres que el menú incluya loncheras de lunes a viernes? Actívalas en las preferencias de tu semana.
          </Text>
          <Boton pequeno titulo="Ir a Mi semana" onPress={() => router.push('/')} />
        </View>
      )}
      {SECCIONES.map((sec) => (
        <View key={sec.comida} style={{ gap: 10 }}>
          <Text style={s.titulo}>{sec.titulo}</Text>
          <Suave>{sec.texto}</Suave>
          <View style={s.rejilla}>
            {candidatas(catalogo, sec.comida).map((r) => (
              <TarjetaReceta
                key={r.id}
                receta={r}
                macros={macrosPorPorcion(r, catalogo.ingredientes)}
                costo={costoPorPorcion(r, catalogo)}
                cobertura={coberturaInventario(r, inventario)}
                enPlan={enPlan.has(r.id)}
                onPress={() => router.push(`/receta/${r.id}`)}
              />
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  titulo: { fontSize: 20, fontWeight: '800', color: colores.texto, marginTop: 6 },
  rejilla: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  aviso: { backgroundColor: colores.primarioSuave, borderRadius: 14, padding: 12, gap: 8 },
  avisoTexto: { color: colores.primario, fontWeight: '600' },
});
