import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Boton, Chip, Suave, Tarjeta, Titulo, colores, estilos } from '../components/ui';
import { formatoCantidad, formatoQ, recetasSugeridas } from '../domain/planificador';
import { useApp } from '../state/AppState';

const ETIQUETAS = ['guatemalteca', 'económica', 'rápida', 'desayuno', 'saludable', 'vegetariana'];

export default function Recetas() {
  const { catalogo, inventario, plan, agregarAlPlan } = useApp();
  const [filtro, setFiltro] = useState<string | null>(null);
  const [abierta, setAbierta] = useState<string | null>(null);

  const lista = useMemo(
    () => recetasSugeridas(catalogo, inventario).filter((x) => !filtro || x.receta.etiquetas.includes(filtro)),
    [catalogo, inventario, filtro],
  );

  return (
    <ScrollView style={estilos.pantalla} contentContainerStyle={estilos.contenido}>
      <Suave>Primero aparecen las que más aprovechan tu despensa, luego las más baratas.</Suave>
      <View style={[estilos.fila, { flexWrap: 'wrap' }]}>
        {ETIQUETAS.map((e) => (
          <Chip key={e} texto={e} activo={filtro === e} onPress={() => setFiltro(filtro === e ? null : e)} />
        ))}
      </View>

      {lista.map(({ receta, cobertura, costo }) => {
        const veces = plan.filter((p) => p.recetaId === receta.id).length;
        return (
          <Tarjeta key={receta.id}>
            <Pressable onPress={() => setAbierta(abierta === receta.id ? null : receta.id)}>
              <Titulo>{receta.nombre}</Titulo>
              <Suave>
                {receta.minutos} min · {costo !== null ? `${formatoQ(costo)} por porción` : 'sin precio'}
                {cobertura > 0 ? ` · tienes ${Math.round(cobertura * 100)}%` : ''}
              </Suave>
            </Pressable>

            {abierta === receta.id && (
              <View style={{ gap: 4, marginTop: 6 }}>
                <Text style={[estilos.texto, { fontWeight: '600' }]}>Ingredientes ({receta.porciones} porciones)</Text>
                {receta.ingredientes.map((i) => {
                  const ing = catalogo.ingredientes[i.id];
                  const tengo = (inventario[i.id] ?? 0) >= i.cantidad;
                  return (
                    <Text key={i.id} style={{ color: tengo ? colores.primario : colores.texto }}>
                      {tengo ? '✓ ' : '• '}
                      {ing?.nombre ?? i.id}: {ing ? formatoCantidad(i.cantidad, ing.unidad) : i.cantidad}
                    </Text>
                  );
                })}
                <Text style={[estilos.texto, { fontWeight: '600', marginTop: 6 }]}>Preparación</Text>
                {receta.pasos.map((p, n) => (
                  <Text key={n} style={estilos.texto}>
                    {n + 1}. {p}
                  </Text>
                ))}
              </View>
            )}

            <View style={[estilos.fila, { marginTop: 6 }]}>
              <Boton pequeno titulo="Agregar al plan" onPress={() => agregarAlPlan(receta.id)} />
              {veces > 0 && <Suave>En el plan ×{veces}</Suave>}
            </View>
          </Tarjeta>
        );
      })}
    </ScrollView>
  );
}
