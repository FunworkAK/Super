import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

export const colores = {
  fondo: '#F7F5F0',
  tarjeta: '#FFFFFF',
  texto: '#1F2421',
  suave: '#6B726E',
  borde: '#E4E1D8',
  primario: '#2F7D4F',
  primarioSuave: '#E3F1E8',
  alerta: '#B3412E',
  alertaSuave: '#F8E5E1',
};

export function Tarjeta({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[estilos.tarjeta, style]}>{children}</View>;
}

export function Boton({
  titulo,
  onPress,
  tipo = 'primario',
  pequeno,
}: {
  titulo: string;
  onPress: () => void;
  tipo?: 'primario' | 'secundario' | 'peligro';
  pequeno?: boolean;
}) {
  const fondo =
    tipo === 'primario' ? colores.primario : tipo === 'peligro' ? colores.alertaSuave : colores.primarioSuave;
  const texto = tipo === 'primario' ? '#fff' : tipo === 'peligro' ? colores.alerta : colores.primario;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        estilos.boton,
        pequeno && estilos.botonPequeno,
        { backgroundColor: fondo, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <Text style={[estilos.botonTexto, pequeno && { fontSize: 13 }, { color: texto }]}>{titulo}</Text>
    </Pressable>
  );
}

export function Chip({ texto, activo, onPress }: { texto: string; activo?: boolean; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[estilos.chip, activo && { backgroundColor: colores.primario, borderColor: colores.primario }]}
    >
      <Text style={{ color: activo ? '#fff' : colores.texto, fontSize: 13 }}>{texto}</Text>
    </Pressable>
  );
}

export function Titulo({ children }: { children: ReactNode }) {
  return <Text style={estilos.titulo}>{children}</Text>;
}

export function Suave({ children }: { children: ReactNode }) {
  return <Text style={estilos.suave}>{children}</Text>;
}

export const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo },
  contenido: { padding: 16, gap: 12, paddingBottom: 40 },
  tarjeta: {
    backgroundColor: colores.tarjeta,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colores.borde,
    gap: 6,
  },
  fila: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  titulo: { fontSize: 17, fontWeight: '600', color: colores.texto },
  suave: { fontSize: 13, color: colores.suave },
  texto: { fontSize: 15, color: colores.texto },
  input: {
    backgroundColor: colores.tarjeta,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: colores.texto,
  },
  boton: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  botonPequeno: { paddingHorizontal: 10, paddingVertical: 6 },
  botonTexto: { fontSize: 15, fontWeight: '600' },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colores.borde,
    backgroundColor: colores.tarjeta,
  },
});
