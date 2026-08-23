import type { SupabaseClient } from "@supabase/supabase-js";
import type { DatosPago, PlantillaDocumento } from "@/lib/types";

export async function obtenerDatosPago(
  supabase: SupabaseClient,
  userId: string
): Promise<DatosPago | null> {
  const { data } = await supabase
    .from("datos_pago")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  return (data as DatosPago) ?? null;
}

export async function obtenerPlantillaDocumento(
  supabase: SupabaseClient,
  userId: string
): Promise<PlantillaDocumento | null> {
  const { data } = await supabase
    .from("plantilla_documento")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  return (data as PlantillaDocumento) ?? null;
}
