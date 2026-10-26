import { Tabs } from 'expo-router/js-tabs';
import { useEffect, useState } from 'react';
import { Text, useWindowDimensions } from 'react-native';
import { colores } from '../../components/ui';

const icono = (emoji: string) => () => <Text style={{ fontSize: 22 }}>{emoji}</Text>;

// Menú vertical a la derecha, con el ícono arriba del texto. (Con el texto al
// lado, React Navigation obliga un ancho mínimo de 360 px.)
export default function LayoutPestanas() {
  const ancho = useAncho();
  return (
    <Tabs
      screenOptions={{
        tabBarPosition: 'right',
        tabBarVariant: 'material',
        tabBarLabelPosition: 'below-icon',
        tabBarActiveTintColor: colores.primario,
        tabBarActiveBackgroundColor: colores.primarioSuave,
        tabBarStyle: {
          width: ancho ? 112 : 92,
          paddingLeft: 4,
          paddingRight: 4,
          backgroundColor: colores.tarjeta,
          borderLeftWidth: 1,
          borderLeftColor: colores.borde,
        },
        tabBarLabelStyle: { fontSize: ancho ? 13 : 10.5, fontWeight: '600', marginStart: 0 },
        tabBarItemStyle: { paddingHorizontal: 2 },
        headerStyle: { backgroundColor: colores.fondo },
        headerTitleStyle: { color: colores.texto },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Mi semana', tabBarLabel: 'Semana', tabBarIcon: icono('📅') }} />
      <Tabs.Screen name="recetas" options={{ title: 'Recetas', tabBarIcon: icono('🍲') }} />
      <Tabs.Screen name="snacks" options={{ title: 'Snacks y loncheras', tabBarLabel: 'Snacks', tabBarIcon: icono('🎒') }} />
      <Tabs.Screen name="despensa" options={{ title: 'Mi despensa', tabBarLabel: 'Despensa', tabBarIcon: icono('🥫') }} />
      <Tabs.Screen name="lista" options={{ title: 'Lista del super', tabBarLabel: 'Lista', tabBarIcon: icono('🛒') }} />
      <Tabs.Screen name="presupuesto" options={{ title: 'Presupuesto', tabBarLabel: ancho ? 'Presupuesto' : 'Gastos', tabBarIcon: icono('💰') }} />
    </Tabs>
  );
}

// El HTML estático se genera sin conocer la pantalla; el ancho real se aplica
// después de cargar para no romper la hidratación.
function useAncho() {
  const { width } = useWindowDimensions();
  const [ancho, setAncho] = useState(false);
  useEffect(() => setAncho(width >= 768), [width]);
  return ancho;
}
