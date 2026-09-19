"use client";

import { useActionState } from "react";
import {
  actualizarPasswordPerfil,
  type ActualizarPasswordPerfilState,
} from "./actions";

const ESTADO_INICIAL: ActualizarPasswordPerfilState = {
  error: null,
  guardado: false,
};

export function PasswordFormPerfil() {
  const [state, formAction, pending] = useActionState(
    actualizarPasswordPerfil,
    ESTADO_INICIAL
  );

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-2">
      <label className="block text-sm">
        <span className="text-texto-suave text-xs">Contrasena Nueva</span>
        <input
          type="password"
          name="password"
          required
          autoComplete="new-password"
          className="w-full mt-1 rounded-lg border border-borde bg-transparent px-3 py-2 text-texto focus:outline-none focus:border-primario"
        />
      </label>
      <label className="block text-sm">
        <span className="text-texto-suave text-xs">Confirmar Contrasena</span>
        <input
          type="password"
          name="confirmar"
          required
          autoComplete="new-password"
          className="w-full mt-1 rounded-lg border border-borde bg-transparent px-3 py-2 text-texto focus:outline-none focus:border-primario"
        />
      </label>
      <div className="sm:col-span-2 flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="bg-primario hover:bg-primario-hover disabled:opacity-50 text-white text-sm rounded-lg px-4 py-2"
        >
          {pending ? "Guardando..." : "Actualizar Contrasena"}
        </button>
        {state.guardado && (
          <span className="text-primario text-xs">Contrasena actualizada ✓</span>
        )}
        {state.error && <span className="text-peligro text-xs">{state.error}</span>}
      </div>
    </form>
  );
}
