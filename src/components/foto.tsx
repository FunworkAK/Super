import { Image, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { FOTOS } from '../data/fotos';

// Foto de Wikimedia Commons si la hay; si no, el emoji sobre un fondo de color.
export function Foto({
  clave,
  emoji,
  fondo,
  tamanoEmoji = 56,
  style,
}: {
  clave: string;
  emoji: string;
  fondo: string;
  tamanoEmoji?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const foto = FOTOS[clave];
  return (
    <View style={[s.caja, { backgroundColor: fondo }, style]}>
      {foto ? (
        <Image source={foto.src} style={StyleSheet.absoluteFill} resizeMode="cover" accessibilityIgnoresInvertColors />
      ) : (
        <Text style={{ fontSize: tamanoEmoji }}>{emoji}</Text>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  caja: { alignItems: 'center', justifyContent: 'center', width: '100%', overflow: 'hidden' },
});
