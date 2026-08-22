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
  });

  revalidatePath("/app/catalogo");
}

export async function actualizarServicio(id: string, formData: FormData) {
  const concepto = String(formData.get("concepto") ?? "").trim();
  const precio = Number(formData.get("precio") ?? 0);

  if (!concepto || Number.isNaN(precio) || precio < 0) return;

  const supabase = await createClient();
  await supabase.from("servicios").update({ concepto, precio }).eq("id", id);

  revalidatePath("/app/catalogo");
}

export async function eliminarServicio(id: string) {
  const supabase = await createClient();
  await supabase.from("servicios").delete().eq("id", id);

  revalidatePath("/app/catalogo");
}
