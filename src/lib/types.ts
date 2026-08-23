export type Estatus = "borrador" | "enviada" | "aceptada" | "no_aceptada";

export type TipoPrecio = "fijo" | "por_bloque";

export const CLAVES_REGIMEN = [
  "resico_pf",
  "pf_actividad",
  "pm_general",
  "pm_resico",
] as const;

export type ClaveRegimen = (typeof CLAVES_REGIMEN)[number];

export type Servicio = {
  id: string;
  user_id: string;
  clave: string | null;
  concepto: string;
  tipo: TipoPrecio;
  precio: number;
  incremento_bloque: number | null;
  tamano_bloque: number | null;
  unidad: string | null;
  created_at: string;
};

export type Partida = {
  servicioId: string | null;
  concepto: string;
  precioUnitario: number;
  cantidad: number;
  importe: number;
  // Para servicios "por_bloque": la cantidad real capturada (cfdi, empleados,
  // facturas) que determino el precio, para mostrarla/auditarla.
  cantidadBase?: number | null;
  unidadBase?: string | null;
  // Marca la partida "Declaracion anual" generada automaticamente a partir
  // del mismo servicio/regimen de contabilidad mensual.
  esAnual?: boolean;
};

export type Cotizacion = {
  id: string;
  user_id: string;
  prospecto: string;
  notas: string | null;
  partidas: Partida[];
  subtotal: number;
  tasa_iva: number;
  iva: number;
  total: number;
  estatus: Estatus;
  fecha_aceptada: string | null;
  archivada: boolean;
  created_at: string;
  updated_at: string;
};

export type DatosPago = {
  user_id: string;
  beneficiario: string | null;
  banco: string | null;
  clabe: string | null;
  numero_cuenta: string | null;
  updated_at: string;
};
