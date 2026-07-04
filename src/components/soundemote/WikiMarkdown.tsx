import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import type { ComponentPropsWithoutRef } from "react";
import { slugifyHeading } from "./TableOfContents";

function MarkdownHeading({ level, children, ...rest }: { level: 2 | 3 } & ComponentPropsWithoutRef<"h2">) {
  const text = String(children);
  const Tag = level === 2 ? "h2" : "h3";
  return (
    <Tag id={slugifyHeading(text)} {...rest}>
      {children}
    </Tag>
  );
}

// The official wiki page styling -- every markdown article on the site
// (patch wiki pages, the homepage featured spotlight, etc.) renders through
// this component so they all read as one consistent GitHub-README-flavored
// design language.
export const WIKI_PROSE_CLASSNAME =
  "prose prose-invert prose-sm md:prose-base max-w-none prose-headings:display prose-headings:font-normal prose-a:text-scope prose-code:before:content-none prose-code:after:content-none prose-pre:border prose-pre:border-border/60 prose-pre:bg-black/50 prose-blockquote:border-scope/50 prose-blockquote:not-italic prose-hr:border-border/60 prose-h2:scroll-mt-24 prose-img:rounded-md prose-table:text-sm [&_p_img]:my-0 [&_p_img]:inline-block [&_p_img]:align-middle [&_p_a]:inline-block";

const WikiMarkdown = ({ markdown, className }: { markdown: string; className?: string }) => (
  <div className={className ?? WIKI_PROSE_CLASSNAME}>
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={{
        h2: ({ children, ...rest }) => (
          <MarkdownHeading level={2} {...rest}>
            {children}
          </MarkdownHeading>
        ),
        h3: ({ children, ...rest }) => (
          <MarkdownHeading level={3} {...rest}>
            {children}
          </MarkdownHeading>
        ),
      }}
    >
      {markdown}
    </ReactMarkdown>
  </div>
);

export default WikiMarkdown;
