"use client";

import { useState, useTransition } from "react";
import { actualizarEstatus } from "./actions";
import { ESTATUS_DISPONIBLES, ETIQUETA_ESTATUS } from "@/lib/quotes";
import type { Estatus } from "@/lib/types";

const ESTILO_ESTATUS: Record<Estatus, string> = {
  borrador: "bg-superficie-alta text-texto-suave",
  enviada: "bg-[#FFF2D9] text-acento",
  aceptada: "bg-[#E3F2EA] text-primario",
  no_aceptada: "bg-[#FDE7E3] text-peligro",
};

export function EstatusSelector({
  id,
  actual,
}: {
  id: string;
  actual: Estatus;
}) {
  const [valor, setValor] = useState<Estatus>(actual);
  const [pending, startTransition] = useTransition();

  return (
    <select
      value={valor}
      disabled={pending}
      onChange={(e) => {
        const nuevo = e.target.value as Estatus;
        setValor(nuevo);
        startTransition(() => {
          actualizarEstatus(id, nuevo);
        });
      }}
      className={`rounded-full px-3.5 py-1.5 text-xs font-semibold border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primario disabled:opacity-50 ${ESTILO_ESTATUS[valor]}`}
    >
      {ESTATUS_DISPONIBLES.map((estatus) => (
        <option key={estatus} value={estatus} className="bg-superficie text-texto">
          {ETIQUETA_ESTATUS[estatus]}
        </option>
      ))}
    </select>
  );
}
