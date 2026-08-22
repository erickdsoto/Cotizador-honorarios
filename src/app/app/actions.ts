"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { calcularTotales } from "@/lib/quotes";
import { siguienteEstatus } from "@/lib/quotes";
import type { Estatus, Partida } from "@/lib/types";

export type CotizacionFormState = { error: string | null };

export async function crearCotizacion(
  _prevState: CotizacionFormState,
  formData: FormData
): Promise<CotizacionFormState> {
  const prospecto = String(formData.get("prospecto") ?? "").trim();
  const notas = String(formData.get("notas") ?? "").trim();
  const partidasRaw = String(formData.get("partidas") ?? "[]");

  if (!prospecto) {
    return { error: "Captura el nombre del prospecto." };
  }

  let partidas: Partida[];
  try {
    partidas = JSON.parse(partidasRaw);
  } catch {
    return { error: "No se pudieron leer los servicios seleccionados." };
  }

  if (!Array.isArray(partidas) || partidas.length === 0) {
    return { error: "Selecciona al menos un servicio." };
  }

  const partidasNormalizadas: Partida[] = partidas.map((p) => {
    const cantidad = Math.max(1, Math.floor(Number(p.cantidad) || 1));
    const precioUnitario = Number(p.precioUnitario) || 0;
    return {
      servicioId: p.servicioId ?? null,
      concepto: String(p.concepto ?? ""),
      precioUnitario,
      cantidad,
      importe: Math.round(precioUnitario * cantidad * 100) / 100,
    };
  });

  const { subtotal, iva, total } = calcularTotales(partidasNormalizadas);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("cotizaciones").insert({
    user_id: user.id,
    prospecto,
    notas: notas || null,
    partidas: partidasNormalizadas,
    subtotal,
    iva,
    total,
    estatus: "borrador",
  });

  if (error) {
    return { error: "No se pudo guardar la cotizacion. Intenta de nuevo." };
  }

  redirect("/app");
}

export async function cambiarEstatus(id: string, actual: Estatus) {
  const supabase = await createClient();
  const siguiente = siguienteEstatus(actual);

  const update: { estatus: Estatus; fecha_aceptada?: string | null } = {
    estatus: siguiente,
  };

  if (siguiente === "aceptada") {
    update.fecha_aceptada = new Date().toISOString();
  } else if (actual === "aceptada") {
    update.fecha_aceptada = null;
  }

  await supabase.from("cotizaciones").update(update).eq("id", id);

  revalidatePath("/app");
  revalidatePath(`/app/${id}`);
}

export async function duplicarCotizacion(id: string) {
  redirect(`/app/nueva?duplicar=${id}`);
}
