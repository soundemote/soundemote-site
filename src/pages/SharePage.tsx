import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase, supabaseConfigError } from "@/lib/supabase";

type SharedProject = {
  slug: string;
  title: string;
  bank_name: string | null;
  visibility: string;
  created_at: string;
  project_data: unknown;
};

const SharePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [project, setProject] = useState<SharedProject | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      setProject(null);
      if (supabaseConfigError) {
        if (!cancelled) {
          setError(supabaseConfigError);
          setLoading(false);
        }
        return;
      }
      try {
        const { data, error: queryError } = await supabase
          .from("shared_projects")
          .select("slug, title, bank_name, visibility, created_at, project_data")
          .eq("slug", slug)
          .maybeSingle();
        if (cancelled) return;
        if (queryError) {
          setError(queryError.message);
        } else {
          setProject(data as SharedProject | null);
        }
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Unexpected error.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto max-w-2xl px-4 py-12">
        <Link to="/" className="mono text-xs text-muted-foreground hover:text-foreground">
          ← soundemote
        </Link>
        <h1 className="display mt-4 text-2xl">Shared Project</h1>

        {loading && <p className="mt-6 text-muted-foreground">Loading…</p>}

        {!loading && error && (
          <div className="mt-6 rounded-md border border-destructive/40 bg-destructive/10 p-4">
            <p className="font-medium text-destructive">Could not load this share</p>
            <p className="mt-1 text-sm text-destructive break-words">{error}</p>
          </div>
        )}

        {!loading && !error && !project && (
          <div className="mt-6 rounded-md border border-border p-4">
            <p className="font-medium">Not found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              No shared project exists for "{slug}".
            </p>
          </div>
        )}

        {!loading && !error && project && (
          <div className="mt-6 space-y-4">
            <div>
              <h2 className="text-xl font-semibold">{project.title}</h2>
              <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                <dt className="text-muted-foreground">Bank</dt>
                <dd>{project.bank_name ?? "—"}</dd>
                <dt className="text-muted-foreground">Visibility</dt>
                <dd>{project.visibility}</dd>
                <dt className="text-muted-foreground">Created</dt>
                <dd>{new Date(project.created_at).toLocaleString()}</dd>
              </dl>
            </div>
            <div>
              <h3 className="mono text-xs uppercase tracking-wider text-muted-foreground">
                project_data
              </h3>
              <pre className="mt-2 overflow-auto rounded-md border border-border bg-muted/30 p-4 text-xs">
                {JSON.stringify(project.project_data, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default SharePage;