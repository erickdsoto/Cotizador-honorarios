"use client";

import { useActionState, useState } from "react";
import { enviarCorreoCotizacion, type EnviarCorreoState } from "./actions";

const ESTADO_INICIAL: EnviarCorreoState = { error: null, enviado: false };

export function EnviarCorreoForm({
  id,
  correoInicial,
  className,
}: {
  id: string;
  correoInicial: string;
  className?: string;
}) {
  const [state, formAction, pending] = useActionState(
    enviarCorreoCotizacion,
    ESTADO_INICIAL
  );
  const [correo, setCorreo] = useState(correoInicial);

  return (
    <form
      action={formAction}
      className={className ?? "flex flex-wrap items-center gap-2"}
    >
      <input type="hidden" name="id" value={id} />
      <input
        type="email"
        name="correo"
        value={correo}
        onChange={(e) => setCorreo(e.target.value)}
        required
        placeholder="correo@prospecto.com"
        className="rounded-lg border border-borde bg-transparent px-3 py-2 text-sm text-texto placeholder:text-texto-suave focus:outline-none focus:border-primario"
      />
      <button
        type="submit"
        disabled={pending}
        className="bg-primario hover:bg-primario-hover disabled:opacity-60 transition-colors text-white text-sm font-medium rounded-lg px-4 py-2"
      >
        {pending ? "Enviando..." : "Enviar por Correo"}
      </button>
      {state.enviado && (
        <span className="text-primario text-xs">Correo enviado ✓</span>
      )}
      {state.error && <span className="text-peligro text-xs">{state.error}</span>}
    </form>
  );
}
