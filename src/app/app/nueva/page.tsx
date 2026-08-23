import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { obtenerCatalogo } from "@/lib/servicios";
import { ConstructorCotizacion } from "./constructor-cotizacion";

export default async function NuevaCotizacionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const servicios = await obtenerCatalogo(supabase, user.id);

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
    </div>
  );
}
