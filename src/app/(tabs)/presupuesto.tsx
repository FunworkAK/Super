import { useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { Boton, Suave, Tarjeta, Titulo, colores, estilos } from '../../components/ui';
import { compararTiendas, formatoQ, sugerirCambios } from '../../domain/planificador';
import { TIENDAS } from '../../domain/types';
import { SelectorTiendas } from '../../components/tiendas';
import { useApp } from '../../state/AppState';

export default function Presupuesto() {
  const { cargado, presupuesto, setPresupuesto, plan, setPlan, inventario, catalogo, tiendas, setTiendas } = useApp();
  const [texto, setTexto] = useState(String(presupuesto));

  // El presupuesto guardado se carga después del primer render.
  useEffect(() => {
    if (cargado) setTexto(String(presupuesto));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cargado]);

  const comparacion = useMemo(() => compararTiendas(plan, inventario, catalogo, tiendas), [plan, inventario, catalogo, tiendas]);
  const mismas = (a: string[]) => a.length === tiendas.length && a.every((t) => tiendas.includes(t as never));
  const actual = comparacion.find((c) => mismas(c.estrategia))?.total ?? 0;
  const pasado = actual > presupuesto;

  const sugerencias = useMemo(
    () => (pasado ? sugerirCambios(plan, inventario, catalogo, tiendas) : []),
    [pasado, plan, inventario, catalogo, tiendas],
  );

  const aplicar = (quitarId: string, ponerId: string) =>
    setPlan(plan.map((p) => (p.recetaId === quitarId ? { ...p, recetaId: ponerId } : p)));

  const precios = catalogo.precios;
  const estimados = precios.filter((p) => p.fuente === 'estimado').length;

  return (
    <ScrollView style={estilos.pantalla} contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled">
      <Tarjeta>
        <Titulo>Presupuesto semanal</Titulo>
        <View style={estilos.fila}>
          <Text style={estilos.texto}>Q</Text>
          <TextInput
            style={[estilos.input, { flex: 1 }]}
            keyboardType="numeric"
            value={texto}
            onChangeText={(t) => {
              setTexto(t);
              const n = Number(t.replace(',', '.'));
              if (!Number.isNaN(n) && n >= 0) setPresupuesto(n);
            }}
          />
        </View>
      </Tarjeta>

      <Titulo>¿Dónde vas a comprar?</Titulo>
      <SelectorTiendas />
      <Suave>El total usa el precio más bajo entre las tiendas que elijas.</Suave>

      <Titulo>Comparar tiendas</Titulo>
      {comparacion.map((c) => {
        const nombre = c.estrategia.length > 1 ? 'Tus tiendas, combinadas' : TIENDAS[c.estrategia[0]];
        const activo = mismas(c.estrategia);
        return (
          <Tarjeta key={c.estrategia.join('+')} style={activo && { borderColor: colores.primario, borderWidth: 2 }}>
            <View style={estilos.fila}>
              <View style={{ flex: 1 }}>
                <Text style={estilos.texto}>{nombre}</Text>
                {c.sinPrecio > 0 && <Suave>{c.sinPrecio} productos no disponibles</Suave>}
              </View>
              <Text style={[estilos.texto, { color: c.total > presupuesto ? colores.alerta : colores.primario }]}>
                {formatoQ(c.total)}
              </Text>
              {!activo && <Boton pequeno tipo="secundario" titulo="Usar" onPress={() => setTiendas(c.estrategia)} />}
            </View>
          </Tarjeta>
        );
      })}

      {pasado && (
        <>
          <Titulo>Para ajustarte al presupuesto</Titulo>
          {sugerencias.length === 0 && (
            <Suave>No encontré cambios de receta que bajen el total. Prueba con menos porciones o quita una comida.</Suave>
          )}
          {sugerencias.map((s) => (
            <Tarjeta key={s.quitar.id}>
              <Text style={estilos.texto}>
                Cambia <Text style={{ fontWeight: '600' }}>{s.quitar.nombre}</Text> por{' '}
                <Text style={{ fontWeight: '600' }}>{s.poner.nombre}</Text>
              </Text>
              <Suave>
                Ahorras {formatoQ(s.ahorro)} · nuevo total {formatoQ(s.nuevoTotal)}
              </Suave>
              <Boton pequeno titulo="Aplicar cambio" onPress={() => aplicar(s.quitar.id, s.poner.id)} />
            </Tarjeta>
          ))}
        </>
      )}

      <Suave>
        {estimados} de {precios.length} precios son estimados de referencia; el resto viene de los extractores.
      </Suave>
    </ScrollView>
  );
}
