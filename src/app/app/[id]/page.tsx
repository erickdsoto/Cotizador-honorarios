import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatoFecha, formatoMoneda } from "@/lib/format";
import { ETIQUETA_ESTATUS, siguienteEstatus } from "@/lib/quotes";
import type { Cotizacion } from "@/lib/types";
import { cambiarEstatus, duplicarCotizacion } from "../actions";

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
              {cotizacion.prospecto}
            </h1>
            <p className="text-texto-suave text-sm mt-1">
              Creada el {formatoFecha(cotizacion.created_at)}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <form action={duplicarCotizacion.bind(null, cotizacion.id)}>
              <button
                type="submit"
                className="border border-borde hover:border-texto-suave text-texto text-sm rounded-lg px-4 py-2"
              >
                Duplicar como borrador
              </button>
            </form>
            <form
              action={cambiarEstatus.bind(
                null,
                cotizacion.id,
                cotizacion.estatus
              )}
            >
              <button
                type="submit"
                className="bg-superficie-alta hover:bg-borde text-texto text-sm rounded-lg px-4 py-2"
              >
                Marcar como{" "}
                {ETIQUETA_ESTATUS[siguienteEstatus(cotizacion.estatus)]}
              </button>
            </form>
          </div>
        </div>

        {cotizacion.notas && (
          <p className="text-texto-suave text-sm mt-3 border-t border-borde pt-3">
            {cotizacion.notas}
          </p>
        )}
      </div>

      <div className="bg-superficie border border-borde rounded-2xl overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-texto-suave border-b border-borde">
              <th className="px-5 py-3 font-medium">Servicio</th>
              <th className="px-5 py-3 font-medium text-right">Cantidad</th>
              <th className="px-5 py-3 font-medium text-right">
                Precio unitario
              </th>
              <th className="px-5 py-3 font-medium text-right">Importe</th>
            </tr>
          </thead>
          <tbody>
            {cotizacion.partidas.map((p, i) => (
              <tr key={i} className="border-b border-borde last:border-0">
                <td className="px-5 py-3 text-texto">{p.concepto}</td>
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
          <span>IVA (16%)</span>
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
      </div>
    </div>
  );
}
