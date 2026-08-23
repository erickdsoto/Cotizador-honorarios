import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { obtenerDatosPago } from "@/lib/datos-pago";
import { formatoFecha, formatoMoneda } from "@/lib/format";
import { ETIQUETA_ESTATUS } from "@/lib/quotes";
import type { Cotizacion } from "@/lib/types";
import { BotonImprimir } from "./boton-imprimir";

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
  const datosPago = await obtenerDatosPago(supabase, user.id);
  const hayDatosPago =
    datosPago &&
    (datosPago.beneficiario || datosPago.banco || datosPago.clabe || datosPago.numero_cuenta);

  return (
    <div className="min-h-screen bg-white text-gray-900 px-6 py-10 print:p-0">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-end mb-6 print:hidden">
          <BotonImprimir />
        </div>

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-xl font-bold">Cotizador de Honorarios</h1>
            <p className="text-gray-500 text-sm">{user.email}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-500 text-sm">Fecha</p>
            <p className="font-medium">{formatoFecha(cotizacion.created_at)}</p>
          </div>
        </div>

        <div className="mb-8">
          <p className="text-gray-500 text-sm">Cotizacion para</p>
          <h2 className="text-lg font-semibold">{cotizacion.prospecto}</h2>
          <p className="text-gray-500 text-sm mt-1">
            Estatus: {ETIQUETA_ESTATUS[cotizacion.estatus]}
          </p>
          {cotizacion.notas && (
            <p className="text-gray-600 text-sm mt-2">{cotizacion.notas}</p>
          )}
        </div>

        <table className="w-full text-sm mb-8 border-collapse">
          <thead>
            <tr className="text-left border-b-2 border-gray-900">
              <th className="py-2 font-semibold">Servicio</th>
              <th className="py-2 font-semibold text-right">Cantidad</th>
              <th className="py-2 font-semibold text-right">
                Precio Unitario
              </th>
              <th className="py-2 font-semibold text-right">Importe</th>
            </tr>
          </thead>
          <tbody>
            {cotizacion.partidas.map((p, i) => (
              <tr key={i} className="border-b border-gray-200">
                <td className="py-2">
                  {p.concepto}
                  {p.esAnual && " (Anual)"}
                  {typeof p.cantidadBase === "number" && p.unidadBase && (
                    <span className="text-gray-500 text-xs block">
                      {p.cantidadBase} {p.unidadBase}
                    </span>
                  )}
                </td>
                <td className="py-2 text-right font-mono tabular-nums">
                  {p.cantidad}
                </td>
                <td className="py-2 text-right font-mono tabular-nums text-gray-600">
                  {formatoMoneda(p.precioUnitario)}
                </td>
                <td className="py-2 text-right font-mono tabular-nums">
                  {formatoMoneda(p.importe)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="ml-auto max-w-xs mb-10">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Subtotal</span>
            <span className="font-mono tabular-nums">
              {formatoMoneda(cotizacion.subtotal)}
            </span>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>IVA ({Math.round(cotizacion.tasa_iva * 100)}%)</span>
            <span className="font-mono tabular-nums">
              {formatoMoneda(cotizacion.iva)}
            </span>
          </div>
          <div className="flex justify-between items-center border-t-2 border-gray-900 pt-2">
            <span className="font-semibold">Total</span>
            <span className="text-2xl font-bold font-mono tabular-nums">
              {formatoMoneda(cotizacion.total)}
            </span>
          </div>
        </div>

        {hayDatosPago && (
          <div className="border border-gray-300 rounded-lg p-4 mb-8 text-sm">
            <p className="font-semibold mb-2">Datos para Transferencia</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-gray-700">
              {datosPago?.beneficiario && (
                <>
                  <span className="text-gray-500">Beneficiario</span>
                  <span>{datosPago.beneficiario}</span>
                </>
              )}
              {datosPago?.banco && (
                <>
                  <span className="text-gray-500">Banco</span>
                  <span>{datosPago.banco}</span>
                </>
              )}
              {datosPago?.clabe && (
                <>
                  <span className="text-gray-500">CLABE</span>
                  <span className="font-mono">{datosPago.clabe}</span>
                </>
              )}
              {datosPago?.numero_cuenta && (
                <>
                  <span className="text-gray-500">Numero de Cuenta</span>
                  <span className="font-mono">{datosPago.numero_cuenta}</span>
                </>
              )}
            </div>
          </div>
        )}

        <p className="text-center text-gray-400 text-xs">
          Herramienta de apoyo profesional. El criterio y la revision final
          son del contador.
        </p>
      </div>
    </div>
  );
}
