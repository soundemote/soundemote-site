import { useCallback, useEffect, useMemo, useState } from "react";
import {
  SOUNDEMOTE_BANK,
  type BankAudius,
  type BankVideo,
} from "@/data/patchBank";

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

type HeroMedia = BankVideo | BankAudius;

const MEDIA_VIEWPORT_HEIGHT = "560px";

/** Hero playlist: videos + Audius only (no sandbox patch embeds). */
function heroMediaBank(): HeroMedia[] {
  return SOUNDEMOTE_BANK.filter(
    (item): item is HeroMedia => item.kind === "video" || item.kind === "audius",
  );
}

export const Hero = ({ patchSlug }: { patchSlug?: string }) => {
  const mediaBank = useMemo(() => heroMediaBank(), []);
  const routeMediaIndex = mediaBank.findIndex((item) => item.slug === patchSlug);
  const initialIndex = routeMediaIndex >= 0 ? routeMediaIndex : 0;
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [patchSlug, initialIndex]);

  const current = mediaBank[currentIndex] ?? mediaBank[0];
  const isVideo = current?.kind === "video";
  const isAudius = current?.kind === "audius";

  const gotoBank = useCallback(
    (delta: number) => {
      const n = mediaBank.length;
      if (n === 0) return;
      setCurrentIndex((prev) => (prev + delta + n) % n);
    },
    [mediaBank.length],
  );

  if (!current) return null;

  return (
    <section id="top" className="relative overflow-hidden py-6 md:py-8">
      <div className="absolute inset-0 scope-grid opacity-40" aria-hidden />
      <div className="absolute inset-0 bg-[var(--gradient-hero)]" aria-hidden />
      <div className="relative mx-auto flex min-h-[56vh] max-w-6xl flex-col items-center justify-center animate-fade-in px-4 text-center md:min-h-[62vh]">
        <h1 className="sr-only">
          Soundemote — audio-visual DSP instruments and signal-reactive visual tools for electronic music producers and VJs
        </h1>
        <div className="mx-auto w-full animate-fade-in [animation-delay:200ms]">
          <div className="relative flex w-full max-w-[900px] mx-auto justify-center overflow-hidden bg-transparent">
            {isVideo ? (
              <div
                className="w-full overflow-hidden bg-black"
                style={{ height: MEDIA_VIEWPORT_HEIGHT }}
              >
                <iframe
                  title={current.label}
                  src={`https://www.youtube.com/embed/${current.youtubeId}?rel=0`}
                  className="h-full w-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              </div>
            ) : isAudius ? (
              <div
                className="flex w-full items-center justify-center overflow-hidden bg-black"
                style={{ height: MEDIA_VIEWPORT_HEIGHT }}
              >
                <iframe
                  title={current.label}
                  src={`https://audius.co/embed/playlist/${current.audiusId}?flavor=card`}
                  className="h-full w-full max-w-[900px] border-0"
                  allow="encrypted-media"
                />
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-[2px] flex w-full flex-col items-center gap-[2px]">
          <span className="mono flex min-w-[10rem] flex-col items-center text-xs uppercase tracking-[0.18em] text-scope leading-none">
            {current.label}
          </span>

          {/* ── Outside Media Player ── */}
          <div
            role="toolbar"
            aria-label="Media transport"
            className="inline-flex items-center gap-1 rounded-sm border border-scope/20 bg-[#0a0c14] p-1"
          >
            <TransportButton label="Previous track" onClick={() => gotoBank(-1)}>
              {ICON_PREV}
            </TransportButton>
            <TransportButton label="Next track" onClick={() => gotoBank(1)}>
              {ICON_NEXT}
            </TransportButton>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;