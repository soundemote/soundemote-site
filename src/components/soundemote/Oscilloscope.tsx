import { useEffect, useRef, useState } from "react";
import { Minus, Plus, Volume2, VolumeX, RotateCcw } from "lucide-react";
import {
  ATTRACTORS,
  attractorStepFns,
  attractorWorkletSteps,
  type AttractorKind,
} from "./attractors";

// Click-and-hold repeat button. Fires onTick at ~60Hz while held, with the
// step multiplier accelerating the longer the user holds.
const HoldButton = ({
  onTick,
  className,
  children,
  ariaLabel,
}: {
  onTick: (accel: number) => void;
  className?: string;
  children: React.ReactNode;
  ariaLabel?: string;
}) => {
  const rafRef = useRef(0);
  const startRef = useRef(0);
  const stop = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
  };
  const begin = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    startRef.current = performance.now();
    // single tick immediately
    onTick(1);
    const loop = () => {
      const held = (performance.now() - startRef.current) / 1000;
      // accelerate: 1x → ~6x after ~1.2s held
      const accel = 1 + Math.min(8, held * 5);
      onTick(accel);
      rafRef.current = requestAnimationFrame(loop);
    };
    // small delay before auto-repeat starts
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = requestAnimationFrame(loop);
    });
  };
  const end = (e: React.PointerEvent<HTMLButtonElement>) => {
    try { (e.target as HTMLElement).releasePointerCapture?.(e.pointerId); } catch {}
    stop();
  };
  useEffect(() => () => stop(), []);
  return (
    <button
      type="button"
      onPointerDown={begin}
      onPointerUp={end}
      onPointerCancel={end}
      onPointerLeave={end}
      className={className}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
};

// Click-and-drag number input. Vertical drag changes the value on a log
// scale so it can sweep many orders of magnitude (slow → audio rate).
// Double-click to type a value directly.
const DragNumber = ({
  value,
  onChange,
  min,
  max,
  format,
  suffix,
  sensitivity = 0.008,
  mode = "log",
  linearStep,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  format: (v: number) => string;
  suffix?: string;
  sensitivity?: number;
  mode?: "log" | "linear";
  linearStep?: number;
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const startRef = useRef({ y: 0, v: 0 });
  const movedRef = useRef(false);

  const onDown = (e: React.PointerEvent<HTMLSpanElement>) => {
    if (editing) return;
    e.preventDefault();
    movedRef.current = false;
    startRef.current = { y: e.clientY, v: value };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent<HTMLSpanElement>) => {
    if (!(e.target as HTMLElement).hasPointerCapture?.(e.pointerId)) return;
    const dy = e.clientY - startRef.current.y;
    if (Math.abs(dy) > 2) movedRef.current = true;
    let next: number;
    if (mode === "linear") {
      const step = linearStep ?? (max - min) * 0.004;
      next = startRef.current.v - dy * step;
    } else {
      // log-scale drag: dragging up multiplies, dragging down divides
      const logV = Math.log(Math.max(1e-6, startRef.current.v));
      next = Math.exp(logV - dy * sensitivity);
    }
    onChange(Math.max(min, Math.min(max, next)));
  };
  const onUp = (e: React.PointerEvent<HTMLSpanElement>) => {
    try { (e.target as HTMLElement).releasePointerCapture(e.pointerId); } catch {}
  };
  const commit = () => {
    const n = parseFloat(draft);
    if (!Number.isNaN(n)) onChange(Math.max(min, Math.min(max, n)));
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        autoFocus
        type="number"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") setEditing(false);
        }}
        className="w-16 bg-transparent border-b border-scope outline-none text-foreground tabular-nums text-center"
      />
    );
  }
  return (
    <span
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onDoubleClick={() => { setDraft(String(value)); setEditing(true); }}
      className="cursor-ns-resize select-none tabular-nums border-b border-border/40 hover:border-scope/60 px-1 text-foreground"
      title="Drag vertically · double-click to type"
    >
      {format(value)}{suffix}
    </span>
  );
};

export type HSL = { h: number; s: number; l: number };

// HSL (h:0-360, s:0-1, l:0-1) → linear-ish RGB 0-1
const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = (h % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r = 0, g = 0, b = 0;
  if (hp < 1) [r, g, b] = [c, x, 0];
  else if (hp < 2) [r, g, b] = [x, c, 0];
  else if (hp < 3) [r, g, b] = [0, c, x];
  else if (hp < 4) [r, g, b] = [0, x, c];
  else if (hp < 5) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const m = l - c / 2;
  return [r + m, g + m, b + m];
};

export const Oscilloscope = ({
  kind = "lorenz",
  tracerColor = { h: 157, s: 0.84, l: 0.54 },
  bgColor = { h: 0, s: 0, l: 0 },
}: { kind?: AttractorKind; tracerColor?: HSL; bgColor?: HSL } = {}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Live attractor selection (held in ref so the rAF loop reads latest value).
  const kindRef = useRef<AttractorKind>(kind);
  // Live color refs (read inside the rAF loop).
  const tracerColorRef = useRef<HSL>(tracerColor);
  const bgColorRef = useRef<HSL>(bgColor);
  // Live params held in refs so the rAF loop reads the latest values
  const zoomRef = useRef(1);
  const zoomTargetRef = useRef(1);
  const rotXRef = useRef(0.35); // tilt
  const rotYRef = useRef(0);    // spin
  const autoSpinXRef = useRef(false);
  const autoSpinYRef = useRef(false);
  const panXRef = useRef(0);
  const panYRef = useRef(0);
  const panTargetXRef = useRef(0);
  const panTargetYRef = useRef(0);
  const traceWidthRef = useRef(2.2);
  // Phosphor decay (0 = long burn-in, 1 = quick clean fade). Default in the
  // middle gives a nice screen-burn that still eventually clears.
  const decayRef = useRef(0.45);
  const spinSpeedXRef = useRef(0);
  const spinSpeedYRef = useRef(0.003);
  // Live coefficient values for the *current* attractor (parallel to its paramSchema).
  const paramsRef = useRef<number[]>([...ATTRACTORS[kind].params]);
  // Steps per second of Lorenz integration. ~1440 matches the old
  // 24 steps/frame @ 60fps. Range covers slow drift → audio-rate buzz.
  const freqRef = useRef(1440);
  // Audio output
  const volumeRef = useRef(0.15);
  const audioRef = useRef<{
    ctx: AudioContext;
    node: AudioWorkletNode;
    gain: GainNode;
  } | null>(null);
  const [audioOn, setAudioOn] = useState(false);
  const audioOnRef = useRef(false);
  const [resetSeq, setResetSeq] = useState(0);
  // NOTE: Lanczos upsampler / coefficient smoothing experiment disabled.
  // This was a failed attempt at signal smoothing — revisit later.
  const smoothingRef = useRef(false);
  // Shared Lorenz state. When audio is running the worklet is master and
  // pushes (x,y,z) triples back here; otherwise the visual integrator
  // writes to it. Either way both renderers consume the same data.
  const stateRef = useRef({ x: 0.01, y: 0, z: 0 });
  const ptsQueueRef = useRef<number[]>([]); // flat x,y,z,x,y,z,...
  const [, setTick] = useState(0); // force re-render of overlay labels

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
    }) as WebGLRenderingContext | null;
    if (!gl) return;

    let raf = 0;
    let dpr = window.devicePixelRatio || 1;

    /* ---------- Shader helpers ---------- */
    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.error("shader", gl.getShaderInfoLog(sh), src);
      }
      return sh;
    };
    const program = (vs: string, fs: string) => {
      const p = gl.createProgram()!;
      gl.attachShader(p, compile(gl.VERTEX_SHADER, vs));
      gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fs));
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
        console.error("link", gl.getProgramInfoLog(p));
      }
      return p;
    };

    // Woscope-style Gaussian segment shader (adapted from dood.al / m1el woscope)
    const beamProg = program(
      `attribute vec2 aStart, aEnd;
       attribute float aIdx;
       uniform float uSize;
       uniform float uIntensity;
       varying vec4 uvl;
       varying float vSize;
       void main(){
         float idx = mod(aIdx, 4.0);
         vec2 dir = aEnd - aStart;
         uvl.z = length(dir);
         if (uvl.z > 1e-6) dir = dir / uvl.z; else dir = vec2(1.0, 0.0);
         vSize = uSize;
         vec2 norm = vec2(-dir.y, dir.x);
         vec2 current; float tang;
         if (idx >= 2.0) { current = aEnd; tang = 1.0; uvl.x = -vSize; }
         else { current = aStart; tang = -1.0; uvl.x = uvl.z + vSize; }
         float side = (mod(idx, 2.0) - 0.5) * 2.0;
         uvl.y = side * vSize;
         uvl.w = uIntensity;
         vec2 pos = current + (tang * dir + norm * side) * vSize;
         gl_Position = vec4(pos, 0.0, 1.0);
       }`,
      `precision highp float;
       #define SQRT2 1.4142135623730951
       #define TAUR 2.5066282746310002
       varying vec4 uvl;
       varying float vSize;
       float erf(float x){
         float s = sign(x), a = abs(x);
         float r = 1.0 + (0.278393 + (0.230389 + 0.078108 * (a*a)) * a) * a;
         r *= r;
         return s - s / (r * r);
       }
       float gaussian(float x, float sigma){
         return exp(-(x*x)/(2.0*sigma*sigma)) / (TAUR * sigma);
       }
       void main(){
         float len = uvl.z;
         vec2 xy = uvl.xy;
         float sigma = vSize / 5.0;
         float b;
         if (len < 1e-6) {
           b = gaussian(length(xy), sigma);
         } else {
           b = erf(xy.x/SQRT2/sigma) - erf((xy.x-len)/SQRT2/sigma);
           b *= exp(-xy.y*xy.y/(2.0*sigma*sigma)) / 2.0 / len;
         }
         b *= uvl.w;
         gl_FragColor = vec4(b, b, b, 1.0);
       }`
    );
    const beamA_start = gl.getAttribLocation(beamProg, "aStart");
    const beamA_end = gl.getAttribLocation(beamProg, "aEnd");
    const beamA_idx = gl.getAttribLocation(beamProg, "aIdx");
    const beamU_size = gl.getUniformLocation(beamProg, "uSize");
    const beamU_intensity = gl.getUniformLocation(beamProg, "uIntensity");

    // Fullscreen quad shaders (fade + output)
    const quadVS = `attribute vec2 aPos; varying vec2 vUv;
      void main(){ vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`;

    const fadeProg = program(
      quadVS,
      `precision highp float;
       uniform sampler2D uTex;
       uniform float uFadeFast;  // bright-pixel keep factor (per frame)
       uniform float uFadeBurn;  // dim-pixel  keep factor (per frame, ~1.0)
       uniform float uFloor;     // hard subtractive floor so burn eventually dies
       varying vec2 vUv;
       void main(){
         vec4 c = texture2D(uTex, vUv);
         // Non-linear phosphor decay: bright pixels lose energy fast,
         // dim pixels (the "burn-in") lose energy very slowly. This gives
         // a CRT screen-burn look while still letting the burn fade out.
         vec4 t = clamp(c, 0.0, 1.0);
         vec4 k = mix(vec4(uFadeBurn), vec4(uFadeFast), t);
         c = c * k;
         // tiny subtractive floor — guarantees the burn eventually clears
         c = max(c - vec4(uFloor), vec4(0.0));
         gl_FragColor = vec4(c.rgb, 1.0);
       }`
    );
    const fadeA_pos = gl.getAttribLocation(fadeProg, "aPos");
    const fadeU_tex = gl.getUniformLocation(fadeProg, "uTex");
    const fadeU_fadeFast = gl.getUniformLocation(fadeProg, "uFadeFast");
    const fadeU_fadeBurn = gl.getUniformLocation(fadeProg, "uFadeBurn");
    const fadeU_floor = gl.getUniformLocation(fadeProg, "uFloor");

    const outProg = program(
      quadVS,
      `precision highp float;
       uniform sampler2D uTex;
       uniform vec3 uColor;
       uniform vec3 uBg;
       uniform float uExposure;
       varying vec2 vUv;
       void main(){
         float l = texture2D(uTex, vUv).r;
         float t = 1.0 - exp(-l * uExposure);
         vec3 col = mix(uColor, vec3(1.0), t * t * 0.6) * t;
         gl_FragColor = vec4(uBg * (1.0 - t) + col, 1.0);
       }`
    );
    const outA_pos = gl.getAttribLocation(outProg, "aPos");
    const outU_tex = gl.getUniformLocation(outProg, "uTex");
    const outU_color = gl.getUniformLocation(outProg, "uColor");
    const outU_bg = gl.getUniformLocation(outProg, "uBg");
    const outU_exposure = gl.getUniformLocation(outProg, "uExposure");

    // Fullscreen quad buffer
    const quadBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    // Segment vertex buffer: 4 verts * (aStart.xy + aEnd.xy + aIdx) = 20 floats / segment.
    // Indices: 6 per segment (two triangles).
    const MAX_SEGS = 4096;
    const segData = new Float32Array(MAX_SEGS * 20);
    const idxData = new Uint16Array(MAX_SEGS * 6);
    for (let s = 0; s < MAX_SEGS; s++) {
      const v = s * 4;
      const o = s * 6;
      idxData[o + 0] = v + 0;
      idxData[o + 1] = v + 1;
      idxData[o + 2] = v + 2;
      idxData[o + 3] = v + 2;
      idxData[o + 4] = v + 1;
      idxData[o + 5] = v + 3;
    }
    const segBuf = gl.createBuffer();
    const segIdxBuf = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, segIdxBuf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idxData, gl.STATIC_DRAW);

    // Ping-pong FBOs
    type FBO = { tex: WebGLTexture; fbo: WebGLFramebuffer; w: number; h: number };
    const makeFBO = (w: number, h: number): FBO => {
      const tex = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      const fbo = gl.createFramebuffer()!;
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      return { tex, fbo, w, h };
    };
    let fboA: FBO | null = null;
    let fboB: FBO | null = null;

    const resize = () => {
      dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const W = Math.max(1, Math.floor(rect.width * dpr));
      const H = Math.max(1, Math.floor(rect.height * dpr));
      canvas.width = W;
      canvas.height = H;
      if (fboA) { gl.deleteTexture(fboA.tex); gl.deleteFramebuffer(fboA.fbo); }
      if (fboB) { gl.deleteTexture(fboB.tex); gl.deleteFramebuffer(fboB.fbo); }
      fboA = makeFBO(W, H);
      fboB = makeFBO(W, H);
      // clear both
      for (const f of [fboA, fboB]) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, f.fbo);
        gl.viewport(0, 0, W, H);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    };
    resize();
    window.addEventListener("resize", resize);

    const dt = 0.006;
    // stepsPerFrame is computed each frame from freqRef + dtSeconds
    // Base scale chosen so zoom=1.0 shows the attractor at its most readable "default" size.
    // (What used to render at 0.3x zoom is now the 1.0x baseline.)
    const scale = 0.018 * 0.3 * 0.3;

    let prevPx: number | null = null;
    let prevPy: number | null = null;
    // Phosphor decay is now driven by decayRef via the fade shader uniforms.
    // Smoothed shadows of the coefficients used by the visual fallback
    // integrator. The audio worklet smooths internally per-sample.
    // Smoothed shadow of the active attractor's coefficient array.
    let sParams: number[] = paramsRef.current.slice();
    let sFreq = freqRef.current;

    /* ---- Lanczos upsampler (DISABLED — failed experiment) ------------------ */
    // NOTE: This was an attempt to smooth the Lorenz signal like dood.al's
    // oscilloscope. It produced undesirable artifacts and is disabled.
    // We will revisit proper signal smoothing another time.
    // Code kept for reference — smoothingRef is hardcoded to false so this
    // block is effectively dead. Raw triples pass through instead.
    const UP_STEPS = 8;
    const UP_A = 2;
    const UP_R = UP_A * UP_STEPS;
    const upK = new Float32Array(UP_R);
    upK[0] = 1;
    for (let i = 1; i < UP_R; i++) {
      const piX = (Math.PI * i) / UP_STEPS;
      const sinc = Math.sin(piX) / piX;
      const win = (UP_A * Math.sin(piX / UP_A)) / piX;
      upK[i] = sinc * Math.pow(win, 1.5);
    }
    // Sliding context of 3 triples (positions p-1, p, p+1)
    const upCtx = new Float32Array(9);
    let upFill = 0;
    const resetUpsampler = () => { upFill = 0; };

    let lastT = performance.now();

    // Pointer drag to pan (move tracer origin)
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let lastMoveT = performance.now();
    // Velocity in CSS px / second, used to "throw" the origin on release
    let velX = 0;
    let velY = 0;
    const onDown = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      lastMoveT = performance.now();
      velX = 0;
      velY = 0;
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const t = performance.now();
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      const dt = Math.max(1, t - lastMoveT) / 1000;
      // Blend new instantaneous velocity into a tracked one so a single jitter
      // doesn't dominate the throw.
      const sampleVx = dx / dt;
      const sampleVy = dy / dt;
      const blend = 0.35;
      velX = velX * (1 - blend) + sampleVx * blend;
      velY = velY * (1 - blend) + sampleVy * blend;
      panTargetXRef.current += dx;
      panTargetYRef.current += dy;
      lastX = e.clientX;
      lastY = e.clientY;
      lastMoveT = t;
    };
    const onUp = (e: PointerEvent) => {
      dragging = false;
      // If the gesture ended stale (no recent move), don't throw
      if (performance.now() - lastMoveT > 80) {
        velX = 0;
        velY = 0;
      }
      try { canvas.releasePointerCapture(e.pointerId); } catch {}
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const next = zoomTargetRef.current * (e.deltaY < 0 ? 1.1 : 0.9);
      zoomTargetRef.current = Math.max(0.05, Math.min(20, next));
      setTick((n) => n + 1);
    };
    canvas.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });

    const draw = () => {
      const now = performance.now();
      let dtSeconds = (now - lastT) / 1000;
      lastT = now;
      if (dtSeconds > 0.1) dtSeconds = 0.1; // clamp huge gaps (tab switch)
      const frameScale = Math.max(0.1, Math.min(8, dtSeconds * 60));

      // Smooth zoom toward target (exponential lerp, longer half-life for
      // a slower, more cinematic zoom feel).
      const zoomLerp = 1 - Math.pow(0.02, dtSeconds);
      zoomRef.current += (zoomTargetRef.current - zoomRef.current) * zoomLerp;

      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const s = Math.min(w, h) * scale * zoomRef.current;
      // Throw inertia: when not dragging, integrate velocity into the pan
      // target and apply exponential damping until it settles to 0.
      if (!dragging && (velX !== 0 || velY !== 0)) {
        panTargetXRef.current += velX * dtSeconds;
        panTargetYRef.current += velY * dtSeconds;
        const damp = Math.pow(0.12, dtSeconds); // ~half-life around 0.3s
        velX *= damp;
        velY *= damp;
        if (Math.abs(velX) < 0.5) velX = 0;
        if (Math.abs(velY) < 0.5) velY = 0;
      }
      // Wrap the origin around when it leaves the visible canvas, with a
      // margin so the trace can drift a bit past the edge before snapping.
      // Wrap is driven by the *visible* pan (panXRef), not the target — that
      // way you only see a teleport when the visible origin actually leaves
      // the boundary, not when an inertial target overshoots far ahead.
      const marginX = w * 0.25;
      const marginY = h * 0.25;
      const spanX = w + marginX * 2;
      const spanY = h + marginY * 2;
      const wrap = (v: number, span: number) => {
        const half = span / 2;
        if (v > half) return v - span;
        if (v < -half) return v + span;
        return v;
      };
      const beforeX = panXRef.current;
      const beforeY = panYRef.current;
      panXRef.current = wrap(beforeX, spanX);
      panYRef.current = wrap(beforeY, spanY);
      const wrappedX = panXRef.current !== beforeX;
      const wrappedY = panYRef.current !== beforeY;
      // Shift the target by the same delta so the smoothed lerp doesn't
      // immediately animate the origin back across the screen.
      panTargetXRef.current += panXRef.current - beforeX;
      panTargetYRef.current += panYRef.current - beforeY;
      if (wrappedX || wrappedY) {
        // Break the trail so the next segment doesn't streak across screen
        prevPx = null;
        prevPy = null;
        resetUpsampler();
      }
      // Linear smoother (port of soemdsp::filter::LinearSmoother): constant
      // velocity toward the target, snap on overshoot. Increment is recomputed
      // each frame against the current target so drag/inertia stay responsive.
      const panSmoothTime = 0.12; // seconds to traverse current gap
      const incX = (panTargetXRef.current - panXRef.current) / panSmoothTime;
      const incY = (panTargetYRef.current - panYRef.current) / panSmoothTime;
      const nextPanX = panXRef.current + incX * dtSeconds;
      const nextPanY = panYRef.current + incY * dtSeconds;
      const overshotX = incX > 0 ? nextPanX > panTargetXRef.current : nextPanX < panTargetXRef.current;
      const overshotY = incY > 0 ? nextPanY > panTargetYRef.current : nextPanY < panTargetYRef.current;
      panXRef.current = overshotX ? panTargetXRef.current : nextPanX;
      panYRef.current = overshotY ? panTargetYRef.current : nextPanY;
      const cx = w / 2 + panXRef.current;
      const cy = h / 2 + panYRef.current;

      if (autoSpinXRef.current) {
        rotXRef.current += spinSpeedXRef.current;
      }
      if (autoSpinYRef.current) {
        rotYRef.current += spinSpeedYRef.current;
      }

      // Smooth coefficient + freq changes (~30ms time constant). If the
      // user turned smoothing off, snap to the targets each frame.
      const smooth = smoothingRef.current
        ? 1 - Math.exp(-dtSeconds / 0.030)
        : 1;
      const target = paramsRef.current;
      if (sParams.length !== target.length) sParams = target.slice();
      for (let i = 0; i < target.length; i++) {
        sParams[i] += (target[i] - sParams[i]) * smooth;
      }
      sFreq  += (freqRef.current  - sFreq)  * smooth;

      const cosY = Math.cos(rotYRef.current);
      const sinY = Math.sin(rotYRef.current);
      const cosX = Math.cos(rotXRef.current);
      const sinX = Math.sin(rotXRef.current);

      /* ---- Integrate Lorenz → screen-space points (NDC) ---- */
      const pts: number[] = []; // [x0,y0,x1,y1,...] in NDC
      // start with prev point if we have one, so continuous between frames
      if (prevPx !== null && prevPy !== null) {
        pts.push((prevPx / w) * 2 - 1, 1 - (prevPy / h) * 2);
      }
      // Source the (x,y,z) triples: either drain audio worklet's queue
      // (so visual and audio are guaranteed to derive from the same
      // numerical state) or integrate locally as a fallback.
      const triples: number[] = [];
      const audioActive =
        audioOnRef.current && audioRef.current && audioRef.current.ctx.state === "running";
      if (audioActive && ptsQueueRef.current.length >= 3) {
        const q = ptsQueueRef.current;
        // Cap per-frame draw count so we never fall further behind
        const maxPts = 2400;
        const take = Math.min(q.length, maxPts * 3);
        for (let i = 0; i < take; i++) triples.push(q.shift()!);
        // sync last sample back to shared state
        const L = triples.length;
        if (L >= 3) {
          stateRef.current.x = triples[L - 3];
          stateRef.current.y = triples[L - 2];
          stateRef.current.z = triples[L - 1];
        }
      } else {
        const def = ATTRACTORS[kindRef.current];
        const stepFn = attractorStepFns[def.id];
        const params = sParams;
        if (def.id === "off") {
          // No integration — emit a single zero triple so the tracer dot
          // renders at origin (pan still works since it offsets the canvas).
          const st = stateRef.current;
          st.x = 0; st.y = 0; st.z = 0;
          triples.push(0, 0, 0);
        } else {
        // Phasor-style oscillators (spiral) want a fixed sample-rate-style
        // integration; `dt` is a per-sample phase increment, so the normal
        // `steps = freq*dt_seconds` would either jump full cycles per step
        // or skip the polygon entirely.
        let dtA: number;
        let steps: number;
        if (def.visualSamplesPerSec) {
          const sps = def.visualSamplesPerSec;
          steps = Math.max(1, Math.min(8000, Math.round(sps * dtSeconds)));
          dtA = (def.dt * sFreq) / sps;
        } else {
          dtA = def.dt;
          steps = Math.max(1, Math.min(8000, Math.round(sFreq * dtSeconds)));
        }
        const st = stateRef.current;
        for (let i = 0; i < steps; i++) {
          stepFn(st, dtA, params);
          // explosion guard — re-seed from this attractor's init
          if (!isFinite(st.x) || Math.abs(st.x) > 1e4) {
            st.x = def.init.x; st.y = def.init.y; st.z = def.init.z;
            prevPx = null; prevPy = null;
            resetUpsampler();
            break;
          }
          triples.push(st.x, st.y, st.z);
        }
        }
      }

      /* ---- Lanczos upsample triples (a=2, steps=UP_STEPS) ---- */
      // Produces UP_STEPS output triples per input interval. Carries upCtx
      // across frames so we never see a chord boundary.
      const up: number[] = [];
      if (!smoothingRef.current) {
        // Smoothing disabled: pass raw triples through, reset context so
        // re-enabling doesn't blend across the gap.
        upFill = 0;
        for (let i = 0; i < triples.length; i++) up.push(triples[i]);
      } else
      for (let i = 0; i < triples.length; i += 3) {
        // shift context left by one triple
        upCtx[0]=upCtx[3]; upCtx[1]=upCtx[4]; upCtx[2]=upCtx[5];
        upCtx[3]=upCtx[6]; upCtx[4]=upCtx[7]; upCtx[5]=upCtx[8];
        upCtx[6]=triples[i]; upCtx[7]=triples[i+1]; upCtx[8]=triples[i+2];
        if (upFill < 3) { upFill++; continue; }
        // emit output for interval between upCtx[3..5] (p) and upCtx[6..8] (p+1)
        // r=0: the raw sample at p
        up.push(upCtx[3], upCtx[4], upCtx[5]);
        for (let r = 1; r < UP_STEPS; r++) {
          const k_m1 = upK[r + UP_STEPS];   // |s*steps - r| with s=-1
          const k_0  = upK[r];               // s=0
          const k_p1 = upK[UP_STEPS - r];    // s=1 (UP_STEPS > r always)
          const ux = upCtx[0]*k_m1 + upCtx[3]*k_0 + upCtx[6]*k_p1;
          const uy = upCtx[1]*k_m1 + upCtx[4]*k_0 + upCtx[7]*k_p1;
          const uz = upCtx[2]*k_m1 + upCtx[5]*k_0 + upCtx[8]*k_p1;
          up.push(ux, uy, uz);
        }
      }

      const defView = ATTRACTORS[kindRef.current];
      for (let i = 0; i < up.length; i += 3) {
        const x0 = up[i];
        const y0 = up[i + 1];
        const z0 = up[i + 2] - defView.zOffset;
        // Rotate around Y axis
        const xr = x0 * cosY + z0 * sinY;
        const zr = -x0 * sinY + z0 * cosY;
        // Rotate around X axis
        const yr = y0 * cosX - zr * sinX;
        // (zr2 unused for orthographic projection)
        const px = cx + xr * s * 8 * defView.viewScale;
        const py = cy + yr * s * 8 * defView.viewScale;
        pts.push((px / w) * 2 - 1, 1 - (py / h) * 2);
        prevPx = px;
        prevPy = py;
      }

      const W = canvas.width;
      const H = canvas.height;
      if (!fboA || !fboB) {
        raf = requestAnimationFrame(draw);
        return;
      }

      /* ---- Pass 1: fade previous (read fboB → write fboA) ---- */
      gl.bindFramebuffer(gl.FRAMEBUFFER, fboA.fbo);
      gl.viewport(0, 0, W, H);
      gl.disable(gl.BLEND);
      gl.useProgram(fadeProg);
      gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
      gl.enableVertexAttribArray(fadeA_pos);
      gl.vertexAttribPointer(fadeA_pos, 2, gl.FLOAT, false, 0, 0);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, fboB.tex);
      gl.uniform1i(fadeU_tex, 0);
      // Map decayRef (0 = long burn, 1 = quick fade) → per-frame keep factors.
      // Bright pixels use uFadeFast (lots of headroom), dim "burn" pixels use
      // uFadeBurn (very close to 1). Floor subtracts a tiny amount so even
      // burn-in eventually dies.
      const d = Math.max(0, Math.min(1, decayRef.current));
      const fastBase = 0.55 + (1 - d) * 0.42;   // 0.55 .. 0.97
      const burnBase = 0.985 + (1 - d) * 0.014; // 0.985 .. 0.999
      const floorBase = 0.00008 + d * 0.003;    // 0.00008 .. 0.003
      gl.uniform1f(fadeU_fadeFast, Math.pow(fastBase, frameScale));
      gl.uniform1f(fadeU_fadeBurn, Math.pow(burnBase, frameScale));
      gl.uniform1f(fadeU_floor, floorBase * frameScale);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      gl.disableVertexAttribArray(fadeA_pos);

      /* ---- Pass 2: additively draw segments into fboA ---- */
      const nSegs = Math.max(0, Math.min(MAX_SEGS, (pts.length / 2) - 1));
      if (nSegs > 0) {
        for (let i = 0; i < nSegs; i++) {
          const sx = pts[i * 2], sy = pts[i * 2 + 1];
          const ex = pts[i * 2 + 2], ey = pts[i * 2 + 3];
          const base = i * 20;
          for (let v = 0; v < 4; v++) {
            const o = base + v * 5;
            segData[o + 0] = sx;
            segData[o + 1] = sy;
            segData[o + 2] = ex;
            segData[o + 3] = ey;
            segData[o + 4] = v;
          }
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, segBuf);
        gl.bufferData(gl.ARRAY_BUFFER, segData.subarray(0, nSegs * 20), gl.STREAM_DRAW);
        gl.useProgram(beamProg);
        const stride = 5 * 4;
        gl.enableVertexAttribArray(beamA_start);
        gl.vertexAttribPointer(beamA_start, 2, gl.FLOAT, false, stride, 0);
        gl.enableVertexAttribArray(beamA_end);
        gl.vertexAttribPointer(beamA_end, 2, gl.FLOAT, false, stride, 8);
        gl.enableVertexAttribArray(beamA_idx);
        gl.vertexAttribPointer(beamA_idx, 1, gl.FLOAT, false, stride, 16);
        // size in NDC units (width in pixels → fraction of min dim)
        const sizeNdc = (traceWidthRef.current * dpr) / Math.min(W, H) * 2.0;
        gl.uniform1f(beamU_size, sizeNdc);
        gl.uniform1f(beamU_intensity, 0.22);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE);
        gl.blendEquation(gl.FUNC_ADD);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, segIdxBuf);
        gl.drawElements(gl.TRIANGLES, nSegs * 6, gl.UNSIGNED_SHORT, 0);
        gl.disable(gl.BLEND);
        gl.disableVertexAttribArray(beamA_start);
        gl.disableVertexAttribArray(beamA_end);
        gl.disableVertexAttribArray(beamA_idx);
      }

      /* ---- Pass 3: composite fboA to canvas with tone-map + color ---- */
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, W, H);
      gl.useProgram(outProg);
      gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
      gl.enableVertexAttribArray(outA_pos);
      gl.vertexAttribPointer(outA_pos, 2, gl.FLOAT, false, 0, 0);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, fboA.tex);
      gl.uniform1i(outU_tex, 0);
      {
        const tc = tracerColorRef.current;
        const bc = bgColorRef.current;
        const [tr, tg, tb] = hslToRgb(tc.h, tc.s, tc.l);
        const [br, bg2, bb] = hslToRgb(bc.h, bc.s, bc.l);
        gl.uniform3f(outU_color, tr, tg, tb);
        gl.uniform3f(outU_bg, br, bg2, bb);
      }
      gl.uniform1f(outU_exposure, 2.4);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      gl.disableVertexAttribArray(outA_pos);

      // swap
      const tmp = fboA; fboA = fboB; fboB = tmp;

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
      if (fboA) { gl.deleteTexture(fboA.tex); gl.deleteFramebuffer(fboA.fbo); }
      if (fboB) { gl.deleteTexture(fboB.tex); gl.deleteFramebuffer(fboB.fbo); }
    };
  }, []);

  const adjustZoom = (factor: number) => {
    zoomTargetRef.current = Math.max(0.05, Math.min(20, zoomTargetRef.current * factor));
    setTick((n) => n + 1);
  };

  const adjustTrace = (delta: number) => {
    traceWidthRef.current = Math.max(0.4, Math.min(40, traceWidthRef.current + delta));
    setTick((n) => n + 1);
  };

  const adjustDecay = (delta: number) => {
    decayRef.current = Math.max(0, Math.min(1, decayRef.current + delta));
    setTick((n) => n + 1);
  };

  /* ---- Audio: Lorenz running at sampleRate inside an AudioWorklet ---- */
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const a = audioRef.current;
      if (a) {
        try { a.node.disconnect(); } catch {}
        try { a.gain.disconnect(); } catch {}
        try { a.ctx.close(); } catch {}
        audioRef.current = null;
      }
    };
  }, []);

  const enableAudio = async () => {
    if (audioRef.current) {
      const a = audioRef.current;
      if (a.ctx.state === "suspended") await a.ctx.resume();
      setAudioOn(true);
      return;
    }
    // Per-attractor step source — kept in attractors.ts as raw strings so
    // production minification can't rename the identifiers we depend on.
    const stepCases = Object.entries(attractorWorkletSteps)
      .map(([k, body]) => `case '${k}': ${body} break;`)
      .join("\n      ");
    const workletCode = `
class AttractorProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.kind = 'lorenz';
    this.x = 0.01; this.y = 0; this.z = 0;
    // Smoothed coefficient array used by the step. tParams is the target
    // (what the UI just set); params chases it via the per-sample smoother.
    this.params  = [16, 45.92, 4];
    this.tParams = [16, 45.92, 4];
    this.dt = 0.003; this.tDt = 0.003;
    // visual / audio scaling
    this.zOffset = 45; this.audioScale = 0.035;
    // 3D rotation (radians) — mirrors the visual projection so the audio
    // L/R channels correspond to what's on screen.
    this.rotX = 0; this.rotY = 0;
    this.tRotX = 0; this.tRotY = 0;
    // per-sample rotation velocity (rad/sec).
    this.rotXVel = 0; this.rotYVel = 0;
    this.tRotXVel = 0; this.tRotYVel = 0;
    // Linear ramp state for rotation smoothing. Ramp length is derived from
    // the current audio block duration and set to 2 blocks.
    this.blockSize = 128;
    this.rotXStep = 0; this.rotYStep = 0;
    this.rotXVelStep = 0; this.rotYVelStep = 0;
    this.rotXRemain = 0; this.rotYRemain = 0;
    this.rotXVelRemain = 0; this.rotYVelRemain = 0;
    // smoothing coefficient (~30ms time constant @ 48k → recomputed in process)
    this.smooth = 0;
    this.smoothOn = true;
    // 10Hz one-pole high-pass DC blocker per channel (soemdsp OnePoleHP / IIT).
    // y[n] = b0*x[n] - b0*x[n-1] + a1*y[n-1]
    // Coeffs computed once at construction (sampleRate is fixed for ctx lifetime).
    const _fc = 10.0;
    const _w = (2 * Math.PI * _fc) / sampleRate;
    this.dcA1 = Math.exp(-_w);
    this.dcB0 = 0.5 * (1 + this.dcA1);
    // per-channel state: x[n-1], y[n-1]
    this.dcXL = 0; this.dcYL = 0;
    this.dcXR = 0; this.dcYR = 0;
    // visual decimation: every Nth sample is sent to main thread
    this.decim = 32; this.dCount = 0;
    this.batch = new Float32Array(768); // up to 256 triples
    this.bIdx = 0;
    this.port.onmessage = (e) => {
      const d = e.data;
      if (d.type === 'reset') {
        if (d.init) { this.x = d.init.x; this.y = d.init.y; this.z = d.init.z; }
        else { this.x = 0.01; this.y = 0; this.z = 0; }
        this.dcXL = 0; this.dcYL = 0; this.dcXR = 0; this.dcYR = 0;
        this.bIdx = 0;
        this.rotXStep = 0; this.rotYStep = 0;
        this.rotXVelStep = 0; this.rotYVelStep = 0;
        this.rotXRemain = 0; this.rotYRemain = 0;
        this.rotXVelRemain = 0; this.rotYVelRemain = 0;
        // snap smoothed values to targets on reset
        if (d.snap) {
          for (let i = 0; i < this.tParams.length; i++) this.params[i] = this.tParams[i];
          this.dt = this.tDt;
        }
        return;
      }
      if (d.kind !== undefined) this.kind = d.kind;
      if (d.params !== undefined) {
        this.tParams = d.params.slice();
        // resize / snap params array if length changed (attractor switch)
        if (this.params.length !== this.tParams.length) {
          this.params = this.tParams.slice();
        }
      }
      if (d.init !== undefined) { this.x = d.init.x; this.y = d.init.y; this.z = d.init.z; }
      if (d.zOffset !== undefined) this.zOffset = d.zOffset;
      if (d.audioScale !== undefined) this.audioScale = d.audioScale;
      if (d.dt !== undefined) this.tDt = d.dt;
      if (d.rotX !== undefined) this.startLinearRamp('rotX', 'tRotX', 'rotXStep', 'rotXRemain', d.rotX, true);
      if (d.rotY !== undefined) this.startLinearRamp('rotY', 'tRotY', 'rotYStep', 'rotYRemain', d.rotY, true);
      if (d.rotXVel !== undefined) this.startLinearRamp('rotXVel', 'tRotXVel', 'rotXVelStep', 'rotXVelRemain', d.rotXVel, false);
      if (d.rotYVel !== undefined) this.startLinearRamp('rotYVel', 'tRotYVel', 'rotYVelStep', 'rotYVelRemain', d.rotYVel, false);
      if (d.decim !== undefined) this.decim = Math.max(1, d.decim|0);
      if (d.smoothOn !== undefined) this.smoothOn = !!d.smoothOn;
    };
  }
  blockRampSamples() {
    const blockTime = this.blockSize / sampleRate;
    return Math.max(1, Math.round(blockTime * 2 * sampleRate));
  }
  shortestAngleDiff(target, current) {
    const PI = Math.PI;
    const TAU = 2 * PI;
    let d = target - current;
    if (d > PI) d -= TAU;
    else if (d < -PI) d += TAU;
    return d;
  }
  startLinearRamp(currentKey, targetKey, stepKey, remainKey, target, wrapAngle) {
    this[targetKey] = target;
    const rampSamples = this.blockRampSamples();
    const delta = wrapAngle
      ? this.shortestAngleDiff(target, this[currentKey])
      : target - this[currentKey];
    this[stepKey] = delta / rampSamples;
    this[remainKey] = rampSamples;
  }
  process(_, outputs) {
    const out = outputs[0];
    const L = out[0]; const R = out[1] || out[0];
    const n = L.length;
    this.blockSize = n;
    if (this.smooth === 0) {
      // ~30ms time constant
      this.smooth = 1 - Math.exp(-1 / (0.030 * sampleRate));
    }
    const k = this.smoothOn ? this.smooth : 1;
    const invSR = 1 / sampleRate;
    for (let i = 0; i < n; i++) {
      // per-sample smoothing of params (denormal-safe: targets are O(1))
      for (let p = 0; p < this.params.length; p++) {
        this.params[p] += (this.tParams[p] - this.params[p]) * k;
      }
      this.dt += (this.tDt - this.dt) * k;
      if (this.rotXVelRemain > 0) {
        this.rotXVel += this.rotXVelStep;
        if (--this.rotXVelRemain === 0) this.rotXVel = this.tRotXVel;
      }
      if (this.rotYVelRemain > 0) {
        this.rotYVel += this.rotYVelStep;
        if (--this.rotYVelRemain === 0) this.rotYVel = this.tRotYVel;
      }
      this.rotX += this.rotXVel * invSR;
      this.rotY += this.rotYVel * invSR;
      if (this.rotXRemain > 0) {
        this.rotX += this.rotXStep;
        if (--this.rotXRemain === 0) this.rotX = this.tRotX;
      }
      if (this.rotYRemain > 0) {
        this.rotY += this.rotYStep;
        if (--this.rotYRemain === 0) this.rotY = this.tRotY;
      }
      const dt = this.dt;
      switch (this.kind) {
      ${stepCases}
      }
      // explosion / NaN guard
      if (!isFinite(this.x) || Math.abs(this.x) > 1e4) {
        this.x = 0.01; this.y = 0; this.z = 0;
        this.dcXL = 0; this.dcYL = 0; this.dcXR = 0; this.dcYR = 0;
      }
      // Apply the same 3D rotation the visual uses, so L/R == on-screen X/Y.
      const x0 = this.x, y0 = this.y, z0 = this.z - this.zOffset;
      const cY = Math.cos(this.rotY), sY = Math.sin(this.rotY);
      const cX = Math.cos(this.rotX), sX = Math.sin(this.rotX);
      const xr = x0 * cY + z0 * sY;
      const zr = -x0 * sY + z0 * cY;
      const yr = y0 * cX - zr * sX;
      // normalize roughly to [-1,1]
      const sx = xr * this.audioScale;
      const sy = yr * this.audioScale;
      // soemdsp OnePoleHP @ 10Hz — speaker-protection DC blocker
      const ox = this.dcB0 * sx - this.dcB0 * this.dcXL + this.dcA1 * this.dcYL;
      this.dcXL = sx; this.dcYL = ox;
      const oy = this.dcB0 * sy - this.dcB0 * this.dcXR + this.dcA1 * this.dcYR;
      this.dcXR = sy; this.dcYR = oy;
      L[i] = Math.max(-1, Math.min(1, ox));
      R[i] = Math.max(-1, Math.min(1, oy));
      if (++this.dCount >= this.decim) {
        this.dCount = 0;
        if (this.bIdx + 3 <= this.batch.length) {
          this.batch[this.bIdx++] = this.x;
          this.batch[this.bIdx++] = this.y;
          this.batch[this.bIdx++] = this.z;
        }
      }
    }
    if (this.bIdx > 0) {
      this.port.postMessage({ pts: this.batch.slice(0, this.bIdx) });
      this.bIdx = 0;
    }
    return true;
  }
}
registerProcessor('attractor', AttractorProcessor);
`;
    try {
      const ctx = new AudioContext();
      const blob = new Blob([workletCode], { type: "application/javascript" });
      const url = URL.createObjectURL(blob);
      await ctx.audioWorklet.addModule(url);
      URL.revokeObjectURL(url);
      const node = new AudioWorkletNode(ctx, "attractor", {
        outputChannelCount: [2],
      });
      const gain = ctx.createGain();
      gain.gain.value = volumeRef.current;
      node.connect(gain).connect(ctx.destination);
      // Compute decimation: target ~freqRef visual points/sec, capped
      const targetVisRate = Math.max(60, Math.min(4000, freqRef.current));
      const decim = Math.max(1, Math.round(ctx.sampleRate / targetVisRate));
      {
        const def = ATTRACTORS[kindRef.current];
        node.port.postMessage({
          kind: def.id,
          params: paramsRef.current.slice(),
          init: def.init,
          zOffset: def.zOffset,
          audioScale: def.audioScale,
          dt: (freqRef.current * def.dt) / ctx.sampleRate,
          rotX: rotXRef.current,
          rotY: rotYRef.current,
          rotXVel: autoSpinXRef.current ? spinSpeedXRef.current * 60 : 0,
          rotYVel: autoSpinYRef.current ? spinSpeedYRef.current * 60 : 0,
          decim,
          smoothOn: smoothingRef.current,
        });
      }
      node.port.onmessage = (e) => {
        const pts = e.data && e.data.pts;
        if (!pts) return;
        const q = ptsQueueRef.current;
        for (let i = 0; i < pts.length; i++) q.push(pts[i]);
        // cap queue growth (~2s of points at 4000/s)
        const max = 8000 * 3;
        if (q.length > max) q.splice(0, q.length - max);
      };
      audioRef.current = { ctx, node, gain };
      setAudioOn(true);
      // push param updates ~30Hz
      const id = window.setInterval(() => {
        const a = audioRef.current;
        if (!a) { window.clearInterval(id); return; }
        const tvr = Math.max(60, Math.min(4000, freqRef.current));
        const dc = Math.max(1, Math.round(a.ctx.sampleRate / tvr));
        const def = ATTRACTORS[kindRef.current];
        a.node.port.postMessage({
          params: paramsRef.current.slice(),
          dt: (freqRef.current * def.dt) / a.ctx.sampleRate,
          // While auto-spinning, omit position target so the worklet's velocity
          // integration owns the angle; sending a moving target would fight it
          // and create per-message discontinuities (clicks).
          ...(autoSpinXRef.current ? {} : { rotX: rotXRef.current }),
          ...(autoSpinYRef.current ? {} : { rotY: rotYRef.current }),
          rotXVel: autoSpinXRef.current ? spinSpeedXRef.current * 60 : 0,
          rotYVel: autoSpinYRef.current ? spinSpeedYRef.current * 60 : 0,
          decim: dc,
          smoothOn: smoothingRef.current,
        });
      }, 33);
    } catch (err) {
      console.error("audio init failed", err);
    }
  };

  const toggleAudio = async () => {
    if (audioOn && audioRef.current) {
      await audioRef.current.ctx.suspend();
      setAudioOn(false);
    } else {
      await enableAudio();
    }
  };

  const setVolume = (v: number) => {
    volumeRef.current = v;
    if (audioRef.current) {
      audioRef.current.gain.gain.setTargetAtTime(
        v,
        audioRef.current.ctx.currentTime,
        0.01
      );
    }
    setTick((n) => n + 1);
  };

  // React to attractor switching: reset integrator state, snap defaults,
  // and notify the audio worklet so visual + audio stay in sync.
  useEffect(() => {
    const def = ATTRACTORS[kind];
    kindRef.current = kind;
    stateRef.current = { ...def.init };
    ptsQueueRef.current.length = 0;
    paramsRef.current = [...def.params];
    if (def.defaultFreq !== undefined) freqRef.current = def.defaultFreq;
    // (color refs synced in a separate effect)
    if (audioRef.current) {
      const { ctx, node } = audioRef.current;
      node.port.postMessage({
        kind: def.id,
        params: paramsRef.current.slice(),
        init: def.init,
        zOffset: def.zOffset,
        audioScale: def.audioScale,
        dt: (freqRef.current * def.dt) / ctx.sampleRate,
      });
      node.port.postMessage({ type: "reset", init: def.init });
    }
    setResetSeq((n) => n + 1);
    setTick((n) => n + 1);
  }, [kind]);

  // Sync color props into refs (read by rAF render loop).
  useEffect(() => { tracerColorRef.current = tracerColor; }, [tracerColor.h, tracerColor.s, tracerColor.l]);
  useEffect(() => { bgColorRef.current = bgColor; }, [bgColor.h, bgColor.s, bgColor.l]);

  // Reset coefficients, integrator state, and audio engine — recovers
  // from chaotic collapse / explosion / silenced denormals.
  const resetAll = () => {
    const def = ATTRACTORS[kindRef.current];
    paramsRef.current = [...def.params];
    freqRef.current = def.defaultFreq ?? 1440;
    stateRef.current = { ...def.init };
    ptsQueueRef.current.length = 0;
    if (audioRef.current) {
      audioRef.current.node.port.postMessage({ type: "reset", init: def.init });
      audioRef.current.node.port.postMessage({
        params: paramsRef.current.slice(),
        dt: (freqRef.current * def.dt) / audioRef.current.ctx.sampleRate,
      });
    }
    setResetSeq((n) => n + 1);
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

  const GhostKnob: React.FC<{ getValue: () => number; min: number; max: number }> = ({ getValue, min, max }) => {
    const dotRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
      let raf = 0;
      const range = max - min;
      const tick = () => {
        const el = dotRef.current;
        if (el) {
          let v = getValue() - min;
          v = ((v % range) + range) % range;
          el.style.left = `${(v / range) * 100}%`;
        }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    }, [getValue, min, max]);
    return (
      <div
        ref={dotRef}
        className="pointer-events-none absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-scope/60 ring-1 ring-scope/80 shadow-[0_0_6px_hsl(var(--scope)/0.6)]"
        style={{ left: "0%" }}
      />
    );
  };

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border border-border bg-[var(--gradient-panel)] scope-grid">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4 border-b border-border/60 px-4 py-2 mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        <div className="flex items-center gap-3">
          {ATTRACTORS[kind].paramSchema.map((p, i) => (
            <label key={`${kind}-p${i}`} className="flex items-center gap-1">
              {p.label}=
              <DragNumber
                key={`${kind}-p${i}-${resetSeq}`}
                value={paramsRef.current[i] ?? 0}
                onChange={(v) => { paramsRef.current[i] = v; setTick((n) => n + 1); }}
                min={p.min}
                max={p.max}
                mode={p.mode ?? "log"}
                format={(v) => v.toFixed(p.precision ?? 2)}
              />
            </label>
          ))}
          <label className="flex items-center gap-1">
            ƒ=
            <DragNumber
              value={freqRef.current}
              onChange={(v) => { freqRef.current = v; setTick((n) => n + 1); }}
              min={0.5}
              max={48000}
              suffix="Hz"
              format={(v) =>
                v >= 1000 ? (v / 1000).toFixed(v >= 10000 ? 1 : 2) + "k"
                : v >= 10 ? v.toFixed(0)
                : v.toFixed(2)
              }
            />
          </label>
          <button
            type="button"
            onClick={resetAll}
            className="ml-1 flex items-center gap-1 rounded-full border border-border/60 px-2 py-1 text-muted-foreground hover:text-scope hover:border-scope/60 transition-colors"
            title="Reset coefficients, integrator state, and audio engine"
            aria-label="Reset"
          >
            <RotateCcw className="h-3 w-3" />
            <span className="text-[10px] tracking-[0.15em]">reset</span>
          </button>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        className="h-[calc(100%-2.25rem)] w-full touch-none cursor-move"
        aria-label="Animated Lorenz attractor XY scope"
      />
      {/* Controls */}
      <div className="absolute bottom-3 right-3 flex items-center gap-2">
        <div className="flex items-center gap-1.5 rounded-full border border-border/60 bg-background/70 px-1.5 py-1 backdrop-blur-sm">
          <HoldButton
            onTick={(a) => adjustZoom(Math.pow(0.97, a))}
            className="rounded-full p-1.5 text-muted-foreground hover:text-scope hover:bg-scope/10 transition-colors"
            ariaLabel="Zoom out"
          >
            <Minus className="h-3.5 w-3.5" />
          </HoldButton>
          <span className="mono text-[10px] tracking-[0.15em] text-muted-foreground tabular-nums w-10 text-center">
            {zoomRef.current.toFixed(2)}x
          </span>
          <HoldButton
            onTick={(a) => adjustZoom(Math.pow(1.03, a))}
            className="rounded-full p-1.5 text-muted-foreground hover:text-scope hover:bg-scope/10 transition-colors"
            ariaLabel="Zoom in"
          >
            <Plus className="h-3.5 w-3.5" />
          </HoldButton>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-border/60 bg-background/70 px-1.5 py-1 backdrop-blur-sm">
          <HoldButton
            onTick={(a) => adjustTrace(-0.15 * a)}
            className="rounded-full p-1.5 text-muted-foreground hover:text-scope hover:bg-scope/10 transition-colors"
            ariaLabel="Thinner trace"
          >
            <Minus className="h-3.5 w-3.5" />
          </HoldButton>
          <span className="mono text-[10px] tracking-[0.15em] text-muted-foreground tabular-nums w-10 text-center">
            w{traceWidthRef.current.toFixed(1)}
          </span>
          <HoldButton
            onTick={(a) => adjustTrace(0.15 * a)}
            className="rounded-full p-1.5 text-muted-foreground hover:text-scope hover:bg-scope/10 transition-colors"
            ariaLabel="Thicker trace"
          >
            <Plus className="h-3.5 w-3.5" />
          </HoldButton>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-border/60 bg-background/70 px-1.5 py-1 backdrop-blur-sm">
          <HoldButton
            onTick={(a) => adjustDecay(0.01 * a)}
            className="rounded-full p-1.5 text-muted-foreground hover:text-scope hover:bg-scope/10 transition-colors"
            ariaLabel="Longer phosphor burn"
          >
            <Minus className="h-3.5 w-3.5" />
          </HoldButton>
          <span className="mono text-[10px] tracking-[0.15em] text-muted-foreground tabular-nums w-12 text-center">
            burn{(1 - decayRef.current).toFixed(2)}
          </span>
          <HoldButton
            onTick={(a) => adjustDecay(-0.01 * a)}
            className="rounded-full p-1.5 text-muted-foreground hover:text-scope hover:bg-scope/10 transition-colors"
            ariaLabel="Shorter phosphor burn"
          >
            <Plus className="h-3.5 w-3.5" />
          </HoldButton>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-border/60 bg-background/70 px-1.5 py-1 backdrop-blur-sm">
          <button
            type="button"
            onClick={toggleAudio}
            className={`rounded-full p-1.5 transition-colors ${audioOn ? "text-scope hover:bg-scope/10" : "text-muted-foreground hover:text-scope hover:bg-scope/10"}`}
            aria-label={audioOn ? "Mute audio" : "Enable audio"}
            title={audioOn ? "Mute" : "Enable audio output"}
          >
            {audioOn ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volumeRef.current}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            disabled={!audioOn}
            className="h-1 w-20 cursor-pointer accent-scope bg-border/40 rounded-full appearance-none disabled:opacity-40"
            aria-label="Volume"
          />
          <span className="mono text-[10px] tracking-[0.15em] text-muted-foreground tabular-nums w-8 text-center">
            {Math.round(volumeRef.current * 100)}
          </span>
        </div>
      </div>
      {/* Rotation sliders */}
      <div className="absolute top-12 right-3 flex flex-col gap-2 rounded-lg border border-border/60 bg-background/70 px-3 py-2 backdrop-blur-sm mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={autoSpinXRef.current}
            onChange={(e) => { autoSpinXRef.current = e.target.checked; setTick((n) => n + 1); }}
            className="accent-scope"
          />
          <span className="text-scope/80">⟳</span>
          <span className="w-10">{autoSpinXRef.current ? "ωX" : "rX"}</span>
          <div className="relative flex items-center">
            {autoSpinXRef.current ? (
              <input
                key="spinX"
                type="range"
                min={-0.45}
                max={0.45}
                step={0.001}
                defaultValue={spinSpeedXRef.current}
                onChange={(e) => { spinSpeedXRef.current = parseFloat(e.target.value); }}
                className={sliderClass}
              />
            ) : (
              <input
                key="rotX"
                type="range"
                min={-1.4}
                max={1.4}
                step={0.01}
                defaultValue={rotXRef.current}
                onChange={(e) => { rotXRef.current = parseFloat(e.target.value); }}
                className={sliderClass}
              />
            )}
            <GhostKnob getValue={() => rotXRef.current} min={-1.4} max={1.4} />
          </div>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={autoSpinYRef.current}
            onChange={(e) => { autoSpinYRef.current = e.target.checked; setTick((n) => n + 1); }}
            className="accent-scope"
          />
          <span className="text-scope/80">⟳</span>
          <span className="w-10">{autoSpinYRef.current ? "ωY" : "rY"}</span>
          <div className="relative flex items-center">
            {autoSpinYRef.current ? (
              <input
                key="spinY"
                type="range"
                min={-0.45}
                max={0.45}
                step={0.001}
                defaultValue={spinSpeedYRef.current}
                onChange={(e) => { spinSpeedYRef.current = parseFloat(e.target.value); }}
                className={sliderClass}
              />
            ) : (
              <input
                key="rotY"
                type="range"
                min={-Math.PI}
                max={Math.PI}
                step={0.01}
                defaultValue={rotYRef.current}
                onChange={(e) => { rotYRef.current = parseFloat(e.target.value); }}
                className={sliderClass}
              />
            )}
            <GhostKnob getValue={() => rotYRef.current} min={-Math.PI} max={Math.PI} />
          </div>
        </label>
      </div>
    </div>
  );
};

export default Oscilloscope;