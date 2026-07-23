import { useCallback, useEffect, useRef, useState } from "react";
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

const ICON_DOWNLOAD = <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden><path d="M8 1v10M4 7l4 4 4-4M2 13h12" stroke="currentColor" strokeWidth="1.5" fill="none" /></svg>;



export const Hero = ({ patchSlug }: { patchSlug?: string }) => {
  const [sandboxLoaded, setSandboxLoaded] = useState(false);
  // Live engine state synced from the sandbox via postMessage.
  const [liveEnabled, setLiveEnabled] = useState(false);
  const [liveSpeed, setLiveSpeed] = useState(1);
  // The route (e.g. /reverb, /shootingstar) selects which patch the single hero
  // sandbox loads. Unknown/absent slugs fall back to the first bank patch.
  // This is the *initial* index; prev/next cycle the sandbox without changing
  // the URL, so we track the active bank position in local state.
  const routePatchIndex = SOUNDEMOTE_BANK.findIndex((p) => p.slug === patchSlug);
  const initialPatchIndex = routePatchIndex >= 0 ? routePatchIndex : 0;
  const [currentBankIndex, setCurrentBankIndex] = useState(initialPatchIndex);

  // Sync local state when the route changes (someone navigated to a different URL).
  useEffect(() => {
    setCurrentBankIndex(initialPatchIndex);
  }, [patchSlug, initialPatchIndex]);
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
  const currentPatch = SOUNDEMOTE_BANK[currentBankIndex];

  // Keep a live ref to the current patch label so the message listener
  // (registered once) always uses the currently-selected patch's name.
  const currentLabelRef = useRef(currentPatch.label);
  useEffect(() => {
    currentLabelRef.current = currentPatch.label;
  }, [currentPatch.label]);

  // Send a postMessage into the sandbox iframe.
  const postToSandbox = useCallback((message: unknown) => {
    try {
      iframeRef.current?.contentWindow?.postMessage(message, "*");
    } catch (_) { /* iframe not ready */ }
  }, []);

  const isPlaying = liveEnabled && liveSpeed > 0;
  const isPaused = liveEnabled && liveSpeed === 0;

  // Prev/next: cycle the patch locally without changing the URL.
  const gotoBank = useCallback(
    (delta: number) => {
      const n = SOUNDEMOTE_BANK.length;
      setCurrentBankIndex((prev) => (prev + delta + n) % n);
    },
    [],
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
  // If the sandbox hasn't been loaded yet, load it first (like clicking the hero image).
  const handlePlay = useCallback(() => {
    if (!sandboxLoaded) {
      setSandboxLoaded(true);
      return;
    }
    if (isPaused) {
      postToSandbox({ type: "soundemote:set-live-speed", speed: 1 });
    } else {
      postToSandbox({ type: "soundemote:set-live-output", enabled: true });
      postToSandbox({ type: "soundemote:set-live-speed", speed: 1 });
    }
  }, [isPaused, postToSandbox, sandboxLoaded]);

  // Transport: Pause — freeze the engine (speed → 0).
  const handlePause = useCallback(() => {
    postToSandbox({ type: "soundemote:set-live-speed", speed: 0 });
  }, [postToSandbox]);

  // Transport: Stop — tear down the audio engine entirely, reset speed.
  const handleStop = useCallback(() => {
    postToSandbox({ type: "soundemote:set-live-output", enabled: false });
    postToSandbox({ type: "soundemote:set-live-speed", speed: 1 });
  }, [postToSandbox]);

  const handleDownload = useCallback(() => {
    postToSandbox({ type: "soundemote:render-sample" });
  }, [postToSandbox]);

  // Listen for messages from the sandbox.
  useEffect(() => {
    if (!sandboxLoaded) return;
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === "soundemote:live-output-changed") {
        setLiveEnabled(Boolean(event.data.enabled));
        const rawSpeed = event.data.speed;
        setLiveSpeed(rawSpeed != null ? Number(rawSpeed) : 1);
      }
      if (event.data?.type === "soundemote:rendered-sample" && event.data?.url) {
        const a = document.createElement("a");
        a.href = event.data.url;
        a.download = `${currentLabelRef.current.replace(/\s+/g, "_")}.wav`;
        a.click();
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
    if (lastPostedRef.current === currentBankIndex) return;
    lastPostedRef.current = currentBankIndex;
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
  }, [currentPatch.label, currentPatch.url, currentBankIndex]);

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

          {/* ── Outside Media Player ── */}
          <div className="flex w-full max-w-[900px] items-center justify-between gap-2 px-2 py-1 rounded-sm border border-scope/20 bg-[#0a0c14]">
            {/* Transport */}
            <div role="toolbar" aria-label="Media transport" className="flex items-center gap-1">
              <TransportButton label="Previous patch" onClick={() => gotoBank(-1)}>{ICON_PREV}</TransportButton>
              <TransportButton label="Stop" onClick={handleStop}>{ICON_STOP}</TransportButton>
              <button
                type="button"
                onClick={isPlaying ? handlePause : handlePlay}
                aria-label={isPlaying ? "Pause" : "Play"}
                aria-pressed={isPlaying}
                title={isPlaying ? "Pause" : "Play"}
                className={
                  "inline-flex h-9 w-9 items-center justify-center rounded-sm border transition-colors " +
                  "focus:outline-none focus-visible:ring-1 focus-visible:ring-scope/60 " +
                  (isPlaying
                    ? "border-scope/60 bg-scope/15 text-scope"
                    : "border-scope/25 bg-transparent text-scope/60 hover:bg-scope/10 hover:text-scope")
                }
              >
                {isPaused ? ICON_PLAY : isPlaying ? ICON_PAUSE : ICON_PLAY}
              </button>
              <TransportButton label="Next patch" onClick={() => gotoBank(1)}>{ICON_NEXT}</TransportButton>
            </div>

            {/* Time display */}
            <div className="hidden sm:flex items-center gap-1.5 mono text-[0.65rem] tracking-[0.06em] text-scope/60">
              <span className="text-scope/40">0:00</span>
              <span className="text-scope/20">/</span>
              <span>0:00</span>
            </div>

            {/* Waveform placeholder */}
            <div className="hidden sm:block h-8 flex-1 rounded-sm border border-scope/15 bg-[#03050a] opacity-50" aria-hidden />

            {/* Download button */}
            <button
              type="button"
              onClick={handleDownload}
              className="mono inline-flex items-center gap-1 rounded-sm border border-scope/40 px-2 py-1 text-[0.65rem] uppercase tracking-[0.14em] text-scope/80 transition-colors hover:border-scope/60 hover:text-scope hover:bg-scope/10"
              aria-label="Download rendered sample"
              title="Download WAV"
            >
              {ICON_DOWNLOAD}
              Download
            </button>
          </div>
        </div>
        <div className="mt-[2px] flex items-center justify-center gap-1 mono text-xs normal-case tracking-[0.06em] text-muted-foreground/80 leading-none">
          <span>/*</span>
          <SandboxNavLink href="/sandbox" label="sandbox" />
          <span>{siteConfig.sandboxVersion}</span>
          <span>*/</span>
        </div>

        <div className="mt-3 flex items-center justify-center gap-2">
          <a
            href="https://github.com/soundemote/soemdsp-sandbox"
            target="_blank"
            rel="noopener noreferrer"
            className="mono inline-flex items-center gap-1.5 rounded-sm border border-dashed border-muted-foreground/30 px-3 py-1 text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground/60 transition-colors hover:border-muted-foreground/50 hover:text-muted-foreground/80"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-3 w-3"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
              <path d="M14 2v4a2 2 0 0 0 2 2h4" />
            </svg>
            <span>under construction</span>
            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" x2="21" y1="14" y2="3" />
            </svg>
          </a>
        </div>

      </div>
    </section>
  );
};

export default Hero;
