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
      <div className="container mx-auto max-w-2xl px-4 py-12">
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
            <ul className="space-y-2">
              {entries.map((entry) => (
                <li key={entry.slug}>
                  <Link
                    to={`/wiki/${entry.slug}`}
                    className="mono text-sm text-foreground underline underline-offset-4 hover:text-muted-foreground"
                  >
                    {entry.title || entry.slug}
                  </Link>
                  <span className="ml-2 text-xs text-muted-foreground">/{entry.slug}</span>
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