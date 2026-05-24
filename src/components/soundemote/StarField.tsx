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

type Shooter = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number; // 0..1, decays
  trail: { x: number; y: number; glyph: string }[];
  hue: number;
};

export const StarField = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const shootersRef = useRef<Shooter[]>([]);
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
      const density = 0.00008; // stars per pixel (very sparse)
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

    const spawnShooter = () => {
      // launch from upper-left-ish, travel down-right (or mirror)
      const fromLeft = Math.random() < 0.5;
      const y0 = Math.random() * height * 0.6;
      const x0 = fromLeft ? -40 : width + 40;
      const speed = 6 + Math.random() * 4;
      const angle = (Math.random() * 0.3 + 0.15) * Math.PI; // ~27-81deg
      const vx = (fromLeft ? 1 : -1) * Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      shootersRef.current.push({
        x: x0,
        y: y0,
        vx,
        vy,
        life: 1,
        trail: [],
        hue: Math.random() < 0.3 ? 40 : 180,
      });
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
    let nextShooterAt = 1.5;
    const tick = (now: number) => {
      const t = (now - start) / 1000;
      // near-black wash with a faint vignette feel
      ctx.fillStyle = "#000000";
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

      // shooting stars
      if (t >= nextShooterAt) {
        spawnShooter();
        nextShooterAt = t + 2 + Math.random() * 4;
      }
      const shooters = shootersRef.current;
      const trailGlyphs = ["*", "+", "·", ".", " "];
      for (let i = shooters.length - 1; i >= 0; i--) {
        const sh = shooters[i];
        sh.x += sh.vx;
        sh.y += sh.vy;
        sh.trail.unshift({
          x: sh.x,
          y: sh.y,
          glyph: trailGlyphs[Math.floor(Math.random() * trailGlyphs.length)],
        });
        if (sh.trail.length > 14) sh.trail.pop();

        // draw trail (oldest = dimmest)
        for (let j = sh.trail.length - 1; j >= 0; j--) {
          const p = sh.trail[j];
          const a = (1 - j / sh.trail.length) * 0.8;
          ctx.fillStyle = `hsla(${sh.hue}, 80%, ${65 + (1 - j / sh.trail.length) * 25}%, ${a})`;
          ctx.fillText(p.glyph, p.x, p.y);
        }
        // head
        ctx.fillStyle = `hsla(${sh.hue}, 90%, 90%, 1)`;
        ctx.fillRect(sh.x - 1.5, sh.y - 1.5, 3, 3);
        ctx.fillText("✦", sh.x, sh.y);

        if (
          sh.x < -60 || sh.x > width + 60 ||
          sh.y < -60 || sh.y > height + 60
        ) {
          shooters.splice(i, 1);
        }
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