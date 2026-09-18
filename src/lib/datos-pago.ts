import type { SupabaseClient } from "@supabase/supabase-js";
import type { DatosPago, PlantillaDocumento } from "@/lib/types";

export async function obtenerDatosPago(
  supabase: SupabaseClient,
  despachoId: string
): Promise<DatosPago | null> {
  const { data } = await supabase
    .from("datos_pago")
    .select("*")
    .eq("despacho_id", despachoId)
    .maybeSingle();

  return (data as DatosPago) ?? null;
}

export async function obtenerPlantillaDocumento(
  supabase: SupabaseClient,
  despachoId: string
): Promise<PlantillaDocumento | null> {
  const { data } = await supabase
    .from("plantilla_documento")
    .select("*")
    .eq("despacho_id", despachoId)
    .maybeSingle();

  return (data as PlantillaDocumento) ?? null;
}
