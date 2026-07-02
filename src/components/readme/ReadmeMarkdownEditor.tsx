import { useLayoutEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useReadmeEditor, type UseReadmeEditorReturn } from "@/hooks/useReadmeEditor";
import { highlightMarkdown } from "@/lib/markdownHighlight";

type ReadmeMarkdownEditorProps = {
  /** Optional external controller from useReadmeEditor(); one is created if omitted. */
  controller?: UseReadmeEditorReturn;
  initialValue?: string;
  onCommit?: (markdown: string) => void;
  className?: string;
};

/**
 * Basic, intentionally-unstyled README editor: highlighted source on the left,
 * live GitHub-flavoured preview on the right, with accept / edit / replace /
 * revert actions. Swap the markup/styles later — the behaviour lives in
 * useReadmeEditor + highlightMarkdown.
 */
export function ReadmeMarkdownEditor({
  controller,
  initialValue = "",
  onCommit,
  className,
}: ReadmeMarkdownEditorProps) {
  const fallback = useReadmeEditor({ initialValue, onCommit });
  const md = controller ?? fallback;

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);

  // Keep the highlight underlay scroll in sync with the textarea.
  useLayoutEffect(() => {
    const ta = textareaRef.current;
    const pre = highlightRef.current;
    if (!ta || !pre) return;
    const sync = () => {
      pre.scrollTop = ta.scrollTop;
      pre.scrollLeft = ta.scrollLeft;
    };
    ta.addEventListener("scroll", sync);
    return () => ta.removeEventListener("scroll", sync);
  }, []);

  const showEditor = md.mode === "edit" || md.mode === "split";
  const showPreview = md.mode === "preview" || md.mode === "split";

  return (
    <div className={className} data-readme-editor>
      <div data-readme-toolbar style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 4 }}>
          {(["edit", "split", "preview"] as const).map((m) => (
            <button key={m} type="button" onClick={() => md.setMode(m)} aria-pressed={md.mode === m}>
              {m}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 4, marginLeft: "auto" }}>
          <button type="button" onClick={md.accept} disabled={!md.isDirty}>
            accept
          </button>
          <button type="button" onClick={md.revert} disabled={!md.isDirty}>
            revert
          </button>
          <button
            type="button"
            onClick={async () => {
              try {
                const text = await navigator.clipboard.readText();
                if (text) md.replace(text);
              } catch {
                /* clipboard unavailable */
              }
            }}
          >
            replace from clipboard
          </button>
          {md.isDirty && <span data-readme-dirty>unsaved</span>}
        </div>
      </div>

      <div
        data-readme-panes
        style={{ display: "grid", gridTemplateColumns: md.mode === "split" ? "1fr 1fr" : "1fr", gap: 12 }}
      >
        {showEditor && (
          <div data-readme-source style={{ position: "relative" }}>
            <pre
              ref={highlightRef}
              aria-hidden
              data-readme-highlight
              style={sharedTextStyle}
              dangerouslySetInnerHTML={{ __html: highlightMarkdown(md.draft) + "\n" }}
            />
            <textarea
              ref={textareaRef}
              value={md.draft}
              onChange={(e) => md.setDraft(e.target.value)}
              spellCheck={false}
              style={{
                ...sharedTextStyle,
                position: "absolute",
                inset: 0,
                resize: "none",
                background: "transparent",
                color: "transparent",
                caretColor: "currentColor",
                WebkitTextFillColor: "transparent",
              }}
            />
          </div>
        )}
        {showPreview && (
          <div data-readme-preview className="prose max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{md.draft || "*Nothing to preview*"}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}

// Editor + underlay must share identical metrics for the overlay to line up.
const sharedTextStyle: React.CSSProperties = {
  margin: 0,
  padding: 12,
  width: "100%",
  minHeight: 320,
  maxHeight: 480,
  overflow: "auto",
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  fontSize: 13,
  lineHeight: 1.5,
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  border: "1px solid currentColor",
  borderRadius: 8,
  boxSizing: "border-box",
  tabSize: 2,
};

export default ReadmeMarkdownEditor;