import { createClient } from "@supabase/supabase-js";

// SERVER-ONLY client. Uses the service role key, which bypasses Row Level
// Security -- this file must never be imported from a page/component that
// runs in the browser. It's only ever used inside pages/api/*.js.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export const supabaseAdmin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export const isAdminConfigured = Boolean(url && serviceKey);
