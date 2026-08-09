import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// During local dev without env vars set yet, this still lets pages render
// so the UI can be previewed before Supabase is wired up.
export const supabase = createClient(
  url || "https://placeholder.supabase.co",
  anonKey || "placeholder-anon-key"
);

export const isSupabaseConfigured = Boolean(url && anonKey);
