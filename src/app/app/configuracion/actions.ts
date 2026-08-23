"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function crearServicio(formData: FormData) {
  const concepto = String(formData.get("concepto") ?? "").trim();
  const precio = Number(formData.get("precio") ?? 0);

  if (!concepto || Number.isNaN(precio) || precio < 0) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("servicios").insert({
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

  await supabase.from("datos_pago").upsert({
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
  const nombreDespacho = String(formData.get("nombre_despacho") ?? "").trim();
  const ciudad = String(formData.get("ciudad") ?? "").trim();
  const textoAlcance = String(formData.get("texto_alcance") ?? "").trim();
  const notasLegales = String(formData.get("notas_legales") ?? "").trim();
  const nombreFirma = String(formData.get("nombre_firma") ?? "").trim();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("plantilla_documento").upsert({
    user_id: user.id,
    nombre_despacho: nombreDespacho || null,
    ciudad: ciudad || null,
    texto_alcance: textoAlcance || null,
    notas_legales: notasLegales || null,
    nombre_firma: nombreFirma || null,
    updated_at: new Date().toISOString(),
  });

  revalidatePath("/app/configuracion");
}
