"use client";

import { useActionState, useMemo, useState } from "react";
import { crearCotizacion, type CotizacionFormState } from "../actions";
import { calcularTotales } from "@/lib/quotes";
import { formatoMoneda } from "@/lib/format";
import type { Servicio, Partida } from "@/lib/types";

const ESTADO_INICIAL: CotizacionFormState = { error: null };

type Seleccion = Record<string, { checked: boolean; cantidad: number }>;

export function ConstructorCotizacion({
  servicios,
  inicial,
}: {
  servicios: Servicio[];
  inicial: { prospecto: string; notas: string; partidas: Partida[] } | null;
}) {
  const [seleccion, setSeleccion] = useState<Seleccion>(() => {
    const base: Seleccion = {};
    for (const s of servicios) {
      const previa = inicial?.partidas.find((p) => p.servicioId === s.id);
      base[s.id] = previa
        ? { checked: true, cantidad: previa.cantidad }
        : { checked: false, cantidad: 1 };
    }
    return base;
  });

  // Partidas duplicadas cuyo servicio ya no existe en el catalogo actual:
  // se conservan tal cual para no alterar el contenido de la cotizacion original.
  const [extras, setExtras] = useState<Partida[]>(() => {
    if (!inicial) return [];
    return inicial.partidas.filter(
      (p) => !p.servicioId || !servicios.some((s) => s.id === p.servicioId)
    );
  });

  const [state, formAction, pending] = useActionState(
    crearCotizacion,
    ESTADO_INICIAL
  );

  const partidas: Partida[] = useMemo(() => {
    const delCatalogo: Partida[] = servicios
      .filter((s) => seleccion[s.id]?.checked)
      .map((s) => {
        const cantidad = seleccion[s.id].cantidad;
        return {
          servicioId: s.id,
          concepto: s.concepto,
          precioUnitario: s.precio,
          cantidad,
          importe: Math.round(s.precio * cantidad * 100) / 100,
        };
      });

    const deExtras: Partida[] = extras.map((p) => ({
      ...p,
      importe: Math.round(p.precioUnitario * p.cantidad * 100) / 100,
    }));

    return [...delCatalogo, ...deExtras];
  }, [servicios, seleccion, extras]);

  const totales = calcularTotales(partidas);

  function actualizar(
    servicioId: string,
    cambios: Partial<{ checked: boolean; cantidad: number }>
  ) {
    setSeleccion((prev) => ({
      ...prev,
      [servicioId]: { ...prev[servicioId], ...cambios },
    }));
  }

  function actualizarExtra(index: number, cantidad: number) {
    setExtras((prev) =>
      prev.map((p, i) => (i === index ? { ...p, cantidad } : p))
    );
  }

  function quitarExtra(index: number) {
    setExtras((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <form action={formAction} className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-superficie border border-borde rounded-2xl p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-texto-suave mb-1">
              Prospecto
            </label>
            <input
              type="text"
              name="prospecto"
              defaultValue={inicial?.prospecto ?? ""}
              required
              placeholder="Nombre del prospecto o empresa"
              className="w-full rounded-lg border border-borde bg-transparent px-3 py-2 text-texto placeholder:text-texto-suave focus:outline-none focus:border-primario"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-texto-suave mb-1">
              Notas (opcional)
            </label>
            <textarea
              name="notas"
              defaultValue={inicial?.notas ?? ""}
              rows={2}
              className="w-full rounded-lg border border-borde bg-transparent px-3 py-2 text-texto placeholder:text-texto-suave focus:outline-none focus:border-primario"
            />
          </div>
        </div>

        <div className="bg-superficie border border-borde rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-texto-suave border-b border-borde">
                <th className="px-5 py-3 font-medium w-10"></th>
                <th className="px-5 py-3 font-medium">Servicio</th>
                <th className="px-5 py-3 font-medium text-right w-28">
                  Precio
                </th>
                <th className="px-5 py-3 font-medium text-right w-24">
                  Cantidad
                </th>
              </tr>
            </thead>
            <tbody>
              {servicios.map((s) => (
                <tr key={s.id} className="border-b border-borde last:border-0">
                  <td className="px-5 py-3">
                    <input
                      type="checkbox"
                      checked={seleccion[s.id]?.checked ?? false}
                      onChange={(e) =>
                        actualizar(s.id, { checked: e.target.checked })
                      }
                      className="h-4 w-4 accent-primario"
                    />
                  </td>
                  <td className="px-5 py-3 text-texto">{s.concepto}</td>
                  <td className="px-5 py-3 text-right font-mono tabular-nums text-texto-suave">
                    {formatoMoneda(s.precio)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <input
                      type="number"
                      min={1}
                      value={seleccion[s.id]?.cantidad ?? 1}
                      onChange={(e) =>
                        actualizar(s.id, {
                          cantidad: Math.max(1, Number(e.target.value) || 1),
                        })
                      }
                      disabled={!seleccion[s.id]?.checked}
                      className="w-16 rounded-lg border border-borde bg-transparent px-2 py-1 text-right font-mono tabular-nums text-texto disabled:opacity-40 focus:outline-none focus:border-primario"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {extras.length > 0 && (
          <div className="bg-superficie border border-borde rounded-2xl overflow-hidden">
            <p className="px-5 py-3 text-texto-suave text-xs border-b border-borde">
              Servicios de la cotizacion original que ya no estan en tu
              catalogo actual
            </p>
            <table className="w-full text-sm">
              <tbody>
                {extras.map((p, i) => (
                  <tr key={i} className="border-b border-borde last:border-0">
                    <td className="px-5 py-3 text-texto">{p.concepto}</td>
                    <td className="px-5 py-3 text-right font-mono tabular-nums text-texto-suave">
                      {formatoMoneda(p.precioUnitario)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <input
                        type="number"
                        min={1}
                        value={p.cantidad}
                        onChange={(e) =>
                          actualizarExtra(
                            i,
                            Math.max(1, Number(e.target.value) || 1)
                          )
                        }
                        className="w-16 rounded-lg border border-borde bg-transparent px-2 py-1 text-right font-mono tabular-nums text-texto focus:outline-none focus:border-primario"
                      />
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => quitarExtra(i)}
                        className="text-texto-suave hover:text-peligro text-xs"
                      >
                        Quitar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="bg-superficie border border-borde rounded-2xl p-6 sticky top-6">
          <div className="flex justify-between text-texto-suave text-sm mb-1">
            <span>Subtotal</span>
            <span className="font-mono tabular-nums">
              {formatoMoneda(totales.subtotal)}
            </span>
          </div>
          <div className="flex justify-between text-texto-suave text-sm mb-3">
            <span>IVA (16%)</span>
            <span className="font-mono tabular-nums">
              {formatoMoneda(totales.iva)}
            </span>
          </div>
          <div className="flex justify-between items-center border-t border-borde pt-3 mb-5">
            <span className="text-texto font-medium">Total</span>
            <span className="text-3xl font-semibold text-primario font-mono tabular-nums">
              {formatoMoneda(totales.total)}
            </span>
          </div>

          <input
            type="hidden"
            name="partidas"
            value={JSON.stringify(partidas)}
            readOnly
          />

          {state.error && (
            <p className="text-sm text-peligro mb-3">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending || partidas.length === 0}
            className="w-full bg-primario hover:bg-primario-hover disabled:opacity-50 transition-colors text-white font-medium rounded-lg py-3"
          >
            {pending ? "Guardando..." : "Guardar cotizacion"}
          </button>
        </div>
      </div>
    </form>
  );
}
