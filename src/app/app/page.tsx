import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatoFecha, formatoMoneda } from "@/lib/format";
import { ETIQUETA_ESTATUS, siguienteEstatus } from "@/lib/quotes";
import type { Cotizacion } from "@/lib/types";
import { cambiarEstatus, duplicarCotizacion } from "./actions";

const ESTILO_ESTATUS: Record<string, string> = {
  borrador: "bg-superficie-alta text-texto-suave",
  enviada: "bg-acento/20 text-acento",
  aceptada: "bg-primario/20 text-primario",
};

export default async function CotizacionesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("cotizaciones")
    .select("*")
    .order("created_at", { ascending: false });

  const cotizaciones = (data ?? []) as Cotizacion[];

  const ahora = new Date();
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
  const totalAceptadasMes = cotizaciones
    .filter(
      (c) =>
        c.estatus === "aceptada" &&
        c.fecha_aceptada &&
        new Date(c.fecha_aceptada) >= inicioMes
    )
    .reduce((acc, c) => acc + c.total, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-texto-suave text-sm">
            {user?.email}
          </p>
          <h1 className="text-2xl font-semibold text-texto mt-1">
            Cotizaciones
          </h1>
        </div>
        <Link
          href="/app/nueva"
          className="bg-primario hover:bg-primario-hover transition-colors text-white font-medium rounded-lg px-5 py-2.5"
        >
          + Nueva cotizacion
        </Link>
      </div>

      <div className="bg-superficie border border-borde rounded-2xl p-6 mb-8">
        <p className="text-texto-suave text-sm mb-1">
          En cotizaciones aceptadas este mes
        </p>
        <p className="text-4xl font-semibold text-primario font-mono tabular-nums">
          {formatoMoneda(totalAceptadasMes)}
        </p>
      </div>

      {cotizaciones.length === 0 ? (
        <div className="bg-superficie border border-borde rounded-2xl p-10 text-center">
          <p className="text-texto-suave">
            Todavia no tienes cotizaciones. Crea la primera.
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
              {cotizaciones.map((c) => (
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
                    <form
                      action={cambiarEstatus.bind(null, c.id, c.estatus)}
                    >
                      <button
                        type="submit"
                        title={`Marcar como ${
                          ETIQUETA_ESTATUS[siguienteEstatus(c.estatus)]
                        }`}
                        className={`rounded-full px-3 py-1 text-xs font-medium ${ESTILO_ESTATUS[c.estatus]}`}
                      >
                        {ETIQUETA_ESTATUS[c.estatus]}
                      </button>
                    </form>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <form action={duplicarCotizacion.bind(null, c.id)}>
                      <button
                        type="submit"
                        className="text-texto-suave hover:text-texto text-xs"
                      >
                        Duplicar
                      </button>
                    </form>
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
