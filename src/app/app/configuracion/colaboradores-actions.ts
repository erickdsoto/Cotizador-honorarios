"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { Resend } from "resend";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { obtenerDespacho } from "@/lib/despacho";
import { obtenerPlantillaDocumento } from "@/lib/datos-pago";
import { construirCorreoInvitacion } from "@/lib/correo";

export type InvitarColaboradorState = {
  error: string | null;
  enviado: boolean;
};

async function buscarUsuarioPorCorreo(admin: SupabaseClient, correo: string) {
  const porPagina = 200;
  for (let pagina = 1; pagina <= 10; pagina++) {
    const { data, error } = await admin.auth.admin.listUsers({
      page: pagina,
      perPage: porPagina,
    });
    if (error) return null;
    const usuario = data.users.find((u) => u.email?.toLowerCase() === correo);
    if (usuario) return usuario;
    if (data.users.length < porPagina) return null;
  }
  return null;
}

export async function invitarColaborador(
  _prevState: InvitarColaboradorState,
  formData: FormData
): Promise<InvitarColaboradorState> {
  const correo = String(formData.get("correo") ?? "")
    .trim()
    .toLowerCase();
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
        "El envío de invitaciones no está configurado: falta la SUPABASE_SERVICE_ROLE_KEY.",
      enviado: false,
    };
  }

  const plantilla = await obtenerPlantillaDocumento(supabase, despachoId);
  const remitente = plantilla?.correo_remitente;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !remitente) {
    return {
      error:
        "El envío de correos no está configurado: falta la API key o el correo remitente en Configuración.",
      enviado: false,
    };
  }

  const headersList = await headers();
  const host = headersList.get("host");
  const protocolo = host?.startsWith("localhost") ? "http" : "https";
  const origin = `${protocolo}://${host}`;

  // Si el correo ya tiene cuenta pero no pertenece a ningún despacho (por
  // ejemplo, alguien que aceptó una invitación sin crear su contraseña o que
  // fue quitado), se le reinvita con un enlace para crear contraseña. Si ya
  // pertenece a un despacho, no se toca.
  const existente = await buscarUsuarioPorCorreo(admin, correo);
  if (existente) {
    const { data: yaMiembro } = await admin
      .from("miembros_despacho")
      .select("id")
      .eq("user_id", existente.id)
      .maybeSingle();
    if (yaMiembro) {
      return {
        error: "Ese correo ya pertenece a un despacho.",
        enviado: false,
      };
    }
  }

  // generateLink no manda correo: la invitación sale por Resend con el
  // remitente del despacho.
  const { data: enlaceData, error: errorEnlace } =
    await admin.auth.admin.generateLink(
      existente
        ? { type: "recovery", email: correo }
        : { type: "invite", email: correo }
    );

  if (errorEnlace || !enlaceData.user || !enlaceData.properties) {
    return {
      error: "No se pudo crear la invitación. Intenta de nuevo.",
      enviado: false,
    };
  }

  const invitadoId = enlaceData.user.id;
  const cuentaNueva = !existente;

  const { error: errorMiembro } = await admin.from("miembros_despacho").insert({
    despacho_id: despachoId,
    user_id: invitadoId,
    rol: "colaborador",
  });

  if (errorMiembro) {
    if (cuentaNueva) await admin.auth.admin.deleteUser(invitadoId);
    return {
      error: "No se pudo agregar al colaborador. Intenta de nuevo.",
      enviado: false,
    };
  }

  const tipo = existente ? "recovery" : "invite";
  const enlace = `${origin}/auth/confirm?token_hash=${encodeURIComponent(
    enlaceData.properties.hashed_token
  )}&type=${tipo}&next=/actualizar-password`;
  const nombreDespacho = plantilla?.nombre_despacho || "";
  const { asunto, html } = construirCorreoInvitacion({ nombreDespacho, enlace });

  const resend = new Resend(apiKey);
  const { error: errorCorreo } = await resend.emails.send({
    from: `${nombreDespacho || "Cotizador de Honorarios"} <${remitente}>`,
    to: correo,
    subject: asunto,
    html,
  });

  if (errorCorreo) {
    // Se revierte para poder reintentar con el mismo correo.
    await admin.from("miembros_despacho").delete().eq("user_id", invitadoId);
    if (cuentaNueva) await admin.auth.admin.deleteUser(invitadoId);
    return {
      error:
        "No se pudo enviar el correo de invitación. Revisa que el remitente esté verificado en Resend.",
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
