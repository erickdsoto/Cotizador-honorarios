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
