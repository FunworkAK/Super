import { Image, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { FOTOS } from '../data/fotos';

// La foto (subida por la persona o de Wikimedia Commons) si la hay; si no,
// el emoji sobre un fondo de color.
export function Foto({
  clave,
  uri,
  emoji,
  fondo,
  tamanoEmoji = 56,
  style,
}: {
  clave: string;
  uri?: string;
  emoji: string;
  fondo: string;
  tamanoEmoji?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const foto = uri ? { src: { uri } } : FOTOS[clave];
  return (
    <View style={[s.caja, { backgroundColor: fondo }, style]}>
      {foto ? (
        <Image source={foto.src} style={s.imagen} resizeMode="cover" accessibilityIgnoresInvertColors />
      ) : (
        <Text style={{ fontSize: tamanoEmoji }}>{emoji}</Text>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  caja: { alignItems: 'center', justifyContent: 'center', width: '100%', overflow: 'hidden' },
  // Sin ancho y alto explícitos, en la web la imagen toma el tamaño del archivo.
  imagen: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
});
