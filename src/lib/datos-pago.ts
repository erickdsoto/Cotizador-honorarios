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

// Datos ligeros para el encabezado de la app: no trae la imagen del logo,
// solo si existe (logo_updated_at) para armar la URL con cache-busting.
export async function obtenerMarcaDespacho(
  supabase: SupabaseClient,
  despachoId: string
): Promise<{ nombre: string | null; logoVersion: string | null }> {
  const { data } = await supabase
    .from("plantilla_documento")
    .select("nombre_despacho, logo_updated_at")
    .eq("despacho_id", despachoId)
    .maybeSingle();

  return {
    nombre: (data?.nombre_despacho as string | null) ?? null,
    logoVersion: (data?.logo_updated_at as string | null) ?? null,
  };
}
