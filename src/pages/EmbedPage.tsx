import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const SITE_ORIGIN = "https://soundemote.io";

type PatchOption = {
  label: string;
  path: string;
};

const PATCHES: PatchOption[] = [
  { label: "silently dreaming", path: "/sandbox" },
  { label: "reverb", path: "/reverb" },
  { label: "shooting star", path: "/shootingstar" },
  { label: "tweet", path: "/tweet" },
];

const EmbedPage = () => {
  const [patch, setPatch] = useState<string>(PATCHES[1].path);
  const [height, setHeight] = useState<number>(600);
  const [autoframe, setAutoframe] = useState<boolean>(true);
  const [modular, setModular] = useState<boolean>(false);
  const [hideUi, setHideUi] = useState<boolean>(false);

  const embedUrl = useMemo(() => {
    const q = new URLSearchParams();
    q.set("embed", "1");
    if (autoframe) q.set("autoframe", "1");
    // hideui implies modular-only view, so no need to also set modular.
    if (hideUi) q.set("hideui", "1");
    else if (modular) q.set("modular", "1");
    return `${SITE_ORIGIN}${patch}?${q.toString()}`;
  }, [patch, autoframe, modular, hideUi]);

  const snippet = useMemo(
    () =>
      `<iframe\n  src="${embedUrl}"\n  width="100%"\n  height="${height}"\n  style="border:0;border-radius:12px;overflow:hidden"\n  allow="autoplay; microphone"\n  allowfullscreen\n  loading="lazy"\n  title="Soundemote sandbox"\n></iframe>`,
    [embedUrl, height],
  );

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: `${label} copied` });
    } catch {
      toast({ title: "Copy failed", variant: "destructive" });
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <Link to="/" className="mono text-xs text-muted-foreground hover:text-foreground">
          ← soundemote
        </Link>
        <h1 className="display mt-4 text-3xl">Embed the sandbox</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Drop a live, playable Soundemote patch into any site that allows iframes — Substack,
          Ghost, WordPress, Notion, Webflow, Framer, Squarespace and more. Pick a patch, paste the
          snippet.
        </p>

        <div className="mt-8 grid gap-6">
          <div>
            <p className="mono mb-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              patch
            </p>
            <div className="flex flex-wrap gap-2">
              {PATCHES.map((p) => (
                <button
                  key={p.path}
                  type="button"
                  onClick={() => setPatch(p.path)}
                  className={`mono rounded border px-3 py-2 text-xs transition ${
                    patch === p.path
                      ? "border-cyan-300/50 bg-cyan-950/60 text-cyan-100"
                      : "border-border bg-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mono mb-2 block text-xs uppercase tracking-[0.18em] text-muted-foreground">
              height (px)
            </label>
            <input
              type="number"
              min={320}
              max={1200}
              value={height}
              onChange={(e) => setHeight(Number(e.target.value) || 600)}
              className="mono w-32 rounded border border-border bg-transparent px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mono flex cursor-pointer items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={autoframe}
                onChange={(e) => setAutoframe(e.target.checked)}
                className="h-4 w-4 accent-cyan-400"
              />
              <span className="uppercase tracking-[0.18em] text-muted-foreground">
                autoframe — zoom to fit the whole patch
              </span>
            </label>
          </div>

          <div>
            <label className="mono flex cursor-pointer items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={modular}
                disabled={hideUi}
                onChange={(e) => setModular(e.target.checked)}
                className="h-4 w-4 accent-cyan-400 disabled:opacity-40"
              />
              <span className="uppercase tracking-[0.18em] text-muted-foreground">
                modular view — open straight into the modules
              </span>
            </label>
          </div>

          <div>
            <label className="mono flex cursor-pointer items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={hideUi}
                onChange={(e) => setHideUi(e.target.checked)}
                className="h-4 w-4 accent-cyan-400"
              />
              <span className="uppercase tracking-[0.18em] text-muted-foreground">
                hide ui — full-screen modular, no back / resize / border
              </span>
            </label>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                embed snippet
              </p>
              <button
                type="button"
                onClick={() => copy(snippet, "Snippet")}
                className="mono rounded border border-cyan-300/40 bg-cyan-950/40 px-3 py-1.5 text-xs text-cyan-100 hover:bg-cyan-950/70"
              >
                copy snippet
              </button>
            </div>
            <pre className="overflow-x-auto rounded-md border border-border bg-black/40 p-4 text-xs text-cyan-100">
              {snippet}
            </pre>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                direct link
              </p>
              <button
                type="button"
                onClick={() => copy(embedUrl, "Link")}
                className="mono rounded border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                copy link
              </button>
            </div>
            <p className="mono break-all rounded-md border border-border bg-black/40 p-4 text-xs text-muted-foreground">
              {embedUrl}
            </p>
          </div>

          <div>
            <p className="mono mb-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              live preview
            </p>
            <iframe
              key={embedUrl + height}
              src={`${patch}?embed=1${autoframe ? "&autoframe=1" : ""}${
                hideUi ? "&hideui=1" : modular ? "&modular=1" : ""
              }`}
              width="100%"
              height={height}
              style={{ border: 0, borderRadius: 12, overflow: "hidden" }}
              allow="autoplay; microphone"
              allowFullScreen
              title="Soundemote sandbox preview"
            />
          </div>
        </div>
      </div>
    </main>
  );
};

export default EmbedPage;