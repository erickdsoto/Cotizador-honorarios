import { formatoMoneda } from "@/lib/format";
import { calcularTotalAnual } from "@/lib/quotes";
import { textoAvisoTerminacion } from "@/lib/aviso";
import type { Cotizacion, DatosPago, PlantillaDocumento } from "@/lib/types";

function escaparHtml(texto: string) {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function celdaImporte(p: { importe: number; importeSinDescuento?: number | null; descuentoPorcentaje?: number | null }) {
  if (!p.descuentoPorcentaje || typeof p.importeSinDescuento !== "number") {
    return formatoMoneda(p.importe);
  }
  return `<span style="color:#9ca3af; text-decoration:line-through; margin-right:6px;">${formatoMoneda(p.importeSinDescuento)}</span>${formatoMoneda(p.importe)} <span style="color:#b3432f;">(-${p.descuentoPorcentaje}%)</span>`;
}

function parrafosHtml(texto: string | null | undefined, color = "#374151") {
  const parrafos = (texto ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  return parrafos
    .map(
      (p) =>
        `<p style="margin:0 0 12px 0; color:${color}; font-size:14px; line-height:1.5;">${escaparHtml(p)}</p>`
    )
    .join("");
}

function logoHtml(logoUrl: string | null | undefined) {
  if (!logoUrl) return "";
  return `<img src="${escaparHtml(logoUrl)}" alt="" height="48" style="display:block; height:48px; width:auto; max-width:240px; margin:0 0 12px 0;" />`;
}

export function construirCorreoCotizacion({
  cotizacion,
  datosPago,
  plantilla,
  logoUrl,
}: {
  cotizacion: Cotizacion;
  datosPago: DatosPago | null;
  plantilla: PlantillaDocumento | null;
  logoUrl?: string | null;
}) {
  const despacho = escaparHtml(plantilla?.nombre_despacho || "Cotizador de Honorarios");

  const filasPartidas = cotizacion.partidas
    .filter((p) => !p.esAnual)
    .map((p) => {
      const detalle =
        typeof p.cantidadBase === "number" && p.unidadBase
          ? ` <span style="color:#9ca3af;">(${p.cantidadBase} ${escaparHtml(p.unidadBase)})</span>`
          : "";
      return `<tr style="border-bottom:1px solid #e5e7eb;">
        <td style="padding:8px 0; font-size:14px; color:#1f2937;">${escaparHtml(p.concepto)}${detalle}</td>
        <td style="padding:8px 0; font-size:14px; color:#1f2937; text-align:right; white-space:nowrap;">${celdaImporte(p)}</td>
      </tr>`;
    })
    .join("");

  const partidaAnual = cotizacion.partidas.find((p) => p.esAnual);
  const totalesAnual = calcularTotalAnual(cotizacion.partidas, cotizacion.tasa_iva);

  const anualHtml = partidaAnual
    ? `<div style="margin-top:24px; padding:16px; border:1px dashed #d1d5db; border-radius:8px;">
        <p style="margin:0 0 4px 0; font-weight:bold; font-size:14px; color:#1f2937;">Declaración Anual</p>
        <p style="margin:0 0 12px 0; font-size:12px; color:#9ca3af;">Cobro único, se realiza una sola vez al año en temporada de declaraciones anuales — no forma parte del total mensual de arriba.</p>
        <div style="display:flex; justify-content:space-between; font-size:14px; color:#1f2937; margin-bottom:8px;">
          <span>${escaparHtml(partidaAnual.concepto)}</span>
          <span>${celdaImporte(partidaAnual)}</span>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:15px; font-weight:bold; color:#111827; border-top:1px solid #e5e7eb; padding-top:8px;">
          <span>Total Anual</span>
          <span>${formatoMoneda(totalesAnual.total)}</span>
        </div>
      </div>`
    : "";

  const hayDatosPago =
    datosPago &&
    (datosPago.beneficiario ||
      datosPago.banco ||
      datosPago.clabe ||
      datosPago.numero_cuenta);

  const datosPagoHtml = hayDatosPago
    ? `<div style="margin-top:24px; padding:16px; border:1px solid #e5e7eb; border-radius:8px;">
        <p style="margin:0 0 8px 0; font-weight:bold; font-size:14px; color:#1f2937;">Datos para Transferencia</p>
        ${datosPago?.beneficiario ? `<p style="margin:2px 0; font-size:13px; color:#374151;">Beneficiario: ${escaparHtml(datosPago.beneficiario)}</p>` : ""}
        ${datosPago?.banco ? `<p style="margin:2px 0; font-size:13px; color:#374151;">Banco: ${escaparHtml(datosPago.banco)}</p>` : ""}
        ${datosPago?.clabe ? `<p style="margin:2px 0; font-size:13px; color:#374151; font-family:monospace;">CLABE: ${escaparHtml(datosPago.clabe)}</p>` : ""}
        ${datosPago?.numero_cuenta ? `<p style="margin:2px 0; font-size:13px; color:#374151; font-family:monospace;">Cuenta: ${escaparHtml(datosPago.numero_cuenta)}</p>` : ""}
      </div>`
    : "";

  const html = `<!doctype html>
<html lang="es-MX">
  <body style="margin:0; padding:0; background-color:#f3f4f6; font-family: Arial, Helvetica, sans-serif;">
    <div style="max-width:600px; margin:0 auto; padding:32px 24px; background-color:#ffffff;">
      ${logoHtml(logoUrl)}<h1 style="font-size:20px; font-weight:bold; color:#111827; margin:0 0 4px 0;">${despacho}</h1>
      <div style="border-top:2px solid #C08A2E; margin:12px 0 24px 0;"></div>

      <p style="font-size:12px; color:#9ca3af; margin:0 0 4px 0;">Cotización No. ${cotizacion.numero}</p>
      <p style="font-size:14px; color:#374151; margin:0 0 16px 0;">Hola ${escaparHtml(cotizacion.prospecto)},</p>
      <p style="font-size:14px; color:#374151; margin:0 0 24px 0;">Aquí tienes tu cotización de honorarios:</p>

      ${parrafosHtml(plantilla?.texto_alcance)}

      <table style="width:100%; border-collapse:collapse; margin:16px 0;">
        <thead>
          <tr style="border-bottom:2px solid #111827;">
            <th style="text-align:left; padding:8px 0; font-size:13px; color:#6b7280;">Servicio</th>
            <th style="text-align:right; padding:8px 0; font-size:13px; color:#6b7280;">Importe</th>
          </tr>
        </thead>
        <tbody>
          ${filasPartidas}
        </tbody>
      </table>

      <table style="width:220px; margin-left:auto; margin-bottom:8px;">
        <tr>
          <td style="font-size:13px; color:#6b7280; padding:2px 0;">Subtotal</td>
          <td style="font-size:13px; color:#6b7280; text-align:right; padding:2px 0;">${formatoMoneda(cotizacion.subtotal)}</td>
        </tr>
        <tr>
          <td style="font-size:13px; color:#6b7280; padding:2px 0;">IVA (${Math.round(cotizacion.tasa_iva * 100)}%)</td>
          <td style="font-size:13px; color:#6b7280; text-align:right; padding:2px 0;">${formatoMoneda(cotizacion.iva)}</td>
        </tr>
        <tr style="border-top:2px solid #111827;">
          <td style="font-size:15px; font-weight:bold; color:#111827; padding:8px 0 0 0;">Total</td>
          <td style="font-size:22px; font-weight:bold; color:#2F6F4E; text-align:right; padding:8px 0 0 0;">${formatoMoneda(cotizacion.total)}</td>
        </tr>
      </table>

      ${anualHtml}

      ${parrafosHtml(plantilla?.notas_legales, "#b3432f")}
      ${parrafosHtml(textoAvisoTerminacion(plantilla?.meses_aviso_terminacion), "#1f2937")}

      ${datosPagoHtml}

      <p style="margin-top:32px; font-size:14px; color:#374151;">Saludos cordiales,<br />${plantilla?.nombre_firma ? escaparHtml(plantilla.nombre_firma) : despacho}</p>

      <p style="margin-top:32px; font-size:11px; color:#9ca3af; text-align:center;">
        Herramienta de apoyo profesional. El criterio y la revisión final son del contador.
      </p>
    </div>
  </body>
</html>`;

  const asunto = `Cotización No. ${cotizacion.numero} de honorarios — ${cotizacion.prospecto}`;

  return { html, asunto };
}

export function construirCorreoInvitacion({
  nombreDespacho,
  enlace,
  logoUrl,
}: {
  nombreDespacho: string;
  enlace: string;
  logoUrl?: string | null;
}) {
  const nombre = nombreDespacho.trim() || "Honorarios";
  const despacho = escaparHtml(nombre);
  const href = escaparHtml(enlace);

  return {
    asunto: `Invitación al Cotizador de ${nombre}`,
    html: `<div style="font-family:Arial,Helvetica,sans-serif; max-width:560px; margin:0 auto; padding:24px;">
      ${logoHtml(logoUrl)}<h2 style="margin:0 0 16px 0; color:#1f2421; font-size:20px;">Invitación al Cotizador de ${despacho}</h2>
      <p style="margin:0 0 12px 0; color:#374151; font-size:14px; line-height:1.5;">Te agregaron como auxiliar en el Cotizador de ${despacho}. Da clic en el botón para crear tu contraseña y entrar.</p>
      <p style="margin:24px 0;"><a href="${href}" style="background:#1f2421; color:#ffffff; text-decoration:none; padding:12px 24px; border-radius:999px; font-size:14px; font-weight:bold; display:inline-block;">Aceptar invitación</a></p>
      <p style="margin:0; color:#9ca3af; font-size:12px; line-height:1.5;">Si no esperabas esta invitación, puedes ignorar este correo.</p>
    </div>`,
  };
}
