"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { obtenerDespacho } from "@/lib/despacho";

export type InvitarColaboradorState = {
  error: string | null;
  enviado: boolean;
};

export async function invitarColaborador(
  _prevState: InvitarColaboradorState,
  formData: FormData
): Promise<InvitarColaboradorState> {
  const correo = String(formData.get("correo") ?? "").trim();
  if (!correo) {
    return { error: "Captura el correo del colaborador.", enviado: false };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { despachoId, rol } = await obtenerDespacho(supabase, user.id);
  if (rol !== "dueno") {
    return {
      error: "Solo el administrador del despacho puede invitar auxiliares.",
      enviado: false,
    };
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return {
      error:
        "El envio de invitaciones no esta configurado: falta la SUPABASE_SERVICE_ROLE_KEY.",
      enviado: false,
    };
  }

  const headersList = await headers();
  const host = headersList.get("host");
  const protocolo = host?.startsWith("localhost") ? "http" : "https";
  const origin = `${protocolo}://${host}`;

  const { data: invitado, error: errorInvite } =
    await admin.auth.admin.inviteUserByEmail(correo, {
      redirectTo: `${origin}/auth/confirm?next=/actualizar-password`,
    });

  if (errorInvite || !invitado.user) {
    return {
      error: errorInvite?.message.includes("already")
        ? "Ese correo ya tiene una cuenta (propia o de otro despacho)."
        : "No se pudo enviar la invitacion. Intenta de nuevo.",
      enviado: false,
    };
  }

  const { error: errorMiembro } = await admin.from("miembros_despacho").insert({
    despacho_id: despachoId,
    user_id: invitado.user.id,
    rol: "colaborador",
  });

  if (errorMiembro) {
    return {
      error: "No se pudo agregar al colaborador. Intenta de nuevo.",
      enviado: false,
    };
  }

  revalidatePath("/app/configuracion");
  return { error: null, enviado: true };
}

export async function eliminarColaborador(miembroId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { rol } = await obtenerDespacho(supabase, user.id);
  if (rol !== "dueno") return;

  await supabase.from("miembros_despacho").delete().eq("id", miembroId);

  revalidatePath("/app/configuracion");
}
