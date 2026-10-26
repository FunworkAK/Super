import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { INGREDIENTES_POR_ID } from '../data/ingredientes';
import { RECETAS_POR_ID } from '../data/recetas';
import { PRECIOS_ESTIMADOS, combinarPrecios } from '../data/precios';
import extraidos from '../data/precios-extraidos.json';
import type { Catalogo } from '../domain/planificador';
import { TODAS_TIENDAS, type ConfigMenu, type Inventario, type ItemPlan, type ProductoTienda, type TiendaId } from '../domain/types';

const CLAVE = 'super-recetas/estado-v1';

interface Guardado {
  inventario: Inventario;
  plan: ItemPlan[];
  presupuesto: number;
  tiendas: TiendaId[];
  // null hasta que la persona configura su menú por primera vez.
  config: ConfigMenu | null;
}

const INICIAL: Guardado = {
  inventario: {},
  plan: [],
  presupuesto: 500,
  tiendas: TODAS_TIENDAS,
  config: null,
};

// Ajusta datos guardados por versiones anteriores de la app.
function migrar(guardado: Record<string, unknown>): Guardado {
  const e = { ...INICIAL, ...guardado } as Guardado & { estrategia?: unknown };
  if (!Array.isArray(e.tiendas) || e.tiendas.length === 0) {
    e.tiendas = typeof e.estrategia === 'string' && e.estrategia !== 'mejor' ? [e.estrategia as TiendaId] : TODAS_TIENDAS;
  }
  delete e.estrategia;
  return e;
}

interface AppState extends Guardado {
  cargado: boolean;
  catalogo: Catalogo;
  setInventario: (inv: Inventario) => void;
  setCantidad: (ingredienteId: string, cantidad: number) => void;
  setPlan: (plan: ItemPlan[]) => void;
  agregarAlPlan: (recetaId: string, porciones?: number) => void;
  setPresupuesto: (q: number) => void;
  setTiendas: (t: TiendaId[]) => void;
  setConfig: (c: ConfigMenu) => void;
}

const Ctx = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<Guardado>(INICIAL);
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(CLAVE)
      .then((json) => {
        if (json) setEstado(migrar(JSON.parse(json)));
      })
      .catch(() => {})
      .finally(() => setCargado(true));
  }, []);

  useEffect(() => {
    if (cargado) AsyncStorage.setItem(CLAVE, JSON.stringify(estado)).catch(() => {});
  }, [estado, cargado]);

  const catalogo = useMemo<Catalogo>(
    () => ({
      recetas: RECETAS_POR_ID,
      ingredientes: INGREDIENTES_POR_ID,
      precios: combinarPrecios(PRECIOS_ESTIMADOS, extraidos as ProductoTienda[]),
    }),
    [],
  );

  const valor: AppState = {
    ...estado,
    cargado,
    catalogo,
    setInventario: (inventario) => setEstado((s) => ({ ...s, inventario })),
    setCantidad: (id, cantidad) =>
      setEstado((s) => {
        const inventario = { ...s.inventario };
        if (cantidad > 0) inventario[id] = cantidad;
        else delete inventario[id];
        return { ...s, inventario };
      }),
    setPlan: (plan) => setEstado((s) => ({ ...s, plan })),
    agregarAlPlan: (recetaId, porciones) =>
      setEstado((s) => ({
        ...s,
        plan: [
          ...s.plan,
          { recetaId, porciones: porciones ?? s.config?.personas ?? RECETAS_POR_ID[recetaId]?.porciones ?? 4 },
        ],
      })),
    setPresupuesto: (presupuesto) => setEstado((s) => ({ ...s, presupuesto })),
    setTiendas: (tiendas) => setEstado((s) => ({ ...s, tiendas: tiendas.length ? tiendas : s.tiendas })),
    setConfig: (config) => setEstado((s) => ({ ...s, config })),
  };

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp fuera de AppStateProvider');
  return v;
}
