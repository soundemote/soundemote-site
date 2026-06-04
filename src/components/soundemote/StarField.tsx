import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

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

type Spark = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  hue: number;
  glyph: string;
};

type ScopeHitbox = {
  left: number;
  right: number;
  top: number;
  bottom: number;
};

export const StarField = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [portalHost, setPortalHost] = useState<HTMLElement | null>(null);
  const starsRef = useRef<Star[]>([]);
  const shootersRef = useRef<Shooter[]>([]);
  const sparksRef = useRef<Spark[]>([]);
  const rafRef = useRef<number>();

  useEffect(() => {
    setPortalHost(document.body);
  }, []);

  useEffect(() => {
    if (!portalHost) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let lastScrollAt = -Infinity;

    const getScopeHitbox = (now: number): ScopeHitbox | null => {
      if (now - lastScrollAt < 250) return null;

      const target =
        document.querySelector<HTMLElement>("#hero-patch-image") ??
        document.querySelector<HTMLCanvasElement>("#hero-oscilloscope canvas");
      const rect = target?.getBoundingClientRect();
      if (
        !rect ||
        rect.right <= 0 ||
        rect.left >= width ||
        rect.bottom <= 0 ||
        rect.top >= height
      ) {
        return null;
      }

      return {
        left: rect.left,
        right: rect.right,
        top: rect.top,
        bottom: rect.bottom,
      };
    };

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

    const explode = (x: number, y: number, hue: number) => {
      const glyphs = ["*", "+", "✦", "✧", "·"];
      const sparks = sparksRef.current;
      const count = 24;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.35;
        const speed = 1.5 + Math.random() * 5.5;
        const maxLife = 28 + Math.random() * 22;
        sparks.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: maxLife,
          maxLife,
          size: 1 + Math.random() * 2.5,
          hue: hue + (Math.random() * 50 - 25),
          glyph: glyphs[Math.floor(Math.random() * glyphs.length)],
        });
      }
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

    const handleScroll = () => {
      lastScrollAt = performance.now();
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", handleScroll, { passive: true });

    let start = performance.now();
    let nextShooterAt = 1.5;
    const tick = (now: number) => {
      const t = (now - start) / 1000;
      ctx.clearRect(0, 0, width, height);

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
      const scopeHitbox = getScopeHitbox(now);
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
          scopeHitbox &&
          sh.x >= scopeHitbox.left &&
          sh.x <= scopeHitbox.right &&
          sh.y >= scopeHitbox.top &&
          sh.y <= scopeHitbox.bottom
        ) {
          explode(sh.x, sh.y, sh.hue);
          shooters.splice(i, 1);
          continue;
        }

        if (
          sh.x < -60 || sh.x > width + 60 ||
          sh.y < -60 || sh.y > height + 60
        ) {
          shooters.splice(i, 1);
        }
      }

      const sparks = sparksRef.current;
      for (let i = sparks.length - 1; i >= 0; i--) {
        const sp = sparks[i];
        const age = sp.life / sp.maxLife;
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.vx *= 0.96;
        sp.vy = sp.vy * 0.96 + 0.035;
        sp.life -= 1;

        ctx.fillStyle = `hsla(${sp.hue}, 95%, ${65 + age * 25}%, ${Math.max(0, age)})`;
        if (sp.glyph === "·") {
          ctx.fillRect(sp.x - sp.size / 2, sp.y - sp.size / 2, sp.size, sp.size);
        } else {
          ctx.fillText(sp.glyph, sp.x, sp.y);
        }

        if (sp.life <= 0) {
          sparks.splice(i, 1);
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [portalHost]);

  const canvas = (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        background: "transparent",
      }}
    />
  );

  return portalHost ? createPortal(canvas, portalHost) : null;
};

export default StarField;
