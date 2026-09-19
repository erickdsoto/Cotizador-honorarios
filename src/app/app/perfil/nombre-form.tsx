"use client";

import { useActionState } from "react";
import { actualizarNombre, type ActualizarNombreState } from "./actions";

const ESTADO_INICIAL: ActualizarNombreState = { error: null };

export function NombreForm({ nombreInicial }: { nombreInicial: string }) {
  const [state, formAction, pending] = useActionState(
    actualizarNombre,
    ESTADO_INICIAL
  );

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input
        type="text"
        name="nombre"
        defaultValue={nombreInicial}
        placeholder="Tu nombre"
        className="flex-1 min-w-[220px] rounded-lg border border-borde bg-transparent px-3 py-2 text-texto placeholder:text-texto-suave focus:outline-none focus:border-primario"
      />
      <button
        type="submit"
        disabled={pending}
        className="bg-primario hover:bg-primario-hover disabled:opacity-50 text-white text-sm rounded-lg px-4 py-2"
      >
        {pending ? "Guardando..." : "Guardar Nombre"}
      </button>
      {state.error && (
        <p className="w-full text-peligro text-xs">{state.error}</p>
      )}
    </form>
  );
}
