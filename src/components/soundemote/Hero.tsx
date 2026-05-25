import { useRef, useState } from "react";
import Oscilloscope, { type HSL, type OscilloscopeRef } from "./Oscilloscope";
import { ATTRACTOR_ORDER, ATTRACTORS, type AttractorKind } from "./attractors";

const HSPicker = ({
  label,
  color,
  onChange,
}: {
  label: string;
  color: HSL;
  onChange: (c: HSL) => void;
}) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const handleXY = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = boxRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    const y = Math.max(0, Math.min(1, (e.clientY - r.top) / r.height));
    onChange({ h: x * 360, s: 1 - y, l: color.l });
  };
  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    handleXY(e);
  };
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).hasPointerCapture?.(e.pointerId)) handleXY(e);
  };
  const previewBg = `hsl(${color.h.toFixed(0)} ${(color.s * 100).toFixed(0)}% ${(color.l * 100).toFixed(0)}%)`;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/70 flex items-center gap-1.5">
        <span
          className="inline-block h-2 w-2 rounded-full border border-border/60"
          style={{ background: previewBg }}
          aria-hidden
        />
        {label}
      </div>
      <div
        ref={boxRef}
        onPointerDown={onDown}
        onPointerMove={onMove}
        className="relative h-16 w-16 cursor-crosshair rounded-sm border border-border/60 touch-none"
        style={{
          background:
            "linear-gradient(to bottom, transparent, hsl(0 0% 50%)), linear-gradient(to right, hsl(0 100% 50%), hsl(60 100% 50%), hsl(120 100% 50%), hsl(180 100% 50%), hsl(240 100% 50%), hsl(300 100% 50%), hsl(360 100% 50%))",
        }}
        aria-label={`${label} hue saturation`}
      >
        <div
          className="pointer-events-none absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-warm-white shadow-[0_0_4px_rgba(0,0,0,0.8)]"
          style={{ left: `${(color.h / 360) * 100}%`, top: `${(1 - color.s) * 100}%` }}
        />
      </div>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={color.l}
        onChange={(e) => onChange({ ...color, l: parseFloat(e.target.value) })}
        className="h-1 w-16 cursor-pointer accent-scope appearance-none bg-border/40 rounded-full"
        aria-label={`${label} lightness`}
      />
    </div>
  );
};

export const Hero = () => {
  const [kind, setKind] = useState<AttractorKind>("lorenz");
  const [tracerColor, setTracerColor] = useState<HSL>({ h: 157, s: 0.84, l: 0.54 });
  const [bgColor, setBgColor] = useState<HSL>({ h: 0, s: 0, l: 0 });
  return (
  <section id="top" className="relative overflow-hidden pt-32 pb-24 md:pt-40 md:pb-32">
    <div className="absolute inset-0 scope-grid opacity-40" aria-hidden />
    <div className="absolute inset-0 bg-[var(--gradient-hero)]" aria-hidden />
    <div className="container relative max-w-3xl mx-auto text-center animate-fade-in">
      <p className="mono tracking-[0.35em] text-scope mb-6 normal-case lowercase font-medium text-3xl font-sans">
        ⋆⁺₊✧ soemdsp ✧₊⁺⋆
      </p>
      <p className="mt-8 mx-auto max-w-xl text-lg leading-relaxed text-muted-foreground" />
      
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <a
          href="#projects"
          className="group inline-flex items-center gap-2 rounded-full bg-scope px-6 py-3 mono text-xs uppercase tracking-[0.2em] text-primary-foreground transition-all hover:shadow-[0_0_30px_hsl(var(--scope)/0.6)]"
        >
          Explore Projects
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </a>
        <a
          href="https://discord.gg/hjpBC8kZ3s"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 mono text-xs uppercase tracking-[0.2em] text-warm-white hover:border-scope/60 hover:text-scope transition-colors"
        >
          Join Discord
        </a>
      </div>
      <div className="max-w-xl mx-auto mt-16 flex flex-wrap items-center justify-center gap-2">
        {ATTRACTOR_ORDER.map((k) => {
          const active = k === kind;
          return (
            <button
              key={k}
              type="button"
              onClick={() => setKind(k)}
              className={`rounded-full border px-3 py-1.5 mono text-[10px] uppercase tracking-[0.2em] transition-colors ${
                active
                  ? "border-scope/70 text-scope bg-scope/10 shadow-[0_0_18px_hsl(var(--scope)/0.35)]"
                  : "border-border/60 text-muted-foreground hover:text-scope hover:border-scope/40"
              }`}
              aria-pressed={active}
            >
              {ATTRACTORS[k].label}
            </button>
          );
        })}
      </div>
      <div className="relative aspect-[5/4] w-full max-w-xl mx-auto mt-3 animate-fade-in [animation-delay:200ms]">
        <Oscilloscope kind={kind} tracerColor={tracerColor} bgColor={bgColor} />
      </div>
      <div className="max-w-xl mx-auto mt-2 flex justify-start mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
        drag to pan · scroll to zoom
      </div>
      <div className="max-w-xl mx-auto mt-3 flex justify-center gap-6">
        <HSPicker label="bg" color={bgColor} onChange={setBgColor} />
        <HSPicker label="tracer" color={tracerColor} onChange={setTracerColor} />
      </div>
      <div className="mt-12 grid grid-cols-3 max-w-md mx-auto gap-6 mono text-xs text-muted-foreground">
        <div>
          <div className="text-scope text-2xl display">04</div>
          open projects
        </div>
        <div>
          <div className="text-scope text-2xl display">C++</div>
          CLAP / DSP
        </div>
        <div>
          <div className="text-scope text-2xl display">MIT</div>
          open source
        </div>
      </div>
    </div>
  </section>
  );
};

export default Hero;