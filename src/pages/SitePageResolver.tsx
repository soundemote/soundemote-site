import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import { supabase, supabaseConfigError } from "@/lib/supabase";
import { useWikiRole } from "@/hooks/useWikiRole";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { featuredArticles } from "@/data/featuredArticles";

type SitePageStyle = "homepage" | "wiki" | "sandbox";
type SitePageRow = {
  slug: string;
  style: SitePageStyle;
  target_slug: string | null;
};

/**
 * Resolves a bare root slug (e.g. `/supersaw`) via the `site_pages` table.
 *  - Row exists  -> render / redirect to its style.
 *  - Row missing -> trusted user sees a creator picker, everyone else 404s.
 */
export default function SitePageResolver({ slug: slugProp }: { slug?: string } = {}) {
  const params = useParams<{ handle?: string; slug?: string }>();
  const raw = slugProp ?? params.slug ?? params.handle ?? "";
  const slug = raw.toLowerCase();
  const { loading: roleLoading, session, isTrusted } = useWikiRole();
  const [loading, setLoading] = useState(true);
  const [row, setRow] = useState<SitePageRow | null>(null);

  useEffect(() => {
    let cancel = false;
    if (!slug || supabaseConfigError) {
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from("site_pages")
      .select("slug, style, target_slug")
      .eq("slug", slug)
      .maybeSingle()
      .then(({ data }) => {
        if (cancel) return;
        setRow((data as SitePageRow | null) ?? null);
        setLoading(false);
      });
    return () => {
      cancel = true;
    };
  }, [slug]);

  if (loading || roleLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground mono text-sm">
        loading /{slug}…
      </div>
    );
  }

  if (row) {
    if (row.style === "wiki") return <Navigate to={`/wiki/${slug}`} replace />;
    if (row.style === "sandbox") return <Navigate to={`/patch/${slug}`} replace />;
    // homepage
    return <Index featuredSlug={row.target_slug || undefined} />;
  }

  if (!session || !isTrusted) return <NotFound />;

  return <ClaimSitePagePicker slug={slug} userId={session.user.id} />;
}

function ClaimSitePagePicker({ slug, userId }: { slug: string; userId: string }) {
  const navigate = useNavigate();
  const [style, setStyle] = useState<SitePageStyle | null>(null);
  const [targetSlug, setTargetSlug] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (chosen: SitePageStyle) => {
    setError(null);
    if (chosen === "homepage" && !targetSlug.trim()) {
      setError("Pick which featured article to show on the front page.");
      return;
    }
    setBusy(true);
    const { error: insertError } = await supabase.from("site_pages").insert({
      slug,
      style: chosen,
      target_slug: chosen === "homepage" ? targetSlug.trim() : null,
      created_by: userId,
    });
    if (insertError) {
      setError(insertError.message);
      setBusy(false);
      return;
    }
    setBusy(false);
    if (chosen === "wiki") {
      navigate(`/wiki/${slug}`, { replace: true });
    } else if (chosen === "sandbox") {
      navigate(`/patch/${slug}`, { replace: true });
    } else {
      // Already at `/${slug}` — navigating there is a no-op and would leave
      // the picker mounted. Hydrate the row locally so the resolver flips to
      // rendering the homepage on this same render pass.
      setRow({
        slug,
        style: "homepage",
        target_slug: targetSlug.trim() || null,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Create /{slug} — Soundemote</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="mx-auto max-w-2xl px-6 py-16">
        <p className="mono text-xs uppercase tracking-widest text-muted-foreground">
          unclaimed page
        </p>
        <h1 className="mt-2 text-3xl font-bold">
          Create <span className="mono">/{slug}</span>?
        </h1>
        <p className="mt-3 text-muted-foreground">
          No page exists at <span className="mono">soundemote.io/{slug}</span> yet. Pick a style
          to reserve this URL. You can always fill in the content afterward from the
          wiki/sandbox editor.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <StyleCard
            active={style === "homepage"}
            title="Homepage"
            desc="Front page framed around a featured article."
            onClick={() => setStyle("homepage")}
          />
          <StyleCard
            active={style === "wiki"}
            title="Wiki"
            desc="Standard wiki article page (Markdown + patch)."
            onClick={() => setStyle("wiki")}
          />
          <StyleCard
            active={style === "sandbox"}
            title="Sandbox"
            desc="Playable page-patch showcase (like /patch/…)."
            onClick={() => setStyle("sandbox")}
          />
        </div>

        {style === "homepage" && (
          <div className="mt-6 space-y-2">
            <Label htmlFor="target-slug" className="mono text-xs">
              Featured article slug
            </Label>
            <Input
              id="target-slug"
              list="featured-article-slugs"
              value={targetSlug}
              onChange={(e) => setTargetSlug(e.target.value)}
              placeholder="e.g. simd"
              className="mono"
            />
            <datalist id="featured-article-slugs">
              {featuredArticles.map((a) => (
                <option key={a.slug} value={a.slug}>
                  {a.title}
                </option>
              ))}
            </datalist>
          </div>
        )}

        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

        <div className="mt-8 flex items-center gap-3">
          <Button
            disabled={!style || busy}
            onClick={() => style && submit(style)}
            className="mono"
          >
            {busy ? "creating…" : `create /${slug}`}
          </Button>
          <Link to="/" className="mono text-sm text-muted-foreground hover:text-foreground">
            cancel
          </Link>
        </div>
      </div>
    </div>
  );
}

function StyleCard({
  title,
  desc,
  active,
  onClick,
}: {
  title: string;
  desc: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left rounded-lg border p-4 transition ${
        active
          ? "border-primary bg-primary/5 ring-2 ring-primary/40"
          : "border-border hover:border-primary/60"
      }`}
    >
      <div className="mono text-sm font-semibold">{title}</div>
      <div className="mt-1 text-xs text-muted-foreground">{desc}</div>
    </button>
  );
}
