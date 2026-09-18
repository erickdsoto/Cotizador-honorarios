import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { obtenerDespacho } from "@/lib/despacho";
import { obtenerCatalogo } from "@/lib/servicios";
import type { Cotizacion } from "@/lib/types";
import { ConstructorCotizacion } from "../../nueva/constructor-cotizacion";

export default async function EditarCotizacionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data } = await supabase
    .from("cotizaciones")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();

  const cotizacion = data as Cotizacion;
  const { despachoId } = await obtenerDespacho(supabase, user.id);
  const servicios = await obtenerCatalogo(supabase, despachoId, user.id);

  return (
    <div>
      <Link
        href={`/app/${cotizacion.id}`}
        className="text-texto-suave hover:text-texto text-sm mb-6 inline-block"
      >
        ← Cancelar y Volver a la Cotizacion
      </Link>

      <h1 className="text-2xl font-semibold text-texto mb-1">
        Editar Cotizacion #{cotizacion.numero}
      </h1>
      <p className="text-texto-suave text-sm mb-8">
        Ajusta lo que necesites y guarda. El total se recalcula solo.
      </p>

      <ConstructorCotizacion
        servicios={servicios}
        cotizacionExistente={cotizacion}
      />
    </div>
  );
}
