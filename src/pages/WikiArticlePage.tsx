import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase, supabaseConfigError } from "@/lib/supabase";
import { useWikiRole } from "@/hooks/useWikiRole";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import WikiMarkdown from "@/components/soundemote/WikiMarkdown";
import TableOfContents, { extractChapters } from "@/components/soundemote/TableOfContents";

type WikiPageRow = {
  slug: string;
  title: string | null;
  body: string;
  project_data: unknown;
  updated_at: string | null;
};

const WikiArticlePage = () => {
  const { slug = "", handle } = useParams<{ slug: string; handle?: string }>();
  const userScope = handle ? handle.replace(/^@/, "") : null;
  const { loading: roleLoading, session, isTrusted } = useWikiRole();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState<WikiPageRow | null>(null);
  const [hasGlobalPatch, setHasGlobalPatch] = useState(false);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [includePatch, setIncludePatch] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (supabaseConfigError) {
      setError(supabaseConfigError);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("wiki_pages")
      .select("slug, title, body, project_data, updated_at")
      .eq("slug", slug)
      .maybeSingle();
    setPage((data as WikiPageRow) ?? null);
    setLoading(false);
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  // A /wiki/<slug> and /<slug> (page patch) are two views of the same subject: if a
  // global page-patch shares this slug, surface a cross-link to it.
  useEffect(() => {
    let cancelled = false;
    if (supabaseConfigError || !slug) return;
    supabase
      .from("page_patches")
      .select("slug")
      .eq("slug", slug)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setHasGlobalPatch(Boolean(data));
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  // Push the saved patch into the embedded sandbox when ready.
  const postProjectData = () => {
    const data = page?.project_data;
    if (!data || !iframeRef.current?.contentWindow) return;
    iframeRef.current.contentWindow.postMessage(
      { type: "soundemote:sandbox-project-data", projectData: data },
      window.location.origin,
    );
  };
  useEffect(postProjectData, [page]);

  const requestCurrentPatch = (): Promise<unknown> =>
    new Promise((resolve) => {
      const target = iframeRef.current?.contentWindow;
      if (!target) return resolve(null);
      const requestId = Math.random().toString(36).slice(2);
      const timer = window.setTimeout(() => {
        window.removeEventListener("message", onMessage);
        resolve(null);
      }, 4000);
      const onMessage = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        if (event.data?.type !== "soundemote:current-patch") return;
        if (event.data.requestId && event.data.requestId !== requestId) return;
        window.clearTimeout(timer);
        window.removeEventListener("message", onMessage);
        resolve(event.data.projectData || null);
      };
      window.addEventListener("message", onMessage);
      target.postMessage(
        { type: "soundemote:request-current-patch", requestId },
        window.location.origin,
      );
    });

  const startEditing = () => {
    setTitle(page?.title ?? slug);
    setBody(page?.body ?? "");
    setIncludePatch(false);
    setError(null);
    setDone(null);
    setEditing(true);
  };

  const submit = async () => {
    setError(null);
    setBusy(true);
    try {
      const uid = session?.user?.id;
      if (!uid) {
        setError("You must be signed in to edit.");
        return;
      }
      let projectData: unknown = page?.project_data ?? null;
      if (includePatch) {
        const captured = await requestCurrentPatch();
        if (!captured) {
          setError("Could not read the current sandbox patch. Try again.");
          return;
        }
        projectData = captured;
      }

      if (isTrusted) {
        // Auto-publish directly to the canonical page.
        const { error: upsertError } = await supabase.from("wiki_pages").upsert(
          {
            slug,
            title: title.trim() || slug,
            body,
            project_data: projectData,
            updated_by: uid,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "slug" },
        );
        if (upsertError) {
          setError(upsertError.message);
          return;
        }
        await supabase.from("wiki_edits").insert({
          slug,
          editor_id: uid,
          title: title.trim() || slug,
          body,
          project_data: projectData,
          status: "approved",
          reviewed_at: new Date().toISOString(),
        });
        setDone("Published.");
        setEditing(false);
        load();
      } else {
        const { error: insertError } = await supabase.from("wiki_edits").insert({
          slug,
          editor_id: uid,
          title: title.trim() || slug,
          body,
          project_data: projectData,
          status: "pending",
        });
        if (insertError) {
          setError(insertError.message);
          return;
        }
        setDone("Submitted for review. An admin will approve it before it goes live.");
        setEditing(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto max-w-5xl px-4 py-10">
        <div className="flex items-center justify-between gap-3">
          <nav className="mono flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <Link to="/" className="transition-colors hover:text-scope">
              soundemote
            </Link>
            <span>/</span>
            {userScope ? (
              <Link to={`/@${userScope}`} className="transition-colors hover:text-scope">
                @{userScope}
              </Link>
            ) : (
              <Link to="/wiki" className="transition-colors hover:text-scope">
                wiki
              </Link>
            )}
            <span>/</span>
            <span className="text-scope">{slug}</span>
          </nav>
          {hasGlobalPatch && (
            <Link
              to={`/${slug}`}
              className="mono text-xs text-foreground underline underline-offset-4 hover:text-muted-foreground"
            >
              open patch →
            </Link>
          )}
          {!editing && !roleLoading && (
            session ? (
              <Button size="sm" className="mono normal-case" onClick={startEditing}>
                {page ? "Edit page" : "Create page"}
              </Button>
            ) : (
              <Link
                to="/auth"
                className="mono text-xs text-foreground underline underline-offset-4 hover:text-muted-foreground"
              >
                sign in to edit
              </Link>
            )
          )}
        </div>

        <header className="mt-6 border-b border-border/60 pb-6">
          <h1 className="display text-3xl md:text-4xl">{page?.title || slug}</h1>
          <p className="mono mt-2 text-xs text-muted-foreground">
            /wiki/{slug}
            {page?.updated_at && (
              <span className="ml-3">
                updated {new Date(page.updated_at).toLocaleDateString()}
              </span>
            )}
          </p>
        </header>

        {done && <p className="mt-4 text-sm text-emerald-400">{done}</p>}
        {error && <p className="mt-4 text-sm text-destructive break-words">{error}</p>}

        {loading ? (
          <p className="mt-8 text-sm text-muted-foreground">Loading…</p>
        ) : editing ? (
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="wiki-title">Title</Label>
              <Input id="wiki-title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wiki-body">Page text</Label>
              <Textarea
                id="wiki-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={10}
                placeholder="Describe this patch… Use Markdown. Start sections with `## Heading` to build the contents table."
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={includePatch}
                onChange={(e) => setIncludePatch(e.target.checked)}
              />
              Replace the patch with what's currently in the sandbox below
            </label>
            <p className="mono text-xs text-muted-foreground">
              {isTrusted
                ? "You are trusted — your changes publish immediately."
                : "Your changes will be queued for admin review."}
            </p>
            <div className="flex gap-2">
              <Button onClick={submit} disabled={busy}>
                {busy ? "Saving…" : isTrusted ? "Publish" : "Submit for review"}
              </Button>
              <Button variant="outline" onClick={() => setEditing(false)} disabled={busy}>
                Cancel
              </Button>
            </div>
          </div>
        ) : page ? (
          page.body ? (
            <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
              {/* Contents / navigation table — sticky on desktop, on top on phones */}
              <aside className="order-first lg:sticky lg:top-8 lg:self-start">
                <TableOfContents chapters={extractChapters(page.body)} />
              </aside>
              {/* Article body */}
              <div className="min-w-0">
                <WikiMarkdown markdown={page.body} />
              </div>
            </div>
          ) : (
            <p className="mt-8 text-sm text-muted-foreground">No description yet.</p>
          )
        ) : (
          <p className="mt-8 text-sm text-muted-foreground">
            This page doesn't exist yet.
            {session ? " Use “Create page” to start it." : " Sign in to create it."}
          </p>
        )}

        {(page || editing) && (
          <section className="mt-8">
            <h2 className="mono text-xs uppercase tracking-wide text-muted-foreground">patch</h2>
            <iframe
              ref={iframeRef}
              title={`${slug} patch`}
              src="/soemdsp-sandbox/index.html"
              className="mt-3 h-[480px] w-full rounded border border-border"
              allow="autoplay; microphone"
              onLoad={postProjectData}
            />
            {page && (
              <Link
                to={`/sandbox?wiki=${encodeURIComponent(slug)}`}
                className="mono mt-3 inline-block text-xs text-foreground underline underline-offset-4 hover:text-muted-foreground"
              >
                open full sandbox
              </Link>
            )}
          </section>
        )}
      </div>
    </main>
  );
};

export default WikiArticlePage;
