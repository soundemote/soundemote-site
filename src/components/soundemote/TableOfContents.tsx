export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

/** Pulls every `## Heading` line out of a markdown body, in order. */
export function extractChapters(markdown: string): { label: string; anchor: string }[] {
  const matches = [...markdown.matchAll(/^##\s+(.+)$/gm)];
  return matches.map((match) => ({
    label: match[1].trim(),
    anchor: slugifyHeading(match[1].trim()),
  }));
}

function toRoman(num: number): string {
  const numerals: [number, string][] = [
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let remaining = num;
  let result = "";
  for (const [value, symbol] of numerals) {
    while (remaining >= value) {
      result += symbol;
      remaining -= value;
    }
  }
  return result;
}

type TableOfContentsProps = {
  chapters: { label: string; anchor: string }[];
  theme?: "default" | "war";
};

export function TableOfContents({ chapters, theme = "default" }: TableOfContentsProps) {
  if (chapters.length === 0) return null;

  if (theme === "war") {
    return (
      <nav
        aria-label="Table of contents"
        className="relative mb-10 overflow-hidden rounded-lg border-2 border-[#c94b3a]/50 bg-[repeating-linear-gradient(135deg,rgba(201,75,58,0.05)_0px,rgba(201,75,58,0.05)_2px,transparent_2px,transparent_10px)] bg-black/60 px-5 py-5"
      >
        <div className="pointer-events-none absolute -right-6 -top-6 rotate-12 select-none border-4 border-[#c94b3a]/40 px-4 py-1 mono text-[0.6rem] font-bold uppercase tracking-[0.3em] text-[#c94b3a]/40">
          field manual
        </div>
        <p className="mono text-[0.65rem] font-bold uppercase tracking-[0.3em] text-[#c94b3a]">
          ▸▸ campaign chapters
        </p>
        <ol className="mt-4 space-y-2 border-l-2 border-[#c94b3a]/30 pl-4">
          {chapters.map((chapter, index) => (
            <li key={chapter.anchor}>
              <a
                href={`#${chapter.anchor}`}
                className="group mono flex items-baseline gap-3 text-sm text-muted-foreground transition-colors hover:text-[#ff6b52]"
              >
                <span className="w-8 shrink-0 font-bold text-[#c94b3a] group-hover:text-[#ff6b52]">
                  {toRoman(index + 1)}.
                </span>
                <span className="uppercase tracking-[0.04em]">{chapter.label}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>
    );
  }

  return (
    <nav aria-label="Table of contents" className="mb-10 rounded-lg border border-border/60 bg-card/40 px-5 py-5">
      <p className="mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">contents</p>
      <ol className="mt-3 space-y-1.5">
        {chapters.map((chapter, index) => (
          <li key={chapter.anchor}>
            <a
              href={`#${chapter.anchor}`}
              className="mono flex items-baseline gap-3 text-sm text-foreground/80 transition-colors hover:text-scope"
            >
              <span className="w-5 shrink-0 text-muted-foreground">{index + 1}.</span>
              <span>{chapter.label}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default TableOfContents;
