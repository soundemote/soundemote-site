const FALLBACK_SUPABASE_URL = "https://nzsiesevactiltflhwvp.supabase.co";
const FALLBACK_SUPABASE_ANON_KEY = "sb_publishable_3geBI9EkVzDeiVpu84WWYQ_wNizaofh";

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? FALLBACK_SUPABASE_URL;
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ?? FALLBACK_SUPABASE_ANON_KEY;

export const supabaseConfigError =
  !supabaseUrl || !supabaseAnonKey ? "Missing Supabase configuration (URL or anon key)." : null;

type FallbackQuery = {
  then<T>(cb: (value: { data: null; error: Error }) => T): Promise<T>;
  select: (...args: unknown[]) => FallbackQuery;
  insert: (...args: unknown[]) => FallbackQuery;
  update: (...args: unknown[]) => FallbackQuery;
  delete: (...args: unknown[]) => FallbackQuery;
  order: (...args: unknown[]) => FallbackQuery;
  limit: (...args: unknown[]) => FallbackQuery;
  eq: (...args: unknown[]) => FallbackQuery;
  single: (...args: unknown[]) => FallbackQuery;
  maybeSingle: (...args: unknown[]) => FallbackQuery;
};

export const supabase = {
  from: () => {
    const query: FallbackQuery = {
      then: async (cb) => cb({ data: null, error: unsupported }),
      select: () => query,
      insert: () => query,
      update: () => query,
      delete: () => query,
      order: () => query,
      limit: () => query,
      eq: () => query,
      single: () => query,
      maybeSingle: () => query,
    };
    return query;
  },
  rpc: () => ({
    then: async (cb) => cb({ data: null, error: unsupported }),
  }),
};

const unsupported = new Error(
  "Supabase client is unavailable in this local environment. Sharing features are temporarily disabled."
);
