import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

const LADO_MAX = 800;

// Abre la galería (o la cámara en el celular) y devuelve la foto como data URI,
// reducida para que quepa en el almacenamiento del navegador.
export async function elegirFoto(): Promise<string | null> {
  const r = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.7,
    base64: Platform.OS !== 'web',
  });
  const foto = r.canceled ? null : r.assets[0];
  if (!foto) return null;
  if (Platform.OS !== 'web') return foto.base64 ? `data:image/jpeg;base64,${foto.base64}` : foto.uri;
  return reducirEnWeb(foto.uri);
}

function reducirEnWeb(uri: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      const escala = Math.min(1, LADO_MAX / Math.max(img.width, img.height));
      const lienzo = document.createElement('canvas');
      lienzo.width = Math.round(img.width * escala);
      lienzo.height = Math.round(img.height * escala);
      lienzo.getContext('2d')!.drawImage(img, 0, 0, lienzo.width, lienzo.height);
      resolve(lienzo.toDataURL('image/jpeg', 0.75));
    };
    img.onerror = reject;
    img.src = uri;
  });
}
