import { nearestCssColorName } from "./css-named-colors.js";

const STYLE_ID = "sound-gradient-curve-widget-styles";

const css = `
  .gcw-mount {
    --gcw-bg: rgba(243, 240, 230, 0.035);
    --gcw-border: rgba(243, 240, 230, 0.16);
    --gcw-ink: rgba(243, 240, 230, 0.9);
    --gcw-muted: rgba(243, 240, 230, 0.62);
    --gcw-accent: #f1b84b;
    color: var(--gcw-ink);
    container-type: inline-size;
    display: grid;
    font-family: Inter, ui-sans-serif, system-ui, sans-serif;
    height: 100%;
    min-height: 0;
    min-width: 0;
    user-select: none;
    width: 100%;
  }

  .gcw-mount,
  .gcw-mount * {
    box-sizing: border-box;
  }

  .gcw-root {
    display: grid;
    gap: 6px;
    grid-template-areas:
      "preview"
      "presets"
      "index"
      "falloff"
      "active"
      "saved"
      "actions";
    grid-template-rows: min(46vh, 420px) auto auto auto auto auto auto;
    height: auto;
    min-height: 100%;
    padding: 0;
  }

  .gcw-preview {
    border: 1px solid var(--gcw-border);
    border-radius: 7px;
    min-height: 0;
    overflow: hidden;
  }

  .gcw-preview {
    background: var(--gcw-preview-edge-color, rgba(18, 20, 15, 0.42));
    box-shadow: inset 0 0 32px rgba(18, 20, 15, 0.3);
    cursor: crosshair;
    grid-area: preview;
    min-height: 0;
    position: relative;
  }

  .gcw-preview::before {
    background: var(--gcw-preview-gradient);
    border-radius: inherit;
    content: "";
    inset: 0;
    position: absolute;
    transform: translate(var(--gcw-preview-pan-x, 0px), var(--gcw-preview-pan-y, 0px)) scale(var(--gcw-preview-zoom, 1));
    transform-origin: center;
  }

  .gcw-preview[data-preview-mode="dot"]::before {
    aspect-ratio: 1;
    border-radius: 999px;
    inset: 50% auto auto 50%;
    max-height: 96%;
    max-width: 96%;
    transform: translate(calc(-50% + var(--gcw-preview-pan-x, 0px)), calc(-50% + var(--gcw-preview-pan-y, 0px))) scale(var(--gcw-preview-zoom, 1));
    transform-origin: center;
    width: min(72cqw, 460px);
  }

  .gcw-preview[data-preview-mode="dot"],
  .gcw-preview[data-preview-mode="square"],
  .gcw-preview[data-preview-mode="rectangle"] {
    box-shadow: none;
  }

  .gcw-preview[data-preview-mode="square"]::before {
    aspect-ratio: 1;
    border-radius: 0;
    inset: 50% auto auto 50%;
    max-height: 90%;
    max-width: 90%;
    transform: translate(calc(-50% + var(--gcw-preview-pan-x, 0px)), calc(-50% + var(--gcw-preview-pan-y, 0px))) scale(var(--gcw-preview-zoom, 1));
    transform-origin: center;
    width: min(52cqw, 380px);
  }

  .gcw-preview[data-preview-mode="rectangle"]::before {
    border-radius: 0;
    inset: 14% 8%;
    transform: translate(var(--gcw-preview-pan-x, 0px), var(--gcw-preview-pan-y, 0px)) scale(var(--gcw-preview-zoom, 1));
    transform-origin: center;
  }

  .gcw-zone {
    display: grid;
    gap: 3px;
    min-height: 0;
    overflow: visible;
    padding: 0;
  }

  .gcw-zone[data-drop-zone="active"] {
    grid-area: active;
    min-height: 48px;
  }

  .gcw-zone[data-drop-zone="saved"] {
    grid-area: saved;
    min-height: 62px;
  }

  .gcw-zone[data-drag-over="true"] {
    filter: drop-shadow(0 0 14px rgba(241, 184, 75, 0.26));
  }

  .gcw-zone[data-empty="true"] {
    grid-template-rows: auto;
    min-height: auto;
  }

  .gcw-zone-title {
    color: var(--gcw-muted);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0;
  }

  .gcw-palette,
  .gcw-saved {
    align-content: start;
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    min-height: 0;
    overflow: visible;
  }

  .gcw-zone[data-empty="true"] .gcw-saved {
    display: none;
  }

  .gcw-color-card {
    display: block;
    height: 36px;
    max-width: none;
    min-height: 24px;
    padding: 0;
    width: 36px;
  }

  .gcw-color-card[data-zone="saved"] {
    height: 36px;
    width: 36px;
  }

  .gcw-color-card .gcw-swatch-button,
  .gcw-color-card[data-zone="saved"] .gcw-swatch-button {
    border-radius: 5px;
    height: 100%;
    min-height: 0;
    width: 100%;
  }

  .gcw-color-card .gcw-color-meta,
  .gcw-color-card[data-zone="saved"] .gcw-color-meta {
    display: none;
  }

  .gcw-color-card[draggable="true"] {
    cursor: grab;
  }

  .gcw-color-card[data-dragging="true"] {
    opacity: 0.46;
  }

  .gcw-color-card[data-active="true"] {
    filter: drop-shadow(0 0 12px rgba(241, 184, 75, 0.26));
  }

  .gcw-color-card[data-active="true"] .gcw-swatch-button {
    border-color: var(--gcw-accent);
    box-shadow: inset 0 0 0 1px var(--gcw-accent);
  }

  .gcw-add-card {
    display: block;
    height: 36px;
    max-width: none;
    min-height: 24px;
    padding: 0;
    position: relative;
    width: 36px;
  }

  .gcw-add-card[data-dragging="true"] {
    opacity: 0.46;
  }

  .gcw-add-card button {
    align-items: center;
    background: rgba(241, 184, 75, 0.16);
    border: 1px dashed rgba(241, 184, 75, 0.72);
    border-radius: 5px;
    color: var(--gcw-accent);
    cursor: grab;
    display: flex;
    font: inherit;
    font-size: 18px;
    font-weight: 800;
    height: 100%;
    justify-content: center;
    line-height: 1;
    min-height: 0;
    padding: 0;
    width: 100%;
  }

  .gcw-add-card input[type="color"] {
    height: 1px;
    left: 0;
    opacity: 0;
    pointer-events: none;
    position: absolute;
    top: 0;
    width: 1px;
  }

  .gcw-swatch-button {
    background: var(--card-color);
    border: 1px solid rgba(18, 20, 15, 0.82);
    cursor: pointer;
    display: block;
    height: 100%;
    min-height: 0;
    overflow: hidden;
    padding: 0;
    position: relative;
    width: 100%;
  }

  /* Keep the native colour input out of the pointer path so the whole swatch
     stays a reliable drag surface. It is opened programmatically on click. */
  .gcw-swatch-button input[type="color"] {
    height: 1px;
    left: 0;
    opacity: 0;
    pointer-events: none;
    position: absolute;
    top: 0;
    width: 1px;
  }

  .gcw-color-meta {
    color: var(--gcw-muted);
    font-size: 11px;
    font-variant-numeric: tabular-nums;
    line-height: 1;
    max-width: 180px;
    overflow: hidden;
    text-align: left;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .gcw-row {
    align-items: center;
    display: grid;
    gap: 8px;
    grid-template-columns: minmax(58px, 0.34fr) minmax(0, 1fr) minmax(58px, 0.34fr);
  }

  .gcw-note {
    color: var(--gcw-muted);
    font-size: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .gcw-row span,
  .gcw-row output {
    color: var(--gcw-muted);
    font-size: 13px;
  }

  .gcw-row output {
    font-variant-numeric: tabular-nums;
    text-align: right;
  }

  .gcw-row input {
    min-width: 0;
    width: 100%;
  }

  .gcw-row input[type="range"] {
    accent-color: var(--gcw-accent);
  }

  .gcw-actions {
    align-items: center;
    display: flex;
    gap: 5px;
    flex-wrap: wrap;
    grid-area: actions;
  }

  .gcw-toggle {
    align-items: center;
    background: rgba(243, 240, 230, 0.045);
    border: 1px solid var(--gcw-border);
    border-radius: 6px;
    color: var(--gcw-muted);
    display: inline-flex;
    font-size: 10px;
    gap: 5px;
    min-height: 21px;
    padding: 0 6px;
  }

  .gcw-index-control {
    align-items: center;
    background: rgba(243, 240, 230, 0.045);
    border: 1px solid var(--gcw-border);
    border-radius: 6px;
    color: var(--gcw-muted);
    display: inline-flex;
    font-size: 10px;
    gap: 5px;
    min-height: 21px;
    padding: 0 6px;
  }

  .gcw-index-control span {
    color: var(--gcw-ink);
    font-weight: 800;
  }

  .gcw-index-control input {
    background: rgba(18, 20, 15, 0.42);
    border: 1px solid var(--gcw-border);
    border-radius: 999px;
    color: var(--gcw-ink);
    cursor: ew-resize;
    font: inherit;
    font-variant-numeric: tabular-nums;
    font-weight: 800;
    height: 18px;
    padding: 0 10px;
    text-align: center;
    width: 8ch;
  }

  .gcw-index-control input::-webkit-outer-spin-button,
  .gcw-index-control input::-webkit-inner-spin-button {
    appearance: none;
    margin: 0;
  }

  .gcw-index-control input[type="number"] {
    appearance: textfield;
  }

  .gcw-arch-params {
    align-items: center;
    background: rgba(243, 240, 230, 0.045);
    border: 1px solid var(--gcw-border);
    border-radius: 999px;
    color: var(--gcw-muted);
    display: inline-flex;
    flex-wrap: wrap;
    font-size: 10px;
    gap: 5px;
    min-height: 21px;
    padding: 0 6px;
  }

  .gcw-arch-params > span {
    color: var(--gcw-ink);
    font-weight: 800;
  }

  .gcw-arch-params .gcw-index-control {
    background: transparent;
    border: none;
    min-height: 0;
    padding: 0;
  }

  .gcw-arch-params .gcw-index-control input {
    padding: 0 4px;
    width: 5.5ch;
  }

  .gcw-actions button {
    background: rgba(243, 240, 230, 0.06);
    border: 1px solid var(--gcw-border);
    border-radius: 6px;
    color: var(--gcw-ink);
    flex: 0 1 auto;
    font: inherit;
    font-size: 10px;
    min-height: 21px;
    padding: 0 6px;
  }

  .gcw-actions button:disabled {
    color: rgba(243, 240, 230, 0.32);
  }

  .gcw-delete:not(:disabled) {
    border-color: rgba(255, 95, 95, 0.46);
    color: #ffb7b7;
  }

  .gcw-hue-segments {
    align-items: center;
    background: rgba(243, 240, 230, 0.045);
    border: 1px solid var(--gcw-border);
    border-radius: 999px;
    color: var(--gcw-muted);
    display: inline-flex;
    font-size: 10px;
    min-height: 21px;
    overflow: hidden;
    padding: 0;
  }

  .gcw-hue-segments span {
    align-items: center;
    align-self: stretch;
    display: inline-flex;
    padding: 0 6px;
  }

  .gcw-preview-segments,
  .gcw-lightness-segments {
    align-items: center;
    background: rgba(243, 240, 230, 0.045);
    border: 1px solid var(--gcw-border);
    border-radius: 999px;
    color: var(--gcw-muted);
    display: inline-flex;
    font-size: 10px;
    min-height: 21px;
    overflow: hidden;
    padding: 0;
  }

  .gcw-preview-segments span,
  .gcw-lightness-segments span {
    align-items: center;
    align-self: stretch;
    display: inline-flex;
    padding: 0 6px;
  }

  .gcw-radial-center-segments {
    align-items: center;
    background: rgba(243, 240, 230, 0.045);
    border: 1px solid var(--gcw-border);
    border-radius: 999px;
    color: var(--gcw-muted);
    display: inline-flex;
    font-size: 10px;
    min-height: 21px;
    overflow: hidden;
    padding: 0;
  }

  .gcw-radial-center-segments span {
    align-items: center;
    align-self: stretch;
    display: inline-flex;
    padding: 0 6px;
  }

  .gcw-hue-option,
  .gcw-preview-option,
  .gcw-lightness-option,
  .gcw-radial-center-option {
    background: transparent;
    border: 0;
    border-radius: 0;
    color: var(--gcw-muted);
    font: inherit;
    align-self: stretch;
    min-height: 21px;
    padding: 0 6px;
  }

  .gcw-hue-option[data-active="true"],
  .gcw-preview-option[data-active="true"],
  .gcw-lightness-option[data-active="true"],
  .gcw-radial-center-option[data-active="true"] {
    background: var(--gcw-accent);
    color: #18140a;
    font-weight: 800;
  }

  .gcw-index-strip {
    display: flex;
    grid-area: index;
    min-height: 42px;
    overflow: hidden;
    position: relative;
  }

  .gcw-falloff {
    background: rgba(18, 20, 15, 0.38);
    border: 1px solid rgba(241, 184, 75, 0.26);
    border-radius: 9px;
    display: grid;
    gap: 4px;
    grid-area: falloff;
    min-height: 60px;
    padding: 5px;
  }

  .gcw-falloff-head {
    align-items: center;
    color: var(--gcw-muted);
    display: flex;
    font-size: 10px;
    font-weight: 800;
    justify-content: space-between;
    min-height: 0;
  }

  .gcw-falloff-head span:last-child {
    color: rgba(243, 240, 230, 0.46);
    font-weight: 600;
  }

  .gcw-falloff-strip {
    background:
      linear-gradient(90deg, rgba(255, 255, 255, 0.08), transparent 48%, rgba(255, 255, 255, 0.05)),
      var(--gcw-falloff-gradient);
    border: 1px solid var(--gcw-border);
    border-radius: 999px;
    min-height: 22px;
    position: relative;
  }

  .gcw-falloff-handle {
    background: var(--gcw-accent);
    border: 1px solid rgba(18, 20, 15, 0.78);
    box-shadow: 0 0 0 1px rgba(243, 240, 230, 0.22), 0 4px 12px rgba(0, 0, 0, 0.24);
    height: 20px;
    left: var(--falloff-position);
    padding: 0;
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 20px;
  }

  .gcw-falloff-handle[data-falloff-handle="leftEdge"] {
    border-radius: 46% 58% 58% 46% / 50%;
  }

  .gcw-falloff-handle[data-falloff-handle="leftMid"],
  .gcw-falloff-handle[data-falloff-handle="rightMid"] {
    border-radius: 999px;
  }

  .gcw-falloff-handle[data-falloff-handle="rightEdge"] {
    border-radius: 58% 46% 46% 58% / 50%;
  }

  .gcw-falloff-values {
    color: rgba(243, 240, 230, 0.54);
    display: grid;
    font-size: 10px;
    font-variant-numeric: tabular-nums;
    gap: 8px;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    line-height: 1;
  }

  .gcw-falloff-values span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .gcw-index-swatch {
    background: var(--index-color);
    border: 0;
    flex: 1 1 0;
    min-width: 3px;
    padding: 0;
  }

  .gcw-index-swatch[data-sampled="true"] {
    box-shadow: inset 0 0 0 1px var(--gcw-accent);
    z-index: 1;
  }

  /* Preset gradient buttons -- one-click starting palettes. */
  .gcw-presets {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    grid-area: presets;
  }

  .gcw-presets > span {
    color: var(--gcw-muted);
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }

  .gcw-preset {
    align-items: center;
    border: 1px solid var(--gcw-border);
    border-radius: 6px;
    color: var(--gcw-ink);
    cursor: pointer;
    display: inline-flex;
    font: inherit;
    font-size: 10px;
    gap: 6px;
    min-height: 24px;
    padding: 0 8px;
  }

  .gcw-preset:hover {
    border-color: var(--gcw-accent);
  }

  .gcw-preset-swatch {
    border-radius: 999px;
    box-shadow: inset 0 0 0 1px rgba(18, 20, 15, 0.6);
    height: 14px;
    width: 14px;
  }

`; 

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = css;
  document.head.appendChild(style);
}

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const wrapHue = (hue) => ((hue % 360) + 360) % 360;

// Every stop needs a globally unique id. Semantic ids like "black"/"red" used
// to be reused across the gradient list and the saved list, which made
// drag-and-drop and selection collide (dragging the saved black hit the
// gradient black). Always mint a fresh id and keep the caller's hint only as a
// readable prefix.
let stopIdCounter = 0;
function uniqueStopId(hint) {
  stopIdCounter += 1;
  const prefix = typeof hint === "string" && hint ? hint.replace(/[^a-z0-9]+/gi, "-") : "stop";
  return `${prefix}-${stopIdCounter}`;
}

function hslToHex(h, s, l) {
  const hue = wrapHue(h) / 360;
  const sat = clamp(s, 0, 100) / 100;
  const light = clamp(l, 0, 100) / 100;
  const channel = (offset) => {
    const k = (offset + hue * 12) % 12;
    const a = sat * Math.min(light, 1 - light);
    return light - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  return `#${[channel(0), channel(8), channel(4)].map((value) => Math.round(value * 255).toString(16).padStart(2, "0")).join("").toUpperCase()}`;
}

function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  return [0, 2, 4].map((offset) => parseInt(clean.slice(offset, offset + 2), 16) / 255);
}

function hexToRgbBytes(hex) {
  const clean = hex.replace("#", "");
  return [0, 2, 4].map((offset) => parseInt(clean.slice(offset, offset + 2), 16));
}

function hexToHsl(hex) {
  const [r, g, b] = hexToRgb(hex);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const light = (max + min) / 2;
  const delta = max - min;
  if (delta === 0) return { h: 0, s: 0, l: light * 100 };
  const sat = delta / (1 - Math.abs(2 * light - 1));
  let hue = 0;
  if (max === r) hue = 60 * (((g - b) / delta) % 6);
  if (max === g) hue = 60 * ((b - r) / delta + 2);
  if (max === b) hue = 60 * ((r - g) / delta + 4);
  return { h: wrapHue(hue), s: sat * 100, l: light * 100 };
}

function normalizeStop(stop, index, count) {
  const fallbackColor = ["#7AA4FF", "#35FF90", "#F1B84B", "#FF5AD7"][index % 4];
  const color = /^#[0-9a-f]{6}$/i.test(stop?.color || "") ? stop.color.toUpperCase() : fallbackColor;
  const hsl = stop?.hsl || hexToHsl(color);
  return polishStop({
    id: uniqueStopId(stop?.id),
    h: wrapHue(Number.isFinite(Number(stop?.h)) ? Number(stop.h) : hsl.h),
    s: clamp(Number.isFinite(Number(stop?.s)) ? Number(stop.s) : hsl.s, 0, 100),
    l: clamp(Number.isFinite(Number(stop?.l)) ? Number(stop.l) : hsl.l, 0, 100),
  });
}

function polishStop(stop) {
  if (stop.s <= 8) {
    return {
      ...stop,
      s: 0,
      l: clamp(stop.l, 0, 100),
    };
  }

  return {
    ...stop,
    s: clamp(stop.s, 58, 96),
    l: clamp(stop.l, 26, 76),
  };
}

function polishSample(sample) {
  if (sample.s <= 8) {
    return {
      ...sample,
      s: 0,
      l: clamp(sample.l, 0, 100),
    };
  }

  return {
    ...sample,
    s: clamp(sample.s, 0, 96),
    l: clamp(sample.l, 0, 100),
  };
}

function stopColor(stop) {
  return hslToHex(stop.h, stop.s, stop.l);
}

function hueRoute(stops) {
  if (stops.length <= 1) {
    return [...stops];
  }

  const byHue = [...stops].sort((a, b) => a.h - b.h);
  let largestGap = -1;
  let startIndex = 0;
  for (let index = 0; index < byHue.length; index += 1) {
    const current = byHue[index];
    const next = byHue[(index + 1) % byHue.length];
    const gap = index === byHue.length - 1 ? next.h + 360 - current.h : next.h - current.h;
    if (gap > largestGap) {
      largestGap = gap;
      startIndex = (index + 1) % byHue.length;
    }
  }

  return [...byHue.slice(startIndex), ...byHue.slice(0, startIndex)];
}

function arrangedStops(stops, invert = false, autoOrder = true) {
  if (stops.length <= 1) {
    return stops.map((stop) => ({ ...stop, position: 0 }));
  }

  const ordered = autoOrder
    ? [
      ...stops.filter((stop) => stop.l <= 32).sort((a, b) => a.l - b.l),
      ...stops.filter((stop) => stop.l > 32 && stop.l < 78).sort((a, b) => a.l - b.l || a.h - b.h),
      ...stops.filter((stop) => stop.l >= 78).sort((a, b) => a.l - b.l),
    ]
    : [...stops];
  if (invert) ordered.reverse();

  return ordered.map((stop, index) => ({
    ...stop,
    position: (index / Math.max(1, ordered.length - 1)) * 100,
  }));
}

function unwrapHues(stops, invert = false, autoOrder = true, hueMode = "strict") {
  // Every stop is treated identically — no black/white anchors, no injected
  // bridge stops. Hue modes differ only in how hues are unwrapped and, later,
  // which interpolation curve smooths between stops.
  const ordered = arrangedStops(stops, invert, autoOrder);
  const result = [];
  for (const stop of ordered) {
    if (!result.length) {
      result.push({ ...stop, uh: stop.h });
      continue;
    }
    let hue = stop.h;
    const previous = result[result.length - 1].uh;
    if (hueMode === "wide" || hueMode === "chroma") {
      while (hue < previous) hue += 360;
    } else {
      while (hue - previous > 180) hue -= 360;
      while (hue - previous < -180) hue += 360;
    }
    result.push({ ...stop, uh: hue });
  }
  return result;
}
function catmull(p0, p1, p2, p3, t) {
  const t2 = t * t;
  const t3 = t2 * t;
  return 0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
}

function smoothValue(points, x, key) {
  if (x <= points[0].position) return points[0][key];
  if (x >= points[points.length - 1].position) return points[points.length - 1][key];
  const index = points.findIndex((point, itemIndex) => itemIndex < points.length - 1 && x >= point.position && x <= points[itemIndex + 1].position);
  const i = Math.max(0, index);
  const a = points[Math.max(0, i - 1)];
  const b = points[i];
  const c = points[i + 1];
  const d = points[Math.min(points.length - 1, i + 2)];
  const span = Math.max(0.0001, c.position - b.position);
  const t = clamp((x - b.position) / span, 0, 1);
  return catmull(a[key], b[key], c[key], d[key], t);
}

function smoothStep(value) {
  const t = clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
}

function smootherStep(value) {
  const t = clamp(value, 0, 1);
  return t * t * t * (t * (t * 6 - 15) + 10);
}

// ---------------------------------------------------------------------------
// Archimedes curve capture
//
// "Generate a curve over time, capture it, apply it." We run our Archimedes
// oscillator (the same dithered fixed-point symplectic engine as
// native_modules/archimedes/archimedes.cpp) forward in time and capture a
// quarter cycle of its sine output into a normalized [0,1] wavetable. The
// engine's xorshift dither leaves a faint shimmer on the curve, which is
// exactly the character we want baked into the Superdot's falloff.
//
// A synchronous JS port fills the table immediately so rendering never blocks;
// the real compiled .wasm is then loaded asynchronously and overwrites the
// same table in place for full authenticity.
// ---------------------------------------------------------------------------
// Live capture configuration. These are the oscillator parameters exposed to the
// UI: the fixed-point time resolution (dtShift), the pitch (freqHz), the amount
// of xorshift dither jitter (ditherBits), and the captured wavetable resolution.
const ARCHIMEDES_DEFAULTS = Object.freeze({ dtShift: 14, freqHz: 8, ditherBits: 7, tableSize: 256 });
const archimedesConfig = { ...ARCHIMEDES_DEFAULTS };
let archimedesTable = new Float64Array(ARCHIMEDES_DEFAULTS.tableSize);

// Faithful JS port of archimedes.cpp: xorshift dither + symplectic Euler in
// 16.16 fixed point. Captures a rising quarter-cycle of the sine state.
function captureArchimedesJs(target, cfg = archimedesConfig) {
  const n = target.length;
  const dtShift = cfg.dtShift; // rate = 1 << dtShift
  const rate = 1 << dtShift;
  const freqHz = cfg.freqHz;
  const ditherBits = cfg.ditherBits;
  const twoPi = 6.283185307179586;
  const phaseInc = Math.trunc(((twoPi * freqHz) / rate) * 65536.0) | 0;
  const quarterSteps = Math.max(n, Math.floor(rate / freqHz / 4));
  const stride = quarterSteps / (n - 1);

  let x = 0 | 0;
  let y = 65536 | 0; // 1.0
  // The dither PRNG seed. Fixed by default (1337) so static captures are
  // reproducible; the live animation feeds a fresh seed each frame so the
  // xorshift dither actually shivers instead of repeating the same pattern.
  let rng = (cfg.seed >>> 0) || 1337;
  const raw = new Float64Array(n);
  let peak = 1e-9;
  let sampleIndex = 0;
  let nextAt = 0;

  for (let step = 0; sampleIndex < n; step++) {
    if (step >= nextAt) {
      const v = -x / 65536.0; // engine produces -sin; negate for a rising 0->1 curve
      raw[sampleIndex] = v;
      if (v > peak) peak = v;
      sampleIndex++;
      nextAt = Math.round(sampleIndex * stride);
    }
    // xorshift PRNG
    rng ^= rng << 13; rng >>>= 0;
    rng ^= rng >>> 17;
    rng ^= rng << 5; rng >>>= 0;
    const dither = ((rng & ditherBits) - (ditherBits >> 1)) | 0;
    // symplectic Euler step
    x = (x - ((Math.trunc((y * phaseInc) / 65536) | 0) + dither)) | 0;
    y = (y + (Math.trunc((x * phaseInc) / 65536) | 0)) | 0;
  }

  for (let i = 0; i < n; i++) {
    target[i] = clamp(raw[i] / peak, 0, 1);
  }
  // Stochastic-resonance noise floor. The dither injected into the integrator
  // self-corrects and only perturbs the normalized curve by ~0.1%, which is
  // invisible. To actually *see* the oscillator shiver (and to give the live
  // animation something to animate), we surface that noise floor as a visible
  // per-sample jitter whose amplitude tracks the Dither control (0 = frozen,
  // clean curve). We keep advancing the same xorshift stream so the shimmer
  // stays deterministic per seed and re-rolls fresh each animation frame.
  const noiseAmp = Math.min(0.25, ditherBits * 0.01);
  if (noiseAmp > 0) {
    for (let i = 1; i < n - 1; i++) {
      rng ^= rng << 13; rng >>>= 0;
      rng ^= rng >>> 17;
      rng ^= rng << 5; rng >>>= 0;
      const jitter = ((rng >>> 8) / 0xffffff - 0.5) * noiseAmp;
      target[i] = clamp(target[i] + jitter, 0, 1);
    }
  }
  target[0] = 0;
  target[n - 1] = 1;
}

// Capture the same quarter-cycle from the real compiled module.
function captureArchimedesFromWasm(exports, target, cfg = archimedesConfig) {
  const n = target.length;
  const e = exports;
  const h = e.soemdsp_archimedes_create();
  if (!h) return false;
  const dtShift = cfg.dtShift;
  const freqHz = cfg.freqHz;
  const ditherBits = cfg.ditherBits;
  e.soemdsp_archimedes_set_profile(h, dtShift);
  e.soemdsp_archimedes_set_frequency(h, freqHz);
  e.soemdsp_archimedes_reset(h);
  const quarterSteps = Math.max(n, Math.floor((1 << dtShift) / freqHz / 4));
  const stride = quarterSteps / (n - 1);
  const raw = new Float64Array(n);
  let peak = 1e-9;
  let sampleIndex = 0;
  let nextAt = 0;
  for (let step = 0; sampleIndex < n; step++) {
    if (step >= nextAt) {
      const v = -e.soemdsp_archimedes_sine(h); // negate: rising 0->1 quarter cycle
      raw[sampleIndex] = v;
      if (v > peak) peak = v;
      sampleIndex++;
      nextAt = Math.round(sampleIndex * stride);
    }
    e.soemdsp_archimedes_step(h, ditherBits);
  }
  if (e.soemdsp_archimedes_destroy) e.soemdsp_archimedes_destroy(h);
  for (let i = 0; i < n; i++) target[i] = clamp(raw[i] / peak, 0, 1);
  target[0] = 0;
  target[n - 1] = 1;
  return true;
}

let archimedesWasmRequested = false;
let archimedesWasmExports = null;
// (Re)capture the wavetable for the current config. Called on mount and every
// time a parameter control changes, so the dot re-derives its falloff live.
function ensureArchimedesTable(cfg = {}, onReady) {
  Object.assign(archimedesConfig, cfg);
  const n = Math.max(2, Math.round(archimedesConfig.tableSize));
  archimedesConfig.tableSize = n;
  if (archimedesTable.length !== n) archimedesTable = new Float64Array(n);
  if (archimedesWasmExports) {
    captureArchimedesFromWasm(archimedesWasmExports, archimedesTable, archimedesConfig);
    return;
  }
  // Synchronous JS-port capture is always available first.
  captureArchimedesJs(archimedesTable, archimedesConfig);
  if (archimedesWasmRequested || typeof fetch !== "function" || typeof WebAssembly === "undefined") return;
  archimedesWasmRequested = true;
  const url = "/soemdsp-sandbox/native_modules/archimedes/archimedes.wasm";
  const load = WebAssembly.instantiateStreaming
    ? WebAssembly.instantiateStreaming(fetch(url), {})
    : fetch(url).then((r) => r.arrayBuffer()).then((b) => WebAssembly.instantiate(b, {}));
  load
    .then(({ instance }) => {
      archimedesWasmExports = instance.exports;
      if (captureArchimedesFromWasm(archimedesWasmExports, archimedesTable, archimedesConfig) && typeof onReady === "function") onReady();
    })
    .catch(() => { /* JS-port table already in place */ });
}

function lightnessCurveValue(value, mode = "bokeh") {
  const t = clamp(value, 0, 1);
  if (mode === "linear") return t;
  if (mode === "smooth") return smoothStep(t);
  if (mode === "gaussian") {
    const logistic = (x) => 1 / (1 + Math.exp(-8 * (x - 0.5)));
    const low = logistic(0);
    const high = logistic(1);
    return (logistic(t) - low) / (high - low);
  }
  if (mode === "filmic") {
    const film = (x) => (x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14);
    return clamp(film(t) / film(1), 0, 1);
  }
  if (mode === "bokeh") {
    return Math.pow(t, 2.2);
  }
  if (mode === "archimedes") {
    const n = archimedesTable.length;
    const pos = t * (n - 1);
    const i = Math.floor(pos);
    const f = pos - i;
    const a = archimedesTable[i];
    const b = archimedesTable[Math.min(n - 1, i + 1)];
    return clamp(a + (b - a) * f, 0, 1);
  }
  return t;
}

function applyLightnessCurve(samples, mode = "bokeh") {
  if (mode === "linear" || samples.length < 2) return samples;
  const first = samples[0];
  const last = samples[samples.length - 1];
  const span = last.l - first.l;
  if (Math.abs(span) < 0.001) return samples;
  return samples.map((sample) => {
    const t = clamp(sample.position / 100, 0, 1);
    const l = clamp(first.l + span * lightnessCurveValue(t, mode), 0, 100);
    return {
      ...sample,
      l,
      color: hslToHex(sample.h, sample.s, l),
    };
  });
}

function easedValue(points, x, key) {
  if (x <= points[0].position) return points[0][key];
  if (x >= points[points.length - 1].position) return points[points.length - 1][key];
  const index = points.findIndex((point, itemIndex) => itemIndex < points.length - 1 && x >= point.position && x <= points[itemIndex + 1].position);
  const i = Math.max(0, index);
  const a = points[i];
  const b = points[i + 1];
  const span = Math.max(0.0001, b.position - a.position);
  const t = smootherStep((x - a.position) / span);
  return a[key] + (b[key] - a[key]) * t;
}

function velvetValue(points, x, key) {
  if (x <= points[0].position) return points[0][key];
  if (x >= points[points.length - 1].position) return points[points.length - 1][key];
  const index = points.findIndex((point, itemIndex) => itemIndex < points.length - 1 && x >= point.position && x <= points[itemIndex + 1].position);
  const i = Math.max(0, index);
  const a = points[i];
  const b = points[i + 1];
  const span = Math.max(0.0001, b.position - a.position);
  const rawT = clamp((x - a.position) / span, 0, 1);
  const t = (1 - Math.cos(rawT * Math.PI)) / 2;
  return a[key] + (b[key] - a[key]) * t;
}

function monotoneValue(points, x, key) {
  if (x <= points[0].position) return points[0][key];
  if (x >= points[points.length - 1].position) return points[points.length - 1][key];
  const index = points.findIndex((point, itemIndex) => itemIndex < points.length - 1 && x >= point.position && x <= points[itemIndex + 1].position);
  const i = Math.max(0, index);
  const p0 = points[Math.max(0, i - 1)];
  const p1 = points[i];
  const p2 = points[i + 1];
  const p3 = points[Math.min(points.length - 1, i + 2)];
  const span = Math.max(0.0001, p2.position - p1.position);
  const d0 = (p2[key] - p0[key]) / Math.max(0.0001, p2.position - p0.position);
  const d1 = (p3[key] - p1[key]) / Math.max(0.0001, p3.position - p1.position);
  const slope = (p2[key] - p1[key]) / span;
  const m0 = Math.sign(d0) === Math.sign(slope) ? d0 : 0;
  const m1 = Math.sign(d1) === Math.sign(slope) ? d1 : 0;
  const t = clamp((x - p1.position) / span, 0, 1);
  const t2 = t * t;
  const t3 = t2 * t;
  return ((2 * t3 - 3 * t2 + 1) * p1[key])
    + ((t3 - 2 * t2 + t) * span * m0)
    + ((-2 * t3 + 3 * t2) * p2[key])
    + ((t3 - t2) * span * m1);
}

function sampleStops(stops, sampleCount, invert = false, autoOrder = true, hueMode = "strict", lightnessMode = "bokeh") {
  const points = unwrapHues(stops, invert, autoOrder, hueMode);
  const count = clamp(Math.round(sampleCount), 2, 256);
  const valueAt = hueMode === "silk" ? monotoneValue : hueMode === "velvet" ? velvetValue : hueMode === "smooth-natural" ? easedValue : smoothValue;
  const samples = Array.from({ length: count }, (_, index) => {
    const position = count === 1 ? 0 : (index / (count - 1)) * 100;
    const h = valueAt(points, position, "uh");
    const raw = hueMode === "velvet" || hueMode === "silk" ? {
      h: wrapHue(h),
      position,
      s: clamp(valueAt(points, position, "s"), 0, 100),
      l: clamp(valueAt(points, position, "l"), 0, 100),
    } : polishSample({
      h: wrapHue(h),
      position,
      s: clamp(valueAt(points, position, "s"), 0, 100),
      l: clamp(valueAt(points, position, "l"), 0, 100),
    });
    return {
      ...raw,
      color: hslToHex(raw.h, raw.s, raw.l),
    };
  });
  const first = samples[0];
  const last = samples[samples.length - 1];
  const shouldReverse = invert
    ? first && last && first.l < last.l
    : first && last && first.l > last.l;
  const orderedSamples = shouldReverse
    ? samples.map((sample, index) => ({ ...samples[samples.length - 1 - index], position: sample.position }))
    : samples;
  return applyLightnessCurve(orderedSamples, lightnessMode);
}

function gradientCss(angle, stops, sampleCount, invert = false, autoOrder = true, hueMode = "strict", lightnessMode = "bokeh") {
  const samples = sampleStops(stops, sampleCount, invert, autoOrder, hueMode, lightnessMode);
  const parts = samples.map((sample) => `${sample.color} ${sample.position.toFixed(1)}%`);
  return `linear-gradient(${Math.round(angle)}deg, ${parts.join(", ")})`;
}

function downloadDataUrl(dataUrl, filename) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function exportGradientPng(stops, options = {}) {
  const width = clamp(Math.round(Number(options.width) || 1024), 2, 4096);
  const height = clamp(Math.round(Number(options.height) || 1), 1, 4096);
  const samples = sampleStops(stops, width, options.invert, options.autoOrder, options.hueMode, options.lightnessMode);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { alpha: false });
  const image = context.createImageData(width, height);
  for (let x = 0; x < width; x += 1) {
    const [r, g, b] = hexToRgbBytes(samples[x]?.color || "#000000");
    for (let y = 0; y < height; y += 1) {
      const offset = (y * width + x) * 4;
      image.data[offset] = r;
      image.data[offset + 1] = g;
      image.data[offset + 2] = b;
      image.data[offset + 3] = 255;
    }
  }
  context.putImageData(image, 0, 0);
  return canvas.toDataURL("image/png");
}

function normalizeFalloff(falloff = {}) {
  const oldCore = Number(falloff.core);
  const oldBloom = Number(falloff.bloom);
  const oldEdge = Number(falloff.edge);
  const fallbackLeftEdge = Number.isFinite(oldCore) ? oldCore : 18;
  const fallbackRightMid = Number.isFinite(oldBloom) ? oldBloom : 68;
  const fallbackRightEdge = Number.isFinite(oldEdge) ? oldEdge : 100;
  const fallbackLeftMid = fallbackLeftEdge + (fallbackRightMid - fallbackLeftEdge) * 0.45;
  const leftEdgeValue = Number(falloff.leftEdge);
  // Keep a small minimum width for the outer band. At exactly 0 the entire
  // outer color region collapses to zero radius and renders as a hard ring
  // where the dot meets the field; a few percent keeps that transition soft.
  const leftEdge = clamp(Number.isFinite(leftEdgeValue) ? leftEdgeValue : fallbackLeftEdge, 4, 96);
  const leftMidValue = Number(falloff.leftMid);
  const leftMid = clamp(Number.isFinite(leftMidValue) ? leftMidValue : fallbackLeftMid, leftEdge + 1, 97);
  const rightMidValue = Number(falloff.rightMid);
  const rightMid = clamp(Number.isFinite(rightMidValue) ? rightMidValue : fallbackRightMid, leftMid + 1, 98);
  const rightEdgeValue = Number(falloff.rightEdge);
  const rightEdge = clamp(Number.isFinite(rightEdgeValue) ? rightEdgeValue : fallbackRightEdge, rightMid + 1, 100);
  return { leftEdge, leftMid, rightMid, rightEdge };
}

function falloffPosition(position, falloff = {}) {
  const { leftEdge, leftMid, rightMid, rightEdge } = normalizeFalloff(falloff);
  const t = clamp(position, 0, 100) / 100;
  if (t <= 0.18) return (t / 0.18) * leftEdge;
  if (t <= 0.42) return leftEdge + ((t - 0.18) / 0.24) * (leftMid - leftEdge);
  if (t <= 0.76) return leftMid + ((t - 0.42) / 0.34) * (rightMid - leftMid);
  return rightMid + ((t - 0.76) / 0.24) * (rightEdge - rightMid);
}

// Inverse of falloffPosition: given a shaped output position (0..100), return
// the curve input position (0..100) that maps to it. The forward map is
// piecewise-linear and monotonic, so each segment inverts directly. This lets
// the preview sample at evenly-spaced OUTPUT radii instead of evenly-spaced
// INPUT positions — the key to keeping the dot smooth when the falloff handles
// are dragged close together (tight handles no longer collapse the color
// transition onto a couple of duplicate CSS stops / hard edges).
function inverseFalloffPosition(shaped, falloff = {}) {
  const { leftEdge, leftMid, rightMid, rightEdge } = normalizeFalloff(falloff);
  const out = clamp(shaped, 0, 100);
  if (out <= leftEdge) return (leftEdge <= 0 ? 0 : out / leftEdge) * 18;
  if (out <= leftMid) return 18 + ((out - leftEdge) / Math.max(0.0001, leftMid - leftEdge)) * 24;
  if (out <= rightMid) return 42 + ((out - leftMid) / Math.max(0.0001, rightMid - leftMid)) * 34;
  if (out <= rightEdge) return 76 + ((out - rightMid) / Math.max(0.0001, rightEdge - rightMid)) * 24;
  return 100;
}

// Linear color lookup along an evenly-spaced (0..100) sample array, blended in
// RGB so intermediate radii stay continuous even between sparse index samples.
function colorAtCurvePosition(samples, position) {
  if (!samples.length) return "#000000";
  if (samples.length === 1) return samples[0].color;
  const p = clamp(position, 0, 100) / 100;
  const span = p * (samples.length - 1);
  const i = Math.floor(span);
  const f = span - i;
  const a = hexToRgbBytes(samples[i].color);
  const b = hexToRgbBytes(samples[Math.min(samples.length - 1, i + 1)].color);
  const mix = (x, y) => Math.round(x + (y - x) * f).toString(16).padStart(2, "0");
  return `#${mix(a[0], b[0])}${mix(a[1], b[1])}${mix(a[2], b[2])}`;
}

function outwardPreviewSamples(samples, falloff = {}, radialCenter = "start") {
  // The falloff curve runs from the OUTER EDGE (curve start) inward to the
  // CENTER (curve end). radialCenter chooses which gradient color sits at the
  // center; the other color lands on the outer edge.
  const source = radialCenter === "start" ? [...samples].reverse() : samples;
  // Sample at evenly-spaced radial output positions (0% = center, 100% = edge)
  // and invert the falloff to find which curve color belongs at each radius.
  // Even output spacing guarantees well-separated CSS stops, so a tight cluster
  // of falloff handles renders as a clean tight transition rather than a hard
  // edge made of collapsed/duplicate stops.
  const steps = 128;
  const shaped = [];
  for (let i = 0; i <= steps; i += 1) {
    const radius = (i / steps) * 100; // 0 = center, 100 = edge
    // CSS radial position: curve start -> edge, so invert 100 - radius.
    const curvePos = inverseFalloffPosition(100 - radius, falloff);
    shaped.push({ color: colorAtCurvePosition(source, curvePos), position: radius });
  }
  return shaped;
}

function previewGradientCss(mode, stops, sampleCount, invert = false, autoOrder = true, hueMode = "strict", angle = 135, falloff = {}, radialCenter = "start", lightnessMode = "bokeh") {
  const samples = sampleStops(stops, sampleCount, invert, autoOrder, hueMode, lightnessMode);
  const outwardModes = new Set(["dot", "square", "rectangle"]);
  const previewSamples = outwardModes.has(mode)
    ? outwardPreviewSamples(samples, falloff, radialCenter)
    : samples;
  const parts = previewSamples.map((sample) => `${sample.color} ${sample.position.toFixed(2)}%`);
  if (outwardModes.has(mode)) {
    return `radial-gradient(circle closest-side, ${parts.join(", ")})`;
  }
  const previewAngles = {
    diagonal: 135,
    horizontal: 90,
    vertical: 180,
  };
  return `linear-gradient(${Math.round(previewAngles[mode] ?? angle)}deg, ${parts.join(", ")})`;
}

function huePath(stops, invert = false, autoOrder = true, hueMode = "strict") {
  const ordered = unwrapHues(stops, invert, autoOrder, hueMode);
  const segments = [];
  for (let i = 0; i < ordered.length - 1; i += 1) {
    const a = ordered[Math.max(0, i - 1)];
    const b = ordered[i];
    const c = ordered[i + 1];
    const d = ordered[Math.min(ordered.length - 1, i + 2)];
    const x1 = b.position;
    const y1 = 100 - (wrapHue(b.uh) / 360) * 100;
    const x2 = c.position;
    const y2 = 100 - (wrapHue(c.uh) / 360) * 100;
    const cp1x = x1 + (x2 - a.position) / 6;
    const cp1y = y1 + ((100 - (wrapHue(c.uh) / 360) * 100) - (100 - (wrapHue(a.uh) / 360) * 100)) / 6;
    const cp2x = x2 - (d.position - x1) / 6;
    const cp2y = y2 - ((100 - (wrapHue(d.uh) / 360) * 100) - y1) / 6;
    segments.push(`${i === 0 ? `M ${x1.toFixed(2)} ${y1.toFixed(2)}` : ""} C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)} ${cp2x.toFixed(2)} ${cp2y.toFixed(2)} ${x2.toFixed(2)} ${y2.toFixed(2)}`);
  }
  return segments.join(" ");
}

export function mountGradientCurveWidget(host, options = {}) {
  ensureStyles();
  const initialStops = Array.isArray(options.stops) && options.stops.length >= 2 ? options.stops : [
    { id: "black", color: "#000000" },
    { id: "red", color: "#FF1F2D" },
  ];
  const state = {
    angle: Number.isFinite(Number(options.angle)) ? Number(options.angle) : 90,
    invert: options.invert === true,
    autoOrder: options.autoOrder === true,
    autoBright: options.autoBright === true,
    archDtShift: Number.isFinite(Number(options.archDtShift)) ? clamp(Math.round(Number(options.archDtShift)), 8, 18) : ARCHIMEDES_DEFAULTS.dtShift,
    archFreqHz: Number.isFinite(Number(options.archFreqHz)) ? clamp(Math.round(Number(options.archFreqHz)), 1, 64) : ARCHIMEDES_DEFAULTS.freqHz,
    archDitherBits: Number.isFinite(Number(options.archDitherBits)) ? clamp(Math.round(Number(options.archDitherBits)), 0, 31) : ARCHIMEDES_DEFAULTS.ditherBits,
    archTableSize: Number.isFinite(Number(options.archTableSize)) ? clamp(Math.round(Number(options.archTableSize)), 16, 512) : ARCHIMEDES_DEFAULTS.tableSize,
    archFps: Number.isFinite(Number(options.archFps)) ? clamp(Math.round(Number(options.archFps)), 0, 60) : 12,
    hueMode: ["strict", "wide", "chroma", "smooth-natural", "velvet", "silk"].includes(options.hueMode) ? options.hueMode : "strict",
    lightnessMode: ["linear", "smooth", "gaussian", "filmic", "bokeh", "archimedes"].includes(options.lightnessMode) ? options.lightnessMode : "bokeh",
    previewMode: ["dot", "diagonal", "horizontal", "vertical", "square", "rectangle"].includes(options.previewMode) ? options.previewMode : "dot",
    radialCenter: ["start", "end"].includes(options.radialCenter) ? options.radialCenter : "end",
    gridMode: "off",
    falloff: normalizeFalloff(options.falloff),
    previewZoom: Number.isFinite(Number(options.previewZoom)) ? clamp(Number(options.previewZoom), 1, 1000000) : 1,
    previewPanX: Number.isFinite(Number(options.previewPanX)) ? Number(options.previewPanX) : 0,
    previewPanY: Number.isFinite(Number(options.previewPanY)) ? Number(options.previewPanY) : 0,
    sampleCount: Number.isFinite(Number(options.sampleCount)) ? clamp(Number(options.sampleCount), 2, 256) : 32,
    sampledIndex: -1,
    activeStopId: "",
    colorEditStopId: "",
    stops: initialStops.map((stop, index) => normalizeStop(stop, index, initialStops.length)),
    savedStops: (Array.isArray(options.savedStops) ? options.savedStops : [
      { id: "black", color: "#000000" },
      { id: "white", color: "#FFFFFF" },
      { id: "red", color: "#FF0000" },
      { id: "green", color: "#00FF00" },
      { id: "blue", color: "#0000FF" },
      { id: "cyan", color: "#00FFFF" },
      { id: "magenta", color: "#FF00FF" },
      { id: "yellow", color: "#FFFF00" },
    ]).map((stop, index, arr) => normalizeStop(stop, index, arr.length)),
    addInsertIndex: Number.isFinite(Number(options.addInsertIndex)) ? Math.round(Number(options.addInsertIndex)) : initialStops.length,
    addColor: typeof options.addColor === "string" ? options.addColor : "#8A4B22",
    pendingAddStopId: "",
    drag: null,
  };
  state.activeStopId = state.stops[0].id;

  host.innerHTML = `
    <div class="gcw-mount">
      <div class="gcw-root">
        <div class="gcw-preview"></div>
        <div class="gcw-presets" role="group" aria-label="Gradient presets">
          <span>Presets</span>
        </div>
        <div class="gcw-index-strip" aria-label="Generated color indexes"></div>
        <section class="gcw-falloff" aria-label="Radial falloff">
          <div class="gcw-falloff-head">
            <span>Radial Falloff</span>
            <span>left edge / left mid / right mid / right edge</span>
          </div>
          <div class="gcw-falloff-strip">
            <button class="gcw-falloff-handle" type="button" data-falloff-handle="leftEdge" data-short-label="left edge" aria-label="Falloff left edge"></button>
            <button class="gcw-falloff-handle" type="button" data-falloff-handle="leftMid" data-short-label="left mid" aria-label="Falloff left middle"></button>
            <button class="gcw-falloff-handle" type="button" data-falloff-handle="rightMid" data-short-label="right mid" aria-label="Falloff right middle"></button>
            <button class="gcw-falloff-handle" type="button" data-falloff-handle="rightEdge" data-short-label="right edge" aria-label="Falloff right edge"></button>
          </div>
          <div class="gcw-falloff-values">
            <span data-falloff-value="leftEdge"></span>
            <span data-falloff-value="leftMid"></span>
            <span data-falloff-value="rightMid"></span>
            <span data-falloff-value="rightEdge"></span>
          </div>
        </section>
        <section class="gcw-zone" data-drop-zone="active">
          <div class="gcw-zone-title">Gradient Colors</div>
          <div class="gcw-palette" aria-label="Selected gradient colors"></div>
        </section>
        <section class="gcw-zone" data-drop-zone="saved">
          <div class="gcw-zone-title">Saved Colors</div>
          <div class="gcw-saved" aria-label="Saved gradient colors"></div>
        </section>
        <div class="gcw-actions">
          <button class="gcw-delete" type="button">Delete Color</button>
          <button class="gcw-remove" type="button">Save Selected</button>
          <label class="gcw-toggle"><input class="gcw-auto-order" type="checkbox" /> Auto Order</label>
          <label class="gcw-toggle"><input class="gcw-auto-bright" type="checkbox" /> Auto Bright</label>
          <label class="gcw-index-control"><span>Indexes</span><input class="gcw-index-count" type="number" min="2" max="256" step="1" /></label>
          <div class="gcw-hue-segments" role="group" aria-label="Hue mode">
            <span>Hue</span>
            <button class="gcw-hue-option" type="button" data-hue-mode="strict">Strict</button>
            <button class="gcw-hue-option" type="button" data-hue-mode="wide">Wide</button>
            <button class="gcw-hue-option" type="button" data-hue-mode="chroma">Chroma</button>
            <button class="gcw-hue-option" type="button" data-hue-mode="smooth-natural">Smooth Natural</button>
            <button class="gcw-hue-option" type="button" data-hue-mode="velvet">Velvet</button>
            <button class="gcw-hue-option" type="button" data-hue-mode="silk">Silk</button>
          </div>
          <div class="gcw-lightness-segments" role="group" aria-label="Lightness curve">
            <span>Lightness</span>
            <button class="gcw-lightness-option" type="button" data-lightness-mode="linear">Linear</button>
            <button class="gcw-lightness-option" type="button" data-lightness-mode="smooth">Smooth</button>
            <button class="gcw-lightness-option" type="button" data-lightness-mode="gaussian">Gaussian</button>
            <button class="gcw-lightness-option" type="button" data-lightness-mode="filmic">Filmic</button>
            <button class="gcw-lightness-option" type="button" data-lightness-mode="bokeh">Bokeh</button>
            <button class="gcw-lightness-option" type="button" data-lightness-mode="archimedes">Archimedes</button>
          </div>
          <div class="gcw-preview-segments" role="group" aria-label="Gradient preview mode">
            <span>Show</span>
            <button class="gcw-preview-option" type="button" data-preview-mode="dot">Superdot</button>
            <button class="gcw-preview-option" type="button" data-preview-mode="diagonal">Diagonal</button>
            <button class="gcw-preview-option" type="button" data-preview-mode="horizontal">Horizontal</button>
            <button class="gcw-preview-option" type="button" data-preview-mode="vertical">Vertical</button>
            <button class="gcw-preview-option" type="button" data-preview-mode="square">Square</button>
            <button class="gcw-preview-option" type="button" data-preview-mode="rectangle">Rectangle</button>
          </div>
          <div class="gcw-radial-center-segments" role="group" aria-label="Radial center color">
            <span>Radial Center</span>
            <button class="gcw-radial-center-option" type="button" data-radial-center="start">Start</button>
            <button class="gcw-radial-center-option" type="button" data-radial-center="end">End</button>
          </div>
          <div class="gcw-arch-params" role="group" aria-label="Archimedes oscillator parameters">
            <span>Archimedes</span>
            <label class="gcw-index-control"><span>Rate</span><input class="gcw-arch-dtshift" type="number" min="8" max="18" step="1" title="dtShift — fixed-point time resolution (rate = 2^dtShift)" /></label>
            <label class="gcw-index-control"><span>Freq</span><input class="gcw-arch-freq" type="number" min="1" max="64" step="1" title="Oscillator frequency in Hz" /></label>
            <label class="gcw-index-control"><span>Dither</span><input class="gcw-arch-dither" type="number" min="0" max="31" step="1" title="Xorshift dither jitter mask (bits)" /></label>
            <label class="gcw-index-control"><span>Table</span><input class="gcw-arch-table" type="number" min="16" max="512" step="16" title="Captured wavetable resolution" /></label>
            <label class="gcw-index-control"><span>FPS</span><input class="gcw-arch-fps" type="number" min="0" max="60" step="1" title="Live re-capture frame rate — 0 freezes the curve, higher values make the dither shimmer live" /></label>
          </div>
          <label class="gcw-toggle"><input class="gcw-invert" type="checkbox" /> Invert</label>
          <button class="gcw-copy" type="button">Copy CSS</button>
          <button class="gcw-export-png" type="button">Copy PNG</button>
        </div>
      </div>
    </div>
  `;

  const mount = host.querySelector(".gcw-mount");
  const preview = host.querySelector(".gcw-preview");
  const falloffStrip = host.querySelector(".gcw-falloff-strip");
  const falloffHandles = [...host.querySelectorAll(".gcw-falloff-handle")];
  const falloffValues = [...host.querySelectorAll("[data-falloff-value]")];
  const palette = host.querySelector(".gcw-palette");
  const savedPalette = host.querySelector(".gcw-saved");
  const invertInput = host.querySelector(".gcw-invert");
  const autoOrderInput = host.querySelector(".gcw-auto-order");
  const autoBrightInput = host.querySelector(".gcw-auto-bright");
  const indexCountInput = host.querySelector(".gcw-index-count");
  const archDtShiftInput = host.querySelector(".gcw-arch-dtshift");
  const archFreqInput = host.querySelector(".gcw-arch-freq");
  const archDitherInput = host.querySelector(".gcw-arch-dither");
  const archTableInput = host.querySelector(".gcw-arch-table");
  const archFpsInput = host.querySelector(".gcw-arch-fps");
  const indexStrip = host.querySelector(".gcw-index-strip");
  const hueModeButtons = [...host.querySelectorAll(".gcw-hue-option")];
  const lightnessModeButtons = [...host.querySelectorAll(".gcw-lightness-option")];
  const previewModeButtons = [...host.querySelectorAll(".gcw-preview-option")];
  const radialCenterButtons = [...host.querySelectorAll(".gcw-radial-center-option")];
  const removeButton = host.querySelector(".gcw-remove");
  const deleteButton = host.querySelector(".gcw-delete");
  const copyButton = host.querySelector(".gcw-copy");
  const exportPngButton = host.querySelector(".gcw-export-png");
  setupDropZone(host.querySelector('[data-drop-zone="active"]'), "active", palette);
  setupDropZone(host.querySelector('[data-drop-zone="saved"]'), "saved", savedPalette);

  const activeStop = () => state.stops.find((stop) => stop.id === state.activeStopId) || state.stops[0];
  const gradientInvert = () => state.invert;
  const archConfig = () => ({
    dtShift: state.archDtShift,
    freqHz: state.archFreqHz,
    ditherBits: state.archDitherBits,
    tableSize: state.archTableSize,
  });
  // Re-capture the Archimedes wavetable for the current params, then repaint.
  const recaptureArchimedes = () => {
    ensureArchimedesTable(archConfig(), () => render());
    render();
    emit();
    restartArchimedesAnimation();
  };

  // ---- Live Archimedes animation ------------------------------------------
  // The dither PRNG is deterministic per seed, so a static capture never
  // changes. To actually see the oscillator's noise floor shiver, we re-run the
  // JS capture with a fresh seed on every animation frame (throttled to the
  // requested FPS) and repaint. FPS 0 freezes the curve. Only runs while the
  // Archimedes lightness mode is selected — no point animating an unused table.
  let archAnimHandle = 0;
  let archAnimSeed = 1337 >>> 0;
  let archAnimLast = 0;
  const stopArchimedesAnimation = () => {
    if (archAnimHandle) cancelAnimationFrame(archAnimHandle);
    archAnimHandle = 0;
  };
  const restartArchimedesAnimation = () => {
    stopArchimedesAnimation();
    if (state.archFps <= 0 || state.lightnessMode !== "archimedes") return;
    const interval = 1000 / state.archFps;
    archAnimLast = 0;
    const tick = (now) => {
      archAnimHandle = requestAnimationFrame(tick);
      if (now - archAnimLast < interval) return;
      archAnimLast = now;
      // Advance the seed with a cheap LCG so each frame gets new dither noise.
      archAnimSeed = (Math.imul(archAnimSeed, 1664525) + 1013904223) >>> 0;
      captureArchimedesJs(archimedesTable, { ...archimedesConfig, seed: archAnimSeed });
      render();
    };
    archAnimHandle = requestAnimationFrame(tick);
  };
  const packet = () => ({
    widget: "gradient-curve-widget",
    angle: state.angle,
    invert: state.invert,
    autoOrder: state.autoOrder,
    autoBright: state.autoBright,
    archDtShift: state.archDtShift,
    archFreqHz: state.archFreqHz,
    archDitherBits: state.archDitherBits,
    archTableSize: state.archTableSize,
    archFps: state.archFps,
    hueMode: state.hueMode,
    lightnessMode: state.lightnessMode,
    previewMode: state.previewMode,
    radialCenter: state.radialCenter,
    gridMode: "off",
    falloff: { ...state.falloff },
    previewZoom: state.previewZoom,
    previewPan: { x: state.previewPanX, y: state.previewPanY },
    addInsertIndex: state.addInsertIndex,
    addColor: state.addColor,
    sampleCount: state.sampleCount,
    css: gradientCss(state.angle, state.stops, state.sampleCount, gradientInvert(), state.autoOrder, state.hueMode, state.lightnessMode),
    stops: arrangedStops(state.stops, gradientInvert(), state.autoOrder).map((stop) => ({ ...stop, color: stopColor(stop) })),
    savedStops: state.savedStops.map((stop) => ({ ...stop, color: stopColor(stop) })),
    samples: sampleStops(state.stops, state.sampleCount, gradientInvert(), state.autoOrder, state.hueMode, state.lightnessMode),
  });
  const emit = () => {
    const detail = packet();
    options.onChange?.(detail);
    host.dispatchEvent(new CustomEvent("gradient-curve-widget-change", { detail, bubbles: true }));
  };

  function syncActiveControls() {
    const isActive = state.stops.some((stop) => stop.id === state.activeStopId);
    const isSaved = state.savedStops.some((stop) => stop.id === state.activeStopId);
    removeButton.disabled = state.stops.length <= 2 || !isActive;
    deleteButton.disabled = (!isActive && !isSaved) || (isActive && !canDeleteActiveStop(state.activeStopId));
    host.querySelectorAll(".gcw-color-card").forEach((element) => {
      element.dataset.active = String(element.dataset.stopId === state.activeStopId);
    });
  }

  function canDeleteActiveStop(stopId) {
    const remainingStops = state.stops.filter((stop) => stop.id !== stopId);
    return remainingStops.length >= 2;
  }

  function deleteSelectedStop() {
    const activeIndex = state.stops.findIndex((stop) => stop.id === state.activeStopId);
    if (activeIndex >= 0) {
      if (!canDeleteActiveStop(state.activeStopId)) return;
      state.stops.splice(activeIndex, 1);
      const nextActiveIndex = clamp(activeIndex, 0, state.stops.length - 1);
      state.activeStopId = state.stops[nextActiveIndex]?.id || state.savedStops[0]?.id || "";
      commit();
      return;
    }

    const savedIndex = state.savedStops.findIndex((stop) => stop.id === state.activeStopId);
    if (savedIndex >= 0) {
      state.savedStops.splice(savedIndex, 1);
      const nextSavedIndex = clamp(savedIndex, 0, state.savedStops.length - 1);
      state.activeStopId = state.savedStops[nextSavedIndex]?.id || state.stops[0]?.id || "";
      commit();
    }
  }

  function moveStop(stopId, delta) {
    const index = state.stops.findIndex((stop) => stop.id === stopId);
    const nextIndex = clamp(index + delta, 0, state.stops.length - 1);
    if (index < 0 || index === nextIndex) return;
    const [stop] = state.stops.splice(index, 1);
    state.stops.splice(nextIndex, 0, stop);
    state.activeStopId = stop.id;
    commit();
  }

  function stopList(zone) {
    return zone === "saved" ? state.savedStops : state.stops;
  }

  function moveBetweenZones(stopId, fromZone, toZone, toIndex = stopList(toZone).length) {
    const fromList = stopList(fromZone);
    const toList = stopList(toZone);
    const fromIndex = fromList.findIndex((stop) => stop.id === stopId);
    if (fromIndex < 0) return;
    if (fromZone === "active" && toZone === "saved") {
      const remainingStops = fromList.filter((stop) => stop.id !== stopId);
      if (remainingStops.length < 2) return;
    }

    const [stop] = fromList.splice(fromIndex, 1);
    // cardDropIndex is measured on the list with the dragged card already
    // filtered out, so the target index is already in the post-removal frame
    // for same-zone reorders -- no extra offset needed.
    toList.splice(clamp(toIndex, 0, toList.length), 0, stop);
    state.activeStopId = stop.id;
    commit();
  }

  function addGradientColorFromHsl(hsl) {
    const activeIndex = state.stops.findIndex((stop) => stop.id === state.activeStopId);
    const insertIndex = activeIndex >= 0 ? activeIndex : clamp(state.addInsertIndex, 0, state.stops.length);
    const next = normalizeStop({ id: "", ...hsl }, insertIndex, state.stops.length + 1);
    state.stops.splice(insertIndex, 0, next);
    state.activeStopId = next.id;
    state.addInsertIndex = clamp(insertIndex + 1, 0, state.stops.length);
    return next;
  }

  function addColorAtInsertPoint(hex) {
    const insertIndex = clamp(state.addInsertIndex, 0, state.stops.length);
    const next = normalizeStop({ id: "", ...hexToHsl(hex) }, insertIndex, state.stops.length + 1);
    state.stops.splice(insertIndex, 0, next);
    state.pendingAddStopId = next.id;
    state.activeStopId = next.id;
    state.addInsertIndex = clamp(insertIndex + 1, 0, state.stops.length);
    return next;
  }

  function updatePendingAddColor(hex) {
    state.addColor = hex;
    const pending = state.stops.find((stop) => stop.id === state.pendingAddStopId);
    if (pending) {
      Object.assign(pending, polishStop({ ...pending, ...hexToHsl(hex) }));
      return;
    }
    addColorAtInsertPoint(hex);
  }

  function samplePositionFromPreview(event) {
    const rect = preview.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const zoom = Math.max(0.000001, state.previewZoom);
    const unzoomedX = centerX + ((event.clientX - centerX - state.previewPanX) / zoom);
    const unzoomedY = centerY + ((event.clientY - centerY - state.previewPanY) / zoom);
    const x = clamp((unzoomedX - rect.left) / Math.max(1, rect.width), 0, 1);
    const y = clamp((unzoomedY - rect.top) / Math.max(1, rect.height), 0, 1);
    if (state.previewMode === "dot") {
      const dx = (x - 0.5) * 2;
      const dy = (y - 0.5) * 2;
      const distance = clamp(Math.sqrt(dx * dx + dy * dy), 0, 1) * 100;
      return state.radialCenter === "end" ? 100 - distance : distance;
    }
    if (state.previewMode === "square") {
      const distance = Math.max(Math.abs((x - 0.5) * 2), Math.abs((y - 0.5) * 2));
      const position = clamp(distance, 0, 1) * 100;
      return state.radialCenter === "end" ? 100 - position : position;
    }
    if (state.previewMode === "rectangle") {
      const dx = (x - 0.5) * 2;
      const dy = (y - 0.5) * 2;
      const distance = clamp(Math.sqrt(dx * dx + dy * dy), 0, 1) * 100;
      return state.radialCenter === "end" ? 100 - distance : distance;
    }
    if (state.previewMode === "horizontal") return x * 100;
    if (state.previewMode === "vertical") return y * 100;
    return clamp(((x + y) / 2) * 100, 0, 100);
  }

  function colorAtPreviewPosition(position) {
    const activeGradientStops = state.stops;
    const samples = sampleStops(activeGradientStops, state.sampleCount, gradientInvert(), state.autoOrder, state.hueMode, state.lightnessMode);
    const nearest = samples.reduce((current, sample, index) => {
      const previousDistance = Math.abs(current.sample.position - position);
      const nextDistance = Math.abs(sample.position - position);
      return nextDistance < previousDistance ? { sample, index } : current;
    }, { sample: samples[0], index: 0 });
    state.sampledIndex = nearest.index;
    return nearest.sample;
  }

  function renderIndexStrip(samples) {
    indexStrip.replaceChildren();
    indexStrip.dataset.gridMode = state.gridMode;
    indexStrip.style.setProperty("--index-cell-width", `${100 / Math.max(1, samples.length)}%`);
    samples.forEach((sample, index) => {
      const button = document.createElement("button");
      button.className = "gcw-index-swatch";
      button.type = "button";
      button.style.setProperty("--index-color", sample.color);
      button.dataset.sampled = String(index === state.sampledIndex);
      button.title = `Index ${index}: ${sample.color}`;
      button.setAttribute("aria-label", `Sample index ${index} ${sample.color}`);
      button.addEventListener("click", () => {
        state.sampledIndex = index;
        addGradientColorFromHsl(sample);
        commit();
      });
      indexStrip.appendChild(button);
    });
  }

  function renderFalloff(samples) {
    // The strip reads left -> right as OUTER EDGE -> CENTER, matching the dot:
    // the leftmost handle (leftEdge) shapes the outer edge, the rightmost
    // (rightEdge) shapes the center. Colors are drawn in curve order so the
    // start color sits on the left/edge, exactly where it renders on the dot.
    const source = state.radialCenter === "start" ? [...samples].reverse() : samples;
    const shapedSamples = source.map((sample, index) => {
      const position = source.length <= 1 ? 0 : (index / (source.length - 1)) * 100;
      return { color: sample.color, position: falloffPosition(position, state.falloff) };
    });
    const falloffLabels = { leftEdge: "LE", leftMid: "LM", rightMid: "RM", rightEdge: "RE" };
    falloffStrip.style.setProperty("--gcw-falloff-gradient", `linear-gradient(90deg, ${shapedSamples.map((sample) => `${sample.color} ${sample.position.toFixed(1)}%`).join(", ")})`);
    falloffHandles.forEach((handle) => {
      const id = handle.dataset.falloffHandle;
      handle.style.setProperty("--falloff-position", `${state.falloff[id]}%`);
      handle.title = `${falloffLabels[id]} ${Math.round(state.falloff[id])}%`;
    });
    falloffValues.forEach((value) => {
      const id = value.dataset.falloffValue;
      value.textContent = `${falloffLabels[id]} ${Math.round(state.falloff[id])}%`;
    });
  }

  function applyAutoOrder() {
    const ordered = arrangedStops(state.stops, false, true).map(({ position, ...stop }) => stop);
    state.stops = state.invert ? ordered.reverse() : ordered;
    state.activeStopId = state.stops[0]?.id || state.savedStops[0]?.id || "";
  }

  function applyAutoBright() {
    const ordered = arrangedStops(state.stops, false, false);
    const count = Math.max(1, ordered.length - 1);
    state.stops = ordered.map((stop, index) => {
      const t = count === 0 ? 0.5 : index / count;
      const low = 18;
      const high = 82;
      const l = low + (high - low) * smootherStep(t);
      const edgeFade = Math.sin(Math.PI * clamp(t, 0, 1));
      const s = stop.s <= 8 ? 0 : clamp(30 + edgeFade * 66, 6, 96);
      return { ...stop, s, l: clamp(l, 0, 100) };
    });
    state.activeStopId = state.stops[0]?.id || state.savedStops[0]?.id || "";
  }

  function enforceAutoRules() {
    if (state.autoOrder) applyAutoOrder();
    if (state.autoBright) applyAutoBright();
  }

  function commit({ enforce = true, renderCards = true } = {}) {
    if (enforce) enforceAutoRules();
    render({ renderCards });
    emit();
  }

  function swapInZone(sourceId, targetId, zone) {
    const list = stopList(zone);
    const sourceIndex = list.findIndex((stop) => stop.id === sourceId);
    const targetIndex = list.findIndex((stop) => stop.id === targetId);
    if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) return;
    [list[sourceIndex], list[targetIndex]] = [list[targetIndex], list[sourceIndex]];
    state.activeStopId = sourceId;
    commit();
  }

  function cardDropIndex(container, event) {
    const cards = [...container.querySelectorAll(".gcw-color-card")].filter((card) => card.dataset.dragging !== "true");
    for (let index = 0; index < cards.length; index += 1) {
      const rect = cards[index].getBoundingClientRect();
      // Cursor sits in a row entirely above this card -> insert before it.
      if (event.clientY < rect.top - 3) return index;
      // Cursor is within this card's row -> compare against its horizontal
      // midpoint. (A pure Y check here would wrongly send every drop to the
      // first card, which is why dropping into empty space failed before.)
      const inRow = event.clientY <= rect.bottom + 3;
      if (inRow && event.clientX < rect.left + rect.width / 2) return index;
    }
    return cards.length;
  }

  function placeAddCard(index) {
    state.addInsertIndex = clamp(index, 0, state.stops.length);
    state.pendingAddStopId = "";
    render();
    emit();
  }

  function renderAddCard() {
      const card = document.createElement("div");
      card.className = "gcw-add-card";
      card.draggable = true;
      card.dataset.addColor = "true";
      card.style.setProperty("--card-color", state.addColor);
      card.addEventListener("dragstart", (event) => {
        state.drag = { type: "add", zone: "active" };
        card.dataset.dragging = "true";
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", "add-color");
      });
      card.addEventListener("dragend", () => {
        state.drag = null;
        host.querySelectorAll("[data-dragging='true']").forEach((node) => delete node.dataset.dragging);
        host.querySelectorAll("[data-drag-over='true']").forEach((node) => delete node.dataset.dragOver);
      });

      const button = document.createElement("button");
      button.type = "button";
      button.textContent = "+";
      button.title = "Add color here";
      button.setAttribute("aria-label", "Add color here");

      const picker = document.createElement("input");
      picker.type = "color";
      picker.value = state.addColor;
      button.addEventListener("click", (event) => {
        state.pendingAddStopId = "";
        event.stopPropagation();
        picker.click();
      });
      picker.addEventListener("click", (event) => {
        event.stopPropagation();
      });
      picker.addEventListener("input", () => {
        updatePendingAddColor(picker.value);
        commit({ renderCards: false });
      });
      picker.addEventListener("change", () => {
        state.pendingAddStopId = "";
        state.addColor = picker.value;
        commit();
      });
      picker.addEventListener("blur", () => {
        state.pendingAddStopId = "";
      });

      button.append(picker);
      card.append(button);
      return card;
  }

  function renderCard(stop, index, zone) {
      const card = document.createElement("div");
      card.className = "gcw-color-card";
      card.draggable = true;
      card.dataset.zone = zone;
      card.dataset.stopId = stop.id;
      card.dataset.active = String(stop.id === state.activeStopId);
      card.style.setProperty("--card-color", stopColor(stop));
      card.addEventListener("dragstart", (event) => {
        state.drag = { id: stop.id, zone };
        card.dataset.dragging = "true";
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", stop.id);
      });
      card.addEventListener("dragend", () => {
        state.drag = null;
        host.querySelectorAll("[data-dragging='true']").forEach((node) => delete node.dataset.dragging);
        host.querySelectorAll("[data-drag-over='true']").forEach((node) => delete node.dataset.dragOver);
      });
      card.addEventListener("dragover", (event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
      });
      card.addEventListener("drop", (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!state.drag) return;
        if (state.drag.type === "add") {
          placeAddCard(cardDropIndex(palette, event));
          return;
        }
        if (state.drag.zone === zone) {
          swapInZone(state.drag.id, stop.id, zone);
          return;
        }
        const container = zone === "saved" ? savedPalette : palette;
        moveBetweenZones(state.drag.id, state.drag.zone, zone, cardDropIndex(container, event));
      });

      card.addEventListener("click", (event) => {
        if (event.target.closest("button, input")) return;
        state.activeStopId = stop.id;
        syncActiveControls();
        emit();
      });

      const swatch = document.createElement("button");
      swatch.className = "gcw-swatch-button";
      swatch.type = "button";
      swatch.title = "Change color";
      swatch.setAttribute("aria-label", `Change ${stopColor(stop)}`);

      const picker = document.createElement("input");
      picker.type = "color";
      picker.value = stopColor(stop);
      picker.tabIndex = -1;
      // A click that is not a drag selects the stop and opens the colour
      // picker; a drag reorders the card (the browser suppresses the click
      // when a drag occurs, so the two never conflict).
      swatch.addEventListener("click", (event) => {
        event.stopPropagation();
        state.activeStopId = stop.id;
        state.colorEditStopId = stop.id;
        syncActiveControls();
        picker.click();
      });
      picker.addEventListener("input", () => {
        Object.assign(stop, polishStop({ ...stop, ...hexToHsl(picker.value) }));
        commit({ renderCards: false });
      });
      picker.addEventListener("change", () => {
        state.colorEditStopId = "";
        commit();
      });
      picker.addEventListener("blur", () => {
        state.colorEditStopId = "";
        commit();
      });

      const meta = document.createElement("div");
      meta.className = "gcw-color-meta";
      const hex = stopColor(stop);
      meta.textContent = `${hex} \u00B7 ${nearestCssColorName(hex)}`;

      swatch.append(picker);
      card.append(swatch, meta);
      return card;
  }

  function setupDropZone(zoneElement, zone, container) {
    zoneElement.addEventListener("dragover", (event) => {
      event.preventDefault();
      zoneElement.dataset.dragOver = "true";
      event.dataTransfer.dropEffect = "move";
    });
    zoneElement.addEventListener("dragleave", (event) => {
      if (!zoneElement.contains(event.relatedTarget)) delete zoneElement.dataset.dragOver;
    });
    zoneElement.addEventListener("drop", (event) => {
      event.preventDefault();
      delete zoneElement.dataset.dragOver;
      if (!state.drag) return;
      const targetCard = event.target.closest?.(".gcw-color-card");
      if (state.drag.type === "add") {
        if (zone === "active") placeAddCard(cardDropIndex(container, event));
        return;
      }
      if (targetCard?.dataset.zone === zone && targetCard.dataset.stopId && targetCard.dataset.stopId !== state.drag.id) {
        if (targetCard.dataset.zone === state.drag.zone) {
          swapInZone(state.drag.id, targetCard.dataset.stopId, zone);
          return;
        }
      }
      moveBetweenZones(state.drag.id, state.drag.zone, zone, cardDropIndex(container, event));
    });
  }

  function renderPalette() {
    palette.replaceChildren();
    const addIndex = clamp(state.addInsertIndex, 0, state.stops.length);
    state.stops.forEach((stop, index) => {
      if (index === addIndex) palette.appendChild(renderAddCard());
      palette.appendChild(renderCard(stop, index, "active"));
    });
    if (addIndex === state.stops.length) palette.appendChild(renderAddCard());
    savedPalette.replaceChildren();
    state.savedStops.forEach((stop, index) => {
      savedPalette.appendChild(renderCard(stop, index, "saved"));
    });
  }

  function render({ renderCards = true } = {}) {
    const activeGradientStops = state.stops;
    const samples = sampleStops(activeGradientStops, state.sampleCount, gradientInvert(), state.autoOrder, state.hueMode, state.lightnessMode);
    const css = gradientCss(state.angle, activeGradientStops, state.sampleCount, gradientInvert(), state.autoOrder, state.hueMode, state.lightnessMode);
    const previewCss = previewGradientCss(state.previewMode, activeGradientStops, state.sampleCount, gradientInvert(), state.autoOrder, state.hueMode, state.angle, state.falloff, state.radialCenter, state.lightnessMode);
    mount.style.setProperty("--gcw-gradient", css);
    mount.style.setProperty("--gcw-preview-gradient", previewCss);
    mount.style.setProperty("--gcw-preview-zoom", String(state.previewZoom));
    mount.style.setProperty("--gcw-preview-pan-x", `${state.previewPanX}px`);
    mount.style.setProperty("--gcw-preview-pan-y", `${state.previewPanY}px`);
    const outwardPreview = ["dot", "square", "rectangle"].includes(state.previewMode);
    const radialEdgeColor = state.radialCenter === "end" ? samples[0]?.color : samples[samples.length - 1]?.color;
    mount.style.setProperty("--gcw-preview-edge-color", (outwardPreview ? radialEdgeColor : samples[samples.length - 1]?.color) || "rgba(18, 20, 15, 0.42)");
    mount.style.setProperty("--gcw-flat-gradient", `linear-gradient(90deg, ${samples.map((sample) => `${sample.color} ${sample.position.toFixed(1)}%`).join(", ")})`);
    host.querySelector(".gcw-preview").dataset.previewMode = state.previewMode;
    invertInput.checked = state.invert;
    autoOrderInput.checked = state.autoOrder;
    autoBrightInput.checked = state.autoBright;
    indexCountInput.value = String(state.sampleCount);
    archDtShiftInput.value = String(state.archDtShift);
    archFreqInput.value = String(state.archFreqHz);
    archDitherInput.value = String(state.archDitherBits);
    archTableInput.value = String(state.archTableSize);
    archFpsInput.value = String(state.archFps);
    hueModeButtons.forEach((button) => {
      button.dataset.active = String(button.dataset.hueMode === state.hueMode);
      button.setAttribute("aria-pressed", String(button.dataset.hueMode === state.hueMode));
    });
    lightnessModeButtons.forEach((button) => {
      button.dataset.active = String(button.dataset.lightnessMode === state.lightnessMode);
      button.setAttribute("aria-pressed", String(button.dataset.lightnessMode === state.lightnessMode));
    });
    previewModeButtons.forEach((button) => {
      button.dataset.active = String(button.dataset.previewMode === state.previewMode);
      button.setAttribute("aria-pressed", String(button.dataset.previewMode === state.previewMode));
    });
    radialCenterButtons.forEach((button) => {
      button.dataset.active = String(button.dataset.radialCenter === state.radialCenter);
      button.setAttribute("aria-pressed", String(button.dataset.radialCenter === state.radialCenter));
    });
    const activeSelected = state.stops.some((stop) => stop.id === state.activeStopId);
    const savedSelected = state.savedStops.some((stop) => stop.id === state.activeStopId);
    removeButton.disabled = state.stops.length <= 2 || !activeSelected;
    deleteButton.disabled = (!activeSelected && !savedSelected) || (activeSelected && !canDeleteActiveStop(state.activeStopId));
    host.querySelector('[data-drop-zone="saved"]').dataset.empty = String(state.savedStops.length === 0);
    if (renderCards && !state.colorEditStopId) renderPalette();
    renderIndexStrip(samples);
    renderFalloff(samples);
  }

  invertInput.addEventListener("change", () => {
    state.invert = invertInput.checked;
    commit();
  });
  autoOrderInput.addEventListener("change", () => {
    state.autoOrder = autoOrderInput.checked;
    commit();
  });
  autoBrightInput.addEventListener("change", () => {
    state.autoBright = autoBrightInput.checked;
    commit();
  });
  // Generic "scrub to adjust" behaviour for numeric inputs: drag left/right
  // (or up/down) to change the value, or type a value and blur to set it
  // exactly. Hold Shift while dragging for a slower/finer adjustment. This
  // replaces the per-input drag handlers that were duplicated per parameter.
  function makeDraggableNumber(input, { min, max, step = 1, get, set, onChange }) {
    let drag = null;
    const apply = (rawValue) => {
      const snapped = clamp(Math.round(rawValue / step) * step, min, max);
      if (snapped === get()) return;
      set(snapped);
      onChange();
    };
    input.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      drag = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, startValue: get() };
      input.setPointerCapture(event.pointerId);
      event.preventDefault();
    });
    input.addEventListener("pointermove", (event) => {
      if (!drag || event.pointerId !== drag.pointerId) return;
      const travel = (event.clientX - drag.startX) + (drag.startY - event.clientY);
      const pixelsPerStep = event.shiftKey ? 24 : 4;
      apply(drag.startValue + Math.round(travel / pixelsPerStep) * step);
    });
    const end = (event) => {
      if (!drag || event.pointerId !== drag.pointerId) return;
      if (input.hasPointerCapture?.(event.pointerId)) input.releasePointerCapture(event.pointerId);
      drag = null;
    };
    input.addEventListener("pointerup", end);
    input.addEventListener("pointercancel", () => { drag = null; });
    input.addEventListener("change", () => {
      const parsed = Number(input.value);
      apply(Number.isFinite(parsed) ? parsed : get());
    });
  }

  makeDraggableNumber(archDtShiftInput, {
    min: 8, max: 18,
    get: () => state.archDtShift, set: (v) => { state.archDtShift = v; },
    onChange: recaptureArchimedes,
  });
  makeDraggableNumber(archFreqInput, {
    min: 1, max: 64,
    get: () => state.archFreqHz, set: (v) => { state.archFreqHz = v; },
    onChange: recaptureArchimedes,
  });
  makeDraggableNumber(archDitherInput, {
    min: 0, max: 31,
    get: () => state.archDitherBits, set: (v) => { state.archDitherBits = v; },
    onChange: recaptureArchimedes,
  });
  makeDraggableNumber(archTableInput, {
    min: 16, max: 512, step: 16,
    get: () => state.archTableSize, set: (v) => { state.archTableSize = v; },
    onChange: recaptureArchimedes,
  });
  makeDraggableNumber(archFpsInput, {
    min: 0, max: 60,
    get: () => state.archFps, set: (v) => { state.archFps = v; },
    onChange: () => { restartArchimedesAnimation(); render(); emit(); },
  });
  makeDraggableNumber(indexCountInput, {
    min: 2, max: 256,
    get: () => state.sampleCount,
    set: (v) => { state.sampleCount = v; state.sampledIndex = -1; },
    onChange: () => { render(); emit(); },
  });

  // One-click starting palettes. Each applies its colors as the active ramp.
  const GRADIENT_PRESETS = [
    { label: "Ember", colors: ["#000000", "#7A1500", "#FF6B1A", "#FFE08A"] },
    { label: "Ocean", colors: ["#001B2E", "#0F5E7A", "#2EC4B6", "#CFF9F3"] },
    { label: "Neon", colors: ["#12002E", "#7A00FF", "#FF00A8", "#00E5FF"] },
    { label: "Sunset", colors: ["#2B0A3D", "#B5179E", "#F72585", "#FFB703"] },
    { label: "Forest", colors: ["#04130B", "#1B5E20", "#66BB6A", "#E8F5E9"] },
    { label: "Mono", colors: ["#000000", "#555555", "#AAAAAA", "#FFFFFF"] },
    { label: "Plasma", colors: ["#0D0887", "#7E03A8", "#CC4778", "#F89540", "#F0F921"] },
    { label: "Viridis", colors: ["#440154", "#3B528B", "#21918C", "#5EC962", "#FDE725"] },
    { label: "Magma", colors: ["#000004", "#3B0F70", "#8C2981", "#DE4968", "#FEC287"] },
    { label: "Inferno", colors: ["#000004", "#57106E", "#BC3754", "#F98C0A", "#FCFFA4"] },
    { label: "Aurora", colors: ["#011627", "#00B4A6", "#41EAD4", "#B2F7EF", "#F7FFF7"] },
    { label: "Ultraviolet", colors: ["#03001C", "#301E67", "#5B8FB9", "#B6EADA", "#FFFFFF"] },
    { label: "Lava", colors: ["#03071E", "#6A040F", "#DC2F02", "#F48C06", "#FFBA08"] },
    { label: "Ice", colors: ["#03045E", "#0077B6", "#00B4D8", "#90E0EF", "#CAF0F8"] },
    { label: "Candy", colors: ["#1A0B2E", "#7B2CBF", "#E0AAFF", "#FF99C8", "#FFF1E6"] },
    { label: "Spectrum", colors: ["#FF0000", "#FFAA00", "#AAFF00", "#00FFAA", "#00AAFF", "#AA00FF"] },
    { label: "Copper", colors: ["#0B0400", "#5C2E00", "#B87333", "#E6A857", "#FFE9C7"] },
    { label: "Vaporwave", colors: ["#0F0326", "#7303C0", "#EC38BC", "#FDEFF9", "#03A9F4"] },
  ];
  const presetsRow = host.querySelector(".gcw-presets");
  GRADIENT_PRESETS.forEach((preset) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "gcw-preset";
    button.title = `Apply ${preset.label} preset`;
    const swatch = document.createElement("span");
    swatch.className = "gcw-preset-swatch";
    swatch.style.background = `linear-gradient(90deg, ${preset.colors.join(", ")})`;
    const label = document.createElement("span");
    label.textContent = preset.label;
    button.append(swatch, label);
    button.addEventListener("click", () => {
      const key = preset.label.toLowerCase();
      state.stops = preset.colors.map((color, index) =>
        normalizeStop({ id: `${key}-${index}`, color }, index, preset.colors.length));
      state.activeStopId = state.stops[0].id;
      state.addInsertIndex = state.stops.length;
      state.pendingAddStopId = "";
      commit();
    });
    presetsRow.append(button);
  });
  function setFalloffValue(id, value, options = {}) {
    const next = { ...state.falloff };
    if (id === "leftEdge") {
      next.leftEdge = clamp(value, 0, next.leftMid - 1);
    } else if (id === "leftMid") {
      next.leftMid = clamp(value, next.leftEdge + 1, next.rightMid - 1);
    } else if (id === "rightMid") {
      next.rightMid = clamp(value, next.leftMid + 1, next.rightEdge - 1);
    } else if (id === "rightEdge") {
      next.rightEdge = clamp(value, next.rightMid + 1, 100);
    } else if (id === "leftEdgeBand") {
      const startLeftEdge = Number.isFinite(options.startLeftEdge) ? options.startLeftEdge : next.leftEdge;
      const startLeftMid = Number.isFinite(options.startLeftMid) ? options.startLeftMid : next.leftMid;
      const delta = value;
      const minDelta = 0 + 1 - startLeftEdge;
      const maxDelta = next.rightMid - 1 - startLeftMid;
      const clampedDelta = clamp(delta, minDelta, maxDelta);
      next.leftEdge = startLeftEdge + clampedDelta;
      next.leftMid = startLeftMid + clampedDelta;
    } else if (id === "middleBand") {
      const startLeftMid = Number.isFinite(options.startLeftMid) ? options.startLeftMid : next.leftMid;
      const startRightMid = Number.isFinite(options.startRightMid) ? options.startRightMid : next.rightMid;
      const delta = value;
      const minDelta = next.leftEdge + 1 - startLeftMid;
      const maxDelta = next.rightEdge - 1 - startRightMid;
      const clampedDelta = clamp(delta, minDelta, maxDelta);
      next.leftMid = startLeftMid + clampedDelta;
      next.rightMid = startRightMid + clampedDelta;
    } else if (id === "rightEdgeBand") {
      const startRightMid = Number.isFinite(options.startRightMid) ? options.startRightMid : next.rightMid;
      const startRightEdge = Number.isFinite(options.startRightEdge) ? options.startRightEdge : next.rightEdge;
      const delta = value;
      const minDelta = next.leftMid + 1 - startRightMid;
      const maxDelta = 100 - 1 - startRightEdge;
      const clampedDelta = clamp(delta, minDelta, maxDelta);
      next.rightMid = startRightMid + clampedDelta;
      next.rightEdge = startRightEdge + clampedDelta;
    }
    state.falloff = normalizeFalloff(next);
  }

  function closestFalloffHandle(value) {
    const handles = ["leftEdge", "leftMid", "rightMid", "rightEdge"];
    let closest = handles[0];
    let minDistance = Math.abs(value - state.falloff[closest]);
    for (const handle of handles.slice(1)) {
      const distance = Math.abs(value - state.falloff[handle]);
      if (distance < minDistance) {
        minDistance = distance;
        closest = handle;
      }
    }
    return closest;
  }

  let falloffDrag = null;
  let previewPanDrag = null;

  function startFalloffDrag(event, id, captureElement) {
    const rect = falloffStrip.getBoundingClientRect();
    const isBand = id.endsWith("Band");
    falloffDrag = {
      id,
      pointerId: event.pointerId,
      startX: event.clientX,
      startValue: isBand ? 0 : state.falloff[id],
      startLeftEdge: state.falloff.leftEdge,
      startLeftMid: state.falloff.leftMid,
      startRightMid: state.falloff.rightMid,
      startRightEdge: state.falloff.rightEdge,
      captureElement,
      rectLeft: rect.left,
      rectWidth: Math.max(1, rect.width),
    };
    captureElement.setPointerCapture(event.pointerId);
    event.preventDefault();
  }

  function updateFalloffDrag(event) {
    if (!falloffDrag || event.pointerId !== falloffDrag.pointerId) return;
    const pointerValue = clamp(((event.clientX - falloffDrag.rectLeft) / falloffDrag.rectWidth) * 100, 0, 100);
    const startPointerValue = clamp(((falloffDrag.startX - falloffDrag.rectLeft) / falloffDrag.rectWidth) * 100, 0, 100);
    const delta = pointerValue - startPointerValue;
    const nextValue = event.shiftKey
      ? falloffDrag.startValue + (delta * 0.1)
      : falloffDrag.startValue + delta;
    const finalDelta = event.shiftKey ? delta * 0.1 : delta;
    if (falloffDrag.id === "leftEdgeBand") {
      setFalloffValue("leftEdgeBand", finalDelta, {
        startLeftEdge: falloffDrag.startLeftEdge,
        startLeftMid: falloffDrag.startLeftMid,
      });
    } else if (falloffDrag.id === "middleBand") {
      setFalloffValue("middleBand", finalDelta, {
        startLeftMid: falloffDrag.startLeftMid,
        startRightMid: falloffDrag.startRightMid,
      });
    } else if (falloffDrag.id === "rightEdgeBand") {
      setFalloffValue("rightEdgeBand", finalDelta, {
        startRightMid: falloffDrag.startRightMid,
        startRightEdge: falloffDrag.startRightEdge,
      });
    } else {
      setFalloffValue(falloffDrag.id, nextValue);
    }
    render();
    emit();
  }

  function stopFalloffDrag(event) {
    if (!falloffDrag || event.pointerId !== falloffDrag.pointerId) return;
    falloffDrag.captureElement.releasePointerCapture(event.pointerId);
    falloffDrag = null;
  }

  falloffHandles.forEach((handle) => {
    handle.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      const id = handle.dataset.falloffHandle;
      startFalloffDrag(event, id, handle);
    });
  });
  falloffStrip.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    const target = event.target.closest(".gcw-falloff-handle");
    if (target) return;
    const rect = falloffStrip.getBoundingClientRect();
    const value = clamp(((event.clientX - rect.left) / Math.max(1, rect.width)) * 100, 0, 100);
    let id;
    if (value > state.falloff.leftEdge && value < state.falloff.leftMid) {
      id = "leftEdgeBand";
    } else if (value > state.falloff.leftMid && value < state.falloff.rightMid) {
      id = "middleBand";
    } else if (value > state.falloff.rightMid && value < state.falloff.rightEdge) {
      id = "rightEdgeBand";
    } else {
      id = closestFalloffHandle(value);
    }
    startFalloffDrag(event, id, falloffStrip);
  });
  document.addEventListener("pointermove", (event) => {
    updateFalloffDrag(event);
  });
  document.addEventListener("pointerup", (event) => {
    stopFalloffDrag(event);
  });
  document.addEventListener("pointercancel", () => {
    falloffDrag = null;
  });
  hueModeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.hueMode = ["strict", "wide", "chroma", "smooth-natural", "velvet", "silk"].includes(button.dataset.hueMode) ? button.dataset.hueMode : "strict";
      render();
      emit();
    });
  });
  lightnessModeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.lightnessMode = ["linear", "smooth", "gaussian", "filmic", "bokeh", "archimedes"].includes(button.dataset.lightnessMode) ? button.dataset.lightnessMode : "bokeh";
      render();
      emit();
      restartArchimedesAnimation();
    });
  });
  previewModeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.previewMode = ["dot", "diagonal", "horizontal", "vertical", "square", "rectangle"].includes(button.dataset.previewMode) ? button.dataset.previewMode : "dot";
      render();
      emit();
    });
  });
  radialCenterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.radialCenter = ["start", "end"].includes(button.dataset.radialCenter) ? button.dataset.radialCenter : "start";
      render();
      emit();
    });
  });
  preview.addEventListener("click", (event) => {
    const sample = colorAtPreviewPosition(samplePositionFromPreview(event));
    addGradientColorFromHsl(sample);
    commit();
  });
  preview.addEventListener("pointerdown", (event) => {
    if (event.button !== 1) return;
    previewPanDrag = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startPanX: state.previewPanX,
      startPanY: state.previewPanY,
    };
    preview.setPointerCapture(event.pointerId);
    event.preventDefault();
  });
  preview.addEventListener("pointermove", (event) => {
    if (!previewPanDrag || event.pointerId !== previewPanDrag.pointerId) return;
    state.previewPanX = previewPanDrag.startPanX + event.clientX - previewPanDrag.startX;
    state.previewPanY = previewPanDrag.startPanY + event.clientY - previewPanDrag.startY;
    render();
    emit();
    event.preventDefault();
  });
  preview.addEventListener("pointerup", (event) => {
    if (!previewPanDrag || event.pointerId !== previewPanDrag.pointerId) return;
    preview.releasePointerCapture(event.pointerId);
    previewPanDrag = null;
    event.preventDefault();
  });
  preview.addEventListener("pointercancel", () => {
    previewPanDrag = null;
  });
  preview.addEventListener("auxclick", (event) => {
    if (event.button === 1) event.preventDefault();
  });
  preview.addEventListener("wheel", (event) => {
    event.preventDefault();
    const rect = preview.getBoundingClientRect();
    const px = event.clientX - (rect.left + rect.width / 2);
    const py = event.clientY - (rect.top + rect.height / 2);
    const oldZoom = state.previewZoom;
    const wheelUnits = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY;
    const sensitivity = event.shiftKey ? 0.00032 : 0.00135;
    const factor = Math.exp(-wheelUnits * sensitivity);
    const nextZoom = clamp(oldZoom * factor, 1, 1000000);
    const ratio = nextZoom / oldZoom;
    state.previewPanX = nextZoom === 1 ? 0 : px - ratio * (px - state.previewPanX);
    state.previewPanY = nextZoom === 1 ? 0 : py - ratio * (py - state.previewPanY);
    state.previewZoom = nextZoom;
    render();
    emit();
  }, { passive: false });
  removeButton.addEventListener("click", () => {
    moveBetweenZones(state.activeStopId, "active", "saved");
  });
  deleteButton.addEventListener("click", () => {
    deleteSelectedStop();
  });
  copyButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(packet().css);
    } catch {
      // Clipboard can be unavailable on some local/browser contexts.
    }
    copyButton.textContent = "Copied";
    window.setTimeout(() => {
      copyButton.textContent = "Copy CSS";
    }, 900);
  });
  exportPngButton.addEventListener("click", () => {
    const activeGradientStops = state.stops;
    const dataUrl = exportGradientPng(activeGradientStops, {
      width: 1024,
      height: 1,
      invert: gradientInvert(),
      autoOrder: state.autoOrder,
      hueMode: state.hueMode,
      lightnessMode: state.lightnessMode,
    });
    downloadDataUrl(dataUrl, "gradient-texture-1024x1.png");
  });
  commit();
  // Kick off the Archimedes capture (JS port now, real .wasm refines it async).
  ensureArchimedesTable(archConfig(), () => render());
  // Start the live shimmer if the Archimedes lightness mode is already active.
  restartArchimedesAnimation();

  return {
    setGradient(next = {}) {
      if (Number.isFinite(Number(next.angle))) state.angle = clamp(Number(next.angle), 0, 360);
      if (typeof next.invert === "boolean") state.invert = next.invert;
      if (typeof next.autoOrder === "boolean") state.autoOrder = next.autoOrder;
      if (typeof next.autoBright === "boolean") state.autoBright = next.autoBright;
      let archChanged = false;
      if (Number.isFinite(Number(next.archDtShift))) { state.archDtShift = clamp(Math.round(Number(next.archDtShift)), 8, 18); archChanged = true; }
      if (Number.isFinite(Number(next.archFreqHz))) { state.archFreqHz = clamp(Math.round(Number(next.archFreqHz)), 1, 64); archChanged = true; }
      if (Number.isFinite(Number(next.archDitherBits))) { state.archDitherBits = clamp(Math.round(Number(next.archDitherBits)), 0, 31); archChanged = true; }
      if (Number.isFinite(Number(next.archTableSize))) { state.archTableSize = clamp(Math.round(Number(next.archTableSize)), 16, 512); archChanged = true; }
      if (archChanged) ensureArchimedesTable(archConfig());
      if (["wide", "strict", "chroma", "smooth-natural", "velvet", "silk"].includes(next.hueMode)) state.hueMode = next.hueMode;
      if (["linear", "smooth", "gaussian", "filmic", "bokeh", "archimedes"].includes(next.lightnessMode)) state.lightnessMode = next.lightnessMode;
      if (Number.isFinite(Number(next.archFps))) state.archFps = clamp(Math.round(Number(next.archFps)), 0, 60);
      if (["dot", "diagonal", "horizontal", "vertical", "square", "rectangle"].includes(next.previewMode)) state.previewMode = next.previewMode;
      if (["start", "end"].includes(next.radialCenter)) state.radialCenter = next.radialCenter;
      state.gridMode = "off";
      if (next.falloff && typeof next.falloff === "object") state.falloff = normalizeFalloff(next.falloff);
      if (Number.isFinite(Number(next.previewZoom))) state.previewZoom = clamp(Number(next.previewZoom), 1, 1000000);
      if (Number.isFinite(Number(next.previewPanX))) state.previewPanX = Number(next.previewPanX);
      if (Number.isFinite(Number(next.previewPanY))) state.previewPanY = Number(next.previewPanY);
      if (Number.isFinite(Number(next.addInsertIndex))) state.addInsertIndex = clamp(Math.round(Number(next.addInsertIndex)), 0, state.stops.length);
      if (typeof next.addColor === "string") state.addColor = next.addColor;
      if (next.previewPan && typeof next.previewPan === "object") {
        if (Number.isFinite(Number(next.previewPan.x))) state.previewPanX = Number(next.previewPan.x);
        if (Number.isFinite(Number(next.previewPan.y))) state.previewPanY = Number(next.previewPan.y);
      }
      if (Number.isFinite(Number(next.sampleCount))) state.sampleCount = clamp(Number(next.sampleCount), 2, 256);
      if (Array.isArray(next.stops) && next.stops.length >= 2) {
        state.stops = next.stops.map((stop, index) => normalizeStop(stop, index, next.stops.length));
        state.activeStopId = state.stops[0].id;
      }
      if (Array.isArray(next.savedStops)) {
        state.savedStops = next.savedStops.map((stop, index) => normalizeStop(stop, index, next.savedStops.length));
      }
      commit();
      restartArchimedesAnimation();
    },
    getGradient() {
      return packet();
    },
    destroy() {
      stopArchimedesAnimation();
      host.innerHTML = "";
    },
  };
}
