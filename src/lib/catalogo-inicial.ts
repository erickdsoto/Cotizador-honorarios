import type { TipoPrecio } from "@/lib/types";

// Valores de EJEMPLO. Se siembran una sola vez para cada cuenta nueva y son
// editables despues en Configuracion (subir precios, cambiar tamanos de
// bloque, agregar servicios, etc.).

export type ServicioSemilla = {
  clave: string | null;
  concepto: string;
  tipo: TipoPrecio;
  precio: number;
  incremento_bloque: number | null;
  tamano_bloque: number | null;
  unidad: string | null;
};

export const CATALOGO_INICIAL: ServicioSemilla[] = [
  {
    clave: "resico_pf",
    concepto: "Contabilidad Mensual — RESICO Persona Fisica",
    tipo: "por_bloque",
    precio: 1200,
    incremento_bloque: 300,
    tamano_bloque: 50,
    unidad: "CFDI mensuales",
  },
  {
    clave: "pf_actividad",
    concepto:
      "Contabilidad Mensual — Persona Fisica Actividad Empresarial y Profesional",
    tipo: "por_bloque",
    precio: 1800,
    incremento_bloque: 400,
    tamano_bloque: 50,
    unidad: "CFDI mensuales",
  },
  {
    clave: "pm_general",
    concepto: "Contabilidad Mensual — Regimen General de Personas Morales",
    tipo: "por_bloque",
    precio: 3000,
    incremento_bloque: 600,
    tamano_bloque: 50,
    unidad: "CFDI mensuales",
  },
  {
    clave: "pm_resico",
    concepto: "Contabilidad Mensual — RESICO Personas Morales",
    tipo: "por_bloque",
    precio: 2200,
    incremento_bloque: 500,
    tamano_bloque: 50,
    unidad: "CFDI mensuales",
  },
  {
    clave: "nomina",
    concepto: "Nomina",
    tipo: "por_bloque",
    precio: 800,
    incremento_bloque: 300,
    tamano_bloque: 10,
    unidad: "empleados",
  },
  {
    clave: "contabilidad_electronica",
    concepto: "Contabilidad Electronica",
    tipo: "fijo",
    precio: 500,
    incremento_bloque: null,
    tamano_bloque: null,
    unidad: null,
  },
  {
    clave: "estado_cuenta",
    concepto: "Estado de Cuenta Capturado",
    tipo: "fijo",
    precio: 50,
    incremento_bloque: null,
    tamano_bloque: null,
    unidad: "estados de cuenta",
  },
  {
    clave: "generacion_facturas",
    concepto: "Generacion de Facturas (QR)",
    tipo: "por_bloque",
    precio: 300,
    incremento_bloque: 150,
    tamano_bloque: 20,
    unidad: "facturas mensuales",
  },
  {
    clave: "cuestionario_qr",
    concepto: "Formulario de QR para Generar Facturacion",
    tipo: "fijo",
    precio: 250,
    incremento_bloque: null,
    tamano_bloque: null,
    unidad: null,
  },
  {
    clave: "alta_registro_patronal",
    concepto: "Alta de Registro Patronal, FONACOT e ISPT",
    tipo: "fijo",
    precio: 1500,
    incremento_bloque: null,
    tamano_bloque: null,
    unidad: null,
  },
  {
    clave: "repse_alta",
    concepto: "REPSE — Alta",
    tipo: "fijo",
    precio: 2500,
    incremento_bloque: null,
    tamano_bloque: null,
    unidad: null,
  },
  {
    clave: "repse_declaracion",
    concepto: "REPSE — Declaracion Informativa Cuatrimestral",
    tipo: "fijo",
    precio: 1200,
    incremento_bloque: null,
    tamano_bloque: null,
    unidad: null,
  },
  {
    clave: null,
    concepto: "Alta en el SAT y Tramite de e.firma",
    tipo: "fijo",
    precio: 900,
    incremento_bloque: null,
    tamano_bloque: null,
    unidad: null,
  },
  {
    clave: null,
    concepto:
      "Proceso Inicial: Alta en el SAT, Actualizaciones ante el SAT, Citas SAT",
    tipo: "fijo",
    precio: 1200,
    incremento_bloque: null,
    tamano_bloque: null,
    unidad: null,
  },
];

// Orden fijo de las claves estructurales dentro de sus secciones.
export const ORDEN_CLAVES = [
  "resico_pf",
  "pf_actividad",
  "pm_general",
  "pm_resico",
  "nomina",
  "contabilidad_electronica",
  "estado_cuenta",
  "generacion_facturas",
  "cuestionario_qr",
  "alta_registro_patronal",
  "repse_alta",
  "repse_declaracion",
];
