// Chaotic attractor registry used by the oscilloscope.
// Each entry provides defaults for visual rendering + audio worklet driving.
// Adapted from https://github.com/soundemote/soemdsp/blob/main/include/soemdsp/modulator/Attractor.hpp

export type AttractorKind = "lorenz" | "aizawa" | "halvorsen" | "thomas" | "chenlee" | "kepler";

export type AttractorState = { x: number; y: number; z: number };

export type AttractorParam = {
  label: string;
  min: number;
  max: number;
  mode?: "log" | "linear";
  precision?: number;
};

export type AttractorDef = {
  id: AttractorKind;
  label: string;
  params: number[];      // coefficients used by step
  paramSchema: AttractorParam[]; // UI metadata, parallel to params
  init: AttractorState;  // initial state on reset
  dt: number;            // Euler step size (visual + audio)
  viewScale: number;     // multiplier on the on-screen size
  zOffset: number;       // recenters z before projection
  audioScale: number;    // L/R sample amplitude scale
  // Optional: per-attractor default for the global frequency control.
  // Used when switching attractors so each kind picks a sensible rate.
  defaultFreq?: number;
  // Optional: forces the visual fallback to a fixed sample-rate-style
  // integration. Used by oscillators where `dt` is a per-sample phase
  // increment (e.g. Kepler) and naïve "steps per frame ≈ freq*dt" would
  // either jump full cycles per step or skip the polygon entirely.
  visualSamplesPerSec?: number;
};

// Step functions written so their source can be embedded verbatim into the
// AudioWorklet (see Oscilloscope.tsx). Keep `s`, `dt`, `p` as the signature.
export const attractorStepFns: Record<AttractorKind, (s: AttractorState, dt: number, p: number[]) => void> = {
  lorenz: function step(s, dt, p) {
    const dx = p[0] * (s.y - s.x);
    const dy = s.x * (p[1] - s.z) - s.y;
    const dz = s.x * s.y - p[2] * s.z;
    s.x += dx * dt; s.y += dy * dt; s.z += dz * dt;
  },
  aizawa: function step(s, dt, p) {
    const t = s.z - p[1];
    const dx = t * s.x - p[3] * s.y;
    const dy = p[3] * s.x + t * s.y;
    const dz = p[2] + p[0] * s.z - (s.z * s.z * s.z) / 3 - (s.x * s.x + s.y * s.y) * (1 + p[4] * s.z) + p[5] * s.z * s.x * s.x * s.x;
    s.x += dx * dt; s.y += dy * dt; s.z += dz * dt;
  },
  halvorsen: function step(s, dt, p) {
    const a = p[0];
    const dx = -a * s.x - 4 * s.y - 4 * s.z - s.y * s.y;
    const dy = -a * s.y - 4 * s.z - 4 * s.x - s.z * s.z;
    const dz = -a * s.z - 4 * s.x - 4 * s.y - s.x * s.x;
    s.x += dx * dt; s.y += dy * dt; s.z += dz * dt;
  },
  thomas: function step(s, dt, p) {
    const b = p[0];
    const dx = -b * s.x + Math.sin(s.y);
    const dy = -b * s.y + Math.sin(s.z);
    const dz = -b * s.z + Math.sin(s.x);
    s.x += dx * dt; s.y += dy * dt; s.z += dz * dt;
  },
  chenlee: function step(s, dt, p) {
    const dx = p[0] * s.x - s.y * s.z;
    const dy = p[1] * s.y + s.x * s.z;
    const dz = p[2] * s.z + (s.x * s.y) / 3;
    s.x += dx * dt; s.y += dy * dt; s.z += dz * dt;
  },
  // Continuous-ordered polygon oscillator (Hohnerlein/Rest/Smith), driven
  // as a phasor on a Kepler-Bouwkamp inscribed-polygon stack. `dt` is a
  // per-sample phase increment (radians); state.z carries the running
  // phase, and (x,y) are the projected polygon output.
  kepler: function step(s, dt, p) {
    const TAU = Math.PI * 2;
    s.z += dt;
    if (s.z >= TAU) s.z -= TAU;
    else if (s.z < 0) s.z += TAU;
    const start = Math.max(3, Math.round(p[0]));
    const len = Math.max(1, Math.round(p[1]));
    const circles = Math.min(1, Math.max(0, p[2]));
    const zoom = Math.min(1, Math.max(0, p[3]));
    const rot = p[4] * Math.PI;
    const tri = Math.min(1, Math.max(0, p[5]));
    const phi = s.z;
    let sumX = 0, sumY = 0;
    for (let k = 0; k < len; k++) {
      const N = start + k;
      const sector = TAU / N;
      const halfSec = Math.PI / N;
      let alpha = phi - sector * Math.floor(phi / sector + 0.5);
      // `tri` morphs the sector apex toward triangle/saw character.
      alpha += tri * halfSec * Math.sin((alpha / halfSec) * (Math.PI / 2));
      const rPoly = Math.cos(halfSec) / Math.cos(alpha);
      const r = (1 - circles) * rPoly + circles;
      const offset = (k * Math.PI) / N; // rotate each inscribed polygon
      sumX += r * Math.cos(phi + rot + offset);
      sumY += r * Math.sin(phi + rot + offset);
    }
    const scale = (0.4 + 0.6 * zoom) / len;
    s.x = sumX * scale;
    s.y = sumY * scale;
  },
};

export const ATTRACTORS: Record<AttractorKind, AttractorDef> = {
  lorenz: {
    id: "lorenz", label: "lorenz",
    params: [16, 45.92, 4],
    paramSchema: [
      { label: "σ", min: 0.01, max: 200, mode: "log", precision: 2 },
      { label: "ρ", min: 0.01, max: 500, mode: "log", precision: 2 },
      { label: "β", min: 0.01, max: 50,  mode: "log", precision: 2 },
    ],
    init: { x: 0.01, y: 0, z: 0 },
    dt: 0.006, viewScale: 1.0, zOffset: 45, audioScale: 0.035,
  },
  aizawa: {
    id: "aizawa", label: "aizawa",
    params: [0.95, 0.7, 0.6, 3.5, 0.25, 0.1],
    paramSchema: [
      { label: "a", min: 0.01, max: 5,  mode: "log",    precision: 3 },
      { label: "b", min: 0.01, max: 5,  mode: "log",    precision: 3 },
      { label: "c", min: 0.01, max: 5,  mode: "log",    precision: 3 },
      { label: "d", min: 0.01, max: 10, mode: "log",    precision: 3 },
      { label: "e", min: 0.01, max: 2,  mode: "log",    precision: 3 },
      { label: "f", min: 0.01, max: 2,  mode: "log",    precision: 3 },
    ],
    init: { x: 0.1, y: 0, z: 0 },
    dt: 0.01, viewScale: 12, zOffset: 0, audioScale: 0.6,
  },
  halvorsen: {
    id: "halvorsen", label: "halvorsen",
    params: [1.4],
    paramSchema: [
      { label: "a", min: 0.05, max: 5, mode: "log", precision: 3 },
    ],
    init: { x: 1, y: 0, z: 0 },
    dt: 0.005, viewScale: 1.5, zOffset: 0, audioScale: 0.12,
  },
  thomas: {
    id: "thomas", label: "thomas",
    params: [0.19],
    paramSchema: [
      { label: "b", min: 0.005, max: 2, mode: "log", precision: 3 },
    ],
    init: { x: 0.1, y: 0, z: 0 },
    dt: 0.05, viewScale: 4, zOffset: 0, audioScale: 0.3,
  },
  chenlee: {
    id: "chenlee", label: "chenlee",
    params: [5, -10, -0.38],
    paramSchema: [
      { label: "a", min: -20, max: 20,  mode: "linear", precision: 3 },
      { label: "b", min: -20, max: 20,  mode: "linear", precision: 3 },
      { label: "c", min: -5,  max: 5,   mode: "linear", precision: 3 },
    ],
    init: { x: 1, y: 0, z: 4.5 },
    dt: 0.002, viewScale: 0.5, zOffset: 0, audioScale: 0.04,
  },
  kepler: {
    id: "kepler", label: "kepler",
    // [first_polygon, length, circles, zoom, rotation, tri]
    params: [3, 5, 0, 0.7, 0, 0],
    paramSchema: [
      { label: "start",  min: 3,  max: 20, mode: "linear", precision: 0 },
      { label: "length", min: 1,  max: 20, mode: "linear", precision: 0 },
      { label: "circ",   min: 0,  max: 1,  mode: "linear", precision: 2 },
      { label: "zoom",   min: 0,  max: 1,  mode: "linear", precision: 2 },
      { label: "rot",    min: -1, max: 1,  mode: "linear", precision: 2 },
      { label: "tri",    min: 0,  max: 1,  mode: "linear", precision: 2 },
    ],
    init: { x: 1, y: 0, z: 0 },
    // dt is a per-sample phase increment: `audio_dt = freq * def.dt / sr`
    // must equal `2π * freq / sr`, so def.dt = 2π.
    dt: Math.PI * 2, viewScale: 28, zOffset: 0, audioScale: 0.6,
    defaultFreq: 220,
    visualSamplesPerSec: 6000,
  },
};

export const ATTRACTOR_ORDER: AttractorKind[] = ["lorenz", "aizawa", "halvorsen", "thomas", "chenlee", "kepler"];

// Worklet-safe step source for each attractor. Embedded verbatim into the
// AudioWorklet template — must reference `this.x/y/z` and `this.params[i]`
// directly so production minifiers can't rename anything we depend on.
export const attractorWorkletSteps: Record<AttractorKind, string> = {
  lorenz: `{
    const _dx = this.params[0]*(this.y-this.x);
    const _dy = this.x*(this.params[1]-this.z)-this.y;
    const _dz = this.x*this.y-this.params[2]*this.z;
    this.x += _dx*dt; this.y += _dy*dt; this.z += _dz*dt;
  }`,
  aizawa: `{
    const _t = this.z - this.params[1];
    const _dx = _t*this.x - this.params[3]*this.y;
    const _dy = this.params[3]*this.x + _t*this.y;
    const _dz = this.params[2] + this.params[0]*this.z - (this.z*this.z*this.z)/3
      - (this.x*this.x + this.y*this.y)*(1 + this.params[4]*this.z)
      + this.params[5]*this.z*this.x*this.x*this.x;
    this.x += _dx*dt; this.y += _dy*dt; this.z += _dz*dt;
  }`,
  halvorsen: `{
    const _a = this.params[0];
    const _dx = -_a*this.x - 4*this.y - 4*this.z - this.y*this.y;
    const _dy = -_a*this.y - 4*this.z - 4*this.x - this.z*this.z;
    const _dz = -_a*this.z - 4*this.x - 4*this.y - this.x*this.x;
    this.x += _dx*dt; this.y += _dy*dt; this.z += _dz*dt;
  }`,
  thomas: `{
    const _b = this.params[0];
    const _dx = -_b*this.x + Math.sin(this.y);
    const _dy = -_b*this.y + Math.sin(this.z);
    const _dz = -_b*this.z + Math.sin(this.x);
    this.x += _dx*dt; this.y += _dy*dt; this.z += _dz*dt;
  }`,
  chenlee: `{
    const _dx = this.params[0]*this.x - this.y*this.z;
    const _dy = this.params[1]*this.y + this.x*this.z;
    const _dz = this.params[2]*this.z + (this.x*this.y)/3;
    this.x += _dx*dt; this.y += _dy*dt; this.z += _dz*dt;
  }`,
  kepler: `{
    const _TAU = 6.283185307179586;
    this.z += dt;
    if (this.z >= _TAU) this.z -= _TAU;
    else if (this.z < 0) this.z += _TAU;
    const _start = Math.max(3, Math.round(this.params[0]));
    const _len   = Math.max(1, Math.round(this.params[1]));
    const _circ  = Math.min(1, Math.max(0, this.params[2]));
    const _zoom  = Math.min(1, Math.max(0, this.params[3]));
    const _rot   = this.params[4] * Math.PI;
    const _tri   = Math.min(1, Math.max(0, this.params[5]));
    const _phi = this.z;
    let _sumX = 0, _sumY = 0;
    for (let _k = 0; _k < _len; _k++) {
      const _N = _start + _k;
      const _sector = _TAU / _N;
      const _halfSec = Math.PI / _N;
      let _alpha = _phi - _sector * Math.floor(_phi / _sector + 0.5);
      _alpha += _tri * _halfSec * Math.sin((_alpha / _halfSec) * (Math.PI / 2));
      const _rPoly = Math.cos(_halfSec) / Math.cos(_alpha);
      const _r = (1 - _circ) * _rPoly + _circ;
      const _off = (_k * Math.PI) / _N;
      _sumX += _r * Math.cos(_phi + _rot + _off);
      _sumY += _r * Math.sin(_phi + _rot + _off);
    }
    const _scale = (0.4 + 0.6 * _zoom) / _len;
    this.x = _sumX * _scale;
    this.y = _sumY * _scale;
  }`,
};
