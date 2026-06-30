import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { supabase, supabaseConfigError } from "@/lib/supabase";

type ShortlinkTarget = {
  user: string;
  bank: string;
  patch: string;
};

type PatchShortlinkRow = {
  target_user: string | null;
  target_bank: string | null;
  target_patch: string | null;
};

type SharedProjectRouteRow = {
  bank_name: string | null;
  slug: string;
};

async function loadPatchShortlink(slug = ""): Promise<ShortlinkTarget | null> {
  if (!slug || supabaseConfigError) {
    return null;
  }

  const shortlink = await supabase
    .from("patch_shortlinks")
    .select("target_user, target_bank, target_patch")
    .eq("slug", slug)
    .maybeSingle();

  if (!shortlink.error && shortlink.data) {
    const row = shortlink.data as PatchShortlinkRow;
    return {
      user: row.target_user || "soundemote",
      bank: row.target_bank || "main",
      patch: row.target_patch || slug,
    };
  }

  const legacyProject = await supabase
    .from("shared_projects")
    .select("bank_name, slug")
    .eq("slug", slug)
    .maybeSingle();

  if (legacyProject.error || !legacyProject.data) {
    return null;
  }

  const row = legacyProject.data as SharedProjectRouteRow;
  return {
    user: "soundemote",
    bank: row.bank_name || "main",
    patch: row.slug,
  };
}

const PatchShortlinkPage = () => {
  const { shortlink } = useParams<{ shortlink: string }>();
  const [loading, setLoading] = useState(true);
  const [target, setTarget] = useState<ShortlinkTarget | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setTarget(null);
    loadPatchShortlink(shortlink)
      .then((nextTarget) => {
        if (!cancelled) setTarget(nextTarget);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [shortlink]);

  if (target) {
    return <Navigate to={`/${target.user}/${target.bank}/${target.patch}`} replace />;
  }

  if (!loading && shortlink) {
    // Unclaimed space: open the sandbox with a claim affordance.
    return <Navigate to={`/sandbox?claim=${encodeURIComponent(shortlink)}`} replace />;
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto max-w-2xl px-4 py-12">
        <Link to="/" className="mono text-xs text-muted-foreground hover:text-foreground">
          &lt; soundemote
        </Link>
        <h1 className="display mt-4 text-2xl">Sandbox Shortcut</h1>
        <p className="mt-6 text-muted-foreground">
          {loading
            ? "Looking up patch..."
            : `No sandbox shortcut exists for "${shortlink || ""}" yet.`}
        </p>
        {!loading && !target && (
          <Link
            to="/sandbox"
            className="mono mt-6 inline-block text-xs text-foreground underline underline-offset-4 hover:text-muted-foreground"
          >
            open sandbox
          </Link>
        )}
      </div>
    </main>
  );
};

export default PatchShortlinkPage;
