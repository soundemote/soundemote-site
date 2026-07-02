/**
 * Minimal, dependency-free markdown source highlighter.
 *
 * Escapes HTML, then wraps recognised markdown tokens in spans with
 * `data-md` attributes so consumers can style them however they like
 * (see the tokens list below). Intended for a highlighted overlay behind a
 * transparent <textarea>, GitHub-code-comment style.
 */

const escapeHtml = (input: string): string =>
  input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const span = (token: string, text: string): string => `<span data-md="${token}">${text}</span>`;

function highlightInline(text: string): string {
  return text
    // inline code
    .replace(/(`[^`\n]+`)/g, (m) => span("code", m))
    // bold
    .replace(/(\*\*[^*\n]+\*\*|__[^_\n]+__)/g, (m) => span("bold", m))
    // italic
    .replace(/(\*[^*\n]+\*|_[^_\n]+_)/g, (m) => span("italic", m))
    // links / images
    .replace(/(!?\[[^\]\n]*\]\([^)\n]*\))/g, (m) => span("link", m));
}

/** Returns an HTML string with markdown tokens wrapped in `data-md` spans. */
export function highlightMarkdown(source: string): string {
  const lines = source.split("\n");
  let inFence = false;
  const out: string[] = [];

  for (const rawLine of lines) {
    const escaped = escapeHtml(rawLine);

    // fenced code blocks (``` or ~~~)
    if (/^\s*(```|~~~)/.test(rawLine)) {
      inFence = !inFence;
      out.push(span("fence", escaped));
      continue;
    }
    if (inFence) {
      out.push(span("code", escaped));
      continue;
    }

    // headings
    if (/^\s{0,3}#{1,6}\s/.test(rawLine)) {
      out.push(span("heading", escaped));
      continue;
    }
    // blockquote
    if (/^\s{0,3}>/.test(rawLine)) {
      out.push(span("quote", escaped));
      continue;
    }
    // horizontal rule
    if (/^\s{0,3}([-*_])(\s*\1){2,}\s*$/.test(rawLine)) {
      out.push(span("hr", escaped));
      continue;
    }
    // list markers (keep marker highlighted, inline-highlight the rest)
    const listMatch = rawLine.match(/^(\s*(?:[-*+]|\d+\.)\s)(.*)$/);
    if (listMatch) {
      const marker = escapeHtml(listMatch[1]);
      out.push(span("list", marker) + highlightInline(escapeHtml(listMatch[2])));
      continue;
    }

    out.push(highlightInline(escaped));
  }

  return out.join("\n");
}

export default highlightMarkdown;