import { useEffect, useRef } from "react";

// ASCII starfield inspired by Monster Bash (1993): tiny pixel/ascii stars
// twinkling on a near-black night sky. Pure presentation, fixed behind content.
const STAR_GLYPHS = [".", ".", ".", "·", "˙", "*", "+", "✦", "✧"];

type Star = {
  x: number;
  y: number;
  glyph: string;
  phase: number;
  speed: number;
  baseAlpha: number;
  hue: number;
};

export const StarField = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const rafRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const seed = () => {
      const area = width * height;
      const density = 0.00045; // stars per pixel
      const count = Math.floor(area * density);
      const stars: Star[] = [];
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          glyph: STAR_GLYPHS[Math.floor(Math.random() * STAR_GLYPHS.length)],
          phase: Math.random() * Math.PI * 2,
          speed: 0.4 + Math.random() * 1.4,
          baseAlpha: 0.25 + Math.random() * 0.6,
          // mostly cool whites/greens, a few warm
          hue: Math.random() < 0.15 ? 40 : Math.random() < 0.5 ? 150 : 200,
        });
      }
      starsRef.current = stars;
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    resize();
    window.addEventListener("resize", resize);

    let start = performance.now();
    const tick = (now: number) => {
      const t = (now - start) / 1000;
      // near-black wash with a faint vignette feel
      ctx.fillStyle = "#040508";
      ctx.fillRect(0, 0, width, height);

      ctx.font = `12px "JetBrains Mono", ui-monospace, monospace`;
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";

      const stars = starsRef.current;
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        const tw = (Math.sin(t * s.speed + s.phase) + 1) / 2; // 0..1
        const alpha = Math.min(1, s.baseAlpha * (0.35 + tw * 0.9));
        // pixel-art glow: draw a soft dot beneath bright glyphs
        if (tw > 0.75 && s.glyph !== "." && s.glyph !== "·" && s.glyph !== "˙") {
          ctx.fillStyle = `hsla(${s.hue}, 80%, 70%, ${alpha * 0.25})`;
          ctx.fillRect(s.x - 2, s.y - 2, 4, 4);
        }
        ctx.fillStyle = `hsla(${s.hue}, 70%, ${60 + tw * 20}%, ${alpha})`;
        ctx.fillText(s.glyph, s.x, s.y);
      }

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("resize", resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="fixed inset-0 -z-10 pointer-events-none"
    />
  );
};

export default StarField;