// Colores de acento que puede elegir cada despacho. Son presets (no hex
// libre) para garantizar buen contraste de texto sobre fondo blanco.
export const COLORES_ACENTO = {
  salvia: { nombre: "Salvia", base: "#2c7a55", hover: "#256a48" },
  oceano: { nombre: "Océano", base: "#2563a8", hover: "#1e508a" },
  ciruela: { nombre: "Ciruela", base: "#7a3e8e", hover: "#653275" },
  terracota: { nombre: "Terracota", base: "#b5532f", hover: "#96431f" },
  rosa: { nombre: "Rosa", base: "#b0386b", hover: "#912d58" },
  grafito: { nombre: "Grafito", base: "#3b4350", hover: "#2c333d" },
} as const;

export type ClaveColor = keyof typeof COLORES_ACENTO;

export const COLOR_POR_DEFECTO: ClaveColor = "salvia";

export function esClaveColor(valor: unknown): valor is ClaveColor {
  return typeof valor === "string" && valor in COLORES_ACENTO;
}

export function colorAcento(clave: string | null | undefined) {
  return COLORES_ACENTO[esClaveColor(clave) ? clave : COLOR_POR_DEFECTO];
}
