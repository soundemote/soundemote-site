import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAdmin } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";

type Claim = {
  id: string;
  requested_slug: string;
  contact_email: string;
  note: string | null;
  project_data: unknown;
  status: string;
  created_at: string;
  review_note: string | null;
};

function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "patch"
  );
}

function ClaimPreview({ projectData }: { projectData: unknown }) {
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
      title="claim preview"
      src="/soemdsp-sandbox/index.html"
      className="mt-3 h-[420px] w-full rounded border border-border"
      allow="autoplay; microphone"
      onLoad={post}
    />
  );
}

const AdminClaims = () => {
  const navigate = useNavigate();
  const { loading, session, isAdmin } = useAdmin();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected">("pending");

  useEffect(() => {
    if (!loading && (!session || !isAdmin)) {
      navigate("/admin/login", { replace: true });
    }
  }, [loading, session, isAdmin, navigate]);

  const load = useCallback(async () => {
    setFetching(true);
    setError(null);
    const { data, error: qError } = await supabase
      .from("patch_claims")
      .select("*")
      .eq("status", filter)
      .order("created_at", { ascending: false });
    if (qError) setError(qError.message);
    else setClaims((data as Claim[]) || []);
    setFetching(false);
  }, [filter]);

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin, load]);

  const approve = async (claim: Claim) => {
    setBusyId(claim.id);
    setError(null);
    const slug = slugify(claim.requested_slug);
    const { error: upsertError } = await supabase.from("shared_projects").upsert(
      {
        slug,
        title: slug,
        bank_name: "main",
        owner_name: "soundemote",
        bank_slug: "main",
        patch_slug: slug,
        visibility: "public",
        project_data: claim.project_data,
      },
      { onConflict: "slug" },
    );
    if (upsertError) {
      setError(`Approve failed: ${upsertError.message}`);
      setBusyId(null);
      return;
    }
    const { error: markError } = await supabase
      .from("patch_claims")
      .update({ status: "approved", reviewed_at: new Date().toISOString() })
      .eq("id", claim.id);
    if (markError) setError(`Marked snapshot but claim update failed: ${markError.message}`);
    setBusyId(null);
    load();
  };

  const reject = async (claim: Claim) => {
    setBusyId(claim.id);
    const reason = window.prompt("Reason for rejection (optional):") || null;
    const { error: markError } = await supabase
      .from("patch_claims")
      .update({ status: "rejected", reviewed_at: new Date().toISOString(), review_note: reason })
      .eq("id", claim.id);
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
          <Link to="/" className="mono text-xs text-muted-foreground hover:text-foreground">
            &lt; soundemote
          </Link>
          <Button variant="outline" size="sm" onClick={() => supabase.auth.signOut()}>
            Sign out
          </Button>
        </div>
        <h1 className="display mt-4 text-2xl">Claim Review</h1>

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
          {!fetching && claims.length === 0 && (
            <p className="mono text-sm text-muted-foreground">No {filter} claims.</p>
          )}
          {claims.map((claim) => (
            <div key={claim.id} className="rounded border border-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="mono text-base">/{claim.requested_slug}</p>
                  <p className="text-xs text-muted-foreground">
                    {claim.contact_email} · {new Date(claim.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOpenId(openId === claim.id ? null : claim.id)}
                  >
                    {openId === claim.id ? "Hide" : "Preview"}
                  </Button>
                  {filter === "pending" && (
                    <>
                      <Button size="sm" disabled={busyId === claim.id} onClick={() => approve(claim)}>
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={busyId === claim.id}
                        onClick={() => reject(claim)}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
              {claim.note && <p className="mt-2 text-sm">{claim.note}</p>}
              {claim.review_note && (
                <p className="mt-2 text-xs text-muted-foreground">Note: {claim.review_note}</p>
              )}
              {openId === claim.id && <ClaimPreview projectData={claim.project_data} />}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default AdminClaims;
