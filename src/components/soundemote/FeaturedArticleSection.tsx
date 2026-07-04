import WikiMarkdown from "./WikiMarkdown";
import type { FeaturedArticle } from "@/data/featuredArticles";

const FeaturedArticleSection = ({ article }: { article: FeaturedArticle }) => (
  <section
    id="featured-article"
    className="relative scroll-mt-16 border-y border-scope/30 bg-gradient-to-b from-scope/10 via-black/60 to-background py-16 md:py-24"
  >
    <div className="container mx-auto max-w-4xl px-4">
      <div className="mb-4 flex justify-center">
        <button
          type="button"
          onClick={() => document.getElementById("projects")?.scrollIntoView({ block: "start" })}
          className="mono inline-flex items-center gap-2 rounded-full border border-scope/50 px-4 py-1.5 text-[0.65rem] uppercase tracking-[0.14em] text-scope transition-colors hover:bg-scope/10"
        >
          ↓ back to repo list
        </button>
      </div>

      <div className="mb-10 flex flex-col items-center gap-3 text-center">
        <p className="mono max-w-xl text-sm text-muted-foreground">
          {article.tagline} Pick another repo below to switch what's shown here — straight from{" "}
          <a
            href={article.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-scope underline underline-offset-4 hover:text-foreground"
          >
            {article.sourceUrl.replace("https://github.com/", "")}
          </a>
          .
        </p>
      </div>

      <div
        key={article.slug}
        className="rounded-lg border border-border/60 bg-card/40 p-6 shadow-[0_0_60px_-15px_hsl(var(--scope)/0.5)] md:p-10"
      >
        <WikiMarkdown markdown={article.markdown} />
      </div>

      <div className="mt-8 flex justify-center">
        <a
          href={article.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mono inline-flex items-center gap-2 rounded-full border border-scope/50 px-5 py-2 text-xs uppercase tracking-[0.14em] text-scope transition-colors hover:bg-scope/10"
        >
          view the repo →
        </a>
      </div>
    </div>
  </section>
);

export default FeaturedArticleSection;
