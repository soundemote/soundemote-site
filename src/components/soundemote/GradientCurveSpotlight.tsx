import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import GradientCurveWidget from "@/good-code/gradient-curve-widget/GradientCurveWidget";

const BEZIER_CONTROLS_SRC = "/apps/bezier-controls/index.html?embed=1";
/** Fallback until embed posts measured content height */
const BEZIER_IFRAME_FALLBACK_H = 650;

const BezierControlsEmbed = () => {
  const [height, setHeight] = useState(BEZIER_IFRAME_FALLBACK_H);

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      const data = e.data;
      if (
        data &&
        data.type === "bezier-controls-height" &&
        typeof data.height === "number" &&
        Number.isFinite(data.height) &&
        data.height > 100
      ) {
        setHeight(Math.ceil(data.height));
      }
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);

  return (
    <section className="mx-auto w-full max-w-[920px] overflow-hidden rounded-xl border border-scope/40 bg-[#121214] shadow-[0_0_80px_-20px_hsl(var(--scope)/0.75)]">
      {/* Labels above the app — not floating over View/Grid/Actions */}
      <div className="flex items-center justify-between gap-3 px-2.5 pb-1 pt-1.5">
        <span className="mono text-[0.6rem] uppercase tracking-[0.2em] text-scope/60">
          bezier control surface
        </span>
        <a
          href="/apps/bezier-controls/index.html"
          target="_blank"
          rel="noreferrer"
          className="mono text-[0.65rem] uppercase tracking-[0.14em] text-scope underline underline-offset-4 hover:text-foreground"
        >
          open workbench
        </a>
      </div>
      <iframe
        title="Bezier controls"
        src={BEZIER_CONTROLS_SRC}
        className="block w-full border-0 bg-[#121214] align-top"
        scrolling="no"
        style={{ height, overflow: "hidden" }}
        loading="lazy"
      />
    </section>
  );
};

const GradientCurveSpotlight = ({ compact = false }: { compact?: boolean }) => (
  <div
    className={`relative z-20 flex w-full flex-col gap-2.5 isolate ${
      compact ? "" : "md:-mr-[24rem] md:w-[min(92vw,72rem)]"
    }`}
  >
    {/* ── Gradient engine ─────────────────────────────── */}
    <section className="rounded-xl border border-scope/40 bg-black/80 p-3 shadow-[0_0_80px_-20px_hsl(var(--scope)/0.75)]">
      <div className="mb-3 flex flex-col gap-1 px-1 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="mono text-[0.6rem] uppercase tracking-[0.2em] text-scope/60 mt-2">
            gradient engine prototype build 9
          </span>
        </div>
        <Link
          to="/gradient-curve"
          className="mono text-xs uppercase tracking-[0.14em] text-scope underline underline-offset-4 hover:text-foreground"
        >
          open workbench
        </Link>
      </div>
      <div
        className={`relative rounded-lg border border-border/70 bg-[var(--gradient-panel)] ${
          compact ? "min-h-[28rem]" : "min-h-[34rem]"
        }`}
      >
        <GradientCurveWidget />
      </div>
    </section>

    {/* ── Bezier control surface (10px gap via gap-2.5) ── */}
    <BezierControlsEmbed />
  </div>
);

export default GradientCurveSpotlight;
