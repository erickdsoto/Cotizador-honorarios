"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  calcularTotales,
  esTasaIvaValida,
  ESTATUS_DISPONIBLES,
  precioPorBloque,
  TASA_IVA_DEFAULT,
} from "@/lib/quotes";
import type { Estatus, Partida, Servicio } from "@/lib/types";

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

    if (servicio && servicio.tipo === "por_bloque") {
      cantidadBase = Math.max(0, Math.floor(Number(p.cantidadBase) || 0));
      precioUnitario = precioPorBloque(
        cantidadBase,
        servicio.precio,
        servicio.incremento_bloque ?? 0,
        servicio.tamano_bloque ?? 1
      );
    } else if (servicio) {
      precioUnitario = servicio.precio;
    } else {
      // El servicio ya no existe (ej. duplicado de una cotizacion vieja):
      // se respeta el precio congelado que traia la partida original.
      precioUnitario = Number(p.precioUnitario) || 0;
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
    };
  });

  const { subtotal, iva, total } = calcularTotales(
    partidasNormalizadas,
    tasaIva
  );

  const { error } = await supabase.from("cotizaciones").insert({
    user_id: user.id,
    prospecto,
    notas: notas || null,
    partidas: partidasNormalizadas,
    subtotal,
    tasa_iva: tasaIva,
    iva,
    total,
    estatus: "borrador",
  });

  if (error) {
    return { error: "No se pudo guardar la cotizacion. Intenta de nuevo." };
  }

  redirect("/app");
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

export async function duplicarCotizacion(id: string) {
  redirect(`/app/nueva?duplicar=${id}`);
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
