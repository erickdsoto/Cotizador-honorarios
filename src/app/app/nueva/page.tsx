import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { obtenerCatalogo } from "@/lib/servicios";
import type { Cotizacion } from "@/lib/types";
import { ConstructorCotizacion } from "./constructor-cotizacion";

export default async function NuevaCotizacionPage({
  searchParams,
}: {
  searchParams: Promise<{ duplicar?: string }>;
}) {
  const { duplicar } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const servicios = await obtenerCatalogo(supabase, user.id);

  let inicial: { prospecto: string; notas: string; partidas: Cotizacion["partidas"] } | null = null;

  if (duplicar) {
    const { data } = await supabase
      .from("cotizaciones")
      .select("*")
      .eq("id", duplicar)
      .maybeSingle();

    if (data) {
      const original = data as Cotizacion;
      inicial = {
        prospecto: original.prospecto,
        notas: original.notas ?? "",
        partidas: original.partidas,
      };
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-texto mb-1">
        {inicial ? "Duplicar cotizacion" : "Nueva cotizacion"}
      </h1>
      <p className="text-texto-suave text-sm mb-8">
        Palomea los servicios, ajusta cantidades y guarda. El total se
        calcula solo.
      </p>

      <ConstructorCotizacion servicios={servicios} inicial={inicial} />
    </div>
  );
}
