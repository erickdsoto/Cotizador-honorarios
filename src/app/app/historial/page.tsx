import { createClient } from "@/lib/supabase/server";
import type { Cotizacion } from "@/lib/types";
import { HistorialClient } from "./historial-client";

export default async function HistorialPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("cotizaciones")
    .select("*")
    .order("numero", { ascending: false });

  const cotizaciones = (data ?? []) as Cotizacion[];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-texto mb-1">Historial</h1>
      <p className="text-texto-suave text-sm mb-8">
        Todas tus cotizaciones, numeradas. Busca por nombre del prospecto.
      </p>

      <HistorialClient cotizaciones={cotizaciones} />
    </div>
  );
}
