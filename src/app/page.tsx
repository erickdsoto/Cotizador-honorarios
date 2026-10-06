import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-4xl grid gap-10 md:grid-cols-2 items-center">
        <div>
          <span className="inline-block bg-primario/10 text-primario text-xs font-semibold px-4 py-1.5 rounded-full mb-5">
            Para despachos contables
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-texto mb-4">
            Cotiza rápido.
            <br />
            Cobra claro.
          </h1>
          <p className="text-texto-suave text-lg leading-relaxed">
            Deja de copiar la cotización anterior en Word y de corregir sumas
            a mano. Arma tu catálogo de servicios una sola vez y genera
            cotizaciones por prospecto que calculan subtotal, IVA y total
            solas, en segundos.
          </p>
          <ul className="mt-6 space-y-2 text-texto-suave text-sm">
            <li>• Catálogo de servicios propio, editable en cualquier momento</li>
            <li>• Cotizaciones con IVA calculado automáticamente</li>
            <li>• Estatus de cada cotización: borrador, enviada, aceptada</li>
            <li>• Tus datos son solo tuyos: cada cuenta ve únicamente lo propio</li>
          </ul>
        </div>

        <div className="bg-tarjeta text-gray-900 rounded-3xl shadow-xl shadow-black/5 p-8">
          <h2 className="text-xl font-bold tracking-tight mb-1">
            Entra a Tu Cuenta
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Crea tu cuenta o inicia sesión para empezar a cotizar.
          </p>
          <Link
            href="/login"
            className="block text-center bg-texto hover:opacity-90 transition-opacity text-white font-semibold rounded-full py-3.5"
          >
            Iniciar Sesión / Registrarme
          </Link>
        </div>
      </div>

      <footer className="mt-16 text-center text-texto-suave text-xs max-w-md">
        Herramienta de apoyo profesional. El criterio y la revisión final son
        del contador.
      </footer>
    </main>
  );
}
