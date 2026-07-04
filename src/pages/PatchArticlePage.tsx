import { useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ComponentPropsWithoutRef } from "react";
import Nav from "@/components/soundemote/Nav";
import Footer from "@/components/soundemote/Footer";
import MediaGallery from "@/components/soundemote/MediaGallery";
import TableOfContents, { extractChapters, slugifyHeading } from "@/components/soundemote/TableOfContents";
import { findPatchArticle, type PatchArticleBadge } from "@/data/patchArticles";

function MarkdownHeading({ level, children, ...rest }: { level: 2 | 3 } & ComponentPropsWithoutRef<"h2">) {
  const text = String(children);
  const Tag = level === 2 ? "h2" : "h3";
  return (
    <Tag id={slugifyHeading(text)} {...rest}>
      {children}
    </Tag>
  );
}

const badgeToneClass: Record<NonNullable<PatchArticleBadge["tone"]>, string> = {
  scope: "border-scope/50 bg-scope/10 text-scope",
  accent: "border-accent/50 bg-accent/10 text-accent",
  muted: "border-border bg-muted/40 text-muted-foreground",
};

type PatchArticlePageProps = {
  /** Fixed slug for a dedicated route (e.g. /shootingstar); falls back to the :slug route param. */
  slug?: string;
};

const PatchArticlePage = ({ slug: slugProp }: PatchArticlePageProps = {}) => {
  const { slug: slugParam = "" } = useParams<{ slug: string }>();
  const slug = slugProp ?? slugParam;
  const article = findPatchArticle(slug);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const chapters = article ? extractChapters(article.body) : [];
  const tocTheme = slug === "aliasingwars" ? "war" : "default";
  // Analog Box is the app itself, not just an article about it -- give it
  // room to breathe instead of squeezing it into the standard wiki column.
  const isWide = slug === "analogbox";
  const sandboxPreviewSrc =
    "/soemdsp-sandbox/index.html?sandboxView=modular-only&hideui=1&autoframe=1&autostart=1&v=20260703-borderless";

  const postPatch = () => {
    if (!article?.patchUrl) return;
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    fetch(article.patchUrl)
      .then((res) => res.json())
      .then((patchData) => {
        const projectData =
          patchData?.kind === "sandbox_patch"
            ? patchData
            : {
                kind: "sandbox_patch",
                version: 1,
                title: article.title,
                bank_name: "soundemote",
                patch_data: patchData,
              };
        const framePatch = () => {
          win.postMessage({ type: "soundemote:autoframe", padding: 0.18 }, window.location.origin);
        };
        win.postMessage({ type: "soundemote:sandbox-project-data", projectData }, window.location.origin);
        window.setTimeout(framePatch, 160);
        window.setTimeout(framePatch, 520);
        window.setTimeout(framePatch, 1200);
      })
      .catch(() => {
        /* ignore fetch/post errors */
      });
  };

  useEffect(() => {
    document.title = article ? `${article.title} — soundemote wiki` : "Not found — soundemote wiki";
  }, [article]);

  if (!article) {
    return (
      <main className="relative z-10 min-h-screen text-foreground">
        <Nav />
        <div className="container mx-auto max-w-2xl px-4 py-24 text-center">
          <p className="mono text-xs uppercase tracking-[0.2em] text-muted-foreground">404</p>
          <h1 className="display mt-3 text-3xl">No article at /{slug}</h1>
          <Link to="/" className="mono mt-6 inline-block text-sm text-scope underline underline-offset-4">
            back home
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="relative z-10 min-h-screen text-foreground">
      <Nav />

      <article className={`container mx-auto px-4 py-12 md:py-16 ${isWide ? "max-w-[1920px]" : "max-w-6xl"}`}>
        {/* Breadcrumb */}
        <nav className="mono flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <Link to="/" className="hover:text-scope transition-colors">
            soundemote
          </Link>
          <span>/</span>
          <span className="text-scope">wiki</span>
          <span>/</span>
          <span>{article.slug}</span>
        </nav>

        {/* Header */}
        <header className="mt-6 border-b border-border/60 pb-8">
          <h1 className="display text-4xl md:text-5xl">{article.title}</h1>
          <p className="mono mt-3 text-sm text-muted-foreground">{article.tagline}</p>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {article.badges.map((badge) => (
              <span
                key={badge.label}
                className={`mono inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[0.65rem] uppercase tracking-[0.14em] ${badgeToneClass[badge.tone ?? "muted"]}`}
              >
                <span className="opacity-60">{badge.label}</span>
                <span className="font-semibold">{badge.value}</span>
              </span>
            ))}
          </div>
        </header>

        {/* Body grid: article + infobox */}
        <div className={`mt-10 grid grid-cols-1 gap-10 ${isWide ? "lg:grid-cols-[1fr_280px]" : "lg:grid-cols-[1fr_320px]"}`}>
          {/* Main column */}
          <div className="min-w-0">
            {/* Patch preview */}
            <section className="mb-10 overflow-hidden bg-black/40">
              {article.status === "live" ? (
                <iframe
                  ref={iframeRef}
                  title={`${article.title} patch preview`}
                  src={sandboxPreviewSrc}
                  className={`w-full border-0 bg-transparent ${isWide ? "h-[560px] md:h-[720px]" : "h-[440px] md:h-[520px]"}`}
                  allow="autoplay; microphone"
                  onLoad={postPatch}
                />
              ) : (
                <div className="flex h-[280px] flex-col items-center justify-center gap-3 px-6 text-center">
                  <span className="mono rounded-full border border-border bg-muted/30 px-4 py-1.5 text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
                    not yet in the live sandbox
                  </span>
                  <p className="mono max-w-sm text-xs text-muted-foreground">
                    This module lives in an experimental fork and hasn't been ported to the
                    live build yet — read on for the idea behind it.
                  </p>
                </div>
              )}
            </section>

            {/* Gallery: click a thumbnail to watch the video or view the image */}
            {article.gallery && article.gallery.length > 0 && (
              <section className="mb-10">
                <h2 className="mono mb-3 text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
                  gallery
                </h2>
                <MediaGallery items={article.gallery} />
              </section>
            )}

            {/* Table of contents ("chapters") */}
            <TableOfContents chapters={chapters} theme={tocTheme} />

            {/* Markdown body, GitHub-README styled */}
            <div className="prose prose-invert prose-sm md:prose-base max-w-none prose-headings:display prose-headings:font-normal prose-a:text-scope prose-code:before:content-none prose-code:after:content-none prose-pre:border prose-pre:border-border/60 prose-pre:bg-black/50 prose-blockquote:border-scope/50 prose-blockquote:not-italic prose-hr:border-border/60 prose-h2:scroll-mt-24">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h2: ({ children, ...rest }) => (
                    <MarkdownHeading level={2} {...rest}>
                      {children}
                    </MarkdownHeading>
                  ),
                }}
              >
                {article.body}
              </ReactMarkdown>
            </div>

            {article.status === "live" && (
              <div className="mt-8 flex flex-wrap gap-4 border-t border-border/60 pt-6">
                <Link
                  to="/sandbox"
                  className="mono text-xs text-scope underline underline-offset-4 hover:text-foreground"
                >
                  open in full sandbox →
                </Link>
                {article.patchUrl && (
                  <a
                    href={article.patchUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mono text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
                  >
                    view raw patch JSON
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Infobox sidebar, Wikipedia-style */}
          <aside className="h-fit rounded-lg border border-border/60 bg-card/40">
            <div className="border-b border-border/60 px-4 py-3">
              <p className="mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
                {article.category}
              </p>
            </div>
            <dl className="divide-y divide-border/40">
              {article.facts.map((fact) => (
                <div key={fact.label} className="px-4 py-3">
                  <dt className="mono text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground">
                    {fact.label}
                  </dt>
                  <dd className="mt-1 text-sm text-foreground/90">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>
      </article>

      <Footer />
    </main>
  );
};

export default PatchArticlePage;
