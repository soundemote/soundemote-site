import { Link } from "react-router-dom";
import GradientCurveWidget from "@/good-code/gradient-curve-widget/GradientCurveWidget";

const GradientCurveSpotlight = ({ compact = false }: { compact?: boolean }) => (
  <section
    className={`relative z-20 w-full isolate rounded-xl border border-scope/40 bg-black/80 p-3 shadow-[0_0_80px_-20px_hsl(var(--scope)/0.75)] ${
      compact ? "" : "md:-mr-[24rem] md:w-[min(92vw,72rem)]"
    }`}
  >
    <div className="mb-3 flex flex-col gap-1 px-1 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="mono text-[0.65rem] uppercase tracking-[0.24em] text-scope">gradient engine prototype</p>
        <h2 className="display mt-1 text-2xl text-warm-white">The curve, rendered live</h2>
      </div>
      <Link
        to="/gradient-curve"
        className="mono text-xs uppercase tracking-[0.14em] text-scope underline underline-offset-4 hover:text-foreground"
      >
        open full workbench
      </Link>
    </div>
    <div
      className={`relative overflow-hidden rounded-lg border border-border/70 bg-[var(--gradient-panel)] ${
        compact ? "h-[min(54vh,28rem)] min-h-[22rem]" : "h-[min(58vh,34rem)] min-h-[26rem]"
      }`}
    >
      <GradientCurveWidget />
    </div>
  </section>
);

export default GradientCurveSpotlight;
