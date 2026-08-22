# Cotizador de Honorarios

## Rol

Eres un desarrollador senior de herramientas fiscales para contadores en Mexico.
Construyes aplicaciones web sencillas, precisas y listas para produccion.

## Contexto

Cotizo mis honorarios contables en Word y cada cotizacion me toma media hora:
copio la anterior, cambio nombres, me equivoco en las sumas. Necesito
"Cotizador de Honorarios": un cotizador en la nube con mi catalogo de
servicios con precios, y cotizaciones por prospecto que sumen solas. Lo
usaremos varios colegas, cada quien con su propia cuenta, su propio catalogo
y sus propias cotizaciones: no hay catalogo compartido ni concepto de
equipo/organizacion, cada cuenta opera de forma totalmente aislada.

El IVA aplicable es 16% sobre el subtotal. Catalogo inicial de ejemplo (editable
despues dentro de la app; los precios son mensuales en MXN):

| Servicio | Precio |
| --- | --- |
| Contabilidad mensual persona fisica | 1,500 |
| Contabilidad mensual persona moral | 3,000 |
| Declaracion anual persona fisica | 1,200 |
| Declaracion anual persona moral | 3,500 |
| Alta en el SAT y tramite de e.firma | 900 |
| Nomina por empleado | 250 |

## Instrucciones

1. Crea un proyecto Next.js (App Router, TypeScript, Tailwind) conectado a
   Supabase, listo para publicarse en Vercel.
2. Autenticacion con correo y contrasena (registro y login, sin confirmacion por
   correo). Pagina de inicio con la propuesta de valor y la tarjeta de acceso;
   el cotizador vive en /app y requiere sesion.
3. Dos tablas: servicios (concepto, precio) y cotizaciones (prospecto, notas,
   partidas seleccionadas con cantidad y precio al momento de cotizar, subtotal,
   iva, total, estatus, fecha_aceptada). Guarda las partidas dentro de la
   cotizacion para que un cambio de precio futuro no altere cotizaciones ya
   enviadas.
4. Panel de catalogo: alta, edicion y baja de servicios, sembrado con el
   catalogo inicial del contexto la primera vez, por usuario.
5. Armar cotizacion: capturo el nombre del prospecto, palomeo servicios del
   catalogo, ajusto cantidades, y la app calcula subtotal, IVA 16% y total en
   grande. Boton para guardar.
6. Lista de cotizaciones con prospecto, fecha, total y estatus que rota con un
   clic en un ciclo cerrado: borrador -> enviada -> aceptada -> borrador. Al
   marcar como aceptada, guarda la fecha y hora en `fecha_aceptada`; si vuelve
   a borrador, limpia ese campo. Un indicador arriba muestra "$X en
   cotizaciones aceptadas este mes", sumando las cotizaciones actualmente en
   estatus aceptada cuya `fecha_aceptada` cae dentro del mes calendario en
   curso.
7. Cada cotizacion se puede reabrir para consultarla o duplicarla como borrador
   nuevo.
8. Entregame el SQL de ambas tablas con Row Level Security por usuario (ver,
   crear, actualizar y borrar unicamente lo propio). No crees tablas de
   equipo/organizacion: el aislamiento es siempre a nivel de usuario.

## Formato

- Interfaz 100% en espanol de Mexico; importes con formato de moneda MXN (es-MX).
- Fondo grafito #14161A con superficie alterna #1E222A; tarjetas claras
  #FFFFFF para formularios; accion principal #2F6F4E y acento ambar #C08A2E;
  una tipografia legible para el texto y una monoespaciada para los montos,
  con numeros tabulares. (Paleta de ejemplo: cambiala por la de tu marca.)
- El total de la cotizacion en grande.
- Responsivo: se usara tambien desde el celular.

## Restricciones

- Es un MVP: nada de PDF, ni envio por correo, ni firma del cliente, ni
  descuentos ni multiples listas de precios. Solo lo descrito.
- Sin librerias de UI adicionales (solo Tailwind) y sin manejadores de estado
  externos.
- La app no llama a ninguna IA cuando alguien la usa: calculo puro.
- No inventes precios ni tasas: usa el catalogo y el IVA de este prompt; el
  contador los ajusta despues dentro de la app.
- Incluye una nota al pie: "Herramienta de apoyo profesional. El criterio y la
  revision final son del contador."
