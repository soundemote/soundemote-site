// Chaotic attractor registry used by the oscilloscope.
// Each entry provides defaults for visual rendering + audio worklet driving.
// Adapted from https://github.com/soundemote/soemdsp/blob/main/include/soemdsp/modulator/Attractor.hpp

export type AttractorKind = "lorenz" | "aizawa" | "halvorsen" | "thomas" | "chenlee";

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
};

export const ATTRACTOR_ORDER: AttractorKind[] = ["lorenz", "aizawa", "halvorsen", "thomas", "chenlee"];

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
};
