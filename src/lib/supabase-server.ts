import { createClient } from "@supabase/supabase-js";
import { SUPABASE_ENABLED, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL } from "./env";

export function getSupabaseServerClient() {
  if (!SUPABASE_ENABLED) return null;

  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
