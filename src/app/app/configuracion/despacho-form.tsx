"use client";

import { useActionState } from "react";
import { guardarDespacho, type DespachoFormState } from "./actions";
import { COLORES_ACENTO, COLOR_POR_DEFECTO, esClaveColor } from "@/lib/marca";

const ESTADO_INICIAL: DespachoFormState = { error: null, guardado: false };

export function DespachoForm({
  despachoId,
  nombre,
  logoVersion,
  color,
}: {
  despachoId: string;
  nombre: string;
  logoVersion: string | null;
  color: string | null;
}) {
  const colorActual = esClaveColor(color) ? color : COLOR_POR_DEFECTO;
  const [state, formAction, pending] = useActionState(
    guardarDespacho,
    ESTADO_INICIAL
  );

  return (
    <form action={formAction} className="grid gap-4">
      <label className="block text-sm">
        <span className="text-texto-suave text-xs">
          Nombre del Despacho o Firma
        </span>
        <input
          type="text"
          name="nombre_despacho"
          defaultValue={nombre}
          placeholder="ej. Soto Trujillo | Consultores"
          className="w-full mt-1 rounded-lg border border-borde bg-transparent px-3 py-2 text-texto placeholder:text-texto-suave focus:outline-none focus:border-primario"
        />
        <p className="text-texto-suave text-xs mt-1">
          Aparece en el encabezado de la app, en el correo de invitación a tu
          equipo y en tus cotizaciones.
        </p>
      </label>

      <div className="block text-sm">
        <span className="text-texto-suave text-xs">Logo (Opcional)</span>
        <div className="mt-1 flex flex-wrap items-center gap-4">
          {logoVersion && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`/logo/${despachoId}?v=${encodeURIComponent(logoVersion)}`}
              alt="Logo actual"
              className="h-12 w-auto max-w-[160px] object-contain rounded-lg border border-borde bg-superficie p-1"
            />
          )}
          <input
            type="file"
            name="logo"
            accept="image/png,image/jpeg,image/webp"
            className="text-sm text-texto-suave file:mr-3 file:rounded-full file:border-0 file:bg-superficie-alta file:px-4 file:py-2 file:text-sm file:font-medium file:text-texto hover:file:bg-borde"
          />
        </div>
        <p className="text-texto-suave text-xs mt-1">
          PNG, JPG o WebP, de hasta 150 KB. Un logo horizontal se ve mejor.
        </p>
        {logoVersion && (
          <label className="mt-2 flex items-center gap-2 text-xs text-texto-suave">
            <input
              type="checkbox"
              name="quitar_logo"
              className="h-4 w-4 accent-primario"
            />
            Quitar el logo actual
          </label>
        )}
      </div>

      <fieldset className="text-sm">
        <legend className="text-texto-suave text-xs">Color de tu app</legend>
        <div className="mt-2 flex flex-wrap gap-3">
          {Object.entries(COLORES_ACENTO).map(([clave, c]) => (
            <label key={clave} className="cursor-pointer" title={c.nombre}>
              <input
                type="radio"
                name="color_acento"
                value={clave}
                defaultChecked={clave === colorActual}
                className="peer sr-only"
              />
              <span
                className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-transparent ring-offset-2 peer-checked:ring-2 peer-focus-visible:ring-2"
                style={
                  {
                    backgroundColor: c.base,
                    "--tw-ring-color": c.base,
                  } as React.CSSProperties
                }
              />
              <span className="sr-only">{c.nombre}</span>
            </label>
          ))}
        </div>
        <p className="text-texto-suave text-xs mt-2">
          Cambia el color de acento: totales, enlaces y detalles de tu app.
        </p>
      </fieldset>

      {state.error && <p className="text-sm text-peligro">{state.error}</p>}
      {state.guardado && (
        <p className="text-sm text-primario">Datos del despacho guardados.</p>
      )}

      <div>
        <button
          type="submit"
          disabled={pending}
          className="bg-texto hover:opacity-90 disabled:opacity-60 transition-opacity text-white text-sm font-semibold rounded-full px-5 py-2.5"
        >
          {pending ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </form>
  );
}
