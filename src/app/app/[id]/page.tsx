import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatoFecha, formatoMoneda } from "@/lib/format";
import { calcularTotalAnual } from "@/lib/quotes";
import type { Cotizacion } from "@/lib/types";
import { archivarCotizacion, desarchivarCotizacion } from "../actions";
import { EliminarCotizacionBoton } from "../eliminar-cotizacion-boton";
import { EstatusSelector } from "../estatus-selector";
import { EnviarCorreoForm } from "../enviar-correo-form";

export default async function DetalleCotizacionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("cotizaciones")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();

  const cotizacion = data as Cotizacion;
  const totalesAnual = calcularTotalAnual(cotizacion.partidas, cotizacion.tasa_iva);

  return (
    <div>
      <Link
        href="/app"
        className="text-texto-suave hover:text-texto text-sm mb-6 inline-block"
      >
        ← Cotizaciones
      </Link>

      <div className="bg-superficie border border-borde rounded-2xl p-6 mb-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h1 className="text-2xl font-semibold text-texto">
              #{cotizacion.numero} — {cotizacion.prospecto}
            </h1>
            <p className="text-texto-suave text-sm mt-1">
              Creada el {formatoFecha(cotizacion.created_at)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 justify-end">
            <Link
              href={`/app/${cotizacion.id}/editar`}
              className="border border-borde hover:border-texto-suave text-texto text-sm rounded-lg px-4 py-2"
            >
              Editar
            </Link>
            <Link
              href={`/imprimir/${cotizacion.id}`}
              target="_blank"
              className="border border-borde hover:border-texto-suave text-texto text-sm rounded-lg px-4 py-2"
            >
              Imprimir / Descargar PDF
            </Link>
            <EstatusSelector id={cotizacion.id} actual={cotizacion.estatus} />
            <form
              action={(cotizacion.archivada
                ? desarchivarCotizacion
                : archivarCotizacion
              ).bind(null, cotizacion.id)}
            >
              <button
                type="submit"
                className="border border-borde hover:border-texto-suave text-texto-suave text-sm rounded-lg px-4 py-2"
              >
                {cotizacion.archivada ? "Desarchivar" : "Archivar"}
              </button>
            </form>
            <EliminarCotizacionBoton
              id={cotizacion.id}
              className="border border-borde hover:border-peligro hover:text-peligro text-texto-suave text-sm rounded-lg px-4 py-2"
            />
          </div>
        </div>

        {cotizacion.notas && (
          <p className="text-texto-suave text-sm mt-3 border-t border-borde pt-3">
            {cotizacion.notas}
          </p>
        )}

        <div className="border-t border-borde pt-3 mt-3">
          <EnviarCorreoForm
            id={cotizacion.id}
            correoInicial={cotizacion.correo_prospecto ?? ""}
          />
        </div>
      </div>

      <div className="bg-superficie border border-borde rounded-2xl overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-texto-suave border-b border-borde">
              <th className="px-5 py-3 font-medium">Servicio</th>
              <th className="px-5 py-3 font-medium text-right">Cantidad</th>
              <th className="px-5 py-3 font-medium text-right">
                Precio Unitario
              </th>
              <th className="px-5 py-3 font-medium text-right">Importe</th>
            </tr>
          </thead>
          <tbody>
            {cotizacion.partidas.map((p, i) => (
              <tr key={i} className="border-b border-borde last:border-0">
                <td className="px-5 py-3 text-texto">
                  {p.concepto}
                  {p.esAnual && (
                    <span className="ml-2 rounded-full bg-acento/20 text-acento text-xs px-2 py-0.5 align-middle">
                      Anual
                    </span>
                  )}
                  {typeof p.cantidadBase === "number" && p.unidadBase && (
                    <p className="text-texto-suave text-xs mt-0.5">
                      {p.cantidadBase} {p.unidadBase}
                    </p>
                  )}
                </td>
                <td className="px-5 py-3 text-right font-mono tabular-nums text-texto">
                  {p.cantidad}
                </td>
                <td className="px-5 py-3 text-right font-mono tabular-nums text-texto-suave">
                  {formatoMoneda(p.precioUnitario)}
                </td>
                <td className="px-5 py-3 text-right font-mono tabular-nums text-texto">
                  {formatoMoneda(p.importe)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-superficie border border-borde rounded-2xl p-6 ml-auto max-w-sm">
        <div className="flex justify-between text-texto-suave text-sm mb-1">
          <span>Subtotal</span>
          <span className="font-mono tabular-nums">
            {formatoMoneda(cotizacion.subtotal)}
          </span>
        </div>
        <div className="flex justify-between text-texto-suave text-sm mb-3">
          <span>IVA ({Math.round(cotizacion.tasa_iva * 100)}%)</span>
          <span className="font-mono tabular-nums">
            {formatoMoneda(cotizacion.iva)}
          </span>
        </div>
        <div className="flex justify-between items-center border-t border-borde pt-3">
          <span className="text-texto font-medium">Total</span>
          <span className="text-3xl font-semibold text-primario font-mono tabular-nums">
            {formatoMoneda(cotizacion.total)}
          </span>
        </div>

        {totalesAnual.subtotal > 0 && (
          <div className="border-t border-dashed border-borde pt-3 mt-3">
            <p className="text-texto-suave text-xs mb-1">
              Declaracion Anual (cobro unico, en temporada de anuales — no
              incluido en el total de arriba)
            </p>
            <div className="flex justify-between items-center">
              <span className="text-texto-suave text-sm">Total Anual</span>
              <span className="text-lg font-semibold text-acento font-mono tabular-nums">
                {formatoMoneda(totalesAnual.total)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
