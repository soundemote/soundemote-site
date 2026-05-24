import { useEffect, useRef } from "react";

export const Oscilloscope = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let dpr = window.devicePixelRatio || 1;

    const resize = () => {
      dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Prime background so the phosphor fade has something to blend into
      ctx.fillStyle = "hsla(0, 0%, 0%, 1)";
      ctx.fillRect(0, 0, rect.width, rect.height);
    };
    resize();
    window.addEventListener("resize", resize);

    // Lorenz system parameters (classic chaotic regime)
    const sigma = 10;
    const rho = 28;
    const beta = 8 / 3;
    let x = 0.01;
    let y = 0;
    let z = 0;
    const dt = 0.006;
    const stepsPerFrame = 24;
    // Lorenz attractor bounds (approx): x ±20, y ±27, z 0..50
    const scale = 0.018; // fraction of min(w,h) per unit

    let prevPx: number | null = null;
    let prevPy: number | null = null;

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const s = Math.min(w, h) * scale;
      const cx = w / 2;
      const cy = h / 2;

      // Phosphor decay — fade prior frame toward black
      ctx.fillStyle = "hsla(0, 0%, 0%, 0.12)";
      ctx.fillRect(0, 0, w, h);

      ctx.lineWidth = 1.1;
      ctx.lineCap = "round";
      ctx.shadowColor = "hsla(165, 95%, 60%, 0.9)";
      ctx.shadowBlur = 12;
      ctx.strokeStyle = "hsla(165, 95%, 65%, 0.9)";

      ctx.beginPath();
      for (let i = 0; i < stepsPerFrame; i++) {
        // Runge-Kutta-ish: simple Euler is fine at this dt
        const dx = sigma * (y - x);
        const dy = x * (rho - z) - y;
        const dz = x * y - beta * z;
        x += dx * dt;
        y += dy * dt;
        z += dz * dt;

        // Project XZ to screen (classic butterfly view)
        const px = cx + x * s * 8;
        const py = cy + (z - 25) * s * 8;

        if (prevPx === null || prevPy === null) {
          ctx.moveTo(px, py);
        } else {
          ctx.moveTo(prevPx, prevPy);
          ctx.lineTo(px, py);
        }
        prevPx = px;
        prevPy = py;
      }
      ctx.stroke();

      ctx.shadowBlur = 0;
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
          xy scope · lorenz
        </div>
        <span>σ=10 ρ=28 β=8/3</span>
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