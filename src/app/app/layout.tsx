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

  const inicial = (
    (user.user_metadata?.nombre as string | undefined) || user.email || "?"
  )
    .trim()
    .slice(0, 1)
    .toUpperCase();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 py-5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link
            href="/app"
            className="flex items-center gap-2.5 font-bold text-texto tracking-tight"
          >
            <span className="w-8 h-8 rounded-full bg-texto flex items-center justify-center">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-grafito)"
                strokeWidth={2.6}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </span>
            Cotizador
          </Link>

          <details className="relative">
            <summary className="list-none cursor-pointer flex items-center gap-2.5 px-2 py-1.5 rounded-full hover:bg-superficie-alta transition-colors marker:content-none">
              <span className="w-9 h-9 rounded-full bg-primario/15 text-primario font-bold text-xs flex items-center justify-center">
                {inicial}
              </span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-texto-suave mr-1"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </summary>
            <div className="absolute right-0 mt-2 bg-superficie border border-borde rounded-2xl shadow-lg shadow-black/5 py-1.5 w-52 z-10 overflow-hidden">
              <Link
                href="/app"
                className="block px-4 py-2.5 text-sm font-medium text-texto hover:bg-superficie-alta"
              >
                Cotizaciones
              </Link>
              <Link
                href="/app/historial"
                className="block px-4 py-2.5 text-sm font-medium text-texto hover:bg-superficie-alta"
              >
                Historial
              </Link>
              <div className="my-1.5 border-t border-borde" />
              <Link
                href="/app/perfil"
                className="block px-4 py-2.5 text-sm text-texto-suave hover:text-texto hover:bg-superficie-alta"
              >
                Mi Perfil
              </Link>
              <Link
                href="/app/configuracion"
                className="block px-4 py-2.5 text-sm text-texto-suave hover:text-texto hover:bg-superficie-alta"
              >
                Configuracion
              </Link>
              <div className="my-1.5 border-t border-borde" />
              <form action={signOut}>
                <button
                  type="submit"
                  className="w-full text-left px-4 py-2.5 text-sm text-peligro hover:bg-superficie-alta"
                >
                  Cerrar Sesion
                </button>
              </form>
            </div>
          </details>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-8">
        {children}
      </main>

      <footer className="py-6">
        <p className="text-center text-texto-suave text-xs">
          Herramienta de apoyo profesional. El criterio y la revision final
          son del contador.
        </p>
      </footer>
    </div>
  );
}
