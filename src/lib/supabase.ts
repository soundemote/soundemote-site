import { createClient } from "@supabase/supabase-js";

const FALLBACK_SUPABASE_URL = "https://nzsiesevactiltflhwvp.supabase.co";
const FALLBACK_SUPABASE_ANON_KEY = "sb_publishable_3geBI9EkVzDeiVpu84WWYQ_wNizaofh";

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? FALLBACK_SUPABASE_URL;
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ?? FALLBACK_SUPABASE_ANON_KEY;

export const supabaseConfigError =
  !supabaseUrl || !supabaseAnonKey ? "Missing Supabase configuration (URL or anon key)." : null;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
