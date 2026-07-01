import { useCallback, useEffect, useRef, useState } from "react";
import patchImage from "@/assets/soemdsp-patch.png";
import { SOUNDEMOTE_BANK } from "@/data/patchBank";

export const Hero = () => {
  const [sandboxLoaded, setSandboxLoaded] = useState(false);
  const [patchIndex, setPatchIndex] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  // Index 0 (silently dreaming) is already the sandbox's built-in default patch,
  // so we must not re-post it on first load or it re-loads and flashes.
  const didInitialPostRef = useRef(false);
  const sandboxViewportHeight = "max(640px, calc(100svh - 10rem))";
  const currentPatch = SOUNDEMOTE_BANK[patchIndex];

  const postPatch = useCallback(async () => {
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    // Skip the very first post when it's the default patch — the sandbox
    // already boots into it, so re-posting only causes a visible reload flash.
    if (!didInitialPostRef.current) {
      didInitialPostRef.current = true;
      if (patchIndex === 0) return;
    }
    try {
      const res = await fetch(currentPatch.url);
      const projectData = await res.json();
      win.postMessage(
        { type: "soundemote:sandbox-project-data", projectData },
        window.location.origin,
      );
    } catch {
      /* ignore fetch/post errors */
    }
  }, [currentPatch.url, patchIndex]);

  // Re-send whenever the selected patch changes (after initial load).
  useEffect(() => {
    if (sandboxLoaded) postPatch();
  }, [sandboxLoaded, postPatch]);

  const step = (dir: number) =>
    setPatchIndex((i) => (i + dir + SOUNDEMOTE_BANK.length) % SOUNDEMOTE_BANK.length);

  const previewFrameClass = sandboxLoaded
    ? "soundemote-sandbox-preview-frame relative flex w-full justify-center overflow-hidden bg-background"
    : "soundemote-sandbox-preview-frame relative flex w-full justify-center overflow-hidden bg-background";

  return (
    <section id="top" className="relative overflow-hidden py-6 md:py-8">
      <div className="absolute inset-0 scope-grid opacity-40" aria-hidden />
      <div className="absolute inset-0 bg-[var(--gradient-hero)]" aria-hidden />
      <div className="relative mx-auto flex min-h-[56vh] max-w-6xl flex-col items-center justify-center animate-fade-in px-4 text-center md:min-h-[62vh]">
        <div className="mx-auto w-full max-w-[min(95vw,56rem)] animate-fade-in [animation-delay:200ms]">
          <div
            className={previewFrameClass}
            style={sandboxLoaded ? { height: sandboxViewportHeight, minHeight: sandboxViewportHeight } : undefined}
          >
            {sandboxLoaded ? (
              <iframe
                ref={iframeRef}
                id="hero-sandbox-iframe"
                title="soemdsp sandbox"
                src="/soemdsp-sandbox/index.html?sandboxView=modular-only"
                className="w-full border-0 bg-transparent"
                style={{ height: sandboxViewportHeight, minHeight: sandboxViewportHeight }}
                allow="autoplay; microphone"
                onLoad={postPatch}
              />
            ) : (
              <button
                type="button"
                className="group block border-0 bg-transparent p-0 text-left"
                aria-label="Load soemdsp sandbox in this preview"
                onClick={() => setSandboxLoaded(true)}
              >
                <img
                  id="hero-patch-image"
                  src={patchImage}
                  alt="soemdsp modular patch - oscillators, noise, gain and output nodes"
                  className="h-auto w-auto"
                />
                <span className="pointer-events-none absolute inset-0 grid place-items-center bg-background/18 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                  <span className="mono rounded-full border border-scope/70 bg-background/85 px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-scope shadow-[0_0_28px_hsl(var(--scope)/0.22)]">
                    load sandbox
                  </span>
                </span>
              </button>
            )}
          </div>
        </div>

        {sandboxLoaded && (
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous patch"
              className="mono rounded-full border border-scope/70 bg-background/85 px-4 py-2 text-sm text-scope transition-colors hover:bg-scope/10"
            >
              ‹ prev
            </button>
            <span className="mono min-w-[10rem] text-xs uppercase tracking-[0.18em] text-scope">
              soundemote / {currentPatch.label}
            </span>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next patch"
              className="mono rounded-full border border-scope/70 bg-background/85 px-4 py-2 text-sm text-scope transition-colors hover:bg-scope/10"
            >
              next ›
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Hero;
