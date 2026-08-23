"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type ActualizarPasswordState = { error: string | null };

export async function actualizarPassword(
  _prevState: ActualizarPasswordState,
  formData: FormData
): Promise<ActualizarPasswordState> {
  const password = String(formData.get("password") ?? "");
  const confirmar = String(formData.get("confirmar") ?? "");

  if (password.length < 6) {
    return { error: "La contrasena debe tener al menos 6 caracteres." };
  }

  if (password !== confirmar) {
    return { error: "Las contrasenas no coinciden." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: "No se pudo actualizar la contrasena. Intenta de nuevo." };
  }

  redirect("/app");
}
