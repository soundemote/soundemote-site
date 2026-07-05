import { useEffect } from "react";
import { Link } from "react-router-dom";
import Nav from "@/components/soundemote/Nav";
import Footer from "@/components/soundemote/Footer";
import WikiMarkdown from "@/components/soundemote/WikiMarkdown";
import TableOfContents, { extractChapters } from "@/components/soundemote/TableOfContents";
import { findFeaturedArticle } from "@/data/featuredArticles";
import GradientCurveSpotlight from "@/components/soundemote/GradientCurveSpotlight";

const FeaturedArticlePage = ({ slug }: { slug: string }) => {
  const article = findFeaturedArticle(slug);
  const chapters = article ? extractChapters(article.markdown) : [];

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

      <article className="container mx-auto max-w-6xl px-4 py-12 md:py-16">
        <nav className="mono flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <Link to="/" className="hover:text-scope transition-colors">
            soundemote
          </Link>
          <span>/</span>
          <span className="text-scope">wiki</span>
          <span>/</span>
          <span>{article.slug}</span>
        </nav>

        <header className="mt-6 border-b border-border/60 pb-8">
          <h1 className="display text-4xl md:text-5xl">
            {article.emoji} {article.title}
          </h1>
          <p className="mono mt-3 text-sm text-muted-foreground">{article.tagline}</p>
          <a
            href={article.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mono mt-4 inline-block text-xs text-scope underline underline-offset-4 hover:text-foreground"
          >
            view the repo →
          </a>
        </header>

        <div className="mt-10 max-w-3xl">
          {article.slug === "simd" && (
            <div className="mb-10 max-w-none">
              <GradientCurveSpotlight />
            </div>
          )}

          <div className="mb-6">
            <Link
              to="/#projects"
              className="mono inline-flex items-center gap-2 rounded-full border border-scope/50 px-4 py-1.5 text-[0.65rem] uppercase tracking-[0.14em] text-scope transition-colors hover:bg-scope/10"
            >
              ↓ back to repo list
            </Link>
          </div>
          <TableOfContents chapters={chapters} theme="default" />
          <WikiMarkdown markdown={article.markdown} />
        </div>
      </article>

      <Footer />
    </main>
  );
};

export default FeaturedArticlePage;
