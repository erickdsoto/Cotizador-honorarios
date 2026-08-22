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
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/app" className="font-semibold text-texto">
            Cotizador de Honorarios
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/app" className="text-texto-suave hover:text-texto">
              Cotizaciones
            </Link>
            <Link
              href="/app/configuracion"
              className="text-texto-suave hover:text-texto"
            >
              Configuracion
            </Link>
            <span className="text-texto-suave">{user.email}</span>
            <form action={signOut}>
              <button
                type="submit"
                className="text-texto-suave hover:text-texto"
              >
                Cerrar sesion
              </button>
            </form>
          </nav>
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
