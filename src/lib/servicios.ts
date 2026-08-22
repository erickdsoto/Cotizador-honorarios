import type { SupabaseClient } from "@supabase/supabase-js";
import { CATALOGO_INICIAL } from "@/lib/catalogo-inicial";
import type { Servicio } from "@/lib/types";

export async function obtenerCatalogo(
  supabase: SupabaseClient,
  userId: string
): Promise<Servicio[]> {
  const { data, error } = await supabase
    .from("servicios")
    .select("*")
    .order("concepto", { ascending: true });

  if (error) throw error;

  if (data && data.length > 0) return data as Servicio[];

  const { data: sembrado, error: errorSembrado } = await supabase
    .from("servicios")
    .insert(
      CATALOGO_INICIAL.map((s) => ({ ...s, user_id: userId }))
    )
    .select("*");

  if (errorSembrado) throw errorSembrado;

  return (sembrado as Servicio[]).sort((a, b) =>
    a.concepto.localeCompare(b.concepto)
  );
}
