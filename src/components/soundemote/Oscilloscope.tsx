import { useEffect, useRef, useState } from "react";
import { Minus, Plus } from "lucide-react";

export const Oscilloscope = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Live params held in refs so the rAF loop reads the latest values
  const zoomRef = useRef(1);
  const rotXRef = useRef(0.35); // tilt
  const rotYRef = useRef(0);    // spin
  const autoSpinRef = useRef(false);
  const panXRef = useRef(0);
  const panYRef = useRef(0);
  const traceWidthRef = useRef(2.2);
  const sigmaRef = useRef(16);
  const rhoRef = useRef(45.92);
  const betaRef = useRef(4);
  const [, setTick] = useState(0); // force re-render of overlay labels

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

    let x = 0.01;
    let y = 0;
    let z = 0;
    const dt = 0.006;
    const stepsPerFrame = 24;
    // Base scale chosen so zoom=1.0 shows the attractor at its most readable "default" size.
    // (What used to render at 0.3x zoom is now the 1.0x baseline.)
    const scale = 0.018 * 0.3 * 0.3;

    let prevPx: number | null = null;
    let prevPy: number | null = null;

    // Pointer drag to pan (move tracer origin)
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    const onDown = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      panXRef.current += e.clientX - lastX;
      panYRef.current += e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const onUp = (e: PointerEvent) => {
      dragging = false;
      try { canvas.releasePointerCapture(e.pointerId); } catch {}
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const next = zoomRef.current * (e.deltaY < 0 ? 1.1 : 0.9);
      zoomRef.current = Math.max(0.1, Math.min(20, next));
      setTick((n) => n + 1);
    };
    canvas.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const s = Math.min(w, h) * scale * zoomRef.current;
      const cx = w / 2 + panXRef.current;
      const cy = h / 2 + panYRef.current;

      if (autoSpinRef.current) rotYRef.current += 0.003;

      const sigma = sigmaRef.current;
      const rho = rhoRef.current;
      const beta = betaRef.current;

      const cosY = Math.cos(rotYRef.current);
      const sinY = Math.sin(rotYRef.current);
      const cosX = Math.cos(rotXRef.current);
      const sinX = Math.sin(rotXRef.current);

      // Phosphor decay — fade prior frame toward black
      ctx.fillStyle = "hsla(0, 0%, 0%, 0.12)";
      ctx.fillRect(0, 0, w, h);

      ctx.lineWidth = traceWidthRef.current;
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

        // Center attractor at origin, rotate, then project
        const x0 = x;
        const y0 = y;
        const z0 = z - 45;
        // Rotate around Y axis
        const xr = x0 * cosY + z0 * sinY;
        const zr = -x0 * sinY + z0 * cosY;
        // Rotate around X axis
        const yr = y0 * cosX - zr * sinX;
        // (zr2 unused for orthographic projection)
        const px = cx + xr * s * 8;
        const py = cy + yr * s * 8;

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
    // Periodically refresh overlay labels (rotation read-outs)
    const labelTimer = window.setInterval(() => setTick((n) => n + 1), 100);
    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(labelTimer);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("wheel", onWheel);
    };
  }, []);

  const adjustZoom = (factor: number) => {
    zoomRef.current = Math.max(0.1, Math.min(20, zoomRef.current * factor));
    setTick((n) => n + 1);
  };

  const adjustTrace = (delta: number) => {
    traceWidthRef.current = Math.max(0.4, Math.min(20, traceWidthRef.current + delta));
    setTick((n) => n + 1);
  };

  const radToDeg = (r: number) => ((r * 180) / Math.PI).toFixed(0);
  const wrapDeg = (d: number) => {
    let v = d % 360;
    if (v > 180) v -= 360;
    if (v < -180) v += 360;
    return v.toFixed(0);
  };

  const coeffInputClass =
    "w-12 bg-transparent border-b border-border/40 focus:border-scope outline-none text-foreground tabular-nums text-center";

  const sliderClass =
    "h-1 w-24 cursor-pointer accent-scope bg-border/40 rounded-full appearance-none";

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border border-border bg-[var(--gradient-panel)] scope-grid">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4 border-b border-border/60 px-4 py-2 mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-scope animate-pulse-glow" />
          xy scope · lorenz
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1">
            σ=
            <input
              type="number"
              step="0.1"
              defaultValue={sigmaRef.current}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                if (!Number.isNaN(v)) sigmaRef.current = v;
              }}
              className={coeffInputClass}
            />
          </label>
          <label className="flex items-center gap-1">
            ρ=
            <input
              type="number"
              step="0.1"
              defaultValue={rhoRef.current}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                if (!Number.isNaN(v)) rhoRef.current = v;
              }}
              className={coeffInputClass}
            />
          </label>
          <label className="flex items-center gap-1">
            β=
            <input
              type="number"
              step="0.1"
              defaultValue={betaRef.current}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                if (!Number.isNaN(v)) betaRef.current = v;
              }}
              className={coeffInputClass}
            />
          </label>
        </div>
        <span className="tabular-nums text-scope/80">
          rX={radToDeg(rotXRef.current)}° rY={wrapDeg((rotYRef.current * 180) / Math.PI)}°
        </span>
      </div>
      <canvas
        ref={canvasRef}
        className="h-[calc(100%-2.25rem)] w-full touch-none cursor-move"
        aria-label="Animated Lorenz attractor XY scope"
      />
      {/* Controls */}
      <div className="absolute bottom-3 right-3 flex items-center gap-2">
        <div className="flex items-center gap-1.5 rounded-full border border-border/60 bg-background/70 px-1.5 py-1 backdrop-blur-sm">
          <button
            type="button"
            onClick={() => adjustZoom(0.8)}
            className="rounded-full p-1.5 text-muted-foreground hover:text-scope hover:bg-scope/10 transition-colors"
            aria-label="Zoom out"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="mono text-[10px] tracking-[0.15em] text-muted-foreground tabular-nums w-10 text-center">
            {zoomRef.current.toFixed(2)}x
          </span>
          <button
            type="button"
            onClick={() => adjustZoom(1.25)}
            className="rounded-full p-1.5 text-muted-foreground hover:text-scope hover:bg-scope/10 transition-colors"
            aria-label="Zoom in"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-border/60 bg-background/70 px-1.5 py-1 backdrop-blur-sm">
          <button
            type="button"
            onClick={() => adjustTrace(-0.4)}
            className="rounded-full p-1.5 text-muted-foreground hover:text-scope hover:bg-scope/10 transition-colors"
            aria-label="Thinner trace"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="mono text-[10px] tracking-[0.15em] text-muted-foreground tabular-nums w-10 text-center">
            w{traceWidthRef.current.toFixed(1)}
          </span>
          <button
            type="button"
            onClick={() => adjustTrace(0.4)}
            className="rounded-full p-1.5 text-muted-foreground hover:text-scope hover:bg-scope/10 transition-colors"
            aria-label="Thicker trace"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      {/* Rotation sliders */}
      <div className="absolute top-12 right-3 flex flex-col gap-2 rounded-lg border border-border/60 bg-background/70 px-3 py-2 backdrop-blur-sm mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
        <label className="flex items-center gap-2">
          <span className="w-6">rX</span>
          <input
            type="range"
            min={-1.4}
            max={1.4}
            step={0.01}
            defaultValue={rotXRef.current}
            onChange={(e) => { rotXRef.current = parseFloat(e.target.value); }}
            className={sliderClass}
          />
        </label>
        <label className="flex items-center gap-2">
          <span className="w-6">rY</span>
          <input
            type="range"
            min={-Math.PI}
            max={Math.PI}
            step={0.01}
            defaultValue={rotYRef.current}
            onChange={(e) => { rotYRef.current = parseFloat(e.target.value); }}
            className={sliderClass}
          />
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            defaultChecked={autoSpinRef.current}
            onChange={(e) => { autoSpinRef.current = e.target.checked; }}
            className="accent-scope"
          />
          <span>auto-spin</span>
        </label>
      </div>
      <div className="pointer-events-none absolute bottom-3 left-3 mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
        drag to pan · scroll to zoom
      </div>
      {/* Sweep */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-scope/10 to-transparent animate-scope-sweep" />
      </div>
    </div>
  );
};

export default Oscilloscope;