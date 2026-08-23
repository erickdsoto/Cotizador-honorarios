import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ActualizarPasswordForm } from "./formulario";

export default async function ActualizarPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="bg-tarjeta text-gray-900 rounded-2xl shadow-xl p-8">
          <h1 className="text-lg font-semibold mb-1">Nueva Contrasena</h1>
          <p className="text-sm text-gray-500 mb-6">
            Escribe tu nueva contrasena para {user.email}.
          </p>
          <ActualizarPasswordForm />
        </div>
      </div>
    </main>
  );
}
