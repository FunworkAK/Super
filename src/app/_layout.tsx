import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppStateProvider } from '../state/AppState';

export default function Layout() {
  return (
    <AppStateProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="receta/[id]" />
        <Stack.Screen name="cocina/[id]" options={{ animation: 'slide_from_bottom' }} />
      </Stack>
    </AppStateProvider>
  );
}
