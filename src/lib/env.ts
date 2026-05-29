export const DEMO_MODE_ENABLED = process.env.NEXT_PUBLIC_VEYN_DEMO_MODE !== "false";

export const DESKTOP_MODE =
  process.env.VEYN_DESKTOP === "1" || process.env.NEXT_PUBLIC_VEYN_DESKTOP === "1";

export const LOCAL_DB_ENABLED =
  DESKTOP_MODE || process.env.VEYN_LOCAL_DB === "1";

export const WORKSPACE_ID =
  process.env.VEYN_WORKSPACE_ID ??
  process.env.NEXT_PUBLIC_VEYN_WORKSPACE_ID ??
  "ws_demo";

export const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const SUPABASE_ENABLED = Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
