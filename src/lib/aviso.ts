// Condicion de la cotizacion: con cuantos meses de anticipacion debe avisar
// el cliente que quiere terminar o suspender el servicio.
export const MAX_MESES_AVISO = 24;

export function normalizarMesesAviso(valor: unknown): number | null {
  const meses = Number.parseInt(String(valor ?? ""), 10);
  if (!Number.isFinite(meses) || meses < 1) return null;
  return Math.min(meses, MAX_MESES_AVISO);
}

export function textoAvisoTerminacion(
  meses: number | null | undefined
): string | null {
  if (!meses || meses < 1) return null;
  const unidad = meses === 1 ? "mes" : "meses";
  return `Para dar por terminado o suspender el servicio, el cliente deberá avisar con al menos ${meses} ${unidad} de anticipación.`;
}
