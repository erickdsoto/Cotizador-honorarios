import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-4xl grid gap-10 md:grid-cols-2 items-center">
        <div>
          <h1 className="text-4xl font-bold text-texto mb-4">
            Cotizador de Honorarios
          </h1>
          <p className="text-texto-suave text-lg leading-relaxed">
            Deja de copiar la cotizacion anterior en Word y de corregir sumas
            a mano. Arma tu catalogo de servicios una sola vez y genera
            cotizaciones por prospecto que calculan subtotal, IVA y total
            solas, en segundos.
          </p>
          <ul className="mt-6 space-y-2 text-texto-suave text-sm">
            <li>• Catalogo de servicios propio, editable en cualquier momento</li>
            <li>• Cotizaciones con IVA calculado automaticamente</li>
            <li>• Estatus de cada cotizacion: borrador, enviada, aceptada</li>
            <li>• Tus datos son solo tuyos: cada cuenta ve unicamente lo propio</li>
          </ul>
        </div>

        <div className="bg-tarjeta text-gray-900 rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-semibold mb-2">Entra a Tu Cuenta</h2>
          <p className="text-gray-500 text-sm mb-6">
            Crea tu cuenta o inicia sesion para empezar a cotizar.
          </p>
          <Link
            href="/login"
            className="block text-center bg-primario hover:bg-primario-hover transition-colors text-white font-medium rounded-lg py-3"
          >
            Iniciar Sesion / Registrarme
          </Link>
        </div>
      </div>

      <footer className="mt-16 text-center text-texto-suave text-xs max-w-md">
        Herramienta de apoyo profesional. El criterio y la revision final son
        del contador.
      </footer>
    </main>
  );
}
