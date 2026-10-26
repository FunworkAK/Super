import { Tabs } from 'expo-router/js-tabs';
import { Text } from 'react-native';
import { colores } from '../../components/ui';

const icono = (emoji: string) => () => <Text style={{ fontSize: 20 }}>{emoji}</Text>;

export default function LayoutPestanas() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colores.primario,
        headerStyle: { backgroundColor: colores.fondo },
        headerTitleStyle: { color: colores.texto },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Mi despensa', tabBarLabel: 'Despensa', tabBarIcon: icono('🥫') }} />
      <Tabs.Screen name="recetas" options={{ title: 'Recetas', tabBarIcon: icono('🍲') }} />
      <Tabs.Screen name="plan" options={{ title: 'Plan semanal', tabBarLabel: 'Plan', tabBarIcon: icono('📅') }} />
      <Tabs.Screen name="lista" options={{ title: 'Lista del super', tabBarLabel: 'Lista', tabBarIcon: icono('🛒') }} />
      <Tabs.Screen name="presupuesto" options={{ title: 'Presupuesto', tabBarIcon: icono('💰') }} />
    </Tabs>
  );
}
