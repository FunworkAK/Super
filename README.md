# Super y Recetas

App móvil (Android y iPhone) para planificar las comidas de la semana, armar la lista del super a partir de recetas, descontar lo que ya tienes en casa y ajustar la compra a tu presupuesto con precios de La Torre, Walmart y PriceSmart en Guatemala.

## Qué hace

- **Despensa visual:** una cuadrícula de ingredientes por pasillo. Tocas uno para marcarlo y ajustas cuánto tienes (en libras, litros o unidades, con cantidades rápidas). La lista del super lo descuenta.
- **Descubrir recetas:** al estilo de Mise, deslizas tarjetas a la derecha para agregarlas a tu semana o a la izquierda para pasar. Se pueden ordenar por lo que ya tienes, más proteína, menos calorías o más baratas.
- **Macros:** cada receta muestra calorías, proteína, carbohidratos y grasa por porción (valores aproximados en `src/data/nutricion.ts`), y el plan suma los de la semana.
- **Página de receta y Modo cocina:** porciones ajustables, qué ingredientes ya tienes y una vista paso a paso con letra grande. Al terminar se descuenta de la despensa.
- **Lista del super:** agrupada por pasillo, con la presentación y el precio en la tienda elegida (o la más barata por producto). Lo que marcas como comprado pasa a la despensa.
- **Presupuesto:** compara el total en cada tienda y, si te pasas, sugiere cambiar recetas por otras más baratas.

Los datos se guardan en el teléfono.

## Versión web

Se publica sola en **https://funworkak.github.io/Super/** cada vez que cambia `main` y después de cada actualización de precios (`.github/workflows/web.yml`). Los datos se guardan en el navegador.

Para generarla a mano: `npx expo export --platform web` (queda en `dist/`).

## Probarla en tu teléfono

1. Instala [Node.js 22](https://nodejs.org) y la app **Expo Go** en tu teléfono.
2. En la carpeta del proyecto:
   ```bash
   npm install
   npm start
   ```
3. Escanea el código QR con Expo Go (Android) o con la cámara (iPhone).

## Precios

- `src/data/precios.ts` tiene precios **estimados** de referencia para poder usar la app desde ya.
- `scraper/walmart.ts` consulta el catálogo de walmart.com.gt (plataforma VTEX) y guarda los precios reales en `src/data/precios-extraidos.json`, que reemplazan a los estimados. Se ejecuta con `npm run precios:walmart`, y la acción `.github/workflows/precios.yml` lo corre cada día.
- `scraper/busquedas.ts` define cómo buscar cada ingrediente; ajusta los términos si un producto no se encuentra bien.
- Pendiente: extractores de La Torre y PriceSmart.

> El extractor de Walmart ya funciona contra walmart.com.gt (unos 40 de 47 ingredientes). Si algún producto queda mal emparejado, ajusta su entrada en `scraper/busquedas.ts`.

## Desarrollo

```bash
npm test          # pruebas de la lógica (lista, presupuesto, tamaños)
npm run typecheck # TypeScript
```

Estructura:

- `src/app/` pantallas (Expo Router): `(tabs)/` las pestañas, `receta/[id]` y `cocina/[id]`
- `src/domain/` lógica: lista de compras, costos, sugerencias
- `src/data/` ingredientes, recetas y precios
- `src/state/` estado de la app guardado en el teléfono
- `scraper/` extractores de precios
