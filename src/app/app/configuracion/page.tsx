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
  "cuestionario_qr",
  "alta_registro_patronal",
  "repse_alta",
  "repse_declaracion",
];

function CampoPrecio({
  name,
  defaultValue,
  className = "w-24",
}: {
  name: string;
  defaultValue: number;
  className?: string;
}) {
  return (
    <span className="inline-flex items-center gap-1 text-texto-suave text-xs">
      $
      <input
        type="number"
        name={name}
        defaultValue={defaultValue}
        step="0.01"
        min="0"
        required
        className={`${className} rounded-lg border border-borde bg-transparent px-2 py-1.5 text-right font-mono tabular-nums text-texto focus:outline-none focus:border-primario`}
      />
      MXN
    </span>
  );
}

function FilaPorBloque({ servicio }: { servicio: Servicio }) {
  return (
    <tr className="border-b border-borde last:border-0">
      <td className="px-4 py-3">
        <form
          action={actualizarServicioPorBloque.bind(null, servicio.id)}
          className="flex flex-wrap items-center gap-x-3 gap-y-2"
        >
          <input
            type="text"
            name="concepto"
            defaultValue={servicio.concepto}
            required
            className="flex-1 min-w-[240px] bg-transparent text-texto border border-transparent hover:border-borde focus:border-primario rounded-lg px-2 py-1.5 focus:outline-none"
          />
          <span className="text-texto-suave text-xs">base</span>
          <CampoPrecio name="precio" defaultValue={servicio.precio} />
          <span className="text-texto-suave text-xs">+</span>
          <CampoPrecio
            name="incremento_bloque"
            defaultValue={servicio.incremento_bloque ?? 0}
          />
          <span className="text-texto-suave text-xs">cada</span>
          <input
            type="number"
            name="tamano_bloque"
            defaultValue={servicio.tamano_bloque ?? 1}
            step="1"
            min="1"
            required
            className="w-16 rounded-lg border border-borde bg-transparent px-2 py-1.5 text-right font-mono tabular-nums text-texto focus:outline-none focus:border-primario"
          />
          <input
            type="text"
            name="unidad"
            defaultValue={servicio.unidad ?? ""}
            placeholder="unidad (ej. CFDI mensuales)"
            className="w-44 rounded-lg border border-borde bg-transparent px-2 py-1.5 text-texto placeholder:text-texto-suave focus:outline-none focus:border-primario text-xs"
          />
          <button
            type="submit"
            className="text-primario hover:text-acento text-xs px-2"
          >
            Guardar
          </button>
        </form>
      </td>
    </tr>
  );
}

function FilaFija({ servicio }: { servicio: Servicio }) {
  return (
    <tr className="border-b border-borde last:border-0">
      <td className="px-4 py-3">
        <form
          action={actualizarServicioFijo.bind(null, servicio.id)}
          className="flex flex-wrap items-center gap-2"
        >
          <input
            type="text"
            name="concepto"
            defaultValue={servicio.concepto}
            required
            className="flex-1 min-w-[220px] rounded-lg bg-transparent border border-transparent hover:border-borde focus:border-primario px-2 py-1.5 text-texto focus:outline-none"
          />
          <input
            type="text"
            name="unidad"
            defaultValue={servicio.unidad ?? ""}
            placeholder="unidad (opcional)"
            className="w-40 rounded-lg bg-transparent border border-transparent hover:border-borde focus:border-primario px-2 py-1.5 text-texto placeholder:text-texto-suave focus:outline-none text-xs"
          />
          <CampoPrecio name="precio" defaultValue={servicio.precio} className="w-28" />
          <button
            type="submit"
            className="text-primario hover:text-acento text-xs px-2"
          >
            Guardar
          </button>
          <span className="flex-1" />
        </form>
      </td>
      <td className="px-2 py-3 text-right w-20">
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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-texto mb-1">
          Configuracion de Precios
        </h1>
        <p className="text-texto-suave text-sm">
          Todos los montos son en pesos mexicanos (MXN). Estos son los
          precios de ejemplo con los que arrancaste — ajustalos aqui cuando
          cambien tus tarifas: se aplican de inmediato a las cotizaciones
          nuevas.
        </p>
      </div>

      <section>
        <h2 className="text-texto font-medium mb-1">
          Contabilidad Mensual por Regimen
        </h2>
        <p className="text-texto-suave text-sm mb-3">
          Precio base para el primer bloque, mas el incremento que se suma
          por cada bloque adicional completo.
        </p>
        <div className="bg-superficie border border-borde rounded-2xl overflow-x-auto">
          <table className="w-full text-sm">
            <tbody>
              {regimenes.map((s) => (
                <FilaPorBloque key={s.id} servicio={s} />
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {adicionalesPorBloque.length > 0 && (
        <section>
          <h2 className="text-texto font-medium mb-1">
            Adicionales por Bloque
          </h2>
          <p className="text-texto-suave text-sm mb-3">
            Nomina y generacion de facturas tambien suben de precio por
            bloques (empleados, facturas).
          </p>
          <div className="bg-superficie border border-borde rounded-2xl overflow-x-auto">
            <table className="w-full text-sm">
              <tbody>
                {adicionalesPorBloque.map((s) => (
                  <FilaPorBloque key={s.id} servicio={s} />
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {adicionalesFijo.length > 0 && (
        <section>
          <h2 className="text-texto font-medium mb-1">
            Adicionales de Precio Fijo
          </h2>
          <div className="bg-superficie border border-borde rounded-2xl overflow-x-auto">
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
        <h2 className="text-texto font-medium mb-1">Otros Servicios</h2>
        <p className="text-texto-suave text-sm mb-3">
          Precio fijo, se palomean libremente al armar una cotizacion.
        </p>
        <div className="bg-superficie border border-borde rounded-2xl overflow-x-auto mb-4">
          <table className="w-full text-sm">
            <tbody>
              {genericos.map((s) => (
                <FilaFija key={s.id} servicio={s} />
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-superficie border border-borde rounded-2xl p-4">
          <h3 className="text-texto font-medium mb-3 text-sm">
            Agregar Nuevo Servicio
          </h3>
          <form action={crearServicio} className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              name="concepto"
              placeholder="Concepto del Servicio"
              required
              className="flex-1 min-w-[220px] rounded-lg border border-borde bg-transparent px-3 py-2 text-texto placeholder:text-texto-suave focus:outline-none focus:border-primario"
            />
            <CampoPrecio name="precio" defaultValue={0} className="w-28" />
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
