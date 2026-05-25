// Chaotic attractor registry used by the oscilloscope.
// Each entry provides defaults for visual rendering + audio worklet driving.
// Adapted from https://github.com/soundemote/soemdsp/blob/main/include/soemdsp/modulator/Attractor.hpp

export type AttractorKind = "lorenz" | "aizawa" | "halvorsen" | "thomas" | "chenlee";

export type AttractorState = { x: number; y: number; z: number };

export type AttractorDef = {
  id: AttractorKind;
  label: string;
  params: number[];      // coefficients used by step
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
    init: { x: 0.01, y: 0, z: 0 },
    dt: 0.006, viewScale: 1.0, zOffset: 45, audioScale: 0.035,
  },
  aizawa: {
    id: "aizawa", label: "aizawa",
    params: [0.95, 0.7, 0.6, 3.5, 0.25, 0.1],
    init: { x: 0.1, y: 0, z: 0 },
    dt: 0.01, viewScale: 12, zOffset: 0, audioScale: 0.6,
  },
  halvorsen: {
    id: "halvorsen", label: "halvorsen",
    params: [1.4],
    init: { x: 1, y: 0, z: 0 },
    dt: 0.005, viewScale: 1.5, zOffset: 0, audioScale: 0.12,
  },
  thomas: {
    id: "thomas", label: "thomas",
    params: [0.19],
    init: { x: 0.1, y: 0, z: 0 },
    dt: 0.05, viewScale: 4, zOffset: 0, audioScale: 0.3,
  },
  chenlee: {
    id: "chenlee", label: "chenlee",
    params: [5, -10, -0.38],
    init: { x: 1, y: 0, z: 4.5 },
    dt: 0.002, viewScale: 0.5, zOffset: 0, audioScale: 0.04,
  },
};

export const ATTRACTOR_ORDER: AttractorKind[] = ["lorenz", "aizawa", "halvorsen", "thomas", "chenlee"];
