import type { Estatus, Partida } from "@/lib/types";

export const TASA_IVA = 0.16;

function redondear(valor: number) {
  return Math.round((valor + Number.EPSILON) * 100) / 100;
}

export function calcularTotales(partidas: Partida[]) {
  const subtotal = redondear(
    partidas.reduce((acc, p) => acc + p.precioUnitario * p.cantidad, 0)
  );
  const iva = redondear(subtotal * TASA_IVA);
  const total = redondear(subtotal + iva);
  return { subtotal, iva, total };
}

const CICLO_ESTATUS: Record<Estatus, Estatus> = {
  borrador: "enviada",
  enviada: "aceptada",
  aceptada: "borrador",
};

export function siguienteEstatus(actual: Estatus): Estatus {
  return CICLO_ESTATUS[actual];
}

export const ETIQUETA_ESTATUS: Record<Estatus, string> = {
  borrador: "Borrador",
  enviada: "Enviada",
  aceptada: "Aceptada",
};
