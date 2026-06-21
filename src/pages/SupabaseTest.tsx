import { useEffect, useState } from "react";
import { supabase, supabaseConfigError } from "@/lib/supabase";

const SupabaseTest = () => {
  const [name, setName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(supabaseConfigError);
  const [loading, setLoading] = useState(!supabaseConfigError);

  useEffect(() => {
    if (supabaseConfigError) return;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("name")
          .limit(1)
          .maybeSingle();
        if (error) setError(error.message);
        else setName(data?.name ?? "No rows found");
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <main style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h1>Supabase Test</h1>
      {loading && <p>Loading…</p>}
      {!loading && error && <p style={{ color: "red" }}>Error: {error}</p>}
      {!loading && !error && <p>Name: {name}</p>}
    </main>
  );
};

export default SupabaseTest;
