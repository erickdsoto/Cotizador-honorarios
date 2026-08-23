const currencyFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});

const dateFormatter = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "medium",
});

export function formatoMoneda(valor: number) {
  return currencyFormatter.format(valor);
}

export function formatoFecha(iso: string) {
  return dateFormatter.format(new Date(iso));
}

export const MESES_ES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export function formatoFechaLarga(iso: string) {
  const fecha = new Date(iso);
  return `${fecha.getDate()} de ${MESES_ES[fecha.getMonth()]} del ${fecha.getFullYear()}`;
}
