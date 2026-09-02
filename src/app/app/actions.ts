"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import { obtenerDatosPago, obtenerPlantillaDocumento } from "@/lib/datos-pago";
import { construirCorreoCotizacion } from "@/lib/correo";
import {
  calcularTotales,
  esTasaIvaValida,
  ESTATUS_DISPONIBLES,
  precioPorBloque,
  TASA_IVA_DEFAULT,
} from "@/lib/quotes";
import type { Cotizacion, Estatus, Partida, Servicio } from "@/lib/types";

export type CotizacionFormState = { error: string | null };
export type EnviarCorreoState = { error: string | null; enviado: boolean };

export async function crearCotizacion(
  _prevState: CotizacionFormState,
  formData: FormData
): Promise<CotizacionFormState> {
  const prospecto = String(formData.get("prospecto") ?? "").trim();
  const correoProspecto = String(formData.get("correo_prospecto") ?? "").trim();
  const notas = String(formData.get("notas") ?? "").trim();
  const partidasRaw = String(formData.get("partidas") ?? "[]");

  if (!prospecto) {
    return { error: "Captura el nombre del prospecto." };
  }

  let partidasEntrada: Partida[];
  try {
    partidasEntrada = JSON.parse(partidasRaw);
  } catch {
    return { error: "No se pudieron leer los servicios seleccionados." };
  }

  if (!Array.isArray(partidasEntrada) || partidasEntrada.length === 0) {
    return { error: "Selecciona al menos un servicio." };
  }

  const tasaIvaEntrada = Number(formData.get("tasa_iva"));
  const tasaIva = esTasaIvaValida(tasaIvaEntrada)
    ? tasaIvaEntrada
    : TASA_IVA_DEFAULT;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Nunca se confia en el precio que manda el navegador: si la partida
  // referencia un servicio vivo, el precio se recalcula aqui a partir del
  // catalogo real (precio/incremento/tamano de bloque actuales).
  const idsConServicio = Array.from(
    new Set(
      partidasEntrada
        .map((p) => p.servicioId)
        .filter((id): id is string => Boolean(id))
    )
  );

  const serviciosMap: Record<string, Servicio> = {};
  if (idsConServicio.length > 0) {
    const { data: serviciosData } = await supabase
      .from("servicios")
      .select("*")
      .in("id", idsConServicio);
    for (const s of (serviciosData ?? []) as Servicio[]) {
      serviciosMap[s.id] = s;
    }
  }

  const partidasNormalizadas: Partida[] = partidasEntrada.map((p) => {
    const servicio = p.servicioId ? serviciosMap[p.servicioId] : undefined;
    const cantidad = Math.max(1, Math.floor(Number(p.cantidad) || 1));

    let precioUnitario: number;
    let cantidadBase: number | null = null;
    let incrementoBloque: number | null = null;
    let tamanoBloque: number | null = null;

    if (servicio && servicio.tipo === "por_bloque") {
      cantidadBase = Math.max(0, Math.floor(Number(p.cantidadBase) || 0));
      incrementoBloque = servicio.incremento_bloque ?? 0;
      tamanoBloque = servicio.tamano_bloque ?? 1;
      precioUnitario = precioPorBloque(
        cantidadBase,
        servicio.precio,
        incrementoBloque,
        tamanoBloque
      );
    } else if (servicio) {
      precioUnitario = servicio.precio;
    } else {
      // El servicio ya no existe (ej. duplicado de una cotizacion vieja):
      // se respeta el precio congelado que traia la partida original.
      precioUnitario = Number(p.precioUnitario) || 0;
      incrementoBloque = p.incrementoBloque ?? null;
      tamanoBloque = p.tamanoBloque ?? null;
    }

    return {
      servicioId: p.servicioId ?? null,
      concepto: String(p.concepto ?? servicio?.concepto ?? ""),
      precioUnitario,
      cantidad,
      importe: Math.round(precioUnitario * cantidad * 100) / 100,
      cantidadBase,
      unidadBase: servicio?.unidad ?? p.unidadBase ?? null,
      esAnual: Boolean(p.esAnual),
      incrementoBloque,
      tamanoBloque,
    };
  });

  const { subtotal, iva, total } = calcularTotales(
    partidasNormalizadas,
    tasaIva
  );

  const { data: nueva, error } = await supabase
    .from("cotizaciones")
    .insert({
      user_id: user.id,
      prospecto,
      correo_prospecto: correoProspecto || null,
      notas: notas || null,
      partidas: partidasNormalizadas,
      subtotal,
      tasa_iva: tasaIva,
      iva,
      total,
      estatus: "borrador",
    })
    .select("id")
    .single();

  if (error || !nueva) {
    return { error: "No se pudo guardar la cotizacion. Intenta de nuevo." };
  }

  redirect(`/imprimir/${nueva.id}`);
}

export async function actualizarEstatus(id: string, nuevoEstatus: Estatus) {
  if (!ESTATUS_DISPONIBLES.includes(nuevoEstatus)) return;

  const supabase = await createClient();

  await supabase
    .from("cotizaciones")
    .update({
      estatus: nuevoEstatus,
      fecha_aceptada:
        nuevoEstatus === "aceptada" ? new Date().toISOString() : null,
    })
    .eq("id", id);

  revalidatePath("/app");
  revalidatePath(`/app/${id}`);
}

export async function eliminarCotizacion(id: string) {
  const supabase = await createClient();
  await supabase.from("cotizaciones").delete().eq("id", id);
  redirect("/app");
}

export async function archivarCotizacion(id: string) {
  const supabase = await createClient();
  await supabase
    .from("cotizaciones")
    .update({ archivada: true })
    .eq("id", id);

  revalidatePath("/app");
  revalidatePath(`/app/${id}`);
}

export async function desarchivarCotizacion(id: string) {
  const supabase = await createClient();
  await supabase
    .from("cotizaciones")
    .update({ archivada: false })
    .eq("id", id);

  revalidatePath("/app");
  revalidatePath(`/app/${id}`);
}

export async function enviarCorreoCotizacion(
  _prevState: EnviarCorreoState,
  formData: FormData
): Promise<EnviarCorreoState> {
  const id = String(formData.get("id") ?? "");
  const correo = String(formData.get("correo") ?? "").trim();

  if (!correo) {
    return { error: "Captura el correo del prospecto.", enviado: false };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("cotizaciones")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!data) {
    return { error: "No se encontro la cotizacion.", enviado: false };
  }

  const cotizacion = data as Cotizacion;

  const apiKey = process.env.RESEND_API_KEY;
  const plantilla = await obtenerPlantillaDocumento(supabase, user.id);
  const remitente = plantilla?.correo_remitente;

  if (!apiKey || !remitente) {
    return {
      error:
        "El envio de correos no esta configurado: falta la API key o el correo remitente en Configuracion.",
      enviado: false,
    };
  }

  // Guarda el correo para poder reenviar despues sin volver a capturarlo.
  await supabase
    .from("cotizaciones")
    .update({ correo_prospecto: correo })
    .eq("id", id);

  const datosPago = await obtenerDatosPago(supabase, user.id);
  const { html, asunto } = construirCorreoCotizacion({
    cotizacion: { ...cotizacion, correo_prospecto: correo },
    datosPago,
    plantilla,
  });

  const despacho = plantilla?.nombre_despacho || "Cotizador de Honorarios";
  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: `${despacho} <${remitente}>`,
    to: correo,
    replyTo: user.email,
    subject: asunto,
    html,
  });

  if (error) {
    return {
      error: "No se pudo enviar el correo. Revisa que el remitente este verificado en Resend.",
      enviado: false,
    };
  }

  revalidatePath(`/app/${id}`);
  revalidatePath(`/imprimir/${id}`);

  return { error: null, enviado: true };
}
