import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/login/actions";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-borde bg-superficie">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-start justify-between">
            <Link href="/app" className="font-semibold text-texto">
              Cotizador de Honorarios
            </Link>
            <div className="flex flex-col items-end gap-1">
              <nav className="flex items-center gap-6 text-sm">
                <Link
                  href="/app"
                  className="text-texto-suave hover:text-texto"
                >
                  Cotizaciones
                </Link>
                <Link
                  href="/app/historial"
                  className="text-texto-suave hover:text-texto"
                >
                  Historial
                </Link>
                <Link
                  href="/app/configuracion"
                  className="text-texto-suave hover:text-texto"
                >
                  Configuracion
                </Link>
              </nav>
              <form action={signOut}>
                <button
                  type="submit"
                  className="text-peligro/80 hover:text-peligro text-xs"
                >
                  Cerrar Sesion
                </button>
              </form>
            </div>
          </div>
          <p className="text-texto-suave text-xs mt-1">{user.email}</p>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-8">
        {children}
      </main>

      <footer className="border-t border-borde bg-superficie py-4">
        <p className="text-center text-texto-suave text-xs">
          Herramienta de apoyo profesional. El criterio y la revision final
          son del contador.
        </p>
      </footer>
    </div>
  );
}
