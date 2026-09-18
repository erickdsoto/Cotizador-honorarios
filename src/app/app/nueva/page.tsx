import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { obtenerDespacho } from "@/lib/despacho";
import { obtenerCatalogo } from "@/lib/servicios";
import { ConstructorCotizacion } from "./constructor-cotizacion";

export default async function NuevaCotizacionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { despachoId } = await obtenerDespacho(supabase, user.id);
  const servicios = await obtenerCatalogo(supabase, despachoId, user.id);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-texto mb-1">
        Nueva Cotizacion
      </h1>
      <p className="text-texto-suave text-sm mb-8">
        Palomea los servicios, ajusta cantidades y guarda. El total se
        calcula solo.
      </p>

      <ConstructorCotizacion servicios={servicios} />

      <div className="text-center mt-6">
        <Link
          href="/app/configuracion"
          className="inline-block border border-borde hover:border-texto-suave text-texto-suave hover:text-texto text-sm rounded-lg px-4 py-2"
        >
          Editar Servicios y Precios →
        </Link>
      </div>
    </div>
  );
}
