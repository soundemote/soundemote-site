import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { PHOSPHOR_ARTICLE_MARKDOWN, PHOSPHOR_ARTICLE_SOURCE_URL } from "@/data/phosphorArticle";

const PhosphorSpotlight = () => (
  <section className="relative border-y border-scope/30 bg-gradient-to-b from-scope/10 via-black/60 to-background py-16 md:py-24">
    <div className="container mx-auto max-w-4xl px-4">
      <div className="mb-10 flex flex-col items-center gap-3 text-center">
        <span className="mono inline-flex items-center gap-2 rounded-full border border-scope/50 bg-scope/10 px-4 py-1.5 text-[0.65rem] uppercase tracking-[0.2em] text-scope">
          featured fork
        </span>
        <h2 className="display text-3xl text-warm-white md:text-5xl">
          The Phosphor field guide
        </h2>
        <p className="mono max-w-xl text-sm text-muted-foreground">
          The full write-up on why our scopes glow the way they do — straight from{" "}
          <a
            href={PHOSPHOR_ARTICLE_SOURCE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-scope underline underline-offset-4 hover:text-foreground"
          >
            soemdsp-sandbox-phosphor
          </a>
          .
        </p>
      </div>

      <div className="rounded-lg border border-border/60 bg-card/40 p-6 shadow-[0_0_60px_-15px_hsl(var(--scope)/0.5)] md:p-10">
        <div className="prose prose-invert prose-sm md:prose-base max-w-none prose-headings:display prose-headings:font-normal prose-a:text-scope prose-code:before:content-none prose-code:after:content-none prose-pre:border prose-pre:border-border/60 prose-pre:bg-black/50 prose-blockquote:border-scope/50 prose-blockquote:not-italic prose-hr:border-border/60 prose-img:rounded-md prose-table:text-sm">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
            {PHOSPHOR_ARTICLE_MARKDOWN}
          </ReactMarkdown>
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <a
          href={PHOSPHOR_ARTICLE_SOURCE_URL}
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

export default PhosphorSpotlight;
