"use client";

import { useActionState } from "react";
import { guardarDespacho, type DespachoFormState } from "./actions";

const ESTADO_INICIAL: DespachoFormState = { error: null, guardado: false };

export function DespachoForm({
  nombre,
  logoVersion,
}: {
  nombre: string;
  logoVersion: string | null;
}) {
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
              src={`/api/logo?v=${encodeURIComponent(logoVersion)}`}
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
