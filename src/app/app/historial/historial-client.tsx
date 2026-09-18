"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatoMoneda } from "@/lib/format";
import type { Cotizacion } from "@/lib/types";
import { EstatusSelector } from "../estatus-selector";

export function HistorialClient({
  cotizaciones,
}: {
  cotizaciones: Cotizacion[];
}) {
  const [busqueda, setBusqueda] = useState("");

  const filtradas = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return cotizaciones;
    return cotizaciones.filter((c) =>
      c.prospecto.toLowerCase().includes(termino)
    );
  }, [cotizaciones, busqueda]);

  return (
    <div>
      <input
        type="text"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder="Buscar por nombre del prospecto..."
        className="w-full mb-6 rounded-lg border border-borde bg-transparent px-3 py-2 text-texto placeholder:text-texto-suave focus:outline-none focus:border-primario"
      />

      {filtradas.length === 0 ? (
        <div className="bg-superficie border border-borde rounded-2xl p-10 text-center">
          <p className="text-texto-suave">
            {busqueda
              ? "No hay cotizaciones que coincidan con esa busqueda."
              : "Todavia no tienes cotizaciones."}
          </p>
        </div>
      ) : (
        <div className="bg-superficie border border-borde rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-texto-suave border-b border-borde">
                <th className="px-5 py-3 font-medium w-16">No.</th>
                <th className="px-5 py-3 font-medium">Prospecto</th>
                <th className="px-5 py-3 font-medium text-right">Total</th>
                <th className="px-5 py-3 font-medium">Estatus</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map((c) => (
                <tr key={c.id} className="border-b border-borde last:border-0">
                  <td className="px-5 py-3 font-mono tabular-nums text-texto-suave">
                    {c.numero}
                  </td>
                  <td className="px-5 py-3">
                    <Link
                      href={`/app/${c.id}`}
                      className="text-texto hover:text-acento"
                    >
                      {c.prospecto}
                    </Link>
                    {c.archivada && (
                      <span className="ml-2 text-texto-suave text-xs">
                        (Archivada)
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right font-mono tabular-nums text-texto">
                    {formatoMoneda(c.total)}
                  </td>
                  <td className="px-5 py-3">
                    <EstatusSelector id={c.id} actual={c.estatus} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
