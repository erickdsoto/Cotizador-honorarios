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
