import type { Estatus, Partida } from "@/lib/types";

// Tasas de IVA soportadas: general y zona fronteriza. Se elige por
// cotizacion (un mismo contador puede tener clientes en ambas zonas).
export const TASAS_IVA = [0.16, 0.08] as const;
export type TasaIva = (typeof TASAS_IVA)[number];
export const TASA_IVA_DEFAULT: TasaIva = 0.16;

export function esTasaIvaValida(valor: number): valor is TasaIva {
  return (TASAS_IVA as readonly number[]).includes(valor);
}

export function redondear(valor: number) {
  return Math.round((valor + Number.EPSILON) * 100) / 100;
}

export function calcularTotales(
  partidas: Partida[],
  tasaIva: number = TASA_IVA_DEFAULT
) {
  const subtotal = redondear(partidas.reduce((acc, p) => acc + p.importe, 0));
  const iva = redondear(subtotal * tasaIva);
  const total = redondear(subtotal + iva);
  return { subtotal, iva, total };
}

// Precio para servicios que suben por bloques (cada N unidades: cfdi,
// empleados, facturas, etc.). El precio base cubre el primer bloque
// (0 a tamanoBloque-1); cada bloque adicional completo suma el incremento,
// sin tope superior.
export function precioPorBloque(
  cantidadBase: number,
  precioBase: number,
  incrementoBloque: number,
  tamanoBloque: number
) {
  const cantidad = Math.max(0, Math.floor(cantidadBase) || 0);
  const bloquesAdicionales = tamanoBloque > 0 ? Math.floor(cantidad / tamanoBloque) : 0;
  return redondear(precioBase + incrementoBloque * bloquesAdicionales);
}

export const ESTATUS_DISPONIBLES: Estatus[] = [
  "borrador",
  "enviada",
  "aceptada",
  "no_aceptada",
];

export const ETIQUETA_ESTATUS: Record<Estatus, string> = {
  borrador: "Borrador",
  enviada: "Enviada",
  aceptada: "Aceptada",
  no_aceptada: "No Aceptada",
};
