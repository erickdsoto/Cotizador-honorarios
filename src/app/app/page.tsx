import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatoFecha, formatoMoneda } from "@/lib/format";
import type { Cotizacion } from "@/lib/types";
import { archivarCotizacion, desarchivarCotizacion, duplicarCotizacion } from "./actions";
import { EliminarCotizacionBoton } from "./eliminar-cotizacion-boton";
import { EstatusSelector } from "./estatus-selector";

const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

function parseMes(mesParam: string | undefined) {
  const ahora = new Date();
  if (mesParam && /^\d{4}-\d{2}$/.test(mesParam)) {
    const [anio, mes] = mesParam.split("-").map(Number);
    return { anio, mes: mes - 1 };
  }
  return { anio: ahora.getFullYear(), mes: ahora.getMonth() };
}

function formatoMesParam(anio: number, mes: number) {
  return `${anio}-${String(mes + 1).padStart(2, "0")}`;
}

function sumarTotales(lista: Cotizacion[]) {
  return lista.reduce((acc, c) => acc + c.total, 0);
}

export default async function CotizacionesPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string; archivadas?: string }>;
}) {
  const { mes: mesParam, archivadas: archivadasParam } = await searchParams;
  const supabase = await createClient();

  const { anio, mes } = parseMes(mesParam);
  const inicioMes = new Date(anio, mes, 1);
  const finMes = new Date(anio, mes + 1, 1);
  const etiquetaMes = `${MESES[mes]} ${anio}`;
  const mesAnteriorParam = formatoMesParam(
    mes === 0 ? anio - 1 : anio,
    mes === 0 ? 11 : mes - 1
  );
  const mesSiguienteParam = formatoMesParam(
    mes === 11 ? anio + 1 : anio,
    mes === 11 ? 0 : mes + 1
  );

  const verArchivadas = archivadasParam === "1";
  const sufijoArchivadas = verArchivadas ? "&archivadas=1" : "";

  const { data } = await supabase
    .from("cotizaciones")
    .select("*")
    .order("created_at", { ascending: false });

  const cotizaciones = (data ?? []) as Cotizacion[];

  const enviadasMes = cotizaciones.filter((c) => {
    const fecha = new Date(c.created_at);
    return c.estatus === "enviada" && fecha >= inicioMes && fecha < finMes;
  });
  const aceptadasMes = cotizaciones.filter((c) => {
    if (c.estatus !== "aceptada" || !c.fecha_aceptada) return false;
    const fecha = new Date(c.fecha_aceptada);
    return fecha >= inicioMes && fecha < finMes;
  });
  const noAceptadasMes = cotizaciones.filter((c) => {
    const fecha = new Date(c.created_at);
    return c.estatus === "no_aceptada" && fecha >= inicioMes && fecha < finMes;
  });

  const listaVisible = cotizaciones.filter((c) => c.archivada === verArchivadas);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-texto">Cotizaciones</h1>
        <Link
          href="/app/nueva"
          className="bg-primario hover:bg-primario-hover transition-colors text-white font-medium rounded-lg px-5 py-2.5"
        >
          + Nueva Cotizacion
        </Link>
      </div>

      <div className="flex items-center justify-center gap-4 mb-4">
        <Link
          href={`/app?mes=${mesAnteriorParam}${sufijoArchivadas}`}
          className="text-texto-suave hover:text-texto px-2"
        >
          ‹
        </Link>
        <span className="text-texto font-medium text-sm">{etiquetaMes}</span>
        <Link
          href={`/app?mes=${mesSiguienteParam}${sufijoArchivadas}`}
          className="text-texto-suave hover:text-texto px-2"
        >
          ›
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <div className="bg-superficie border border-borde rounded-2xl p-5">
          <p className="text-texto-suave text-sm mb-1">
            Enviadas ({enviadasMes.length})
          </p>
          <p className="text-2xl font-semibold text-acento font-mono tabular-nums">
            {formatoMoneda(sumarTotales(enviadasMes))}
          </p>
        </div>
        <div className="bg-superficie border border-borde rounded-2xl p-5">
          <p className="text-texto-suave text-sm mb-1">
            Aceptadas ({aceptadasMes.length})
          </p>
          <p className="text-2xl font-semibold text-primario font-mono tabular-nums">
            {formatoMoneda(sumarTotales(aceptadasMes))}
          </p>
        </div>
        <div className="bg-superficie border border-borde rounded-2xl p-5">
          <p className="text-texto-suave text-sm mb-1">
            No Aceptadas ({noAceptadasMes.length})
          </p>
          <p className="text-2xl font-semibold text-peligro font-mono tabular-nums">
            {formatoMoneda(sumarTotales(noAceptadasMes))}
          </p>
        </div>
      </div>

      <div className="flex justify-end mb-4">
        <Link
          href={`/app?mes=${formatoMesParam(anio, mes)}${
            verArchivadas ? "" : "&archivadas=1"
          }`}
          className="text-texto-suave hover:text-texto text-xs"
        >
          {verArchivadas ? "Ver activas" : "Ver archivadas"}
        </Link>
      </div>

      {listaVisible.length === 0 ? (
        <div className="bg-superficie border border-borde rounded-2xl p-10 text-center">
          <p className="text-texto-suave">
            {verArchivadas
              ? "No tienes cotizaciones archivadas."
              : "Todavia no tienes cotizaciones. Crea la primera."}
          </p>
        </div>
      ) : (
        <div className="bg-superficie border border-borde rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-texto-suave border-b border-borde">
                <th className="px-5 py-3 font-medium">Prospecto</th>
                <th className="px-5 py-3 font-medium">Fecha</th>
                <th className="px-5 py-3 font-medium text-right">Total</th>
                <th className="px-5 py-3 font-medium">Estatus</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {listaVisible.map((c) => (
                <tr key={c.id} className="border-b border-borde last:border-0">
                  <td className="px-5 py-3">
                    <Link
                      href={`/app/${c.id}`}
                      className="text-texto hover:text-acento"
                    >
                      {c.prospecto}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-texto-suave">
                    {formatoFecha(c.created_at)}
                  </td>
                  <td className="px-5 py-3 text-right font-mono tabular-nums text-texto">
                    {formatoMoneda(c.total)}
                  </td>
                  <td className="px-5 py-3">
                    <EstatusSelector id={c.id} actual={c.estatus} />
                  </td>
                  <td className="px-5 py-3 text-right whitespace-nowrap">
                    <form
                      action={duplicarCotizacion.bind(null, c.id)}
                      className="inline"
                    >
                      <button
                        type="submit"
                        className="text-texto-suave hover:text-texto text-xs"
                      >
                        Duplicar
                      </button>
                    </form>
                    <span className="text-borde mx-2">·</span>
                    <form
                      action={(verArchivadas
                        ? desarchivarCotizacion
                        : archivarCotizacion
                      ).bind(null, c.id)}
                      className="inline"
                    >
                      <button
                        type="submit"
                        className="text-texto-suave hover:text-texto text-xs"
                      >
                        {verArchivadas ? "Desarchivar" : "Archivar"}
                      </button>
                    </form>
                    <span className="text-borde mx-2">·</span>
                    <EliminarCotizacionBoton id={c.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
