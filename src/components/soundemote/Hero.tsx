import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import patchImage from "@/assets/soemdsp-patch.png";
import { siteConfig } from "@/config/site";
import { SOUNDEMOTE_BANK } from "@/data/patchBank";
import { SandboxNavLink } from "@/components/soundemote/Nav";

type TransportButtonProps = {
  label: string;
  onClick: () => void;
  pressed?: boolean;
  children: React.ReactNode;
};

const TransportButton = ({ label, onClick, pressed, children }: TransportButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    aria-pressed={pressed}
    title={label}
    className={
      "inline-flex h-9 w-9 items-center justify-center rounded-sm border border-scope/30 bg-transparent text-scope transition-colors " +
      "hover:bg-scope/10 active:bg-scope/20 focus:outline-none focus-visible:ring-1 focus-visible:ring-scope/60 " +
      (pressed ? "bg-scope/15 border-scope/60 " : "")
    }
  >
    {children}
  </button>
);

// ── Transport icon SVGs ──
const ICON_PREV = <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden><rect x="5" y="4" width="3" height="16" fill="currentColor" /><polygon points="19,4 19,20 8,12" fill="currentColor" /></svg>;
const ICON_NEXT = <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden><polygon points="5,4 5,20 16,12" fill="currentColor" /><rect x="16" y="4" width="3" height="16" fill="currentColor" /></svg>;
const ICON_STOP = <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden><rect x="6" y="6" width="12" height="12" fill="currentColor" /></svg>;
const ICON_PLAY = <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden><polygon points="7,4 7,20 20,12" fill="currentColor" /></svg>;
const ICON_PAUSE = <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden><rect x="6" y="5" width="4" height="14" fill="currentColor" /><rect x="14" y="5" width="4" height="14" fill="currentColor" /></svg>;





export const Hero = ({ patchSlug }: { patchSlug?: string }) => {
  const [sandboxLoaded, setSandboxLoaded] = useState(false);
  const navigate = useNavigate();
  // Live engine state synced from the sandbox via postMessage.
  const [liveEnabled, setLiveEnabled] = useState(false);
  const [liveSpeed, setLiveSpeed] = useState(1);
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

  // Send a postMessage into the sandbox iframe.
  const postToSandbox = useCallback((message: unknown) => {
    iframeRef.current?.contentWindow?.postMessage(message, window.location.origin);
  }, []);

  const isPlaying = liveEnabled && liveSpeed > 0;
  const isPaused = liveEnabled && liveSpeed === 0;

  const gotoBank = useCallback(
    (delta: number) => {
      const n = SOUNDEMOTE_BANK.length;
      const next = SOUNDEMOTE_BANK[(patchIndex + delta + n) % n];
      navigate(`/${next.slug}`);
    },
    [navigate, patchIndex],
  );

  const postPatchRef = useRef<() => void>(() => {});

  const handlePreview = useCallback(() => {
    if (!sandboxLoaded) {
      setSandboxLoaded(true);
      return;
    }
    lastPostedRef.current = -1;
    postPatchRef.current();
  }, [sandboxLoaded]);

  // Transport: Play/resume — start the engine or resume from pause.
  const handlePlay = useCallback(() => {
    if (isPaused) {
      postToSandbox({ type: "soundemote:set-live-speed", speed: 1 });
    } else {
      postToSandbox({ type: "soundemote:set-live-output", enabled: true });
      postToSandbox({ type: "soundemote:set-live-speed", speed: 1 });
    }
  }, [isPaused, postToSandbox]);

  // Transport: Pause — freeze the engine (speed → 0).
  const handlePause = useCallback(() => {
    postToSandbox({ type: "soundemote:set-live-speed", speed: 0 });
  }, [postToSandbox]);

  // Transport: Stop — tear down the audio engine entirely, reset speed.
  const handleStop = useCallback(() => {
    postToSandbox({ type: "soundemote:set-live-output", enabled: false });
    postToSandbox({ type: "soundemote:set-live-speed", speed: 1 });
  }, [postToSandbox]);

  // Listen for live-output-changed messages from the sandbox to keep transport state in sync.
  useEffect(() => {
    if (!sandboxLoaded) return;
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === "soundemote:live-output-changed") {
        setLiveEnabled(Boolean(event.data.enabled));
        setLiveSpeed(Number(event.data.speed) || 1);
      }
    };
    window.addEventListener("message", onMessage);
    // Also request current state in case the sandbox already started before we started listening.
    postToSandbox({ type: "soundemote:request-live-state" });
    return () => window.removeEventListener("message", onMessage);
  }, [sandboxLoaded, postToSandbox]);

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

  useEffect(() => {
    postPatchRef.current = postPatch;
  }, [postPatch]);

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
        <h1 className="sr-only">
          Soundemote — audio-visual DSP instruments and signal-reactive visual tools for electronic music producers and VJs
        </h1>
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
                  decoding="async"
                  fetchPriority="high"
                />
              </button>
            )}
          </div>
        </div>

        <div className="mt-[2px] flex w-full flex-col items-center gap-[2px]">
          <span className="mono flex min-w-[10rem] flex-col items-center text-xs uppercase tracking-[0.18em] text-scope leading-none">
              {currentPatch.label}
              {noDiff && (
                <span className="mt-0.5 text-[0.6rem] normal-case tracking-normal text-scope/60">
                  loaded · identical to previous
                </span>
              )}
            </span>
            <div
              role="toolbar"
              aria-label="Sandbox transport"
              className="flex w-full items-center justify-center gap-2 px-0 py-0"
            >
              <TransportButton label="Previous patch" onClick={() => gotoBank(-1)}>{ICON_PREV}</TransportButton>
              <TransportButton label="Stop" onClick={handleStop}>{ICON_STOP}</TransportButton>
              <TransportButton
                label={isPlaying ? "Pause" : "Play"}
                onClick={isPlaying ? handlePause : handlePlay}
                pressed={isPlaying}
              >
                {isPaused ? ICON_PLAY : isPlaying ? ICON_PAUSE : ICON_PLAY}
              </TransportButton>
              <TransportButton label="Next patch" onClick={() => gotoBank(1)}>{ICON_NEXT}</TransportButton>
            </div>
        </div>
        <div className="mt-[2px] flex items-center justify-center gap-1 mono text-xs normal-case tracking-[0.06em] text-muted-foreground/80 leading-none">
          <span>/*</span>
          <SandboxNavLink href="/sandbox" label="sandbox" />
          <span>{siteConfig.sandboxVersion}</span>
          <span>*/</span>
        </div>


      </div>
    </section>
  );
};

export default Hero;
