import { createClient } from "@/lib/supabase/server";
import { formatoMoneda } from "@/lib/format";
import type { Cotizacion } from "@/lib/types";
import { HistorialClient } from "./historial-client";

function sumarTotales(lista: Cotizacion[]) {
  return lista.reduce((acc, c) => acc + c.total, 0);
}

export default async function HistorialPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("cotizaciones")
    .select("*")
    .order("numero", { ascending: false });

  const cotizaciones = (data ?? []) as Cotizacion[];

  const totalEnCotizacion = sumarTotales(
    cotizaciones.filter((c) => c.estatus === "enviada")
  );
  const totalAutorizado = sumarTotales(
    cotizaciones.filter((c) => c.estatus === "aceptada")
  );

  return (
    <div>
      <h1 className="text-2xl font-semibold text-texto mb-1">Historial</h1>
      <p className="text-texto-suave text-sm mb-8">
        Todas tus cotizaciones, numeradas. Busca por nombre del prospecto.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 mb-8">
        <div className="bg-superficie border border-borde rounded-2xl p-5">
          <p className="text-texto-suave text-sm mb-1">
            En Cotizacion (Enviadas)
          </p>
          <p className="text-2xl font-semibold text-acento font-mono tabular-nums">
            {formatoMoneda(totalEnCotizacion)}
          </p>
        </div>
        <div className="bg-superficie border border-borde rounded-2xl p-5">
          <p className="text-texto-suave text-sm mb-1">
            Autorizado (Aceptadas)
          </p>
          <p className="text-2xl font-semibold text-primario font-mono tabular-nums">
            {formatoMoneda(totalAutorizado)}
          </p>
        </div>
      </div>

      <HistorialClient cotizaciones={cotizaciones} />
    </div>
  );
}
