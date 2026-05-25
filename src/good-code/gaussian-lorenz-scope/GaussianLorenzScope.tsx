import { useEffect, useRef } from "react";

const BURN_MIN = 0.005;
const BURN_MAX = 0.25;
const BURN_STEP = 0.005;
const WIDTH_MIN = 0.01;
const WIDTH_MAX = 0.2;
const WIDTH_STEP = 0.0025;
const FREQUENCY_MIN = 0;
const FREQUENCY_MAX = 20000;
const FREQUENCY_STEP = 1;

const GaussianLorenzScope = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const burnRef = useRef(0.045);
  const widthRef = useRef(0.075);
  const frequencyRef = useRef(240);
  const burnReadoutRef = useRef<HTMLSpanElement>(null);
  const widthReadoutRef = useRef<HTMLSpanElement>(null);
  const frequencyReadoutRef = useRef<HTMLSpanElement>(null);
  const holdRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      preserveDrawingBuffer: true,
    });
    if (!gl) return;

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) throw new Error("Could not create shader");
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(shader) ?? "Shader compile failed");
      }
      return shader;
    };

    const createProgram = (vertex: string, fragment: string) => {
      const handle = gl.createProgram();
      if (!handle) throw new Error("Could not create program");
      gl.attachShader(handle, compile(gl.VERTEX_SHADER, vertex));
      gl.attachShader(handle, compile(gl.FRAGMENT_SHADER, fragment));
      gl.linkProgram(handle);
      if (!gl.getProgramParameter(handle, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(handle) ?? "Program link failed");
      }
      return handle;
    };

    const dotProgram = createProgram(
      `
      attribute vec2 aCorner;
      uniform vec2 uCenter;
      uniform float uRadius;
      uniform float uIntensity;
      varying vec2 vLocal;

      void main() {
        vLocal = aCorner;
        gl_Position = vec4(uCenter + aCorner * uRadius, 0.0, 1.0);
      }
      `,
      `
      precision highp float;
      uniform float uIntensity;
      varying vec2 vLocal;

      void main() {
        float r = length(vLocal);
        if (r > 1.0) discard;
        float sigma = 0.32;
        float brightness = exp(-0.5 * (r * r) / (sigma * sigma));
        gl_FragColor = vec4(vec3(0.12, 1.0, 0.56) * brightness * uIntensity, 1.0);
      }
      `,
    );

    const fadeProgram = createProgram(
      `
      attribute vec2 aPos;
      void main() {
        gl_Position = vec4(aPos, 0.0, 1.0);
      }
      `,
      `
      precision highp float;
      uniform float uBurn;

      void main() {
        gl_FragColor = vec4(0.0, 0.0, 0.0, uBurn);
      }
      `,
    );

    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const aCorner = gl.getAttribLocation(dotProgram, "aCorner");
    const uCenter = gl.getUniformLocation(dotProgram, "uCenter");
    const uRadius = gl.getUniformLocation(dotProgram, "uRadius");
    const uIntensity = gl.getUniformLocation(dotProgram, "uIntensity");
    const fadeAPos = gl.getAttribLocation(fadeProgram, "aPos");
    const fadeUBurn = gl.getUniformLocation(fadeProgram, "uBurn");

    let raf = 0;
    let lastTime = performance.now();
    const lorenz = { x: 0.01, y: 0, z: 0 };
    let previousCenter: { x: number; y: number } | null = null;

    const updateReadout = () => {
      if (burnReadoutRef.current) {
        burnReadoutRef.current.textContent = `burn ${burnRef.current.toFixed(3)}`;
      }
      if (widthReadoutRef.current) {
        widthReadoutRef.current.textContent = `width ${widthRef.current.toFixed(3)}`;
      }
      if (frequencyReadoutRef.current) {
        frequencyReadoutRef.current.textContent = `freq ${frequencyRef.current.toFixed(0)}`;
      }
    };
    const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
    const setBurn = (next: number) => {
      burnRef.current = clamp(next, BURN_MIN, BURN_MAX);
      updateReadout();
    };
    const setWidth = (next: number) => {
      widthRef.current = clamp(next, WIDTH_MIN, WIDTH_MAX);
      updateReadout();
    };
    const setFrequency = (next: number) => {
      frequencyRef.current = clamp(next, FREQUENCY_MIN, FREQUENCY_MAX);
      updateReadout();
    };
    const adjustFrequency = (direction: number, amount = 1) => {
      if (direction < 0 && frequencyRef.current <= FREQUENCY_STEP) {
        setFrequency(0);
        return;
      }
      if (direction > 0 && frequencyRef.current === 0) {
        setFrequency(FREQUENCY_STEP);
        return;
      }
      const ratio = Math.pow(1.08, direction * amount);
      const nudge = direction * 0.05 * amount;
      setFrequency(frequencyRef.current * ratio + nudge);
    };
    const stopHold = () => {
      if (holdRef.current) cancelAnimationFrame(holdRef.current);
      holdRef.current = 0;
    };
    const startHold = (control: string, direction: number) => {
      stopHold();
      let last = performance.now();
      let held = 0;
      const apply = (amount: number) => {
        if (control === "burn") setBurn(burnRef.current + direction * BURN_STEP * amount);
        if (control === "width") setWidth(widthRef.current + direction * WIDTH_STEP * amount);
        if (control === "frequency") adjustFrequency(direction, amount);
      };
      apply(1);
      const loop = (now: number) => {
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        held += dt;
        const accel = 1 + Math.min(8, held * 4);
        apply(accel * dt * 18);
        holdRef.current = requestAnimationFrame(loop);
      };
      holdRef.current = requestAnimationFrame(loop);
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      const control = target?.dataset.control;
      const direction = target?.dataset.direction;
      if (!control || !direction) return;
      event.preventDefault();
      startHold(control, direction === "down" ? -1 : 1);
    };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const size = Math.floor(canvas.getBoundingClientRect().width * dpr);
      canvas.width = Math.max(1, size);
      canvas.height = Math.max(1, size);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
    };

    const stepLorenz = (dt: number) => {
      const sigma = 10;
      const rho = 28;
      const beta = 8 / 3;
      const dx = sigma * (lorenz.y - lorenz.x);
      const dy = lorenz.x * (rho - lorenz.z) - lorenz.y;
      const dz = lorenz.x * lorenz.y - beta * lorenz.z;
      lorenz.x += dx * dt;
      lorenz.y += dy * dt;
      lorenz.z += dz * dt;
    };

    const draw = (now: number) => {
      const frameDt = Math.min(0.05, Math.max(0, (now - lastTime) / 1000));
      lastTime = now;

      const steps = Math.max(1, Math.min(20000, Math.ceil(frameDt * frequencyRef.current)));

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.enable(gl.BLEND);

      gl.useProgram(fadeProgram);
      gl.bindBuffer(gl.ARRAY_BUFFER, quad);
      gl.enableVertexAttribArray(fadeAPos);
      gl.vertexAttribPointer(fadeAPos, 2, gl.FLOAT, false, 0, 0);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.uniform1f(fadeUBurn, burnRef.current);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      gl.disableVertexAttribArray(fadeAPos);

      gl.blendFunc(gl.ONE, gl.ONE);
      gl.useProgram(dotProgram);
      gl.bindBuffer(gl.ARRAY_BUFFER, quad);
      gl.enableVertexAttribArray(aCorner);
      gl.vertexAttribPointer(aCorner, 2, gl.FLOAT, false, 0, 0);
      gl.uniform1f(uRadius, widthRef.current);

      const drawDot = (x: number, y: number, intensity = 1) => {
        gl.uniform1f(uIntensity, intensity);
        gl.uniform2f(uCenter, x, y);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      };

      for (let i = 0; i < steps; i++) {
        stepLorenz(0.006);
        const nextCenter = {
          x: lorenz.x * 0.035,
          y: (lorenz.z - 24) * 0.035,
        };

        if (previousCenter) {
          const dx = nextCenter.x - previousCenter.x;
          const dy = nextCenter.y - previousCenter.y;
          const pixelDistance = Math.hypot(dx, dy) * canvas.width * 0.5;
          const radiusPixels = widthRef.current * canvas.width * 0.5;
          const spacingPixels = Math.max(1, radiusPixels * 0.18);
          const connectors = Math.min(256, Math.ceil(pixelDistance / spacingPixels));

          for (let j = 1; j <= connectors; j++) {
            const t = j / connectors;
            drawDot(previousCenter.x + dx * t, previousCenter.y + dy * t);
          }
        } else {
          drawDot(nextCenter.x, nextCenter.y);
        }

        previousCenter = nextCenter;
      }
      gl.disableVertexAttribArray(aCorner);

      raf = requestAnimationFrame(draw);
    };

    resize();
    updateReadout();
    window.addEventListener("resize", resize);
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", stopHold);
    window.addEventListener("pointercancel", stopHold);
    window.addEventListener("blur", stopHold);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      stopHold();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", stopHold);
      window.removeEventListener("pointercancel", stopHold);
      window.removeEventListener("blur", stopHold);
      gl.deleteBuffer(quad);
      gl.deleteProgram(dotProgram);
      gl.deleteProgram(fadeProgram);
    };
  }, []);

  return (
    <main className="fixed inset-0 flex items-center justify-center overflow-hidden bg-black">
      <div className="fixed left-4 top-4 z-10 flex select-none items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-emerald-300/70">
        <button
          type="button"
          data-control="width"
          data-direction="down"
          className="cursor-pointer text-emerald-300/80 hover:text-emerald-200"
          aria-label="Decrease width"
        >
          ←
        </button>
        <span ref={widthReadoutRef}>width 0.075</span>
        <button
          type="button"
          data-control="width"
          data-direction="up"
          className="cursor-pointer text-emerald-300/80 hover:text-emerald-200"
          aria-label="Increase width"
        >
          →
        </button>

        <button
          type="button"
          data-control="frequency"
          data-direction="down"
          className="cursor-pointer text-emerald-300/80 hover:text-emerald-200"
          aria-label="Decrease frequency"
        >
          ←
        </button>
        <span ref={frequencyReadoutRef}>freq 240</span>
        <button
          type="button"
          data-control="frequency"
          data-direction="up"
          className="cursor-pointer text-emerald-300/80 hover:text-emerald-200"
          aria-label="Increase frequency"
        >
          →
        </button>

        <button
          type="button"
          data-control="burn"
          data-direction="down"
          className="cursor-pointer text-emerald-300/80 hover:text-emerald-200"
          aria-label="Decrease burn"
        >
          ←
        </button>
        <span ref={burnReadoutRef}>burn 0.045</span>
        <button
          type="button"
          data-control="burn"
          data-direction="up"
          className="cursor-pointer text-emerald-300/80 hover:text-emerald-200"
          aria-label="Increase burn"
        >
          →
        </button>
      </div>
      <canvas
        ref={canvasRef}
        className="aspect-square h-[100vmin] w-[100vmin] bg-black"
        aria-label="Lorenz Gaussian dot burn test"
      />
    </main>
  );
};

export default GaussianLorenzScope;
