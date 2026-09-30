export type StaticPagePatch = {
  slug: string;
  url: string;
};

/**
 * Resolve a bare route slug (/tubesaturation) to the catalog file URL.
 * Exact patches/index.json slug wins. Otherwise a single filename stem
 * (demo patches/tubesaturation) is that file, not an alias.
 */
export async function resolveStaticPagePatch(routeSlug: string): Promise<StaticPagePatch | null> {
  const want = String(routeSlug || "")
    .trim()
    .toLowerCase()
    .replace(/\.json$/i, "")
    .replace(/^\/+|\/+$/g, "");
  if (!want || want.split("/").length > 2) return null;
  const res = await fetch("/soemdsp-sandbox/patches/index.json", { cache: "no-store" });
  const type = String(res.headers.get("content-type") || "").toLowerCase();
  if (!res.ok || !type.includes("json")) return null;
  const data = await res.json();
  const patches = Array.isArray(data?.patches) ? data.patches : [];
  const norm = (value: unknown) => String(value || "").trim().toLowerCase();
  const exact = patches.find((entry) => norm(entry?.slug) === want);
  const stemHits = patches.filter(
    (entry) => norm(String(entry?.slug || "").split("/").pop()) === want,
  );
  const hit = exact || (stemHits.length === 1 ? stemHits[0] : null);
  const url = String(hit?.url || "").trim();
  const slug = String(hit?.slug || "").trim();
  if (!url || !slug) return null;
  return { slug, url };
}