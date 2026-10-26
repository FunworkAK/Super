# Super y Recetas

App móvil (Android y iPhone) para planificar las comidas de la semana, armar la lista del super a partir de recetas, descontar lo que ya tienes en casa y ajustar la compra a tu presupuesto con precios de La Torre, Walmart y PriceSmart en Guatemala.

## Qué hace

- **Mi semana:** antes de sugerir recetas pregunta dónde vas a comprar, tu presupuesto, para cuántas personas, qué días, qué comidas (desayuno, almuerzo y cena) y qué aparatos tienes en tu cocina (estufa, horno, freidora de aire, licuadora, Thermomix, Ninja, KitchenAid…), que eliges tocando su foto. Solo sugiere recetas que puedas hacer con ellos. Con eso arma un menú por día y comida que aprovecha tu despensa y se ajusta al presupuesto. Cada plato se puede cambiar por otro de la misma comida.
- **Tiendas:** eliges una o varias (Walmart, La Torre, PriceSmart) y la lista usa el precio más bajo entre ellas.
- **Recetas:** modo Descubrir (deslizar tarjetas, al estilo de Mise) y cuadrícula con filtros por comida. Algunas recetas vienen de sitios de cocina familiar (The Foodie's Kitchen, Guía Infantil) y enlazan a la original (`src/data/recetas-web.ts`).
- **En la web:** enlaces a sitios de recetas sanas, internacionales, de pollo asado, carne asada y comidas fáciles.
- **Fotos:** cada persona sube las fotos de los platos que cocina desde la receta o al terminar el Modo cocina; se guardan en su dispositivo. Las fotos de los aparatos vienen de Wikimedia Commons con licencia libre (`npm run fotos`, o la acción "Buscar fotos").
- **Despensa visual:** cuadrícula de ingredientes por pasillo; tocas uno y ajustas cuánto tienes (libras, litros o unidades). La lista lo descuenta.
- **Macros:** calorías, proteína, carbohidratos y grasa por porción (valores aproximados en `src/data/nutricion.ts`), y promedio de la semana.
- **Modo cocina:** paso a paso con letra grande; al terminar descuenta la despensa.
- **Lista del super y presupuesto:** agrupada por pasillo, con comparación entre tiendas.

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
- `src/domain/` lógica: lista de compras, costos, menú semanal (`menu.ts`), macros
- `src/data/` ingredientes, recetas y precios
- `src/state/` estado de la app guardado en el teléfono
- `scraper/` extractores de precios
