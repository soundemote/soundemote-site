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

type StarFieldProps = {
  /** When true (default), ambient background stars simply don't render
   * inside the Gradient Curve Widget's own rect (".gcw-mount") -- they
   * never fully disappear from the rest of the page, and shooting stars
   * are never affected by this at all; they always fly freely everywhere,
   * including straight through/over the widget. */
  avoidDotArea?: boolean;
};

export const StarField = ({ avoidDotArea = true }: StarFieldProps) => {
  // Two layers: the ambient twinkling starfield stays BEHIND page content
  // (bgCanvas, z-0) like a night sky backdrop. Shooting stars + their
  // explosion sparks render on a separate layer IN FRONT of content
  // (fgCanvas, z-15) so they can visibly fly across and collide with the
  // hero image/attractor scope instead of either being hidden behind
  // opaque elements or having the whole ambient field incorrectly float
  // on top of everything.
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const fgCanvasRef = useRef<HTMLCanvasElement>(null);
  const [portalHost, setPortalHost] = useState<HTMLElement | null>(null);
  const starsRef = useRef<Star[]>([]);
  const shootersRef = useRef<Shooter[]>([]);
  const sparksRef = useRef<Spark[]>([]);
  const rafRef = useRef<number>();
  const avoidDotAreaRef = useRef(avoidDotArea);
  avoidDotAreaRef.current = avoidDotArea;

  useEffect(() => {
    setPortalHost(document.body);
  }, []);

  useEffect(() => {
    if (!portalHost) return;
    const bgCanvas = bgCanvasRef.current;
    const fgCanvas = fgCanvasRef.current;
    if (!bgCanvas || !fgCanvas) return;
    const bgCtx = bgCanvas.getContext("2d");
    const fgCtx = fgCanvas.getContext("2d");
    if (!bgCtx || !fgCtx) return;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let lastScrollAt = -Infinity;

    const rectToHitbox = (rect: DOMRect): ScopeHitbox | null => {
      if (
        !rect ||
        rect.width <= 0 ||
        rect.height <= 0 ||
        rect.right <= 0 ||
        rect.left >= width ||
        rect.bottom <= 0 ||
        rect.top >= height
      ) {
        return null;
      }
      // No inset: collide right at the element's edge/stroke, not 20px
      // deep into it -- otherwise the star visibly flies inside the
      // picture before it explodes instead of hitting its boundary.
      return {
        left: rect.left,
        right: rect.right,
        top: rect.top,
        bottom: rect.bottom,
      };
    };

    // #hero-patch-image is the actual rendered picture (scaled to its natural
    // size); .soundemote-sandbox-preview-frame is just its full-width flex
    // wrapper before the sandbox loads, so it must NOT be checked first --
    // doing so made the hitbox ~230px wider than the visible image on each
    // side (stars looked like they were exploding well off the picture).
    const getHeroHitbox = (now: number): ScopeHitbox | null => {
      if (now - lastScrollAt < 250) return null;

      const target =
        document.querySelector<HTMLElement>("#hero-sandbox-iframe") ??
        document.querySelector<HTMLElement>("#hero-patch-image") ??
        document.querySelector<HTMLElement>(".soundemote-sandbox-preview-frame") ??
        document.querySelector<HTMLCanvasElement>("#hero-oscilloscope canvas");
      if (!target) return null;
      return rectToHitbox(target.getBoundingClientRect());
    };

    // The "strange attractor scope" panel further down the page (ScopeLab.tsx).
    const getAttractorHitbox = (now: number): ScopeHitbox | null => {
      if (now - lastScrollAt < 250) return null;
      const target = document.querySelector<HTMLElement>("#scope-oscilloscope");
      if (!target) return null;
      return rectToHitbox(target.getBoundingClientRect());
    };

    // The Gradient Curve Widget's own mount root, wherever it appears
    // (homepage spotlight or the standalone /gradient-curve page). Used to
    // keep ambient stars from rendering over the dot -- not a hitbox for
    // collision, just an exclusion zone for drawing.
    const getDotAreaRect = (now: number): ScopeHitbox | null => {
      if (!avoidDotAreaRef.current) return null;
      if (now - lastScrollAt < 250) return null;
      const target = document.querySelector<HTMLElement>(".gcw-mount");
      if (!target) return null;
      return rectToHitbox(target.getBoundingClientRect());
    };

    const postSandboxCollisionEvent = (hitbox: ScopeHitbox, x: number, y: number, hue: number, speed: number) => {
      const iframe = document.querySelector<HTMLIFrameElement>("#hero-sandbox-iframe");
      const targetWindow = iframe?.contentWindow;
      if (!targetWindow) return;
      const width = Math.max(1, hitbox.right - hitbox.left);
      const height = Math.max(1, hitbox.bottom - hitbox.top);
      targetWindow.postMessage(
        {
          type: "soundemote:sandbox-event",
          event: "shootingStarExplosion",
          payload: {
            source: "hero-shooting-star",
            x,
            y,
            normalizedX: Math.max(0, Math.min(1, (x - hitbox.left) / width)),
            normalizedY: Math.max(0, Math.min(1, (y - hitbox.top) / height)),
            hue,
            speed,
          },
        },
        window.location.origin,
      );
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

    type SpawnOverrides = {
      hue?: number;
      speed?: number;
      count?: number;
    };

    const spawnShooter = (overrides: SpawnOverrides = {}) => {
      // launch from upper-left-ish, travel down-right (or mirror)
      const fromLeft = Math.random() < 0.5;
      const y0 = Math.random() * height * 0.6;
      const x0 = fromLeft ? -40 : width + 40;
      const speed =
        typeof overrides.speed === "number" ? overrides.speed : 6 + Math.random() * 4;
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
        hue:
          typeof overrides.hue === "number"
            ? overrides.hue
            : Math.random() < 0.3
              ? 40
              : 180,
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
      for (const [c, context] of [
        [bgCanvas, bgCtx],
        [fgCanvas, fgCtx],
      ] as const) {
        c.width = Math.floor(width * dpr);
        c.height = Math.floor(height * dpr);
        c.style.width = `${width}px`;
        c.style.height = `${height}px`;
        context.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      seed();
    };

    const handleScroll = () => {
      lastScrollAt = performance.now();
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Sandbox-driven shooting-star timing: the iframe can post
    // `soundemote:hero-event` messages to trigger stars or change cadence.
    // Cadence override (seconds); null = default random auto-cadence.
    let rateOverride: number | null = null;
    const handleHeroEvent = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const iframe = document.querySelector<HTMLIFrameElement>("#hero-sandbox-iframe");
      if (iframe && event.source && event.source !== iframe.contentWindow) return;
      const data = event.data;
      if (!data || data.type !== "soundemote:hero-event") return;
      const payload = (data.payload ?? {}) as SpawnOverrides & { intervalSeconds?: number };
      switch (data.event) {
        case "spawnShootingStar": {
          const count = Math.max(1, Math.min(20, Math.floor(payload.count ?? 1)));
          for (let i = 0; i < count; i++) {
            spawnShooter({ hue: payload.hue, speed: payload.speed });
          }
          break;
        }
        case "setRate": {
          const interval = payload.intervalSeconds;
          rateOverride =
            typeof interval === "number" && interval > 0
              ? Math.max(0.1, Math.min(30, interval))
              : null;
          break;
        }
        default:
          break;
      }
    };
    window.addEventListener("message", handleHeroEvent);

    let start = performance.now();
    let nextShooterAt = 1.5;
    let lastTickAt = start;
    // Track scroll delta so shooting stars + sparks stay pinned to a page
    // location instead of the viewport: each frame we shift them by however
    // much the page scrolled, so they scroll out of view instead of following
    // the view. (Ambient twinkle stars intentionally stay fixed to the sky.)
    let lastScrollY = window.scrollY;
    const tick = (now: number) => {
      const t = (now - start) / 1000;
      lastTickAt = now;
      const scrollY = window.scrollY;
      const dScroll = scrollY - lastScrollY;
      lastScrollY = scrollY;
      bgCtx.clearRect(0, 0, width, height);
      fgCtx.clearRect(0, 0, width, height);

      bgCtx.font = `12px "JetBrains Mono", ui-monospace, monospace`;
      bgCtx.textBaseline = "middle";
      bgCtx.textAlign = "center";
      fgCtx.font = `12px "JetBrains Mono", ui-monospace, monospace`;
      fgCtx.textBaseline = "middle";
      fgCtx.textAlign = "center";

      const stars = starsRef.current;
      const dotAreaRect = getDotAreaRect(now);
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        if (
          dotAreaRect &&
          s.x >= dotAreaRect.left &&
          s.x <= dotAreaRect.right &&
          s.y >= dotAreaRect.top &&
          s.y <= dotAreaRect.bottom
        ) {
          continue;
        }
        const tw = (Math.sin(t * s.speed + s.phase) + 1) / 2; // 0..1
        const alpha = Math.min(1, s.baseAlpha * (0.35 + tw * 0.9));
        // pixel-art glow: draw a soft dot beneath bright glyphs
        if (tw > 0.75 && s.glyph !== "." && s.glyph !== "·" && s.glyph !== "˙") {
          bgCtx.fillStyle = `hsla(${s.hue}, 80%, 70%, ${alpha * 0.25})`;
          bgCtx.fillRect(s.x - 2, s.y - 2, 4, 4);
        }
        bgCtx.fillStyle = `hsla(${s.hue}, 70%, ${60 + tw * 20}%, ${alpha})`;
        bgCtx.fillText(s.glyph, s.x, s.y);
      }

      // shooting stars
      if (t >= nextShooterAt) {
        spawnShooter();
        nextShooterAt =
          rateOverride != null ? t + rateOverride : t + 2 + Math.random() * 4;
      }
      const shooters = shootersRef.current;
      const trailGlyphs = ["*", "+", "·", ".", " "];
      const heroHitbox = getHeroHitbox(now);
      const attractorHitbox = getAttractorHitbox(now);
      for (let i = shooters.length - 1; i >= 0; i--) {
        const sh = shooters[i];
        // Pin to page: undo this frame's scroll so the star keeps its
        // document position and scrolls off screen.
        sh.y -= dScroll;
        for (let j = 0; j < sh.trail.length; j++) sh.trail[j].y -= dScroll;
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
          fgCtx.fillStyle = `hsla(${sh.hue}, 80%, ${65 + (1 - j / sh.trail.length) * 25}%, ${a})`;
          fgCtx.fillText(p.glyph, p.x, p.y);
        }
        // head
        fgCtx.fillStyle = `hsla(${sh.hue}, 90%, 90%, 1)`;
        fgCtx.fillRect(sh.x - 1.5, sh.y - 1.5, 3, 3);
        fgCtx.fillText("✦", sh.x, sh.y);

        if (
          heroHitbox &&
          sh.x >= heroHitbox.left &&
          sh.x <= heroHitbox.right &&
          sh.y >= heroHitbox.top &&
          sh.y <= heroHitbox.bottom
        ) {
          explode(sh.x, sh.y, sh.hue);
          const shooterSpeed = Math.hypot(sh.vx, sh.vy);
          postSandboxCollisionEvent(heroHitbox, sh.x, sh.y, sh.hue, shooterSpeed);
          shooters.splice(i, 1);
          continue;
        }

        if (
          attractorHitbox &&
          sh.x >= attractorHitbox.left &&
          sh.x <= attractorHitbox.right &&
          sh.y >= attractorHitbox.top &&
          sh.y <= attractorHitbox.bottom
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
        sp.y -= dScroll;
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.vx *= 0.96;
        sp.vy = sp.vy * 0.96 + 0.035;
        sp.life -= 1;

        fgCtx.fillStyle = `hsla(${sp.hue}, 95%, ${65 + age * 25}%, ${Math.max(0, age)})`;
        if (sp.glyph === "·") {
          fgCtx.fillRect(sp.x - sp.size / 2, sp.y - sp.size / 2, sp.size, sp.size);
        } else {
          fgCtx.fillText(sp.glyph, sp.x, sp.y);
        }

        if (sp.life <= 0) {
          sparks.splice(i, 1);
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    // Pause the animation loop while the tab is hidden so it stops burning
    // CPU/GPU in the background; resume without a huge time jump on return.
    const handleVisibility = () => {
      if (document.hidden) {
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = undefined;
        }
      } else if (rafRef.current === undefined) {
        const now = performance.now();
        start += now - lastTickAt;
        lastTickAt = now;
        lastScrollY = window.scrollY;
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("message", handleHeroEvent);
      document.removeEventListener("visibilitychange", handleVisibility);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [portalHost]);

  const canvases = (
    <>
      {/* Ambient twinkling starfield: stays BEHIND page content (z-0),
          like a night sky backdrop -- must not float on top of the hero
          image or any other section. Always rendered; individual stars
          simply aren't drawn inside the dot widget's rect (see
          getDotAreaRect above) when avoidDotArea is on. */}
      <canvas
        ref={bgCanvasRef}
        aria-hidden
        className="pointer-events-none"
        style={{ position: "fixed", inset: 0, zIndex: 0, background: "transparent" }}
      />
      {/* Shooting stars + explosion sparks: always rendered, never masked
          or hidden. z-25 -- above GradientCurveSpotlight's z-20 panel (and
          all other page content), still below Nav's z-50 -- so a star can
          fly straight through/over the gradient widget instead of being
          covered by it. */}
      <canvas
        ref={fgCanvasRef}
        aria-hidden
        className="pointer-events-none"
        style={{ position: "fixed", inset: 0, zIndex: 25, background: "transparent" }}
      />
    </>
  );

  return portalHost ? createPortal(canvases, portalHost) : null;
};

export default StarField;
