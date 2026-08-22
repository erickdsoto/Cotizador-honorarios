# Cotizador de Honorarios

## Rol

Eres un desarrollador senior de herramientas fiscales para contadores en Mexico.
Construyes aplicaciones web sencillas, precisas y listas para produccion.

## Contexto

Cotizo mis honorarios contables en Word y cada cotizacion me toma media hora:
copio la anterior, cambio nombres, me equivoco en las sumas. Necesito
"Cotizador de Honorarios": un cotizador en la nube donde configuro mis
precios una vez y las cotizaciones por prospecto suman solas. Lo usaremos
varios colegas, cada quien con su propia cuenta, su propia configuracion de
precios y sus propias cotizaciones: no hay catalogo compartido ni concepto
de equipo/organizacion, cada cuenta opera de forma totalmente aislada.

El IVA se elige por cotizacion, no es fijo: 16% (tasa general) u 8% (zona
fronteriza) sobre el subtotal, porque un mismo contador puede tener
clientes en ambas zonas al mismo tiempo. 16% es el valor por defecto al
armar una cotizacion nueva.

Mi contabilidad mensual no tiene un precio fijo: depende del regimen fiscal
del cliente y de cuantos CFDI factura al mes. Por cada bloque completo de 50
CFDI adicionales el precio sube un incremento fijo (ej. 0-50 cfdi = precio
base, 50-100 cfdi = base + 1 incremento, 100-150 = base + 2 incrementos, y
asi sin tope). Manejo 4 variantes segun el regimen:

- RESICO persona fisica
- Persona fisica con actividad empresarial y profesional
- Regimen General de Personas Morales
- RESICO Personas Morales

Nosotros manejamos contabilidad simplificada para personas fisicas
(RESICO y actividad empresarial) con ingresos menores a $3,500,000, y
contabilidad electronica para personas fisicas con actividad empresarial
con ingresos mayores a $4,000,000 — este criterio lo aplica el contador al
armar la cotizacion, la app no lo valida automaticamente.

La declaracion anual no tiene precio propio: cuesta lo mismo que 1
mensualidad del regimen cotizado (mismo calculo, mismo bloque de CFDI), asi
que se agrega como una casilla junto a la contabilidad mensual en vez de
capturarse aparte.

Ademas de la contabilidad mensual, cotizamos estos adicionales (todos
opcionales, se palomean segun aplique):

- **Contabilidad electronica**: cuota fija.
- **Nomina**: igual que la contabilidad mensual, sube por bloques — en este
  caso cada 10 trabajadores adicionales, sin tope.
- **Estado de cuenta capturado**: costo fijo por cada estado de cuenta que
  capturamos.
- **Generacion de facturas (QR)**: nosotros generamos las facturas del
  cliente — le damos un QR para que sus clientes manden sus datos via
  formulario y a nosotros nos llega la informacion, pero la factura la
  genera una persona, no un sistema automatico. Tambien sube por bloques
  (cada cuantas facturas mensuales se define en configuracion).
- **REPSE — alta**: cuota unica.
- **REPSE — declaracion informativa cuatrimestral**: cuota recurrente,
  cada 4 meses.

Los montos de todo lo anterior (precios base, incrementos por bloque,
tamanos de bloque) son configurables dentro de la app — arranca con valores
de ejemplo y el contador los ajusta el mismo cuando suben las tarifas, sin
tocar codigo.

Catalogo de servicios de precio fijo, sin cambios (editable igual que
siempre):

| Servicio | Precio |
| --- | --- |
| Alta en el SAT y tramite de e.firma | 900 |

## Instrucciones

1. Crea un proyecto Next.js (App Router, TypeScript, Tailwind) conectado a
   Supabase, listo para publicarse en Vercel.
2. Autenticacion con correo y contrasena (registro y login, sin confirmacion
   por correo). Pagina de inicio con la propuesta de valor y la tarjeta de
   acceso; el cotizador vive en /app y requiere sesion.
3. Tabla `servicios` con columnas: `clave` (identificador estable para los
   servicios estructurales — los 4 regimenes y los 6 adicionales — null para
   servicios genericos que el contador agregue libremente), `concepto`,
   `tipo` (`fijo` o `por_bloque`), `precio` (precio unitario si es fijo,
   precio del primer bloque si es por bloque), `incremento_bloque` (solo
   por bloque), `tamano_bloque` (solo por bloque, ej. 50 cfdi, 10
   empleados), `unidad` (etiqueta de lo que se captura, ej. "CFDI
   mensuales"). Sembrar el catalogo inicial (4 regimenes + 6 adicionales +
   "Alta en el SAT y e.firma") la primera vez, con los valores de ejemplo de
   este prompt.
4. Tabla `cotizaciones` (prospecto, notas, partidas seleccionadas —
   servicio, precio unitario ya calculado, cantidad, importe, y para las
   partidas por bloque tambien la cantidad base capturada (cfdi/empleados/
   facturas) y si es la partida de declaracion anual —, subtotal, iva,
   total, estatus). Guarda las partidas dentro de la cotizacion para que un
   cambio de precio futuro no altere cotizaciones ya enviadas.
5. Pagina de Configuracion: edicion de precio de cada servicio fijo, y de
   precio base + incremento + tamano de bloque + unidad de cada servicio
   por bloque (los 4 regimenes, nomina y generacion de facturas). Tambien
   alta/baja de servicios genericos de precio fijo.
6. Armar cotizacion:
   - Capturo el prospecto y notas, y elijo la tasa de IVA (16% general u 8%
     zona fronteriza; 16% por defecto).
   - Elijo un regimen fiscal (o "ninguno") y, si elijo uno, capturo los CFDI
     mensuales; la app calcula el precio de ese bloque. Casilla para incluir
     la declaracion anual al mismo importe.
   - Palomeo los adicionales que apliquen: contabilidad electronica; nomina
     (capturando numero de empleados); estado de cuenta capturado
     (capturando cantidad); generacion de facturas (capturando cantidad
     mensual); REPSE alta; REPSE declaracion cuatrimestral.
   - Palomeo servicios genericos de precio fijo (ej. alta en el SAT).
   - La app calcula subtotal, IVA (segun la tasa elegida) y total en
     grande, en vivo. Boton para guardar. El precio final de cada partida y
     el IVA se recalculan en el servidor antes de guardar (nunca se confia
     en el calculo hecho en el navegador).
7. Lista de cotizaciones con prospecto, fecha, total y estatus que rota con
   un clic en un ciclo cerrado: borrador -> enviada -> aceptada -> borrador.
   Al marcar como aceptada, guarda la fecha y hora en `fecha_aceptada`; si
   vuelve a borrador, limpia ese campo. Un indicador arriba muestra "$X en
   cotizaciones aceptadas este mes", sumando las cotizaciones actualmente en
   estatus aceptada cuya `fecha_aceptada` cae dentro del mes calendario en
   curso.
8. Cada cotizacion se puede reabrir para consultarla o duplicarla como
   borrador nuevo (precargando el mismo regimen/cfdi/adicionales para
   ajustarlos antes de guardar).
9. Entregame el SQL de ambas tablas con Row Level Security por usuario (ver,
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
- No inventes precios, tasas ni tamanos de bloque reales: usa los valores de
  ejemplo de este prompt y el IVA aqui indicado; el contador los ajusta
  despues dentro de Configuracion.
- La app no valida automaticamente si un cliente califica para contabilidad
  simplificada o electronica por sus ingresos: ese criterio lo aplica el
  contador al elegir el regimen y los adicionales.
- Incluye una nota al pie: "Herramienta de apoyo profesional. El criterio y
  la revision final son del contador."
