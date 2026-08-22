import { createClient } from "@/lib/supabase/server";
import { obtenerCatalogo } from "@/lib/servicios";
import { redirect } from "next/navigation";
import type { Servicio } from "@/lib/types";
import { CLAVES_REGIMEN } from "@/lib/types";
import {
  actualizarServicioFijo,
  actualizarServicioPorBloque,
  crearServicio,
  eliminarServicio,
} from "./actions";

const CLAVES_ADICIONALES_POR_BLOQUE = ["nomina", "generacion_facturas"];
const CLAVES_ADICIONALES_FIJO = [
  "contabilidad_electronica",
  "estado_cuenta",
  "repse_alta",
  "repse_declaracion",
];

function TarjetaPorBloque({ servicio }: { servicio: Servicio }) {
  return (
    <form
      action={actualizarServicioPorBloque.bind(null, servicio.id)}
      className="bg-superficie border border-borde rounded-2xl p-5 space-y-3"
    >
      <input
        type="text"
        name="concepto"
        defaultValue={servicio.concepto}
        required
        className="w-full bg-transparent text-texto font-medium border border-transparent hover:border-borde focus:border-primario rounded-lg px-2 py-1 -mx-2 focus:outline-none"
      />
      <div className="grid grid-cols-3 gap-3 text-sm">
        <label className="block">
          <span className="text-texto-suave text-xs">Precio base</span>
          <input
            type="number"
            name="precio"
            defaultValue={servicio.precio}
            step="0.01"
            min="0"
            required
            className="w-full mt-1 rounded-lg border border-borde bg-transparent px-2 py-1.5 text-right font-mono tabular-nums text-texto focus:outline-none focus:border-primario"
          />
        </label>
        <label className="block">
          <span className="text-texto-suave text-xs">+ por bloque</span>
          <input
            type="number"
            name="incremento_bloque"
            defaultValue={servicio.incremento_bloque ?? 0}
            step="0.01"
            min="0"
            required
            className="w-full mt-1 rounded-lg border border-borde bg-transparent px-2 py-1.5 text-right font-mono tabular-nums text-texto focus:outline-none focus:border-primario"
          />
        </label>
        <label className="block">
          <span className="text-texto-suave text-xs">Tamano bloque</span>
          <input
            type="number"
            name="tamano_bloque"
            defaultValue={servicio.tamano_bloque ?? 1}
            step="1"
            min="1"
            required
            className="w-full mt-1 rounded-lg border border-borde bg-transparent px-2 py-1.5 text-right font-mono tabular-nums text-texto focus:outline-none focus:border-primario"
          />
        </label>
      </div>
      <label className="block text-sm">
        <span className="text-texto-suave text-xs">
          Unidad que se captura al cotizar
        </span>
        <input
          type="text"
          name="unidad"
          defaultValue={servicio.unidad ?? ""}
          placeholder="ej. CFDI mensuales"
          className="w-full mt-1 rounded-lg border border-borde bg-transparent px-2 py-1.5 text-texto placeholder:text-texto-suave focus:outline-none focus:border-primario"
        />
      </label>
      <div className="flex justify-between items-center pt-1">
        <p className="text-texto-suave text-xs">
          Ej: {servicio.tamano_bloque ?? 1}-
          {(servicio.tamano_bloque ?? 1) * 2} {servicio.unidad ?? "unidades"} ={" "}
          {(servicio.precio + (servicio.incremento_bloque ?? 0)).toLocaleString(
            "es-MX",
            { style: "currency", currency: "MXN" }
          )}
        </p>
        <button
          type="submit"
          className="text-primario hover:text-acento text-xs px-2"
        >
          Guardar
        </button>
      </div>
    </form>
  );
}

function FilaFija({ servicio }: { servicio: Servicio }) {
  return (
    <tr className="border-b border-borde last:border-0">
      <td colSpan={3} className="px-2 py-2">
        <form
          action={actualizarServicioFijo.bind(null, servicio.id)}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            name="concepto"
            defaultValue={servicio.concepto}
            required
            className="flex-1 rounded-lg bg-transparent border border-transparent hover:border-borde focus:border-primario px-3 py-2 text-texto focus:outline-none"
          />
          <input
            type="text"
            name="unidad"
            defaultValue={servicio.unidad ?? ""}
            placeholder="unidad (opcional)"
            className="w-40 rounded-lg bg-transparent border border-transparent hover:border-borde focus:border-primario px-3 py-2 text-texto placeholder:text-texto-suave focus:outline-none text-sm"
          />
          <input
            type="number"
            name="precio"
            defaultValue={servicio.precio}
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
        <form action={eliminarServicio.bind(null, servicio.id)}>
          <button
            type="submit"
            className="text-texto-suave hover:text-peligro text-xs px-2"
          >
            Eliminar
          </button>
        </form>
      </td>
    </tr>
  );
}

export default async function ConfiguracionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const servicios = await obtenerCatalogo(supabase, user.id);

  const regimenes = (CLAVES_REGIMEN as readonly string[])
    .map((clave) => servicios.find((s) => s.clave === clave))
    .filter((s): s is Servicio => Boolean(s));

  const adicionalesPorBloque = CLAVES_ADICIONALES_POR_BLOQUE.map((clave) =>
    servicios.find((s) => s.clave === clave)
  ).filter((s): s is Servicio => Boolean(s));

  const adicionalesFijo = CLAVES_ADICIONALES_FIJO.map((clave) =>
    servicios.find((s) => s.clave === clave)
  ).filter((s): s is Servicio => Boolean(s));

  const genericos = servicios.filter((s) => !s.clave);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-texto mb-1">
          Configuracion de precios
        </h1>
        <p className="text-texto-suave text-sm">
          Estos son los precios de ejemplo con los que arrancaste. Ajustalos
          aqui cuando cambien tus tarifas: se aplican de inmediato a las
          cotizaciones nuevas.
        </p>
      </div>

      <section>
        <h2 className="text-texto font-medium mb-1">
          Contabilidad mensual por regimen
        </h2>
        <p className="text-texto-suave text-sm mb-4">
          Precio base para el primer bloque de CFDI, mas el incremento que se
          suma por cada bloque adicional completo.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {regimenes.map((s) => (
            <TarjetaPorBloque key={s.id} servicio={s} />
          ))}
        </div>
      </section>

      {adicionalesPorBloque.length > 0 && (
        <section>
          <h2 className="text-texto font-medium mb-1">
            Adicionales por bloque
          </h2>
          <p className="text-texto-suave text-sm mb-4">
            Nomina y generacion de facturas tambien suben de precio por
            bloques (empleados, facturas).
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {adicionalesPorBloque.map((s) => (
              <TarjetaPorBloque key={s.id} servicio={s} />
            ))}
          </div>
        </section>
      )}

      {adicionalesFijo.length > 0 && (
        <section>
          <h2 className="text-texto font-medium mb-1">
            Adicionales de precio fijo
          </h2>
          <div className="bg-superficie border border-borde rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                {adicionalesFijo.map((s) => (
                  <FilaFija key={s.id} servicio={s} />
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section>
        <h2 className="text-texto font-medium mb-1">Otros servicios</h2>
        <p className="text-texto-suave text-sm mb-4">
          Precio fijo, se palomean libremente al armar una cotizacion.
        </p>
        <div className="bg-superficie border border-borde rounded-2xl overflow-hidden mb-4">
          <table className="w-full text-sm">
            <tbody>
              {genericos.map((s) => (
                <FilaFija key={s.id} servicio={s} />
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-superficie border border-borde rounded-2xl p-5">
          <h3 className="text-texto font-medium mb-3 text-sm">
            Agregar nuevo servicio
          </h3>
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
      </section>
    </div>
  );
}
