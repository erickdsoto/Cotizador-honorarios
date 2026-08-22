import type { SupabaseClient } from "@supabase/supabase-js";
import { CATALOGO_INICIAL, ORDEN_CLAVES } from "@/lib/catalogo-inicial";
import type { Servicio } from "@/lib/types";

function ordenarServicios(servicios: Servicio[]): Servicio[] {
  return [...servicios].sort((a, b) => {
    const ia = a.clave ? ORDEN_CLAVES.indexOf(a.clave) : -1;
    const ib = b.clave ? ORDEN_CLAVES.indexOf(b.clave) : -1;
    const pa = ia === -1 ? ORDEN_CLAVES.length : ia;
    const pb = ib === -1 ? ORDEN_CLAVES.length : ib;
    if (pa !== pb) return pa - pb;
    return a.concepto.localeCompare(b.concepto);
  });
}

export async function obtenerCatalogo(
  supabase: SupabaseClient,
  userId: string
): Promise<Servicio[]> {
  const { data, error } = await supabase.from("servicios").select("*");

  if (error) throw error;

  const existentes = (data ?? []) as Servicio[];

  if (existentes.length === 0) {
    const { data: sembrado, error: errorSembrado } = await supabase
      .from("servicios")
      .insert(CATALOGO_INICIAL.map((s) => ({ ...s, user_id: userId })))
      .select("*");

    if (errorSembrado) throw errorSembrado;

    return ordenarServicios(sembrado as Servicio[]);
  }

  // Agrega automaticamente los servicios estructurales (regimenes,
  // adicionales) que se hayan sumado al catalogo inicial despues de que
  // esta cuenta ya se habia sembrado, sin tocar lo que el usuario ya
  // personalizo.
  const clavesExistentes = new Set(
    existentes.map((s) => s.clave).filter((c): c is string => Boolean(c))
  );
  const faltantes = CATALOGO_INICIAL.filter(
    (s) => s.clave && !clavesExistentes.has(s.clave)
  );

  if (faltantes.length === 0) return ordenarServicios(existentes);

  const { data: agregados, error: errorAgregados } = await supabase
    .from("servicios")
    .insert(faltantes.map((s) => ({ ...s, user_id: userId })))
    .select("*");

  if (errorAgregados) throw errorAgregados;

  return ordenarServicios([
    ...existentes,
    ...((agregados ?? []) as Servicio[]),
  ]);
}
