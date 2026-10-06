import { createClient } from "@/lib/supabase/server";
import { obtenerDespacho } from "@/lib/despacho";

// Sirve el logo del despacho del usuario con sesion. El logo se guarda como
// data URL en plantilla_documento; la URL lleva ?v=<logo_updated_at> para
// que el navegador lo cachee y se refresque solo al cambiarlo.
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response(null, { status: 401 });

  const { despachoId } = await obtenerDespacho(supabase, user.id);
  const { data } = await supabase
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
      "Cache-Control": "private, max-age=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
