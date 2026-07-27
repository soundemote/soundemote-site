import { Link } from "react-router-dom";
import GradientCurveWidget from "@/good-code/gradient-curve-widget/GradientCurveWidget";

const BEZIER_CONTROLS_SRC = "/apps/bezier-controls/index.html?embed=1";

const GradientCurveSpotlight = ({ compact = false }: { compact?: boolean }) => (
  <section
    className={`relative z-20 w-full isolate rounded-xl border border-scope/40 bg-black/80 p-3 shadow-[0_0_80px_-20px_hsl(var(--scope)/0.75)] ${
      compact ? "" : "md:-mr-[24rem] md:w-[min(92vw,72rem)]"
    }`}
  >
    <div className="mb-3 flex flex-col gap-1 px-1 md:flex-row md:items-end md:justify-between">
      <div>
        <span className="mono text-[0.6rem] uppercase tracking-[0.2em] text-scope/60 mt-2">gradient engine prototype build 9</span>
      </div>
      <Link
        to="/gradient-curve"
        className="mono text-xs uppercase tracking-[0.14em] text-scope underline underline-offset-4 hover:text-foreground"
      >
        open full workbench
      </Link>
    </div>
    <div
      className={`relative rounded-lg border border-border/70 bg-[var(--gradient-panel)] ${
        compact ? "min-h-[28rem]" : "min-h-[34rem]"
      }`}
    >
      <GradientCurveWidget />
    </div>

    {/* Bezier control surface — static app under public/apps/ */}
    <div className="mt-3 flex flex-col gap-1 px-1 md:flex-row md:items-end md:justify-between">
      <div>
        <span className="mono text-[0.6rem] uppercase tracking-[0.2em] text-scope/60">
          bezier control surface
        </span>
      </div>
      <a
        href="/apps/bezier-controls/index.html"
        target="_blank"
        rel="noreferrer"
        className="mono text-xs uppercase tracking-[0.14em] text-scope underline underline-offset-4 hover:text-foreground"
      >
        open full page
      </a>
    </div>
    <div className="relative mt-2 overflow-hidden rounded-lg border border-border/70 bg-[#121214]">
      <iframe
        title="Bezier controls"
        src={BEZIER_CONTROLS_SRC}
        className="block w-full border-0 bg-[#121214]"
        style={{ height: compact ? "52rem" : "58rem" }}
        loading="lazy"
      />
    </div>
  </section>
);

export default GradientCurveSpotlight;
