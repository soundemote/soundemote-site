import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAdmin } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";

type WikiEdit = {
  id: string;
  slug: string;
  editor_id: string;
  title: string | null;
  body: string | null;
  project_data: unknown;
  status: string;
  created_at: string;
  review_note: string | null;
};

function EditPreview({ projectData }: { projectData: unknown }) {
  const ref = useRef<HTMLIFrameElement | null>(null);
  const post = () => {
    ref.current?.contentWindow?.postMessage(
      { type: "soundemote:sandbox-project-data", projectData },
      window.location.origin,
    );
  };
  return (
    <iframe
      ref={ref}
      title="edit preview"
      src="/soemdsp-sandbox/index.html"
      className="mt-3 h-[420px] w-full rounded border border-border"
      allow="autoplay; microphone"
      onLoad={post}
    />
  );
}

const AdminWikiEdits = () => {
  const navigate = useNavigate();
  const { loading, session, isAdmin } = useAdmin();
  const [edits, setEdits] = useState<WikiEdit[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected">("pending");

  useEffect(() => {
    if (!loading && (!session || !isAdmin)) navigate("/admin/login", { replace: true });
  }, [loading, session, isAdmin, navigate]);

  const load = useCallback(async () => {
    setFetching(true);
    setError(null);
    const { data, error: qError } = await supabase
      .from("wiki_edits")
      .select("*")
      .eq("status", filter)
      .order("created_at", { ascending: false });
    if (qError) setError(qError.message);
    else setEdits((data as WikiEdit[]) || []);
    setFetching(false);
  }, [filter]);

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin, load]);

  const approve = async (edit: WikiEdit) => {
    setBusyId(edit.id);
    setError(null);
    const { error: upsertError } = await supabase.from("wiki_pages").upsert(
      {
        slug: edit.slug,
        title: edit.title || edit.slug,
        body: edit.body || "",
        project_data: edit.project_data,
        updated_by: edit.editor_id,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "slug" },
    );
    if (upsertError) {
      setError(`Approve failed: ${upsertError.message}`);
      setBusyId(null);
      return;
    }
    const { error: markError } = await supabase
      .from("wiki_edits")
      .update({ status: "approved", reviewed_at: new Date().toISOString() })
      .eq("id", edit.id);
    if (markError) setError(`Published but edit update failed: ${markError.message}`);
    setBusyId(null);
    load();
  };

  const reject = async (edit: WikiEdit) => {
    setBusyId(edit.id);
    const reason = window.prompt("Reason for rejection (optional):") || null;
    const { error: markError } = await supabase
      .from("wiki_edits")
      .update({ status: "rejected", reviewed_at: new Date().toISOString(), review_note: reason })
      .eq("id", edit.id);
    if (markError) setError(markError.message);
    setBusyId(null);
    load();
  };

  if (loading || (!isAdmin && session)) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto max-w-3xl px-4 py-12 mono text-sm text-muted-foreground">
          Checking access…
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <div className="flex items-center justify-between">
          <Link to="/admin/claims" className="mono text-xs text-muted-foreground hover:text-foreground">
            &lt; claims
          </Link>
          <Button variant="outline" size="sm" onClick={() => supabase.auth.signOut()}>
            Sign out
          </Button>
        </div>
        <h1 className="display mt-4 text-2xl">Wiki Edit Review</h1>

        <div className="mt-6 flex gap-2">
          {(["pending", "approved", "rejected"] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              className="mono normal-case"
              onClick={() => setFilter(f)}
            >
              {f}
            </Button>
          ))}
        </div>

        {error && <p className="mt-4 text-sm text-destructive break-words">{error}</p>}

        <div className="mt-6 space-y-4">
          {fetching && <p className="mono text-sm text-muted-foreground">Loading…</p>}
          {!fetching && edits.length === 0 && (
            <p className="mono text-sm text-muted-foreground">No {filter} edits.</p>
          )}
          {edits.map((edit) => (
            <div key={edit.id} className="rounded border border-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="mono text-base">/wiki/{edit.slug}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(edit.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOpenId(openId === edit.id ? null : edit.id)}
                  >
                    {openId === edit.id ? "Hide" : "Preview"}
                  </Button>
                  {filter === "pending" && (
                    <>
                      <Button size="sm" disabled={busyId === edit.id} onClick={() => approve(edit)}>
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={busyId === edit.id}
                        onClick={() => reject(edit)}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
              {edit.title && <p className="mt-2 mono text-sm">{edit.title}</p>}
              {edit.body && (
                <p className="mt-2 whitespace-pre-wrap text-sm text-foreground/90">{edit.body}</p>
              )}
              {edit.review_note && (
                <p className="mt-2 text-xs text-muted-foreground">Note: {edit.review_note}</p>
              )}
              {openId === edit.id && <EditPreview projectData={edit.project_data} />}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default AdminWikiEdits;
