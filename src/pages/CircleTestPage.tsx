import { useEffect, useRef, useState } from "react";
import Nav from "@/components/soundemote/Nav";
import StarField from "@/components/soundemote/StarField";

const CircleTestPage = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [frequency, setFrequency] = useState(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (now: number) => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const side = Math.min(w, h);
      const x0 = (w - side) / 2;
      const y0 = (h - side) / 2;
      const cx = x0 + side / 2;
      const cy = y0 + side / 2;
      const r = side * 0.38;
      const t = (now / 1000) * frequency;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "hsl(230 30% 5% / 0.72)";
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = "hsl(165 85% 55% / 0.18)";
      ctx.lineWidth = 1;
      ctx.strokeRect(x0 + 0.5, y0 + 0.5, side - 1, side - 1);

      ctx.save();
      ctx.beginPath();
      ctx.rect(x0, y0, side, side);
      ctx.clip();

      ctx.strokeStyle = "hsl(165 85% 55% / 0.22)";
      ctx.lineWidth = 1;
      for (let i = 1; i < 8; i++) {
        const p = x0 + (side * i) / 8;
        ctx.beginPath();
        ctx.moveTo(p, y0);
        ctx.lineTo(p, y0 + side);
        ctx.moveTo(x0, p);
        ctx.lineTo(x0 + side, p);
        ctx.stroke();
      }

      ctx.shadowColor = "hsl(165 100% 70%)";
      ctx.shadowBlur = 14;
      ctx.strokeStyle = "hsl(165 100% 70%)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let i = 0; i <= 512; i++) {
        const a = (i / 512) * Math.PI * 2;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      const px = cx + Math.cos(t * Math.PI * 2) * r;
      const py = cy + Math.sin(t * Math.PI * 2) * r;
      ctx.fillStyle = "hsl(40 40% 95%)";
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [frequency]);

  return (
    <main className="min-h-screen text-foreground">
      <StarField />
      <Nav />
      <section className="relative px-4 pb-8 pt-24 md:px-6">
        <div className="mx-auto flex w-full max-w-[1800px] flex-col gap-4">
          <div className="flex flex-col gap-4 rounded-lg border border-border/60 bg-background/70 p-4 backdrop-blur-sm md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mono text-[10px] uppercase tracking-[0.3em] text-accent">/* circle test */</p>
              <h1 className="display mt-2 text-3xl text-warm-white">Sin / cos skew check</h1>
            </div>
            <label className="mono grid min-w-64 gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              <span>Frequency {frequency.toFixed(2)} Hz</span>
              <input
                type="range"
                min={0.05}
                max={8}
                step={0.01}
                value={frequency}
                onChange={(e) => setFrequency(Number(e.target.value))}
                className="h-1 cursor-pointer appearance-none rounded-full bg-border/50 accent-scope"
              />
            </label>
          </div>
          <div className="relative h-[min(72vh,calc((100vw-2rem)*0.58))] min-h-[28rem] w-full overflow-hidden rounded-xl border border-border bg-[var(--gradient-panel)] scope-grid">
            <canvas ref={canvasRef} className="h-full w-full" aria-label="Animated sin cos circle skew test" />
          </div>
        </div>
      </section>
    </main>
  );
};

export default CircleTestPage;
