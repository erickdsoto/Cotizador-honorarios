import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Cliente con la service role key: unicamente para acciones de servidor que
// necesitan privilegios de administrador (invitar colaboradores). Nunca se
// expone al navegador — no usar en componentes cliente ni exponer la key
// como NEXT_PUBLIC_.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Falta configurar SUPABASE_SERVICE_ROLE_KEY para poder invitar colaboradores."
    );
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
