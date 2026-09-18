import type { SupabaseClient } from "@supabase/supabase-js";
import type { Rol } from "@/lib/types";

export type Despacho = {
  despachoId: string;
  rol: Rol;
};

// Cada usuario pertenece a un solo despacho. La primera vez que se le
// consulta (ej. un usuario recien registrado), se le crea su propio
// despacho como dueno; un colaborador invitado ya tiene su membresia
// creada de antemano por invitarColaborador, asi que aqui solo se lee.
export async function obtenerDespacho(
  supabase: SupabaseClient,
  userId: string
): Promise<Despacho> {
  const { data } = await supabase
    .from("miembros_despacho")
    .select("despacho_id, rol")
    .eq("user_id", userId)
    .maybeSingle();

  if (data) {
    return { despachoId: data.despacho_id as string, rol: data.rol as Rol };
  }

  // El despacho recien creado no es visible via su propia policy de SELECT
  // hasta que exista la membresia (todavia no existe en este punto), asi
  // que no se puede usar .select() / RETURNING aqui — Postgres lo rechaza
  // como violacion de RLS. Se genera el id en el cliente para no
  // necesitar leerlo de vuelta.
  const nuevoDespachoId = crypto.randomUUID();

  const { error: errorDespacho } = await supabase
    .from("despachos")
    .insert({ id: nuevoDespachoId });

  if (errorDespacho) throw errorDespacho;

  const { error: errorMiembro } = await supabase
    .from("miembros_despacho")
    .insert({ despacho_id: nuevoDespachoId, user_id: userId, rol: "dueno" });

  if (errorMiembro) throw errorMiembro;

  return { despachoId: nuevoDespachoId, rol: "dueno" };
}
