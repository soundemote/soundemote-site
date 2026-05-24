import { useEffect, useRef, useState } from "react";
import { Minus, Plus, Volume2, VolumeX } from "lucide-react";

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
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  format: (v: number) => string;
  suffix?: string;
  sensitivity?: number;
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
    // log-scale drag: dragging up multiplies, dragging down divides
    const logV = Math.log(Math.max(1e-6, startRef.current.v));
    const next = Math.exp(logV - dy * sensitivity);
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

export const Oscilloscope = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Live params held in refs so the rAF loop reads the latest values
  const zoomRef = useRef(1);
  const rotXRef = useRef(0.35); // tilt
  const rotYRef = useRef(0);    // spin
  const autoSpinRef = useRef(false);
  const panXRef = useRef(0);
  const panYRef = useRef(0);
  const panTargetXRef = useRef(0);
  const panTargetYRef = useRef(0);
  const traceWidthRef = useRef(2.2);
  const spinSpeedXRef = useRef(0);
  const spinSpeedYRef = useRef(0.003);
  const sigmaRef = useRef(16);
  const rhoRef = useRef(45.92);
  const betaRef = useRef(4);
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

    // ---------- Shader helpers ----------
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
       uniform float uFade;
       varying vec2 vUv;
       void main(){
         vec4 c = texture2D(uTex, vUv) * uFade;
         // hard floor so trailing dim pixels actually die
         c = max(c - vec4(0.002), vec4(0.0));
         gl_FragColor = vec4(c.rgb, 1.0);
       }`
    );
    const fadeA_pos = gl.getAttribLocation(fadeProg, "aPos");
    const fadeU_tex = gl.getUniformLocation(fadeProg, "uTex");
    const fadeU_fade = gl.getUniformLocation(fadeProg, "uFade");

    const outProg = program(
      quadVS,
      `precision highp float;
       uniform sampler2D uTex;
       uniform vec3 uColor;
       uniform float uExposure;
       varying vec2 vUv;
       void main(){
         float l = texture2D(uTex, vUv).r;
         float t = 1.0 - exp(-l * uExposure);
         vec3 col = mix(uColor, vec3(1.0), t * t * 0.6) * t;
         gl_FragColor = vec4(col, 1.0);
       }`
    );
    const outA_pos = gl.getAttribLocation(outProg, "aPos");
    const outU_tex = gl.getUniformLocation(outProg, "uTex");
    const outU_color = gl.getUniformLocation(outProg, "uColor");
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

    let x = 0.01;
    let y = 0;
    let z = 0;
    const dt = 0.006;
    // stepsPerFrame is computed each frame from freqRef + dtSeconds
    // Base scale chosen so zoom=1.0 shows the attractor at its most readable "default" size.
    // (What used to render at 0.3x zoom is now the 1.0x baseline.)
    const scale = 0.018 * 0.3 * 0.3;

    let prevPx: number | null = null;
    let prevPy: number | null = null;
    // Phosphor decay (single multiplicative fade, dood.al style)
    const persistence = 0.86; // per-60fps-frame keep factor

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
      const next = zoomRef.current * (e.deltaY < 0 ? 1.1 : 0.9);
      zoomRef.current = Math.max(0.1, Math.min(20, next));
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
      }
      // Critically-damped lerp toward drag target for smooth pan
      const panLerp = 1 - Math.pow(0.001, dtSeconds);
      panXRef.current += (panTargetXRef.current - panXRef.current) * panLerp;
      panYRef.current += (panTargetYRef.current - panYRef.current) * panLerp;
      const cx = w / 2 + panXRef.current;
      const cy = h / 2 + panYRef.current;

      if (autoSpinRef.current) {
        // In auto-spin mode, rX/rY sliders act as rotation speeds (rad/frame)
        rotXRef.current += spinSpeedXRef.current;
        rotYRef.current += spinSpeedYRef.current;
      }

      const sigma = sigmaRef.current;
      const rho = rhoRef.current;
      const beta = betaRef.current;

      const cosY = Math.cos(rotYRef.current);
      const sinY = Math.sin(rotYRef.current);
      const cosX = Math.cos(rotXRef.current);
      const sinX = Math.sin(rotXRef.current);

      // ---- Integrate Lorenz → screen-space points (NDC) ----
      const pts: number[] = []; // [x0,y0,x1,y1,...] in NDC
      // start with prev point if we have one, so continuous between frames
      if (prevPx !== null && prevPy !== null) {
        pts.push((prevPx / w) * 2 - 1, 1 - (prevPy / h) * 2);
      }
      const stepsPerFrame = Math.max(
        1,
        Math.min(8000, Math.round(freqRef.current * dtSeconds))
      );
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

      // ---- Pass 1: fade previous (read fboB → write fboA) ----
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
      const fade = Math.pow(persistence, frameScale);
      gl.uniform1f(fadeU_fade, fade);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      gl.disableVertexAttribArray(fadeA_pos);

      // ---- Pass 2: additively draw segments into fboA ----
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

      // ---- Pass 3: composite fboA to canvas with tone-map + color ----
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, W, H);
      gl.useProgram(outProg);
      gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
      gl.enableVertexAttribArray(outA_pos);
      gl.vertexAttribPointer(outA_pos, 2, gl.FLOAT, false, 0, 0);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, fboA.tex);
      gl.uniform1i(outU_tex, 0);
      // scope green: rgb(40,235,158) ≈ (0.157, 0.921, 0.620)
      gl.uniform3f(outU_color, 0.18, 0.95, 0.42);
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
    zoomRef.current = Math.max(0.1, Math.min(20, zoomRef.current * factor));
    setTick((n) => n + 1);
  };

  const adjustTrace = (delta: number) => {
    traceWidthRef.current = Math.max(0.4, Math.min(40, traceWidthRef.current + delta));
    setTick((n) => n + 1);
  };

  // ---- Audio: Lorenz running at sampleRate inside an AudioWorklet ----
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
    const workletCode = `
class LorenzProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.x = 0.01; this.y = 0; this.z = 0;
    this.sigma = 16; this.rho = 45.92; this.beta = 4; this.dt = 0.003;
    // simple DC blockers per channel
    this.lx = 0; this.ly = 0; this.px = 0; this.py = 0;
    this.port.onmessage = (e) => {
      const d = e.data;
      if (d.sigma !== undefined) this.sigma = d.sigma;
      if (d.rho !== undefined) this.rho = d.rho;
      if (d.beta !== undefined) this.beta = d.beta;
      if (d.dt !== undefined) this.dt = d.dt;
    };
  }
  process(_, outputs) {
    const out = outputs[0];
    const L = out[0]; const R = out[1] || out[0];
    const n = L.length;
    const s = this.sigma, r = this.rho, b = this.beta, dt = this.dt;
    for (let i = 0; i < n; i++) {
      const dx = s*(this.y-this.x);
      const dy = this.x*(r-this.z)-this.y;
      const dz = this.x*this.y-b*this.z;
      this.x += dx*dt; this.y += dy*dt; this.z += dz*dt;
      // normalize roughly to [-1,1]
      const sx = this.x * 0.035;
      const sy = this.y * 0.035;
      // 1-pole DC block
      const ox = sx - this.px + 0.995 * this.lx;
      const oy = sy - this.py + 0.995 * this.ly;
      this.px = sx; this.py = sy; this.lx = ox; this.ly = oy;
      L[i] = Math.max(-1, Math.min(1, ox));
      R[i] = Math.max(-1, Math.min(1, oy));
    }
    return true;
  }
}
registerProcessor('lorenz', LorenzProcessor);
`;
    try {
      const ctx = new AudioContext();
      const blob = new Blob([workletCode], { type: "application/javascript" });
      const url = URL.createObjectURL(blob);
      await ctx.audioWorklet.addModule(url);
      URL.revokeObjectURL(url);
      const node = new AudioWorkletNode(ctx, "lorenz", {
        outputChannelCount: [2],
      });
      const gain = ctx.createGain();
      gain.gain.value = volumeRef.current;
      node.connect(gain).connect(ctx.destination);
      node.port.postMessage({
        sigma: sigmaRef.current,
        rho: rhoRef.current,
        beta: betaRef.current,
        dt: (freqRef.current * 0.006) / ctx.sampleRate,
      });
      audioRef.current = { ctx, node, gain };
      setAudioOn(true);
      // push param updates ~30Hz
      const id = window.setInterval(() => {
        const a = audioRef.current;
        if (!a) { window.clearInterval(id); return; }
        a.node.port.postMessage({
          sigma: sigmaRef.current,
          rho: rhoRef.current,
          beta: betaRef.current,
          dt: (freqRef.current * 0.006) / a.ctx.sampleRate,
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
          <label className="flex items-center gap-1">
            f=
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
          <span className="w-10">{autoSpinRef.current ? "ωX" : "rX"}</span>
          {autoSpinRef.current ? (
            <input
              key="spinX"
              type="range"
              min={-0.05}
              max={0.05}
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
        </label>
        <label className="flex items-center gap-2">
          <span className="w-10">{autoSpinRef.current ? "ωY" : "rY"}</span>
          {autoSpinRef.current ? (
            <input
              key="spinY"
              type="range"
              min={-0.05}
              max={0.05}
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
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            defaultChecked={autoSpinRef.current}
            onChange={(e) => { autoSpinRef.current = e.target.checked; setTick((n) => n + 1); }}
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