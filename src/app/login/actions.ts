"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error: string | null };
export type RecuperacionState = { error: string | null; enviado: boolean };

export async function signIn(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Ingresa tu correo y contrasena." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "Correo o contrasena incorrectos." };
  }

  redirect("/app");
}

export async function signUp(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Ingresa tu correo y contrasena." };
  }

  if (password.length < 6) {
    return { error: "La contrasena debe tener al menos 6 caracteres." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return { error: error.message || "No se pudo crear la cuenta." };
  }

  redirect("/app");
}

export async function solicitarRecuperacion(
  _prevState: RecuperacionState,
  formData: FormData
): Promise<RecuperacionState> {
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    return { error: "Ingresa tu correo.", enviado: false };
  }

  const headersList = await headers();
  const host = headersList.get("host");
  const protocolo = host?.startsWith("localhost") ? "http" : "https";
  const origin = `${protocolo}://${host}`;

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/confirm?next=/actualizar-password`,
  });

  if (error) {
    return {
      error: "No se pudo enviar el correo. Intenta de nuevo.",
      enviado: false,
    };
  }

  return { error: null, enviado: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
