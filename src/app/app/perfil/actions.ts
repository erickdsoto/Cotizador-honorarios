"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type ActualizarNombreState = { error: string | null };
export type ActualizarPasswordPerfilState = { error: string | null; guardado: boolean };

export async function actualizarNombre(
  _prevState: ActualizarNombreState,
  formData: FormData
): Promise<ActualizarNombreState> {
  const nombre = String(formData.get("nombre") ?? "").trim();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.auth.updateUser({ data: { nombre } });

  if (error) {
    return { error: "No se pudo guardar el nombre. Intenta de nuevo." };
  }

  revalidatePath("/app");
  revalidatePath("/app/perfil");
  revalidatePath("/app/configuracion");
  return { error: null };
}

export async function actualizarPasswordPerfil(
  _prevState: ActualizarPasswordPerfilState,
  formData: FormData
): Promise<ActualizarPasswordPerfilState> {
  const password = String(formData.get("password") ?? "");
  const confirmar = String(formData.get("confirmar") ?? "");

  if (password.length < 6) {
    return {
      error: "La contrasena debe tener al menos 6 caracteres.",
      guardado: false,
    };
  }

  if (password !== confirmar) {
    return { error: "Las contrasenas no coinciden.", guardado: false };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return {
      error: "No se pudo actualizar la contrasena. Intenta de nuevo.",
      guardado: false,
    };
  }

  return { error: null, guardado: true };
}
