import { useRef, useState } from "react";
import Nav from "@/components/soundemote/Nav";
import StarField from "@/components/soundemote/StarField";
import Oscilloscope, { type HSL, type OscilloscopeRef } from "@/components/soundemote/Oscilloscope";
import { ATTRACTORS, ATTRACTOR_ORDER, type AttractorKind } from "@/components/soundemote/attractors";

const ColorSlider = ({
  label,
  color,
  onChange,
}: {
  label: string;
  color: HSL;
  onChange: (color: HSL) => void;
}) => (
  <div className="grid gap-2">
    <div className="mono flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
      <span>{label}</span>
      <span style={{ color: `hsl(${color.h} ${color.s * 100}% ${color.l * 100}%)` }}>●</span>
    </div>
    <input
      type="range"
      min={0}
      max={360}
      step={1}
      value={color.h}
      onChange={(e) => onChange({ ...color, h: Number(e.target.value) })}
      className="h-1 w-full cursor-pointer appearance-none rounded-full bg-border/50 accent-scope"
      aria-label={`${label} hue`}
    />
    <input
      type="range"
      min={0}
      max={1}
      step={0.01}
      value={color.l}
      onChange={(e) => onChange({ ...color, l: Number(e.target.value) })}
      className="h-1 w-full cursor-pointer appearance-none rounded-full bg-border/50 accent-scope"
      aria-label={`${label} lightness`}
    />
  </div>
);

const OscilloscopePage = () => {
  const [kind, setKind] = useState<AttractorKind>("lorenz");
  const [tracerColor, setTracerColor] = useState<HSL>({ h: 157, s: 0.84, l: 0.54 });
  const [bgColor, setBgColor] = useState<HSL>({ h: 0, s: 0, l: 0 });
  const scopeRef = useRef<OscilloscopeRef>(null);

  return (
    <main className="min-h-screen text-foreground">
      <StarField />
      <Nav />
      <section className="relative px-4 pb-8 pt-24 md:px-6">
        <div className="mx-auto flex w-full max-w-[1800px] flex-col gap-4">
          <div className="flex flex-col gap-4 rounded-lg border border-border/60 bg-background/70 p-4 backdrop-blur-sm md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mono text-[10px] uppercase tracking-[0.3em] text-scope">/* oscilloscope */</p>
              <h1 className="display mt-2 text-3xl text-warm-white">Prettyscope web surface</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {ATTRACTOR_ORDER.map((attractor) => {
                const active = attractor === kind;
                return (
                  <button
                    key={attractor}
                    type="button"
                    onClick={() => setKind(attractor)}
                    className={`rounded-full border px-3 py-1.5 mono text-[10px] uppercase tracking-[0.18em] transition-colors ${
                      active
                        ? "border-scope/70 bg-scope/10 text-scope"
                        : "border-border/60 text-muted-foreground hover:border-scope/40 hover:text-scope"
                    }`}
                    aria-pressed={active}
                  >
                    {ATTRACTORS[attractor].label}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => scopeRef.current?.reset()}
                className="rounded-full border border-red-500/40 px-3 py-1.5 mono text-[10px] uppercase tracking-[0.18em] text-red-400/70 transition-colors hover:border-red-400 hover:text-red-300"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="relative mx-auto aspect-square w-[min(calc(100vw-2rem),calc(100vh-15rem),56rem)]">
            <Oscilloscope ref={scopeRef} kind={kind} tracerColor={tracerColor} bgColor={bgColor} />
          </div>

          <div className="grid gap-4 rounded-lg border border-border/60 bg-background/70 p-4 backdrop-blur-sm md:grid-cols-2">
            <ColorSlider label="Background" color={bgColor} onChange={setBgColor} />
            <ColorSlider label="Tracer" color={tracerColor} onChange={setTracerColor} />
          </div>
        </div>
      </section>
    </main>
  );
};

export default OscilloscopePage;
