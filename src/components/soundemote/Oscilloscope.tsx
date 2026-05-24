import { useEffect, useRef } from "react";

export const Oscilloscope = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let t = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      ctx.clearRect(0, 0, w, h);

      // Layered waveforms
      const layers = [
        { amp: h * 0.18, freq: 0.012, speed: 0.04, color: "hsla(165, 90%, 60%, 0.9)", width: 1.6, glow: 16 },
        { amp: h * 0.12, freq: 0.022, speed: 0.07, color: "hsla(190, 95%, 65%, 0.7)", width: 1.2, glow: 10 },
        { amp: h * 0.08, freq: 0.04, speed: 0.11, color: "hsla(150, 100%, 70%, 0.4)", width: 1.0, glow: 6 },
      ];

      layers.forEach((L, i) => {
        ctx.beginPath();
        ctx.strokeStyle = L.color;
        ctx.lineWidth = L.width;
        ctx.shadowColor = L.color;
        ctx.shadowBlur = L.glow;
        for (let x = 0; x <= w; x += 1) {
          const y =
            h / 2 +
            Math.sin(x * L.freq + t * L.speed) * L.amp * Math.sin(t * 0.01 + i) +
            Math.sin(x * L.freq * 2.3 + t * L.speed * 1.7) * (L.amp * 0.3);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      ctx.shadowBlur = 0;
      t += 1;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border border-border bg-[var(--gradient-panel)] scope-grid">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-2 mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-scope animate-pulse-glow" />
          scope · ch1
        </div>
        <span>20ms / div</span>
        <span className="text-scope">● rec</span>
      </div>
      <canvas ref={canvasRef} className="h-[calc(100%-2.25rem)] w-full" aria-label="Animated oscilloscope waveform" />
      {/* Sweep */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-scope/10 to-transparent animate-scope-sweep" />
      </div>
    </div>
  );
};

export default Oscilloscope;