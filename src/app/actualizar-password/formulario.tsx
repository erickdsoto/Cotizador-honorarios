"use client";

import { useActionState } from "react";
import {
  actualizarPassword,
  type ActualizarPasswordState,
} from "./actions";

const ESTADO_INICIAL: ActualizarPasswordState = { error: null };

export function ActualizarPasswordForm() {
  const [state, formAction, pending] = useActionState(
    actualizarPassword,
    ESTADO_INICIAL
  );

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Contrasena Nueva
        </label>
        <input
          type="password"
          name="password"
          required
          autoComplete="new-password"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primario"
          placeholder="••••••••"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Confirmar Contrasena
        </label>
        <input
          type="password"
          name="confirmar"
          required
          autoComplete="new-password"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primario"
          placeholder="••••••••"
        />
      </div>

      {state.error && <p className="text-sm text-peligro">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-primario hover:bg-primario-hover disabled:opacity-60 transition-colors text-white font-medium rounded-lg py-3"
      >
        {pending ? "Guardando..." : "Guardar Contrasena"}
      </button>
    </form>
  );
}
