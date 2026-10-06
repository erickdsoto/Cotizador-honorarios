"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { obtenerDespacho } from "@/lib/despacho";
import { obtenerPlantillaDocumento } from "@/lib/datos-pago";
import { construirCorreoInvitacion } from "@/lib/correo";

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

  const plantilla = await obtenerPlantillaDocumento(supabase, despachoId);
  const remitente = plantilla?.correo_remitente;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !remitente) {
    return {
      error:
        "El envio de correos no esta configurado: falta la API key o el correo remitente en Configuracion.",
      enviado: false,
    };
  }

  const headersList = await headers();
  const host = headersList.get("host");
  const protocolo = host?.startsWith("localhost") ? "http" : "https";
  const origin = `${protocolo}://${host}`;

  // generateLink crea la cuenta y devuelve el token, pero no manda correo:
  // la invitacion sale por Resend con el remitente del despacho.
  const { data: enlaceData, error: errorEnlace } =
    await admin.auth.admin.generateLink({ type: "invite", email: correo });

  if (errorEnlace || !enlaceData.user || !enlaceData.properties) {
    return {
      error: /already|registered|exists/i.test(errorEnlace?.message ?? "")
        ? "Ese correo ya tiene una cuenta (propia o de otro despacho)."
        : "No se pudo crear la invitacion. Intenta de nuevo.",
      enviado: false,
    };
  }

  const invitadoId = enlaceData.user.id;

  const { error: errorMiembro } = await admin.from("miembros_despacho").insert({
    despacho_id: despachoId,
    user_id: invitadoId,
    rol: "colaborador",
  });

  if (errorMiembro) {
    await admin.auth.admin.deleteUser(invitadoId);
    return {
      error: "No se pudo agregar al colaborador. Intenta de nuevo.",
      enviado: false,
    };
  }

  const enlace = `${origin}/auth/confirm?token_hash=${encodeURIComponent(
    enlaceData.properties.hashed_token
  )}&type=invite&next=/actualizar-password`;
  const nombreDespacho = plantilla?.nombre_despacho || "Cotizador de Honorarios";
  const { asunto, html } = construirCorreoInvitacion({ nombreDespacho, enlace });

  const resend = new Resend(apiKey);
  const { error: errorCorreo } = await resend.emails.send({
    from: `${nombreDespacho} <${remitente}>`,
    to: correo,
    subject: asunto,
    html,
  });

  if (errorCorreo) {
    // Se revierte para poder reintentar con el mismo correo.
    await admin.from("miembros_despacho").delete().eq("user_id", invitadoId);
    await admin.auth.admin.deleteUser(invitadoId);
    return {
      error:
        "No se pudo enviar el correo de invitacion. Revisa que el remitente este verificado en Resend.",
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

  const { despachoId, rol } = await obtenerDespacho(supabase, user.id);
  if (rol !== "dueno") return;

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return;
  }

  // Se busca el miembro dentro de este despacho antes de borrar: el borrado
  // usa permisos de servidor, asi que la pertenencia se valida aqui.
  const { data: miembro } = await admin
    .from("miembros_despacho")
    .select("id, user_id, rol")
    .eq("id", miembroId)
    .eq("despacho_id", despachoId)
    .maybeSingle();

  if (!miembro || miembro.rol === "dueno" || miembro.user_id === user.id) {
    return;
  }

  const { error } = await admin
    .from("miembros_despacho")
    .delete()
    .eq("id", miembro.id);
  if (error) return;

  // Si la persona nunca llego a entrar, se borra tambien su cuenta para poder
  // volver a invitar ese correo. Si ya habia entrado, su cuenta se conserva.
  const { data: cuenta } = await admin.auth.admin.getUserById(miembro.user_id);
  if (cuenta.user && !cuenta.user.last_sign_in_at) {
    await admin.auth.admin.deleteUser(miembro.user_id);
  }

  revalidatePath("/app/configuracion");
}
