import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ConfigurarMenu } from '../../components/configurar';
import { Foto } from '../../components/foto';
import { MacrosFila } from '../../components/receta';
import { Boton, Suave, colores, confirmar, estilos } from '../../components/ui';
import { EMOJI_RECETA, fondoReceta } from '../../data/visual';
import { macrosPlan, macrosPorPorcion } from '../../domain/macros';
import { candidatas, generarMenu } from '../../domain/menu';
import { armarLista, coberturaInventario, costoPorPorcion, descontarReceta, formatoQ } from '../../domain/planificador';
import { COMIDAS, DIAS, TIENDAS, type ConfigMenu, type ItemPlan } from '../../domain/types';
import { useApp } from '../../state/AppState';

export default function Semana() {
  const { plan, setPlan, catalogo, inventario, setInventario, tiendas, presupuesto, config, setConfig } = useApp();
  const [editando, setEditando] = useState(false);
  const [cambiando, setCambiando] = useState<number | null>(null);

  const crear = (c: ConfigMenu) => {
    setConfig(c);
    setPlan(generarMenu(c, catalogo, inventario, tiendas, presupuesto, Date.now() % 100000));
    setEditando(false);
  };

  const lista = useMemo(() => armarLista(plan, inventario, catalogo, tiendas), [plan, inventario, catalogo, tiendas]);

  if (!config || editando) {
    return <ConfigurarMenu onListo={crear} onCancelar={config ? () => setEditando(false) : undefined} />;
  }

  const porciones = plan.reduce((s, p) => s + p.porciones, 0);
  const total = macrosPlan(plan, catalogo.recetas, catalogo.ingredientes);
  const promedio = porciones
    ? { kcal: total.kcal / porciones, proteina: total.proteina / porciones, carbos: total.carbos / porciones, grasa: total.grasa / porciones }
    : total;
  const pasado = lista.total > presupuesto;

  const quitar = (i: number) => setPlan(plan.filter((_, j) => j !== i));
  const cocinada = (i: number) => {
    setInventario(descontarReceta(inventario, plan[i], catalogo));
    quitar(i);
  };
  const hecha = (i: number) =>
    confirmar('¿Ya la cocinaste?', 'Se descontarán los ingredientes de tu despensa.', 'Sí', () => cocinada(i));

  const indices = plan.map((item, i) => ({ item, i }));
  const extras = indices.filter(({ item }) => item.dia === undefined);

  return (
    <View style={estilos.pantalla}>
      <ScrollView contentContainerStyle={estilos.contenido}>
        <View style={s.resumen}>
          <Text style={s.resumenTitulo}>Tu semana</Text>
          <Text style={s.resumenMeta}>
            {config.personas} personas · {config.dias.length} días · {config.comidas.map((c) => COMIDAS[c]).join(', ')}
          </Text>
          <Text style={s.resumenMeta}>Comprando en {tiendas.map((t) => TIENDAS[t]).join(', ')}</Text>
          <View style={[s.gasto, pasado && { backgroundColor: colores.alertaSuave }]}>
            <Text style={[s.gastoTexto, pasado && { color: colores.alerta }]}>
              Lista: {formatoQ(lista.total)} de {formatoQ(presupuesto)}
              {pasado ? ` · te pasas ${formatoQ(lista.total - presupuesto)}` : ` · te sobran ${formatoQ(presupuesto - lista.total)}`}
            </Text>
          </View>
          <Text style={[s.resumenMeta, { marginTop: 6 }]}>Promedio por porción</Text>
          <MacrosFila m={promedio} compacto />
          <View style={[estilos.fila, { marginTop: 8 }]}>
            <View style={{ flex: 1 }}>
              <Boton
                tipo="secundario"
                titulo="🔄 Otra sugerencia"
                onPress={() =>
                  confirmar('Otra sugerencia', 'Se reemplazará el menú actual.', 'Cambiar', () =>
                    setPlan(generarMenu(config, catalogo, inventario, tiendas, presupuesto, Date.now() % 100000)),
                  )
                }
              />
            </View>
            <View style={{ flex: 1 }}>
              <Boton tipo="secundario" titulo="⚙️ Preferencias" onPress={() => setEditando(true)} />
            </View>
          </View>
        </View>

        {config.dias.map((d) => {
          const delDia = indices.filter(({ item }) => item.dia === d);
          if (delDia.length === 0) return null;
          return (
            <View key={d} style={{ gap: 8 }}>
              <Text style={s.dia}>{DIAS[d]}</Text>
              {delDia.map(({ item, i }) => (
                <Fila key={i} item={item} onCambiar={() => setCambiando(i)} onQuitar={() => quitar(i)} onHecha={() => hecha(i)} />
              ))}
            </View>
          );
        })}

        {extras.length > 0 && (
          <View style={{ gap: 8 }}>
            <Text style={s.dia}>Otras recetas que agregaste</Text>
            {extras.map(({ item, i }) => (
              <Fila key={i} item={item} onQuitar={() => quitar(i)} onHecha={() => hecha(i)} />
            ))}
          </View>
        )}

        {plan.length === 0 && <Suave>No hay recetas en tu semana. Toca "Otra sugerencia" o agrega desde Recetas.</Suave>}
        <Boton titulo="🛒  Ver lista del super" onPress={() => router.push('/lista')} />
      </ScrollView>

      {cambiando !== null && plan[cambiando] && (
        <Alternativas
          item={plan[cambiando]}
          onElegir={(recetaId) => {
            setPlan(plan.map((p, j) => (j === cambiando ? { ...p, recetaId } : p)));
            setCambiando(null);
          }}
          onCerrar={() => setCambiando(null)}
        />
      )}
    </View>
  );
}

function Fila({
  item,
  onCambiar,
  onQuitar,
  onHecha,
}: {
  item: ItemPlan;
  onCambiar?: () => void;
  onQuitar: () => void;
  onHecha: () => void;
}) {
  const { catalogo, fotos } = useApp();
  const receta = catalogo.recetas[item.recetaId];
  if (!receta) return null;
  const m = macrosPorPorcion(receta, catalogo.ingredientes);
  return (
    <View style={s.fila}>
      <Pressable
        onPress={() => router.push(`/receta/${receta.id}`)}
        style={s.miniatura}
      >
        <Foto clave={receta.id} uri={fotos[receta.id]?.[0]?.uri} emoji={EMOJI_RECETA[receta.id]} fondo={fondoReceta(receta.id)} tamanoEmoji={30} style={{ flex: 1 }} />
      </Pressable>
      <View style={{ flex: 1, gap: 3 }}>
        {item.comida && <Text style={s.comida}>{COMIDAS[item.comida].toUpperCase()}</Text>}
        <Pressable onPress={() => router.push(`/receta/${receta.id}`)}>
          <Text style={s.nombre}>{receta.nombre}</Text>
        </Pressable>
        <Text style={s.meta}>
          {item.porciones} porc. · 🔥 {Math.round(m.kcal)} kcal · 💪 {Math.round(m.proteina)} g · ⏱ {receta.minutos} min
        </Text>
        <View style={[estilos.fila, { gap: 4, flexWrap: 'wrap' }]}>
          {onCambiar && (
            <Pressable onPress={onCambiar}>
              <Text style={s.accion}>🔄 Cambiar</Text>
            </Pressable>
          )}
          <Pressable onPress={() => router.push(`/cocina/${receta.id}`)}>
            <Text style={s.accion}>👩‍🍳 Cocinar</Text>
          </Pressable>
          <Pressable onPress={onHecha}>
            <Text style={s.accion}>✓ Hecha</Text>
          </Pressable>
          <Pressable onPress={onQuitar}>
            <Text style={[s.accion, { color: colores.alerta }]}>Quitar</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

// Recetas de la misma comida para reemplazar un plato del menú.
function Alternativas({
  item,
  onElegir,
  onCerrar,
}: {
  item: ItemPlan;
  onElegir: (recetaId: string) => void;
  onCerrar: () => void;
}) {
  const { catalogo, inventario, config, fotos } = useApp();
  const opciones = candidatas(catalogo, item.comida ?? 'almuerzo', config?.aparatos)
    .filter((r) => r.id !== item.recetaId)
    .map((r) => ({
      r,
      costo: costoPorPorcion(r, catalogo),
      cobertura: coberturaInventario(r, inventario),
      kcal: macrosPorPorcion(r, catalogo.ingredientes).kcal,
    }))
    .sort((a, b) => b.cobertura - a.cobertura || (a.costo ?? 0) - (b.costo ?? 0));

  return (
    <Modal transparent animationType="slide" visible onRequestClose={onCerrar}>
      <Pressable style={s.velo} onPress={onCerrar} />
      <View style={s.hoja}>
        <Text style={s.hojaTitulo}>
          Cambiar {item.comida ? COMIDAS[item.comida].toLowerCase() : 'receta'}
          {item.dia !== undefined ? ` del ${DIAS[item.dia].toLowerCase()}` : ''}
        </Text>
        <ScrollView style={{ maxHeight: 420 }} contentContainerStyle={{ gap: 8 }}>
          {opciones.map(({ r, costo, cobertura, kcal }) => (
            <Pressable key={r.id} onPress={() => onElegir(r.id)} style={s.opcion}>
              <View style={[s.miniatura, { width: 48, height: 48 }]}>
                <Foto clave={r.id} uri={fotos[r.id]?.[0]?.uri} emoji={EMOJI_RECETA[r.id]} fondo={fondoReceta(r.id)} tamanoEmoji={24} style={{ flex: 1 }} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.nombre}>{r.nombre}</Text>
                <Text style={s.meta}>
                  {costo !== null ? `${formatoQ(costo)}/porción · ` : ''}
                  {Math.round(kcal)} kcal
                  {cobertura > 0 ? ` · tienes ${Math.round(cobertura * 100)}%` : ''}
                </Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
        <Boton tipo="secundario" titulo="Cerrar" onPress={onCerrar} />
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  resumen: { backgroundColor: colores.primario, borderRadius: 18, padding: 16, gap: 4 },
  resumenTitulo: { color: '#fff', fontSize: 22, fontWeight: '800' },
  resumenMeta: { color: '#E3F1E8', fontSize: 13 },
  gasto: { backgroundColor: colores.primarioSuave, borderRadius: 10, padding: 8, marginTop: 6 },
  gastoTexto: { color: colores.primario, fontWeight: '700' },
  dia: { fontSize: 18, fontWeight: '800', color: colores.texto, marginTop: 8 },
  fila: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colores.tarjeta,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: 10,
  },
  miniatura: { width: 68, height: 68, borderRadius: 12, overflow: 'hidden' },
  comida: { fontSize: 11, fontWeight: '800', color: colores.primario, letterSpacing: 0.5 },
  nombre: { fontSize: 15, fontWeight: '700', color: colores.texto },
  meta: { fontSize: 12, color: colores.suave },
  accion: { fontSize: 13, color: colores.primario, fontWeight: '600', paddingHorizontal: 4, paddingVertical: 2 },
  velo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
  hoja: {
    backgroundColor: colores.fondo,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    gap: 12,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  hojaTitulo: { fontSize: 18, fontWeight: '800', color: colores.texto },
  opcion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colores.tarjeta,
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: colores.borde,
  },
});
