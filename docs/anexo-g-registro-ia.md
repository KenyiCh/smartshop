# Anexo G · Registro de uso de IA en el prototipo

| Fecha | Herramienta | Propósito | Verificación |
|---|---|---|---|
| (antes de nov. 2026) | Lovable | Generar el prototipo base de la interfaz (React, Vite, Tailwind y shadcn/ui). | Revisión manual de las pantallas por el equipo. |
| 19 nov. 2026 | Claude Code (Claude Opus 5.5, Anthropic) | Corregir el prototipo para la demo: catálogo mock centralizado (`src/data/products.ts`) y página de producto por `id` con estado «no encontrado»; comparación ordenada por precio final con tipo de envío, hora y enlace de cada precio, rótulo de afiliado, precio con tarjeta, cuotas y garantía; aviso cuando el precio «antes» no aparece en el historial; historial por producto; flujo de alertas premium simulado con consentimiento (Ley 29733). | `npm run build`, `tsc` y `eslint` sin errores en los archivos modificados. Recorrido en el navegador: búsqueda «laptop» → producto → comparación → alerta premium → «Mis alertas»; producto inexistente (`/product/999`); vista móvil de 375 px. **Pendiente:** revisión humana del equipo antes de la presentación. |
| 19 nov. 2026 | Claude Code (Claude Opus 5.5, Anthropic) | Indicador de plan en la barra (Premium con corona / Gratis), pestaña y página `/planes` (Gratis S/ 0 y Premium S/ 20 al mes, con el pago deshabilitado por ser piloto). Corrección del formulario de bienvenida: no aparecía al entrar con Google porque la marca era global; ahora es por usuario, igual que Premium y las alertas. | `tsc` y `npm run build` sin errores. En el navegador: primer inicio con Google → formulario; insignia «Gratis» y pestaña «Planes»; botón de pago deshabilitado; prueba activada → insignia «Premium» y sin pestaña; segundo inicio con Google → directo al inicio y sigue Premium; barra a 820 px y 1280 px. |

## Qué sigue siendo simulado
- Todos los precios, tiendas, horas, historiales y reseñas son datos de ejemplo (no hay scraping ni backend).
- Inicio de sesión, prueba Premium y alertas: se guardan solo en el `localStorage` del navegador; no hay cobro y las alertas no se envían.
- El rótulo «Enlace de afiliado» en Mercado Libre es ilustrativo: hoy no existe ningún acuerdo de afiliados.
