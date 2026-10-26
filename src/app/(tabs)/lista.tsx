import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Boton, confirmar, Suave, Tarjeta, Titulo, colores, estilos } from '../../components/ui';
import { agregarCompras, armarLista, formatoCantidad, formatoQ } from '../../domain/planificador';
import { SelectorTiendas } from '../../components/tiendas';
import { TIENDAS } from '../../domain/types';
import { useApp } from '../../state/AppState';

export default function Lista() {
  const { plan, inventario, catalogo, tiendas, presupuesto, setInventario } = useApp();
  const [marcados, setMarcados] = useState<Set<string>>(new Set());

  const lista = useMemo(
    () => armarLista(plan, inventario, catalogo, tiendas),
    [plan, inventario, catalogo, tiendas],
  );

  const alternar = (id: string) =>
    setMarcados((m) => {
      const n = new Set(m);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const terminarCompra = () => {
    const compradas = lista.lineas.filter((l) => marcados.has(l.ingrediente.id));
    setInventario(agregarCompras(inventario, compradas));
    setMarcados(new Set());
  };

  let pasilloActual = '';
  const pasado = lista.total > presupuesto;

  return (
    <ScrollView style={estilos.pantalla} contentContainerStyle={estilos.contenido}>
      <SelectorTiendas />

      <Tarjeta style={{ backgroundColor: pasado ? colores.alertaSuave : colores.primarioSuave }}>
        <Titulo>Total estimado: {formatoQ(lista.total)}</Titulo>
        <Suave>
          Presupuesto {formatoQ(presupuesto)} ·{' '}
          {pasado ? `te pasas por ${formatoQ(lista.total - presupuesto)}` : `te sobran ${formatoQ(presupuesto - lista.total)}`}
        </Suave>
        {lista.sinPrecio.length > 0 && (
          <Suave>{lista.sinPrecio.length} productos no se venden en esta tienda (no están en el total).</Suave>
        )}
      </Tarjeta>

      {lista.lineas.length === 0 && (
        <Suave>{plan.length === 0 ? 'Tu plan está vacío.' : '¡Tienes todo en tu despensa!'}</Suave>
      )}

      {lista.lineas.map((l) => {
        const encabezado = l.ingrediente.pasillo !== pasilloActual;
        pasilloActual = l.ingrediente.pasillo;
        const marcado = marcados.has(l.ingrediente.id);
        return (
          <View key={l.ingrediente.id} style={{ gap: 6 }}>
            {encabezado && <Text style={[estilos.suave, { marginTop: 8, fontWeight: '600' }]}>{pasilloActual}</Text>}
            <Pressable onPress={() => alternar(l.ingrediente.id)}>
              <Tarjeta style={[estilos.fila, marcado && { opacity: 0.5 }]}>
                <Text style={{ fontSize: 18 }}>{marcado ? '☑' : '☐'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[estilos.texto, marcado && { textDecorationLine: 'line-through' }]}>
                    {l.ingrediente.nombre} · {formatoCantidad(l.cantidad, l.ingrediente.unidad)}
                  </Text>
                  <Suave>
                    {l.compra
                      ? `${l.compra.paquetes} × ${l.compra.producto.nombre} en ${TIENDAS[l.compra.producto.tienda]}${l.compra.producto.fuente === 'estimado' ? ' (precio estimado)' : ''}`
                      : 'No disponible en esta tienda'}
                  </Suave>
                </View>
                <Text style={estilos.texto}>{l.compra ? formatoQ(l.compra.costo) : '—'}</Text>
              </Tarjeta>
            </Pressable>
          </View>
        );
      })}

      {marcados.size > 0 && (
        <Boton
          titulo={`Pasar ${marcados.size} comprados a la despensa`}
          onPress={() =>
            confirmar('Terminar compra', 'Los productos marcados se agregarán a tu despensa.', 'Agregar', terminarCompra)
          }
        />
      )}
      <Suave>Los precios marcados como estimados son aproximados hasta conectar los extractores.</Suave>
    </ScrollView>
  );
}
