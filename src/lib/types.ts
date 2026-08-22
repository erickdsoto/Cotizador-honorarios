export type Estatus = "borrador" | "enviada" | "aceptada";

export type Servicio = {
  id: string;
  user_id: string;
  concepto: string;
  precio: number;
  created_at: string;
};

export type Partida = {
  servicioId: string | null;
  concepto: string;
  precioUnitario: number;
  cantidad: number;
  importe: number;
};

export type Cotizacion = {
  id: string;
  user_id: string;
  prospecto: string;
  notas: string | null;
  partidas: Partida[];
  subtotal: number;
  iva: number;
  total: number;
  estatus: Estatus;
  fecha_aceptada: string | null;
  created_at: string;
  updated_at: string;
};
