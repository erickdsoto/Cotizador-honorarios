import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { obtenerDespacho } from "@/lib/despacho";
import { obtenerPlantillaDocumento } from "@/lib/datos-pago";
import { NombreForm } from "./nombre-form";
import { PasswordFormPerfil } from "./password-form";

export default async function PerfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { despachoId, rol } = await obtenerDespacho(supabase, user.id);
  const plantilla = await obtenerPlantillaDocumento(supabase, despachoId);

  const nombre = (user.user_metadata?.nombre as string | undefined) ?? "";

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold text-texto mb-1">Mi Perfil</h1>
        <p className="text-texto-suave text-sm">
          Tus datos personales, no los del despacho.
        </p>
      </div>

      <section>
        <h2 className="text-texto font-medium mb-1">Nombre</h2>
        <p className="text-texto-suave text-sm mb-3">
          Se usa para saludarte y para identificarte ante los demas
          miembros del despacho.
        </p>
        <div className="bg-superficie border border-borde rounded-2xl p-4">
          <NombreForm nombreInicial={nombre} />
        </div>
      </section>

      <section>
        <h2 className="text-texto font-medium mb-1">Cambiar Contrasena</h2>
        <div className="bg-superficie border border-borde rounded-2xl p-4">
          <PasswordFormPerfil />
        </div>
      </section>

      <section>
        <h2 className="text-texto font-medium mb-1">Tu Cuenta</h2>
        <div className="bg-superficie border border-borde rounded-2xl p-4 space-y-2 text-sm">
          <p className="text-texto-suave">
            Correo: <span className="text-texto">{user.email}</span>
          </p>
          <p className="text-texto-suave">
            Rol:{" "}
            <span className="text-texto">
              {rol === "dueno" ? "Administrador" : "Auxiliar"}
            </span>
          </p>
          <p className="text-texto-suave">
            Despacho:{" "}
            <span className="text-texto">
              {plantilla?.nombre_despacho || "(sin nombre configurado)"}
            </span>
          </p>
        </div>
      </section>
    </div>
  );
}
