import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase, supabaseConfigError } from "@/lib/supabase";

type WikiEntry = {
  slug: string;
  title: string | null;
  updated_at: string | null;
};

const WikiPage = () => {
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<WikiEntry[]>([]);

  useEffect(() => {
    let cancelled = false;
    if (supabaseConfigError) {
      setLoading(false);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("wiki_pages")
        .select("slug, title, updated_at")
        .order("updated_at", { ascending: false });
      if (cancelled) return;
      setEntries((data as WikiEntry[]) ?? []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <Link to="/" className="mono text-xs text-muted-foreground hover:text-foreground">
          &lt; soundemote
        </Link>
        <h1 className="display mt-4 text-2xl">Wiki</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Named patches live here. Open one at <span className="mono">/wiki/&lt;name&gt;</span>.
        </p>

        <div className="mt-8">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : entries.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No pages yet. Open <span className="mono">/wiki/&lt;name&gt;</span> and create one.
            </p>
          ) : (
            <ul className="divide-y divide-border/40 rounded-lg border border-border/60 bg-card/40">
              {entries.map((entry) => (
                <li key={entry.slug}>
                  <Link
                    to={`/wiki/${entry.slug}`}
                    className="flex items-baseline justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/30"
                  >
                    <span className="mono text-sm text-foreground">{entry.title || entry.slug}</span>
                    <span className="mono shrink-0 text-xs text-muted-foreground">/{entry.slug}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
};

export default WikiPage;