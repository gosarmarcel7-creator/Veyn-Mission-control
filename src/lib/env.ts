export const DEMO_MODE_ENABLED = process.env.NEXT_PUBLIC_VEYN_DEMO_MODE !== "false";

export const WORKSPACE_ID =
  process.env.VEYN_WORKSPACE_ID ??
  process.env.NEXT_PUBLIC_VEYN_WORKSPACE_ID ??
  "ws_demo";

export const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const SUPABASE_ENABLED = Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
