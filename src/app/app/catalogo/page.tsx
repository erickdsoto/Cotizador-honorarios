import { createClient } from "@/lib/supabase/server";
import { obtenerCatalogo } from "@/lib/servicios";
import { redirect } from "next/navigation";
import {
  actualizarServicio,
  crearServicio,
  eliminarServicio,
} from "./actions";

export default async function CatalogoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const servicios = await obtenerCatalogo(supabase, user.id);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-texto mb-1">
        Catalogo de servicios
      </h1>
      <p className="text-texto-suave text-sm mb-8">
        Estos son los servicios y precios que puedes usar al armar una
        cotizacion. Editalos cuando cambien tus tarifas.
      </p>

      <div className="bg-superficie border border-borde rounded-2xl overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-texto-suave border-b border-borde">
              <th className="px-5 py-3 font-medium">Concepto</th>
              <th className="px-5 py-3 font-medium w-40">Precio mensual</th>
              <th className="px-5 py-3 font-medium w-20"></th>
            </tr>
          </thead>
          <tbody>
            {servicios.map((s) => (
              <tr key={s.id} className="border-b border-borde last:border-0">
                <td colSpan={3} className="px-2 py-2">
                  <form
                    action={actualizarServicio.bind(null, s.id)}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      name="concepto"
                      defaultValue={s.concepto}
                      required
                      className="flex-1 rounded-lg bg-transparent border border-transparent hover:border-borde focus:border-primario px-3 py-2 text-texto focus:outline-none"
                    />
                    <input
                      type="number"
                      name="precio"
                      defaultValue={s.precio}
                      step="0.01"
                      min="0"
                      required
                      className="w-32 rounded-lg bg-transparent border border-transparent hover:border-borde focus:border-primario px-3 py-2 text-right font-mono tabular-nums text-texto focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="text-primario hover:text-acento text-xs px-2"
                    >
                      Guardar
                    </button>
                  </form>
                </td>
                <td className="px-2 py-2 text-right">
                  <form action={eliminarServicio.bind(null, s.id)}>
                    <button
                      type="submit"
                      className="text-texto-suave hover:text-peligro text-xs px-2"
                    >
                      Eliminar
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-superficie border border-borde rounded-2xl p-5">
        <h2 className="text-texto font-medium mb-3 text-sm">
          Agregar nuevo servicio
        </h2>
        <form action={crearServicio} className="flex items-center gap-2">
          <input
            type="text"
            name="concepto"
            placeholder="Concepto del servicio"
            required
            className="flex-1 rounded-lg border border-borde bg-transparent px-3 py-2 text-texto placeholder:text-texto-suave focus:outline-none focus:border-primario"
          />
          <input
            type="number"
            name="precio"
            placeholder="Precio"
            step="0.01"
            min="0"
            required
            className="w-32 rounded-lg border border-borde bg-transparent px-3 py-2 text-right font-mono tabular-nums text-texto placeholder:text-texto-suave focus:outline-none focus:border-primario"
          />
          <button
            type="submit"
            className="bg-primario hover:bg-primario-hover text-white text-sm rounded-lg px-4 py-2 whitespace-nowrap"
          >
            Agregar
          </button>
        </form>
      </div>
    </div>
  );
}
