import { router } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { Animated, Linking, PanResponder, Pressable, ScrollView, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { MacrosFila, Portada, TarjetaReceta } from '../../components/receta';
import { Chip, Suave, Tarjeta, colores, estilos } from '../../components/ui';
import { SITIOS } from '../../data/sitios';
import { puedeHacer } from '../../domain/aparatos';
import { macrosPorPorcion } from '../../domain/macros';
import { recetasSugeridas } from '../../domain/planificador';
import type { Comida } from '../../domain/types';
import { useApp } from '../../state/AppState';

const ETIQUETAS = ['guatemalteca', 'asado', 'internacional', 'fácil', 'saludable', 'rápida', 'económica', 'vegetariana'];
const TIPOS: { id: Comida; texto: string }[] = [
  { id: 'desayuno', texto: '🍳 Desayunos' },
  { id: 'almuerzo', texto: '🍲 Almuerzos' },
  { id: 'cena', texto: '🌙 Cenas' },
];
const ORDENES = [
  { id: 'despensa', texto: 'Usa lo que tengo' },
  { id: 'proteina', texto: 'Más proteína' },
  { id: 'kcal', texto: 'Menos calorías' },
  { id: 'costo', texto: 'Más baratas' },
] as const;
type Orden = (typeof ORDENES)[number]['id'];

export default function Recetas() {
  const { catalogo, inventario, plan, agregarAlPlan, config } = useApp();
  const [modo, setModo] = useState<'descubrir' | 'todas' | 'web'>('descubrir');
  const [conMisAparatos, setConMisAparatos] = useState(true);
  const aparatos = conMisAparatos ? config?.aparatos : undefined;
  const [filtro, setFiltro] = useState<string | null>(null);
  const [tipo, setTipo] = useState<Comida | null>(null);
  const [orden, setOrden] = useState<Orden>('despensa');
  const [saltadas, setSaltadas] = useState<string[]>([]);

  const enPlan = new Set(plan.map((p) => p.recetaId));

  const lista = useMemo(() => {
    const base = recetasSugeridas(catalogo, inventario)
      .filter((x) => !filtro || x.receta.etiquetas.includes(filtro))
      .filter((x) => !tipo || x.receta.comidas.includes(tipo))
      .filter((x) => puedeHacer(x.receta, aparatos))
      .map((x) => ({ ...x, macros: macrosPorPorcion(x.receta, catalogo.ingredientes) }));
    if (orden === 'proteina') base.sort((a, b) => b.macros.proteina - a.macros.proteina);
    if (orden === 'kcal') base.sort((a, b) => a.macros.kcal - b.macros.kcal);
    if (orden === 'costo') base.sort((a, b) => (a.costo ?? Infinity) - (b.costo ?? Infinity));
    return base;
  }, [catalogo, inventario, filtro, tipo, orden, aparatos]);

  const mazo = lista.filter((x) => !enPlan.has(x.receta.id) && !saltadas.includes(x.receta.id));
  const actual = mazo[0];
  const siguiente = mazo[1];

  return (
    <ScrollView style={estilos.pantalla} contentContainerStyle={estilos.contenido}>
      <View style={s.segmento}>
        {(['descubrir', 'todas', 'web'] as const).map((m) => (
          <Pressable key={m} onPress={() => setModo(m)} style={[s.segBoton, modo === m && s.segActivo]}>
            <Text style={[s.segTexto, modo === m && { color: colores.texto }]}>
              {m === 'descubrir' ? 'Descubrir' : m === 'todas' ? 'Todas' : 'En la web'}
            </Text>
          </Pressable>
        ))}
      </View>

      {modo === 'web' ? (
        <SitiosWeb />
      ) : (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {config?.aparatos && (
              <Chip
                texto="🔌 Con mis aparatos"
                activo={conMisAparatos}
                onPress={() => setConMisAparatos(!conMisAparatos)}
              />
            )}
            {TIPOS.map((t) => (
              <Chip key={t.id} texto={t.texto} activo={tipo === t.id} onPress={() => setTipo(tipo === t.id ? null : t.id)} />
            ))}
          </ScrollView>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {ORDENES.map((o) => (
              <Chip key={o.id} texto={o.texto} activo={orden === o.id} onPress={() => setOrden(o.id)} />
            ))}
            {ETIQUETAS.map((e) => (
              <Chip key={e} texto={e} activo={filtro === e} onPress={() => setFiltro(filtro === e ? null : e)} />
            ))}
          </ScrollView>

          {modo === 'descubrir' ? (
            <>
              <Suave>
                Desliza a la derecha (o ♥) para agregarla a tu semana, a la izquierda (o ✕) para pasar. Llevas{' '}
                {plan.length} {plan.length === 1 ? 'receta' : 'recetas'}.
              </Suave>
              {actual ? (
                <View style={{ height: 580 }}>
                  {siguiente && (
                    <View style={[s.carta, s.cartaAtras]} pointerEvents="none">
                      <CartaContenido {...siguiente} />
                    </View>
                  )}
                  <CartaDeslizable
                    key={actual.receta.id}
                    onSi={() => agregarAlPlan(actual.receta.id)}
                    onNo={() => setSaltadas((x) => [...x, actual.receta.id])}
                    onAbrir={() => router.push(`/receta/${actual.receta.id}`)}
                  >
                    <CartaContenido {...actual} />
                  </CartaDeslizable>
                </View>
              ) : (
                <View style={[s.carta, { padding: 24, alignItems: 'center', gap: 12, position: 'relative' }]}>
                  <Text style={{ fontSize: 48 }}>🎉</Text>
                  <Text style={s.cartaNombre}>¡Ya viste todas!</Text>
                  <Suave>Revisa tu plan o vuelve a ver las que pasaste.</Suave>
                  <View style={estilos.fila}>
                    <Chip texto="Ver de nuevo" onPress={() => setSaltadas([])} />
                    <Chip texto="Ir a mi plan" activo onPress={() => router.push('/')} />
                  </View>
                </View>
              )}
            </>
          ) : (
            <View style={s.rejilla}>
              {lista.map((x) => (
                <TarjetaReceta
                  key={x.receta.id}
                  {...x}
                  enPlan={enPlan.has(x.receta.id)}
                  onPress={() => router.push(`/receta/${x.receta.id}`)}
                />
              ))}
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

// Enlaces a sitios de recetas por tema, para buscar más ideas.
function SitiosWeb() {
  return (
    <>
      <Suave>Más ideas en sitios de recetas que nos gustan. Se abren en una pestaña nueva.</Suave>
      {SITIOS.map((t) => (
        <Tarjeta key={t.tema}>
          <Text style={s.tema}>
            {t.emoji} {t.tema}
          </Text>
          {t.sitios.map((sitio) => (
            <Pressable
              key={sitio.url}
              role="link"
              onPress={() => Linking.openURL(sitio.url)}
              style={({ pressed }) => [s.sitio, pressed && { opacity: 0.6 }]}
            >
              <View style={{ flex: 1 }}>
                <Text style={s.sitioNombre}>{sitio.nombre}</Text>
                <Text style={s.meta}>{sitio.detalle}</Text>
              </View>
              <Text style={{ color: colores.primario, fontSize: 18 }}>↗</Text>
            </Pressable>
          ))}
        </Tarjeta>
      ))}
    </>
  );
}

type Item = ReturnType<typeof recetasSugeridas>[number] & { macros: ReturnType<typeof macrosPorPorcion> };

function CartaContenido({ receta, macros, costo, cobertura }: Item) {
  return (
    <>
      <Portada receta={receta} alto={230} grande />
      <View style={{ padding: 16, gap: 10 }}>
        <Text style={s.cartaNombre}>{receta.nombre}</Text>
        <Text style={s.meta}>
          ⏱ {receta.minutos} min · {receta.porciones} porciones
          {costo !== null ? ` · Q${costo.toFixed(2)}/porción` : ''}
        </Text>
        <MacrosFila m={macros} compacto />
        <View style={[estilos.fila, { flexWrap: 'wrap', gap: 6 }]}>
          {cobertura > 0 && (
            <View style={[s.pastilla, { backgroundColor: colores.primarioSuave }]}>
              <Text style={{ color: colores.primario, fontSize: 12, fontWeight: '600' }}>
                Tienes {Math.round(cobertura * 100)}% de los ingredientes
              </Text>
            </View>
          )}
          {receta.etiquetas.map((e) => (
            <View key={e} style={s.pastilla}>
              <Text style={{ fontSize: 12, color: colores.suave }}>{e}</Text>
            </View>
          ))}
        </View>
      </View>
    </>
  );
}

function CartaDeslizable({
  children,
  onSi,
  onNo,
  onAbrir,
}: {
  children: React.ReactNode;
  onSi: () => void;
  onNo: () => void;
  onAbrir: () => void;
}) {
  const pos = useRef(new Animated.ValueXY()).current;
  // En la web, soltar después de arrastrar también dispara un clic; se ignora.
  const arrastro = useRef(false);

  const salir = (dir: 1 | -1) => {
    Animated.timing(pos, { toValue: { x: dir * 500, y: 0 }, duration: 220, useNativeDriver: false }).start(() =>
      dir === 1 ? onSi() : onNo(),
    );
  };

  const soltar = (dx: number) => {
    setTimeout(() => (arrastro.current = false), 100);
    if (dx > 110) salir(1);
    else if (dx < -110) salir(-1);
    else Animated.spring(pos, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
  };

  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderGrant: () => {
        arrastro.current = true;
      },
      onPanResponderMove: Animated.event([null, { dx: pos.x }], { useNativeDriver: false }),
      onPanResponderTerminationRequest: () => false,
      onPanResponderRelease: (_, g) => soltar(g.dx),
      // Si el puntero se suelta fuera de la tarjeta (p. ej. sobre el menú) igual cuenta.
      onPanResponderTerminate: (_, g) => soltar(g.dx),
    }),
  ).current;

  const rotar = pos.x.interpolate({ inputRange: [-300, 0, 300], outputRange: ['-12deg', '0deg', '12deg'] });
  const si = pos.x.interpolate({ inputRange: [0, 110], outputRange: [0, 1], extrapolate: 'clamp' });
  const no = pos.x.interpolate({ inputRange: [-110, 0], outputRange: [1, 0], extrapolate: 'clamp' });

  return (
    <>
      <Animated.View
        {...pan.panHandlers}
        style={[s.carta, { transform: [{ translateX: pos.x }, { rotate: rotar }] }]}
      >
        <Pressable onPress={() => !arrastro.current && onAbrir()} style={SIN_SELECCION}>
          {children}
        </Pressable>
        <Animated.View style={[s.sello, { left: 16, borderColor: colores.primario, opacity: si }]}>
          <Text style={[s.selloTexto, { color: colores.primario }]}>¡A LA SEMANA!</Text>
        </Animated.View>
        <Animated.View style={[s.sello, { right: 16, borderColor: colores.alerta, opacity: no }]}>
          <Text style={[s.selloTexto, { color: colores.alerta }]}>PASO</Text>
        </Animated.View>
      </Animated.View>
      <View style={s.botones}>
        <Pressable role="button" aria-label="Pasar" style={[s.circulo, { borderColor: colores.alerta }]} onPress={() => salir(-1)}>
          <Text style={{ fontSize: 26, color: colores.alerta }}>✕</Text>
        </Pressable>
        <Pressable role="button" aria-label="Ver receta" style={[s.circulo, s.circuloPequeno]} onPress={onAbrir}>
          <Text style={{ fontSize: 18 }}>📖</Text>
        </Pressable>
        <Pressable
          role="button"
          aria-label="Agregar a mi semana"
          style={[s.circulo, { borderColor: colores.primario }]}
          onPress={() => salir(1)}
        >
          <Text style={{ fontSize: 26, color: colores.primario }}>♥</Text>
        </Pressable>
      </View>
    </>
  );
}

// En la web, arrastrar no debe seleccionar el texto de la tarjeta (userSelect
// existe en react-native-web pero no en los tipos de View).
const SIN_SELECCION = { userSelect: 'none' } as ViewStyle;

const s = StyleSheet.create({
  segmento: { flexDirection: 'row', backgroundColor: colores.borde, borderRadius: 12, padding: 3 },
  segBoton: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  segActivo: { backgroundColor: colores.tarjeta },
  segTexto: { fontWeight: '600', color: colores.suave },
  rejilla: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  carta: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: colores.tarjeta,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colores.borde,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cartaAtras: { transform: [{ scale: 0.95 }, { translateY: 12 }], opacity: 0.7 },
  cartaNombre: { fontSize: 22, fontWeight: '700', color: colores.texto },
  meta: { fontSize: 13, color: colores.suave },
  pastilla: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: colores.fondo },
  sello: { position: 'absolute', top: 24, borderWidth: 3, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  selloTexto: { fontSize: 20, fontWeight: '800' },
  botones: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  circulo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    backgroundColor: colores.tarjeta,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circuloPequeno: { width: 48, height: 48, borderColor: colores.borde },
  tema: { fontSize: 16, fontWeight: '700', color: colores.texto },
  sitio: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: colores.borde,
  },
  sitioNombre: { fontSize: 15, fontWeight: '600', color: colores.primario },
});
