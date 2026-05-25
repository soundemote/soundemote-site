import { useState } from "react";
import Oscilloscope from "./Oscilloscope";
import { ATTRACTOR_ORDER, ATTRACTORS, type AttractorKind } from "./attractors";

// HSL → RGB (h: 0..360, s/l: 0..1)
const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = (h % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r = 0, g = 0, b = 0;
  if (hp < 1)      [r, g, b] = [c, x, 0];
  else if (hp < 2) [r, g, b] = [x, c, 0];
  else if (hp < 3) [r, g, b] = [0, c, x];
  else if (hp < 4) [r, g, b] = [0, x, c];
  else if (hp < 5) [r, g, b] = [x, 0, c];
  else             [r, g, b] = [c, 0, x];
  const m = l - c / 2;
  return [r + m, g + m, b + m];
};

const HslWidget = ({
  label,
  h, s, l,
  onChange,
}: {
  label: string;
  h: number; s: number; l: number;
  onChange: (h: number, s: number, l: number) => void;
}) => {
  const [r, g, b] = hslToRgb(h, s, l);
  const swatch = `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
  const row = (k: "H" | "S" | "L", val: number, min: number, max: number, step: number) => (
    <label className="flex items-center gap-2 mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
      <span className="w-3 text-scope">{k}</span>
      <input
        type="range"
        min={min} max={max} step={step}
        value={val}
        onChange={(e) => {
          const n = parseFloat(e.target.value);
          if (k === "H") onChange(n, s, l);
          else if (k === "S") onChange(h, n, l);
          else onChange(h, s, n);
        }}
        className="flex-1 accent-scope h-1"
      />
      <span className="w-7 text-right tabular-nums text-foreground/80">
        {k === "H" ? Math.round(val) : Math.round(val * 100)}
      </span>
    </label>
  );
  return (
    <div className="rounded-lg border border-border/60 bg-background/40 backdrop-blur-sm p-3 w-full flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span
          className="w-4 h-4 rounded-sm border border-border/60"
          style={{ background: swatch }}
          aria-hidden
        />
        <span className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          {label}
        </span>
      </div>
      {row("H", h, 0, 360, 1)}
      {row("S", s, 0, 1, 0.01)}
      {row("L", l, 0, 1, 0.01)}
    </div>
  );
};

export const Hero = () => {
  const [kind, setKind] = useState<AttractorKind>("lorenz");
  // bg: black, trace: scope green
  const [bgHsl, setBgHsl] = useState<[number, number, number]>([0, 0, 0]);
  const [traceHsl, setTraceHsl] = useState<[number, number, number]>([140, 0.82, 0.56]);
  const bgRgb = hslToRgb(bgHsl[0], bgHsl[1], bgHsl[2]);
  const traceRgb = hslToRgb(traceHsl[0], traceHsl[1], traceHsl[2]);
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
      <div className="mt-3 flex items-stretch justify-center gap-3 animate-fade-in [animation-delay:200ms]">
        <div className="hidden md:flex w-40 shrink-0 items-start pt-2">
          <HslWidget
            label="background"
            h={bgHsl[0]} s={bgHsl[1]} l={bgHsl[2]}
            onChange={(h, s, l) => setBgHsl([h, s, l])}
          />
        </div>
        <div className="relative aspect-[5/4] w-full max-w-xl">
          <Oscilloscope kind={kind} bgColor={bgRgb} traceColor={traceRgb} />
        </div>
        <div className="hidden md:flex w-40 shrink-0 items-start pt-2">
          <HslWidget
            label="trace"
            h={traceHsl[0]} s={traceHsl[1]} l={traceHsl[2]}
            onChange={(h, s, l) => setTraceHsl([h, s, l])}
          />
        </div>
      </div>
      <div className="md:hidden max-w-xl mx-auto mt-3 grid grid-cols-2 gap-3 text-left">
        <HslWidget
          label="background"
          h={bgHsl[0]} s={bgHsl[1]} l={bgHsl[2]}
          onChange={(h, s, l) => setBgHsl([h, s, l])}
        />
        <HslWidget
          label="trace"
          h={traceHsl[0]} s={traceHsl[1]} l={traceHsl[2]}
          onChange={(h, s, l) => setTraceHsl([h, s, l])}
        />
      </div>
      <div className="max-w-xl mx-auto mt-2 flex justify-start mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
        drag to pan · scroll to zoom
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