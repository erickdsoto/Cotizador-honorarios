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

          <div className="flex items-center gap-1">
            <Link
              href="/app"
              className="text-sm font-medium text-texto-suave hover:text-texto px-4 py-2.5 rounded-full hover:bg-superficie-alta transition-colors"
            >
              Cotizaciones
            </Link>
            <Link
              href="/app/historial"
              className="text-sm font-medium text-texto-suave hover:text-texto px-4 py-2.5 rounded-full hover:bg-superficie-alta transition-colors"
            >
              Historial
            </Link>
            <details className="relative">
              <summary className="list-none cursor-pointer text-sm font-medium text-texto-suave hover:text-texto px-4 py-2.5 rounded-full hover:bg-superficie-alta transition-colors marker:content-none">
                Configuracion ▾
              </summary>
              <div className="absolute right-0 mt-2 bg-superficie border border-borde rounded-2xl shadow-lg shadow-black/5 py-1.5 w-44 z-10">
                <Link
                  href="/app/perfil"
                  className="block px-4 py-2 text-sm text-texto-suave hover:text-texto hover:bg-superficie-alta"
                >
                  Mi Perfil
                </Link>
                <Link
                  href="/app/configuracion"
                  className="block px-4 py-2 text-sm text-texto-suave hover:text-texto hover:bg-superficie-alta"
                >
                  Configuracion
                </Link>
                <form action={signOut}>
                  <button
                    type="submit"
                    className="w-full text-left px-4 py-2 text-sm text-peligro hover:bg-superficie-alta"
                  >
                    Cerrar Sesion
                  </button>
                </form>
              </div>
            </details>
            <span className="w-9 h-9 rounded-full bg-primario/15 text-primario font-bold text-xs flex items-center justify-center ml-2">
              {inicial}
            </span>
          </div>
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
