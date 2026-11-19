# SmartShop — contexto para Claude Code

## Qué es
SmartShop es el proyecto del **Equipo 5** del curso **1INF38 Innovación y Emprendimiento con TI** (PUCP, 2026-2).
Es una plataforma web **freemium** para comparar precios de tecnología en tiendas oficiales del Perú.
- **Cliente:** jóvenes de 18 a 30 años de Lima Metropolitana, universitarios o con primer empleo, que compran tecnología en línea. El adoptante inicial es quien planifica una compra grande para una campaña (CyberWow, Black Friday).
- **Dolor principal:** la **confianza**, no el tiempo. No saben si el descuento es real (el precio «antes») ni si el vendedor es oficial.
- **Gratis:** comparar precios de tiendas oficiales en una sola vista, historial de precios, listas de deseos y reseñas.
- **Premium:** alertas a medida (precio objetivo, descuento mínimo, tiendas, canal y frecuencia) y recomendaciones con IA.

Integrantes: Santiago Moreno, Farid Chavez, Kenyi Chavez, Esteban Guevara y Benjhamin Ruiz.

## Origen del código
Este repo parte del prototipo generado en Lovable (`KenyiCh/smartshop-price-pilot-42`, demo en `smartshop-price-pilot-42.lovable.app`).
- Stack: React 18, Vite, TypeScript, Tailwind y shadcn/ui (`src/components/ui`). Rutas en `src/App.tsx`.
- **Sin backend:** todos los datos son mock dentro de los componentes y páginas. La sesión es simulada con `localStorage` (`user`, `sessionExpiry`).
- Comandos: `npm i`, `npm run dev`, `npm run build`, `npm run lint`.

## Presentación final (Sesión 12)
Hay un deck en Claude Slides: «SmartShop · Presentación final · Equipo 5». Son 6 diapositivas para 5 minutos más anexos (Canvas, registros, referencias y declaración de IA).
Orden de la exposición: problema (50 s) → experimentación (70 s) → Canvas (45 s) → prototipo (35 s) → **demo en vivo (60 s)** → aprendizajes (40 s).

Evidencia que el prototipo debe reflejar:
- **Entrevistas (8, oct. 2026):** 8 de 8 revisaron 2 o más tiendas y 7 de 8 dudaron de la oferta o del vendedor. Ninguno usó un comparador peruano.
- **Prueba concierge (6 participantes, del 6 al 12 de nov.):** 3 de 6 cumplen M1 + M2, así que la decisión fue **iterar**. Todos decidieron en 2 a 9 minutos. Los que no cumplieron abrieron otra tienda para ver **garantía, envío, vigencia u hora del precio, precio con tarjeta (caso P06, tarjeta Oh) y cuotas sin intereses**.
- Cada función responde a un hallazgo: historial (P04), tipo de envío (P02), reseñas (E2, E8) y alertas premium (P01, P05).

Guion de la demo: «Quiero comprar una laptop para Black Friday». Buscar → comparar tiendas (mejor precio arriba, precio por tienda con tipo de envío) → historial y reseñas → guardar en deseos → configurar alertas premium.

## Estado (19 nov. 2026)
Puntos 1 a 6 resueltos con datos mock. Catálogo en `src/data/products.ts` (12 productos, 5 laptops para el guion), premium y alertas simulados en `src/utils/premium.ts` (localStorage `premiumTrial` y `priceAlerts`), diálogo en `src/components/PriceAlertDialog.tsx`, lista en `/notification-settings`. Registro de IA en `docs/anexo-g-registro-ia.md`.

## Correcciones pendientes (prioridad para la demo)
1. **BUG:** `src/pages/ProductDetail.tsx` ignora el `id` de la URL y siempre muestra la «MacBook Pro 14 M3». Cualquier producto abre la MacBook. Hay que centralizar los productos mock (por ejemplo, en `src/data/products.ts`) y buscar por `id`, con estado de «no encontrado».
2. Mostrar **tipo de envío** por tienda en la comparación.
3. Mostrar la **hora de actualización y el enlace** de cada precio (medida ética y hallazgo de P04).
4. Ordenar **siempre por precio final**. Si hay enlaces de afiliado, rotularlos.
5. Gaps observados en la prueba (pendientes en el deck; si da el tiempo, mostrarlos aunque sea con datos mock): **cuotas, garantía y precio con tarjeta**.
6. El flujo premium (alertas: precio objetivo, descuento mínimo, tiendas favoritas, canal) debe poder recorrerse en la demo.

## Reglas de honestidad (lo que se dice en la presentación)
- **Implementado:** interfaz navegable (búsqueda, filtros, página de producto, listas de deseos, notificaciones y su configuración).
- **Simulado:** datos de ejemplo, inicio de sesión, pago y acceso premium, alertas que no se envían y recomendaciones con IA.
- Si se implementa algo real (backend, scraping, alertas), actualizar la diapositiva «demo» y la del prototipo para que digan la verdad.
- La plataforma **aún no se ha probado con usuarios**. No inventar cifras ni participantes.
- Datos personales (Ley 29733): consentimiento y datos mínimos en cuentas, alertas e historial de búsquedas.
- Si se usa IA para construir o modificar el prototipo, registrarlo para el **Anexo G** (herramienta, propósito y verificación).

## Siguiente paso del proyecto
Probar la plataforma con 6 personas nuevas del segmento y, en Black Friday (27 al 29 de nov.), medir búsquedas propias, compras reales y aceptación de una prueba premium.

## Convenciones
- Interfaz y textos en **español (Perú)**, precios en soles (`S/ 1,079`).
- Tiendas de referencia: Falabella, Ripley, Oechsle, Hiraoka, Coolbox y Mercado Libre (oficial).
