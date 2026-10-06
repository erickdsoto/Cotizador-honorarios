"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { obtenerDespacho } from "@/lib/despacho";
import { esClaveColor } from "@/lib/marca";

export async function crearServicio(formData: FormData) {
  const concepto = String(formData.get("concepto") ?? "").trim();
  const precio = Number(formData.get("precio") ?? 0);

  if (!concepto || Number.isNaN(precio) || precio < 0) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { despachoId } = await obtenerDespacho(supabase, user.id);

  await supabase.from("servicios").insert({
    despacho_id: despachoId,
    user_id: user.id,
    concepto,
    precio,
    tipo: "fijo",
  });

  revalidatePath("/app/configuracion");
}

export async function actualizarServicioFijo(id: string, formData: FormData) {
  const concepto = String(formData.get("concepto") ?? "").trim();
  const precio = Number(formData.get("precio") ?? 0);
  const unidad = String(formData.get("unidad") ?? "").trim();

  if (!concepto || Number.isNaN(precio) || precio < 0) return;

  const supabase = await createClient();
  await supabase
    .from("servicios")
    .update({ concepto, precio, unidad: unidad || null })
    .eq("id", id);

  revalidatePath("/app/configuracion");
}

export async function actualizarServicioPorBloque(
  id: string,
  formData: FormData
) {
  const concepto = String(formData.get("concepto") ?? "").trim();
  const precio = Number(formData.get("precio") ?? 0);
  const incrementoBloque = Number(formData.get("incremento_bloque") ?? 0);
  const tamanoBloque = Math.max(
    1,
    Math.floor(Number(formData.get("tamano_bloque") ?? 1))
  );
  const unidad = String(formData.get("unidad") ?? "").trim();

  if (
    !concepto ||
    Number.isNaN(precio) ||
    precio < 0 ||
    Number.isNaN(incrementoBloque) ||
    incrementoBloque < 0
  ) {
    return;
  }

  const supabase = await createClient();
  await supabase
    .from("servicios")
    .update({
      concepto,
      precio,
      incremento_bloque: incrementoBloque,
      tamano_bloque: tamanoBloque,
      unidad: unidad || null,
    })
    .eq("id", id);

  revalidatePath("/app/configuracion");
}

export async function eliminarServicio(id: string) {
  const supabase = await createClient();
  await supabase.from("servicios").delete().eq("id", id);

  revalidatePath("/app/configuracion");
}

export async function guardarDatosPago(formData: FormData) {
  const beneficiario = String(formData.get("beneficiario") ?? "").trim();
  const banco = String(formData.get("banco") ?? "").trim();
  const clabe = String(formData.get("clabe") ?? "").trim();
  const numeroCuenta = String(formData.get("numero_cuenta") ?? "").trim();
  const tarjeta = String(formData.get("tarjeta") ?? "").trim();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { despachoId } = await obtenerDespacho(supabase, user.id);

  await supabase.from("datos_pago").upsert({
    despacho_id: despachoId,
    user_id: user.id,
    beneficiario: beneficiario || null,
    banco: banco || null,
    clabe: clabe || null,
    numero_cuenta: numeroCuenta || null,
    tarjeta: tarjeta || null,
    updated_at: new Date().toISOString(),
  });

  revalidatePath("/app/configuracion");
}

export async function guardarPlantillaDocumento(formData: FormData) {
  const ciudad = String(formData.get("ciudad") ?? "").trim();
  const textoAlcance = String(formData.get("texto_alcance") ?? "").trim();
  const notasLegales = String(formData.get("notas_legales") ?? "").trim();
  const nombreFirma = String(formData.get("nombre_firma") ?? "").trim();
  const correoRemitente = String(formData.get("correo_remitente") ?? "").trim();
  const correosSeguimiento = String(
    formData.get("correos_seguimiento") ?? ""
  ).trim();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { despachoId } = await obtenerDespacho(supabase, user.id);

  await supabase.from("plantilla_documento").upsert({
    despacho_id: despachoId,
    user_id: user.id,
    ciudad: ciudad || null,
    texto_alcance: textoAlcance || null,
    notas_legales: notasLegales || null,
    nombre_firma: nombreFirma || null,
    correo_remitente: correoRemitente || null,
    correos_seguimiento: correosSeguimiento || null,
    updated_at: new Date().toISOString(),
  });

  revalidatePath("/app/configuracion");
}

export type DespachoFormState = { error: string | null; guardado: boolean };

const TIPOS_LOGO = ["image/png", "image/jpeg", "image/webp"];
const MAX_BYTES_LOGO = 150 * 1024;

export async function guardarDespacho(
  _prevState: DespachoFormState,
  formData: FormData
): Promise<DespachoFormState> {
  const nombre = String(formData.get("nombre_despacho") ?? "").trim();
  const quitarLogo = formData.get("quitar_logo") === "on";
  const color = formData.get("color_acento");
  const archivo = formData.get("logo");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { despachoId, rol } = await obtenerDespacho(supabase, user.id);
  if (rol !== "dueno") {
    return {
      error: "Solo el administrador puede cambiar los datos del despacho.",
      guardado: false,
    };
  }

  const ahora = new Date().toISOString();
  const cambios: Record<string, unknown> = {
    despacho_id: despachoId,
    user_id: user.id,
    nombre_despacho: nombre || null,
    updated_at: ahora,
  };

  if (esClaveColor(color)) cambios.color_acento = color;

  if (archivo instanceof File && archivo.size > 0) {
    if (!TIPOS_LOGO.includes(archivo.type)) {
      return { error: "El logo debe ser PNG, JPG o WebP.", guardado: false };
    }
    if (archivo.size > MAX_BYTES_LOGO) {
      return {
        error: "El logo pesa demasiado: el máximo es 150 KB.",
        guardado: false,
      };
    }
    const base64 = Buffer.from(await archivo.arrayBuffer()).toString("base64");
    cambios.logo_data_url = `data:${archivo.type};base64,${base64}`;
    cambios.logo_updated_at = ahora;
  } else if (quitarLogo) {
    cambios.logo_data_url = null;
    cambios.logo_updated_at = null;
  }

  const { error } = await supabase.from("plantilla_documento").upsert(cambios);
  if (error) {
    // Si faltan las columnas de logo/color en la base de datos, al menos se
    // guarda el nombre y se avisa que falta esa actualizacion.
    const basicos = { ...cambios };
    delete basicos.logo_data_url;
    delete basicos.logo_updated_at;
    delete basicos.color_acento;
    if (Object.keys(basicos).length < Object.keys(cambios).length) {
      const reintento = await supabase
        .from("plantilla_documento")
        .upsert(basicos);
      if (!reintento.error) {
        revalidatePath("/app", "layout");
        return {
          error:
            "Se guardó el nombre, pero el logo y el color necesitan una actualización de la base de datos.",
          guardado: false,
        };
      }
    }
    return {
      error: "No se pudo guardar. Intenta de nuevo.",
      guardado: false,
    };
  }

  revalidatePath("/app", "layout");
  return { error: null, guardado: true };
}
