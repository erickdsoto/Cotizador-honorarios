"use client";

import { useActionState } from "react";
import {
  invitarColaborador,
  type InvitarColaboradorState,
} from "./colaboradores-actions";

const ESTADO_INICIAL: InvitarColaboradorState = { error: null, enviado: false };

export function InvitarColaboradorForm() {
  const [state, formAction, pending] = useActionState(
    invitarColaborador,
    ESTADO_INICIAL
  );

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input
        type="email"
        name="correo"
        required
        placeholder="correo@colaborador.com"
        className="flex-1 min-w-[220px] rounded-lg border border-borde bg-transparent px-3 py-2 text-texto placeholder:text-texto-suave focus:outline-none focus:border-primario"
      />
      <button
        type="submit"
        disabled={pending}
        className="bg-primario hover:bg-primario-hover disabled:opacity-50 text-white text-sm rounded-lg px-4 py-2 whitespace-nowrap"
      >
        {pending ? "Invitando..." : "Invitar Auxiliar"}
      </button>
      {state.enviado && (
        <p className="w-full text-primario text-xs">
          Invitacion enviada — le llegara un correo para crear su contrasena.
        </p>
      )}
      {state.error && (
        <p className="w-full text-peligro text-xs">{state.error}</p>
      )}
    </form>
  );
}
