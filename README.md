# Super y Recetas

App móvil (Android y iPhone) para planificar las comidas de la semana, armar la lista del super a partir de recetas, descontar lo que ya tienes en casa y ajustar la compra a tu presupuesto con precios de La Torre, Walmart y PriceSmart en Guatemala.

## Qué hace

- **Despensa:** anotas lo que tienes en casa; la lista lo descuenta.
- **Recetas:** 30 recetas (muchas guatemaltecas), ordenadas por lo que aprovechan tu despensa y por costo por porción.
- **Plan semanal:** eliges recetas y porciones. Al marcar "Ya la cociné" se descuentan los ingredientes.
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

- `src/app/` pantallas (Expo Router, una por pestaña)
- `src/domain/` lógica: lista de compras, costos, sugerencias
- `src/data/` ingredientes, recetas y precios
- `src/state/` estado de la app guardado en el teléfono
- `scraper/` extractores de precios
