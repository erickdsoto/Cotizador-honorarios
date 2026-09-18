import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { obtenerDespacho } from "@/lib/despacho";
import { obtenerDatosPago, obtenerPlantillaDocumento } from "@/lib/datos-pago";
import { formatoFechaLarga, formatoMoneda } from "@/lib/format";
import { calcularTotalAnual } from "@/lib/quotes";
import type { Cotizacion, Partida } from "@/lib/types";
import { BotonImprimir } from "./boton-imprimir";
import { EnviarCorreoForm } from "@/app/app/enviar-correo-form";

const ACENTO = "#C08A2E";

function Divisor() {
  return <hr className="my-4" style={{ borderColor: ACENTO, borderTopWidth: 2 }} />;
}

function Pie({ correo, despacho }: { correo: string; despacho: string }) {
  return (
    <div>
      <Divisor />
      <div className="flex justify-between text-xs text-gray-500">
        <a href={`mailto:${correo}`} className="underline">
          {correo}
        </a>
        <span className="font-semibold tracking-wide">{despacho}</span>
      </div>
    </div>
  );
}

function esMensual(p: Partida) {
  return p.concepto.startsWith("Contabilidad Mensual") && !p.esAnual;
}

function esAnual(p: Partida) {
  return Boolean(p.esAnual);
}

export default async function ImprimirCotizacionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("cotizaciones")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();

  const cotizacion = data as Cotizacion;
  const { despachoId } = await obtenerDespacho(supabase, user.id);
  const datosPago = await obtenerDatosPago(supabase, despachoId);
  const plantilla = await obtenerPlantillaDocumento(supabase, despachoId);

  const despacho = plantilla?.nombre_despacho || "Cotizador de Honorarios";
  const ciudad = plantilla?.ciudad || "";
  const correo = user.email ?? "";

  const partidaMensual = cotizacion.partidas.find(esMensual);
  const partidaAnual = cotizacion.partidas.find(esAnual);
  const adicionales = cotizacion.partidas.filter(
    (p) => !esMensual(p) && !esAnual(p)
  );
  const totalesAnual = calcularTotalAnual(cotizacion.partidas, cotizacion.tasa_iva);

  const partidasPorBloque = cotizacion.partidas.filter(
    (p) => !p.esAnual && p.tamanoBloque && p.incrementoBloque != null
  );

  const hayDatosPago =
    datosPago &&
    (datosPago.beneficiario ||
      datosPago.banco ||
      datosPago.clabe ||
      datosPago.numero_cuenta ||
      datosPago.tarjeta);

  const parrafosAlcance = (plantilla?.texto_alcance ?? "")
    .split("\n")
    .map((linea) => linea.trim())
    .filter(Boolean);

  const parrafosLegales = (plantilla?.notas_legales ?? "")
    .split("\n")
    .map((linea) => linea.trim())
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-white text-gray-800 print:bg-white">
      <div className="max-w-2xl mx-auto px-8 pt-10 print:hidden flex justify-between items-center">
        <Link
          href={`/app/${cotizacion.id}`}
          className="text-gray-500 hover:text-gray-800 text-sm"
        >
          ← Volver a la Cotizacion
        </Link>
        <BotonImprimir />
      </div>
      <div className="max-w-2xl mx-auto px-8 pb-6 print:hidden flex justify-end">
        <EnviarCorreoForm
          id={cotizacion.id}
          correoInicial={cotizacion.correo_prospecto ?? ""}
        />
      </div>

      {/* Pagina 1: Carta */}
      <div className="max-w-2xl mx-auto px-8 pb-10 break-after-page">
        <h1 className="text-2xl font-bold tracking-wide text-gray-900">
          {despacho}
        </h1>
        <Divisor />

        <p className="text-right text-xs text-gray-400 mb-1">
          Cotizacion No. {cotizacion.numero}
        </p>
        <p className="text-right text-sm text-gray-600 mb-8">
          {ciudad ? `${ciudad} a ` : ""}
          {formatoFechaLarga(cotizacion.created_at)}
        </p>

        <p className="font-bold uppercase text-gray-900 mb-1">
          C. {cotizacion.prospecto}
        </p>
        <p className="font-bold tracking-widest text-gray-900 mb-6">
          Presente:
        </p>

        {partidaMensual && (
          <>
            <p className="text-center font-bold text-gray-900 mb-3">
              Servicios
            </p>
            <p className="mb-6 text-gray-800">{partidaMensual.concepto}</p>
          </>
        )}

        {parrafosAlcance.length > 0 && (
          <div className="space-y-3 text-sm leading-relaxed text-gray-700">
            {parrafosAlcance.map((parrafo, i) => (
              <p key={i}>{parrafo}</p>
            ))}
          </div>
        )}

        <div className="mt-10">
          <Pie correo={correo} despacho={despacho} />
        </div>
      </div>

      {/* Pagina 2: Honorarios */}
      <div className="max-w-2xl mx-auto px-8 pb-10 break-after-page">
        <Divisor />
        <p className="text-center font-bold text-gray-900 mb-4">
          <span style={{ backgroundColor: "#FFF3B0" }} className="px-2">
            Honorarios
          </span>
        </p>

        {partidaMensual && (
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-sm">
              <span>{partidaMensual.concepto}</span>
              <span className="font-mono tabular-nums">
                {formatoMoneda(partidaMensual.importe)}
              </span>
            </div>
          </div>
        )}

        {adicionales.length > 0 && (
          <>
            <p className="text-center font-bold text-gray-900 mb-3">
              <span style={{ backgroundColor: "#FFF3B0" }} className="px-2">
                Adicionales
              </span>
            </p>
            <div className="space-y-2 mb-6">
              {adicionales.map((p, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>
                    {p.concepto}
                    {typeof p.cantidadBase === "number" && p.unidadBase && (
                      <span className="text-gray-500">
                        {" "}
                        ({p.cantidadBase} {p.unidadBase})
                      </span>
                    )}
                    {p.cantidad > 1 && !p.cantidadBase && (
                      <span className="text-gray-500"> x{p.cantidad}</span>
                    )}
                  </span>
                  <span className="font-mono tabular-nums">
                    {formatoMoneda(p.importe)}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="border-t border-gray-300 pt-3 max-w-xs ml-auto space-y-1">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span>
            <span className="font-mono tabular-nums">
              {formatoMoneda(cotizacion.subtotal)}
            </span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>IVA ({Math.round(cotizacion.tasa_iva * 100)}%)</span>
            <span className="font-mono tabular-nums">
              {formatoMoneda(cotizacion.iva)}
            </span>
          </div>
          <div className="flex justify-between items-center border-t-2 border-gray-900 pt-2">
            <span className="font-bold">TOTAL</span>
            <span className="text-xl font-bold font-mono tabular-nums">
              {formatoMoneda(cotizacion.total)}
            </span>
          </div>
        </div>

        {partidaAnual && (
          <div className="mt-8 border-t border-dashed border-gray-400 pt-4">
            <p className="text-center font-bold text-gray-900 mb-3">
              <span style={{ backgroundColor: "#FFF3B0" }} className="px-2">
                Declaracion Anual
              </span>
            </p>
            <p className="text-xs text-gray-500 mb-3 text-center">
              Cobro unico, se realiza una sola vez al año en temporada de
              declaraciones anuales — no forma parte de la mensualidad ni del
              TOTAL de arriba.
            </p>
            <div className="flex justify-between text-sm mb-3">
              <span>{partidaAnual.concepto}</span>
              <span className="font-mono tabular-nums">
                {formatoMoneda(partidaAnual.importe)}
              </span>
            </div>
            <div className="border-t border-gray-300 pt-3 max-w-xs ml-auto space-y-1">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span className="font-mono tabular-nums">
                  {formatoMoneda(totalesAnual.subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>IVA ({Math.round(cotizacion.tasa_iva * 100)}%)</span>
                <span className="font-mono tabular-nums">
                  {formatoMoneda(totalesAnual.iva)}
                </span>
              </div>
              <div className="flex justify-between items-center border-t-2 border-gray-900 pt-2">
                <span className="font-bold">TOTAL ANUAL</span>
                <span className="text-xl font-bold font-mono tabular-nums">
                  {formatoMoneda(totalesAnual.total)}
                </span>
              </div>
            </div>
          </div>
        )}

        {parrafosLegales.length > 0 && (
          <div className="mt-8 space-y-1 text-sm text-red-600 font-medium">
            {parrafosLegales.map((linea, i) => (
              <p key={i}>{linea}</p>
            ))}
          </div>
        )}

        <div className="mt-10 text-center text-gray-700 text-sm">
          <p>Saludos Cordiales</p>
          <p className="mt-1">Atentamente,</p>
          {plantilla?.nombre_firma && (
            <p className="mt-6 font-medium">{plantilla.nombre_firma}</p>
          )}
        </div>

        <div className="mt-10">
          <Pie correo={correo} despacho={despacho} />
        </div>
      </div>

      {/* Pagina 3: Datos bancarios */}
      {hayDatosPago && (
        <div className="max-w-2xl mx-auto px-8 pb-10 break-after-page">
          <Divisor />
          <h2 className="text-center text-2xl font-bold text-gray-900 mb-2">
            Datos Bancarios
          </h2>
          <Divisor />
          <div className="space-y-2 text-sm text-gray-800">
            <p className="font-bold">
              Datos Bancarios {despacho}
            </p>
            {plantilla?.nombre_firma && (
              <p className="font-bold uppercase">{plantilla.nombre_firma}</p>
            )}
            {datosPago?.banco && (
              <p className="font-bold text-red-700">{datosPago.banco}</p>
            )}
            {datosPago?.clabe && (
              <>
                <p className="font-bold">CLABE:</p>
                <p className="font-bold font-mono">{datosPago.clabe}</p>
              </>
            )}
            {datosPago?.numero_cuenta && (
              <>
                <p className="font-bold">CUENTA</p>
                <p className="font-bold font-mono">{datosPago.numero_cuenta}</p>
              </>
            )}
            {datosPago?.tarjeta && (
              <>
                {datosPago?.banco && (
                  <p className="font-bold text-red-700">{datosPago.banco}</p>
                )}
                <p className="font-bold font-mono">{datosPago.tarjeta}</p>
              </>
            )}
          </div>

          <div className="mt-10">
            <Pie correo={correo} despacho={despacho} />
          </div>
        </div>
      )}

      {/* Pagina 4: Informativo (solo si hay servicios por bloque) */}
      {partidasPorBloque.length > 0 && (
        <div className="max-w-2xl mx-auto px-8 pb-10">
          <Divisor />
          <p className="text-center font-bold text-gray-900 mb-4">
            Informativo
          </p>
          <div className="space-y-4 text-sm text-gray-800">
            {partidasPorBloque.map((p, i) => (
              <div key={i}>
                <p className="font-bold">
                  Los honorarios de &quot;{p.concepto}&quot; cambiarian en
                  caso de superar {p.tamanoBloque} {p.unidadBase ?? "unidades"},
                  pero el tema se trataria en su debido momento. ($
                  {formatoMoneda(p.incrementoBloque ?? 0).replace("$", "")}{" "}
                  adicionales por cada {p.tamanoBloque}{" "}
                  {p.unidadBase ?? "unidades"} extra)
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <Pie correo={correo} despacho={despacho} />
          </div>
        </div>
      )}

      <p className="text-center text-gray-400 text-xs pb-10">
        Herramienta de apoyo profesional. El criterio y la revision final son
        del contador.
      </p>
    </div>
  );
}
