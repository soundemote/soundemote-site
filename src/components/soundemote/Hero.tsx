import { useCallback, useEffect, useRef, useState } from "react";
import patchImage from "@/assets/soemdsp-patch.png";
import { SOUNDEMOTE_BANK } from "@/data/patchBank";
import { SandboxNavLink } from "@/components/soundemote/Nav";




export const Hero = ({ patchSlug }: { patchSlug?: string }) => {
  const [sandboxLoaded, setSandboxLoaded] = useState(false);
  // The route (e.g. /reverb, /shootingstar) selects which patch the single hero
  // sandbox loads. Unknown/absent slugs fall back to the first bank patch.
  const bankIndex = SOUNDEMOTE_BANK.findIndex((p) => p.slug === patchSlug);
  const patchIndex = bankIndex >= 0 ? bankIndex : 0;
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  // -1 means "nothing posted yet" so the first onLoad always pushes the
  // starting patch (shooting star) -- the sandbox's own built-in default
  // patch is a different, unrelated placeholder graph, so it must not be
  // assumed to already match index 0.
  const lastPostedRef = useRef<number>(-1);
  // Serialized body of the patch currently loaded in the sandbox, to detect
  // "loaded but no visible diff" cases (e.g. two banks pointing at the same graph).
  const lastBodyRef = useRef<string | null>(null);
  const noDiffTimer = useRef<number | null>(null);
  const postRetryTimers = useRef<number[]>([]);
  const [noDiff, setNoDiff] = useState(false);
  const sandboxViewportHeight = "560px";
  // autoframe=1: the sandbox zoom+pans to fit the whole patch after every
  // project-data commit (nodeGraphExternalAutoFrameAfterLoad), so the embed
  // frames itself correctly no matter which patch loads.
  const sandboxEmbedSrc =
    "/soemdsp-sandbox/index.html?sandboxView=modular-only&hideui=1&autostart=1&autoframe=1&v=20260703-autoframe";
  const currentPatch = SOUNDEMOTE_BANK[patchIndex];

  const postPatch = useCallback(async () => {
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    // Nothing to do if this patch is already loaded in the sandbox.
    if (lastPostedRef.current === patchIndex) return;
    lastPostedRef.current = patchIndex;
    try {
      const res = await fetch(currentPatch.url);
      const patchData = await res.json();
      // Detect no-op loads: same graph body as what's already showing.
      const body = JSON.stringify(patchData?.patch_data ?? patchData);
      const identical = lastBodyRef.current !== null && lastBodyRef.current === body;
      lastBodyRef.current = body;
      setNoDiff(identical);
      if (noDiffTimer.current) window.clearTimeout(noDiffTimer.current);
      if (identical) {
        noDiffTimer.current = window.setTimeout(() => setNoDiff(false), 1800);
      }
      // The sandbox expects a "sandbox_patch" share envelope, not a raw patch.
      // If the file is already an envelope, forward it as-is; otherwise wrap it.
      const projectData =
        patchData?.kind === "sandbox_patch"
          ? patchData
          : {
              kind: "sandbox_patch",
              version: 1,
              title: currentPatch.label,
              bank_name: "soundemote",
              patch_data: patchData,
            };
      postRetryTimers.current.forEach((timer) => window.clearTimeout(timer));
      postRetryTimers.current = [];
      const sendProjectData = () => {
        iframeRef.current?.contentWindow?.postMessage(
          { type: "soundemote:sandbox-project-data", projectData },
          window.location.origin,
        );
        // No set-view here: the embed URL carries autoframe=1, so the sandbox
        // auto-frames (zoom-to-fit) after each project-data commit. A fixed
        // x/y/zoom would fight that and land off-center for other patches.
      };
      sendProjectData();
      postRetryTimers.current = [250, 700, 1400, 2600, 4200].map((delay) =>
        window.setTimeout(sendProjectData, delay),
      );
    } catch {
      /* ignore fetch/post errors */
    }
  }, [currentPatch.label, currentPatch.url, patchIndex]);

  // Re-send whenever the selected patch changes (after initial load).
  useEffect(() => {
    if (sandboxLoaded) postPatch();
  }, [sandboxLoaded, postPatch]);

  useEffect(
    () => () => {
      postRetryTimers.current.forEach((timer) => window.clearTimeout(timer));
      if (noDiffTimer.current) window.clearTimeout(noDiffTimer.current);
    },
    [],
  );


  const previewFrameClass = sandboxLoaded
    ? "soundemote-sandbox-preview-frame relative flex w-full max-w-[900px] mx-auto justify-center overflow-hidden bg-transparent"
    : "soundemote-sandbox-preview-frame relative flex w-full justify-center overflow-hidden bg-background";

  return (
    <section id="top" className="relative overflow-hidden py-6 md:py-8">
      <div className="absolute inset-0 scope-grid opacity-40" aria-hidden />
      <div className="absolute inset-0 bg-[var(--gradient-hero)]" aria-hidden />
      <div className="relative mx-auto flex min-h-[56vh] max-w-6xl flex-col items-center justify-center animate-fade-in px-4 text-center md:min-h-[62vh]">
        <div className={sandboxLoaded
          ? "mx-auto w-full animate-fade-in [animation-delay:200ms]"
          : "mx-auto w-full max-w-[min(95vw,56rem)] animate-fade-in [animation-delay:200ms]"
        }> 
          <div
            className={previewFrameClass}
          >
            {sandboxLoaded ? (
              <iframe
                ref={iframeRef}
                id="hero-sandbox-iframe"
                title="soemdsp sandbox"
                src={sandboxEmbedSrc}
                className="w-full border-0 bg-transparent"
                style={{ height: sandboxViewportHeight, width: "100%" }}
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
              </button>
            )}
          </div>
        </div>

        {sandboxLoaded && (
          <div className="mt-4 flex items-center justify-center gap-3">
            <span className="mono flex min-w-[10rem] flex-col items-center text-xs uppercase tracking-[0.18em] text-scope">
              {currentPatch.label}
              {noDiff && (
                <span className="mt-0.5 text-[0.6rem] normal-case tracking-normal text-scope/60">
                  loaded · identical to previous
                </span>
              )}
            </span>
          </div>
        )}
        <span className="mt-2 block text-center text-[10px] tracking-widest text-scope/20 select-none">
          HERO_BUILD {HERO_BUILD}
        </span>
      </div>
    </section>
  );
};

export default Hero;
