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
    <div className="flex flex-col items-center gap-2">
      <div className="mono text-[0.625rem] uppercase tracking-[0.2em] text-muted-foreground/70 flex items-center gap-1.5">
        <span
          className="inline-block h-2.5 w-2.5 rounded-full border border-border/60"
          style={{ background: previewBg }}
          aria-hidden
        />
        {label}
      </div>
      <div
        ref={boxRef}
        onPointerDown={onDown}
        onPointerMove={onMove}
        className="relative h-20 w-20 cursor-crosshair rounded-sm border border-border/60 touch-none sm:h-24 sm:w-24"
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
        className="h-1.5 w-20 cursor-pointer accent-scope appearance-none bg-border/40 rounded-full sm:w-24"
        aria-label={`${label} lightness`}
      />
    </div>
  );
};

export const Hero = () => {
  const [kind, setKind] = useState<AttractorKind>("lorenz");
  const [tracerColor, setTracerColor] = useState<HSL>({ h: 157, s: 0.84, l: 0.54 });
  const [bgColor, setBgColor] = useState<HSL>({ h: 0, s: 0, l: 0 });
  const scopeRef = useRef<OscilloscopeRef>(null);
  return (
  <section id="top" className="relative overflow-hidden pt-14 pb-20 md:pt-20 md:pb-28">
    <div className="absolute inset-0 scope-grid opacity-40" aria-hidden />
    <div className="absolute inset-0 bg-[var(--gradient-hero)]" aria-hidden />
    <div className="container relative max-w-3xl mx-auto text-center animate-fade-in">
      <p className="mono mb-6 whitespace-nowrap text-base font-medium normal-case lowercase tracking-[0.16em] text-scope sm:text-2xl sm:tracking-[0.28em] md:text-3xl md:tracking-[0.35em] font-sans">
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
              className={`rounded-full border px-3 py-1.5 mono text-[0.625rem] uppercase tracking-[0.2em] transition-colors ${
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
      <div className="w-fit mx-auto mt-3 flex flex-col animate-fade-in [animation-delay:200ms]">
        <div className="flex items-stretch">
          <button
            type="button"
            onClick={() => scopeRef.current?.reset()}
            className="flex flex-col items-center justify-center rounded-l-xl border border-r-0 border-red-500/30 bg-background/50 px-1.5 text-red-500/40 transition-colors hover:border-red-500 hover:text-red-400 mono text-[0.625rem] uppercase tracking-[0.2em]"
            title="Reset coefficients, integrator state, and audio engine"
            aria-label="Reset"
          >
            <span>r</span>
            <span>e</span>
            <span>s</span>
            <span>e</span>
            <span>t</span>
          </button>
          <div id="hero-oscilloscope" className="relative aspect-[5/4] w-[36rem] max-w-[calc(100vw-6rem)]">
            <Oscilloscope ref={scopeRef} kind={kind} tracerColor={tracerColor} bgColor={bgColor} />
          </div>
          <div
            aria-hidden
            className="invisible flex flex-col items-center justify-center rounded-l-xl border border-r-0 px-1.5 mono text-[0.625rem] uppercase tracking-[0.2em]"
          >
            <span>r</span>
            <span>e</span>
            <span>s</span>
            <span>e</span>
            <span>t</span>
          </div>
        </div>
        <div className="mt-2 flex justify-start mono text-[0.625rem] uppercase tracking-[0.2em] text-muted-foreground/70">
          drag to pan · scroll to zoom
        </div>
        <div className="mt-6 flex justify-center gap-8">
          <HSPicker label="bg" color={bgColor} onChange={setBgColor} />
          <HSPicker label="tracer" color={tracerColor} onChange={setTracerColor} />
        </div>
      </div>
    </div>
  </section>
  );
};

export default Hero;
