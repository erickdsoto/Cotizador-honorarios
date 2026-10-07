import { formatoFechaLarga } from "@/lib/format";

// Condiciones configurables de la cotizacion (Configuracion > Plantilla).

export const MAX_MESES_AVISO = 24;
export const MAX_DIAS_VIGENCIA = 365;

function entero(valor: unknown): number | null {
  const n = Number.parseInt(String(valor ?? ""), 10);
  return Number.isFinite(n) && n >= 1 ? n : null;
}

export function normalizarMesesAviso(valor: unknown): number | null {
  const meses = entero(valor);
  return meses === null ? null : Math.min(meses, MAX_MESES_AVISO);
}

export function normalizarDiasVigencia(valor: unknown): number | null {
  const dias = entero(valor);
  return dias === null ? null : Math.min(dias, MAX_DIAS_VIGENCIA);
}

// Con cuantos meses de anticipacion debe avisar el cliente que quiere
// terminar o suspender el servicio.
export function textoAvisoTerminacion(
  meses: number | null | undefined
): string | null {
  if (!meses || meses < 1) return null;
  const unidad = meses === 1 ? "mes" : "meses";
  return `Para dar por terminado o suspender el servicio, el cliente deberá avisar con al menos ${meses} ${unidad} de anticipación.`;
}

// Cuantos dias esta vigente la cotizacion, contados desde su fecha.
export function textoVigencia(
  dias: number | null | undefined,
  fechaCotizacionIso: string
): string | null {
  if (!dias || dias < 1) return null;
  const vence = new Date(fechaCotizacionIso);
  vence.setDate(vence.getDate() + dias);
  const unidad = dias === 1 ? "día" : "días";
  return `Esta cotización tiene una vigencia de ${dias} ${unidad}, hasta el ${formatoFechaLarga(vence.toISOString())}.`;
}
