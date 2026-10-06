import type { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Logo publico de un despacho (se usa en la app, el documento imprimible y
// los correos, que no tienen sesion). Solo devuelve la imagen del logo; el
// id es un UUID. La URL lleva ?v=<logo_updated_at> para refrescar la cache.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ despachoId: string }> }
) {
  const { despachoId } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(despachoId)) {
    return new Response(null, { status: 404 });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return new Response(null, { status: 404 });
  }

  const { data } = await admin
    .from("plantilla_documento")
    .select("logo_data_url")
    .eq("despacho_id", despachoId)
    .maybeSingle();

  const coincidencia = /^data:(image\/(?:png|jpeg|webp));base64,(.+)$/.exec(
    (data?.logo_data_url as string | null) ?? ""
  );
  if (!coincidencia) return new Response(null, { status: 404 });

  return new Response(new Uint8Array(Buffer.from(coincidencia[2], "base64")), {
    headers: {
      "Content-Type": coincidencia[1],
      "Cache-Control": "public, max-age=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
