// Chaotic attractor registry used by the oscilloscope.
// Each entry provides defaults for visual rendering + audio worklet driving.
// Adapted from https://github.com/soundemote/soemdsp/blob/main/include/soemdsp/modulator/Attractor.hpp

export type AttractorKind = "lorenz" | "aizawa" | "halvorsen" | "thomas" | "chenlee" | "spiral";

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
  // Jerobeam-style spiral oscillator (soemdsp JerobeamSpiral), simplified
  // to fixed morph/sharp/rotation phasors with three exposed controls:
  // density (number of spirals), zdepth (perspective fold) and z_amount
  // (z-history feedback into oscillator frequency / "darkness").
  // `dt` is a per-sample phase increment in radians (def.dt = 2π); state.z
  // carries the running phasor [0,1), and a closure-scoped `_spiralZH`
  // carries the z_history feedback term.
  spiral: (function () {
    let zh = 0;
    return function step(s, dt, p) {
      const PI = Math.PI, TAU = 2 * PI, PIz2 = PI / 2, PIz4 = PI / 4;
      const dense = Math.max(Math.abs(p[0]), 1e-6);
      const log_dense = Math.log(dense);
      const zdepth = p[1];
      const z_amount = p[2];
      const div = 0.5;
      const z_darkness = Math.pow(z_amount * z_amount * 5 + 1, zh);
      let phasor = s.z + (dt / TAU) * z_darkness;
      phasor -= Math.floor(phasor);
      s.z = phasor;
      // trisaw(phasor, 0.5) → triangle in [0,1]
      const fphas_ends = phasor < 0.5 ? 2 * phasor : 2 - 2 * phasor;
      const lophas = fphas_ends; // bright_dist = 0
      const lh = lophas - 0.5;
      const a = lh;
      const fmod_l = a - Math.trunc(a / 1.0);
      let phas = fmod_l * Math.exp(0.5 * log_dense) / 4 + 0.375;
      phas = phas - Math.trunc(phas);
      // ----- spiral(lophas, phas, dense, 0.5, morph=0.5) -----
      const f001 = PIz4 * lh + PIz4;
      let losin = Math.sin(f001), locos = Math.cos(f001);
      const lo_y = 0.25 * (1 - 2 * losin);
      const lo_z = 0.25 * (1 - 2 * locos);
      const f003 = (PI / 10) * lh + PIz4;
      losin = Math.sin(f003); locos = Math.cos(f003);
      const kTAUp = TAU * phas;
      const sp0sin = Math.sin(kTAUp), sp0cos = Math.cos(kTAUp);
      const spiral0_x = sp0sin;
      const spiral0_y = sp0cos * losin;
      const spiral0_z = sp0cos * locos;
      const f1 = dense * kTAUp - PIz2;
      let sp1sin = Math.sin(f1); const sp1cos = Math.cos(f1);
      sp1sin = -sp1sin;
      const sp1sin_x_sp0sin = sp1sin * sp0sin;
      const spiral1_x = div * sp1sin_x_sp0sin;
      const spiral1_y = div * ((sp1sin * sp0cos) * losin + sp1cos * locos);
      const spiral1_z = div * (sp1cos * -losin + (sp1sin * sp0cos) * locos);
      const f2 = dense * dense * TAU * phas;
      // soemdsp uses math::sincos(angle, sp2cos, sp2sin) where the first
      // output slot is sin; then sp2cos *= -1. So sp2cos = -sin(f2),
      // sp2sin = cos(f2). Variable names are kept for parity with C++.
      const sp2cos = -Math.sin(f2);
      const sp2sin = Math.cos(f2);
      const dd = div * div;
      const spiral2_x = dd * (sp2cos * sp0cos + sp2sin * sp1sin_x_sp0sin);
      const spiral2_y = dd * ((sp2cos * -sp0sin + sp2sin * sp1sin * sp0cos) * losin + (sp2sin * sp1cos) * locos);
      const spiral2_z = dd * ((sp2sin * sp1cos) * -losin + (sp2cos * -sp0sin + sp2sin * sp1sin * sp0cos) * locos);
      let wave_x = spiral0_x + spiral1_x + spiral2_x;
      let wave_y = lo_y + spiral0_y + spiral1_y + spiral2_y;
      let wave_z = lo_z + spiral0_z + spiral1_z + spiral2_z;
      const xs = Math.exp(0.5 * log_dense);
      wave_x *= xs; wave_y *= xs; wave_z *= xs;
      const f004 = xs / 4;
      let yfact = 0;
      if (f004 < 1) yfact = (1 - f004) * (1 - f004);
      const x_off = xs * Math.SQRT1_2 * yfact;
      wave_x -= x_off; wave_y += x_off;
      // ----- end spiral -----
      let vol_correct = 1 / 1.75;
      const zd2 = zdepth / 2;
      vol_correct = vol_correct + zd2 - vol_correct * zd2;
      wave_x *= vol_correct; wave_y *= vol_correct; wave_z *= vol_correct;
      wave_y += 0.25;
      wave_z += 0.36;
      // rotate(wave, 0, -π/2): out_x = in_y, out_y = in_z, out_z = -in_x
      const rx = wave_y, ry = wave_z, rz = -wave_x;
      const formula = zdepth * 1.25 * (rz / 2 + 0.5);
      const m = 1 + zdepth;
      const L = (rx - formula * rx) * m;
      const R = (ry - formula * ry) * m;
      s.x = L; s.y = R;
      zh = rz;
    };
  })(),
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
  spiral: {
    id: "spiral", label: "spiral",
    // [density, zdepth, z_amount]
    params: [2, 0.0, 0.0],
    paramSchema: [
      { label: "density",  min: 0.5, max: 8, mode: "log",    precision: 2 },
      { label: "z-depth",  min: -1,  max: 1, mode: "linear", precision: 2 },
      { label: "z-amount", min: 0,   max: 1, mode: "linear", precision: 2 },
    ],
    init: { x: 0, y: 0, z: 0 },
    // dt is a per-sample phase increment: `audio_dt = freq * def.dt / sr`
    // must equal `2π * freq / sr`, so def.dt = 2π.
    dt: Math.PI * 2, viewScale: 220, zOffset: 0, audioScale: 0.8,
    defaultFreq: 110,
    visualSamplesPerSec: 8000,
  },
};

export const ATTRACTOR_ORDER: AttractorKind[] = ["lorenz", "aizawa", "halvorsen", "thomas", "chenlee", "spiral"];

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
  spiral: `{
    const _PI = Math.PI, _TAU = 6.283185307179586, _PIz2 = _PI/2, _PIz4 = _PI/4;
    if (typeof this.zh !== 'number') this.zh = 0;
    const _dense = Math.max(Math.abs(this.params[0]), 1e-6);
    const _log_dense = Math.log(_dense);
    const _zdepth = this.params[1];
    const _zamt = this.params[2];
    const _div = 0.5;
    const _zdark = Math.pow(_zamt*_zamt*5 + 1, this.zh);
    let _phasor = this.z + (dt/_TAU) * _zdark;
    _phasor -= Math.floor(_phasor);
    this.z = _phasor;
    const _fphas = _phasor < 0.5 ? 2*_phasor : 2 - 2*_phasor;
    const _lophas = _fphas;
    const _lh = _lophas - 0.5;
    const _fml = _lh - Math.trunc(_lh / 1.0);
    let _phas = _fml * Math.exp(0.5 * _log_dense) / 4 + 0.375;
    _phas = _phas - Math.trunc(_phas);
    const _f001 = _PIz4 * _lh + _PIz4;
    let _losin = Math.sin(_f001), _locos = Math.cos(_f001);
    const _lo_y = 0.25 * (1 - 2*_losin);
    const _lo_z = 0.25 * (1 - 2*_locos);
    const _f003 = (_PI/10) * _lh + _PIz4;
    _losin = Math.sin(_f003); _locos = Math.cos(_f003);
    const _kT = _TAU * _phas;
    const _sp0s = Math.sin(_kT), _sp0c = Math.cos(_kT);
    const _s0x = _sp0s, _s0y = _sp0c*_losin, _s0z = _sp0c*_locos;
    const _f1 = _dense*_kT - _PIz2;
    let _sp1s = Math.sin(_f1); const _sp1c = Math.cos(_f1);
    _sp1s = -_sp1s;
    const _ss = _sp1s * _sp0s;
    const _s1x = _div * _ss;
    const _s1y = _div * ((_sp1s*_sp0c)*_losin + _sp1c*_locos);
    const _s1z = _div * (_sp1c*-_losin + (_sp1s*_sp0c)*_locos);
    const _f2 = _dense*_dense * _TAU * _phas;
    const _sp2c = -Math.sin(_f2);
    const _sp2s = Math.cos(_f2);
    const _dd = _div * _div;
    const _s2x = _dd * (_sp2c*_sp0c + _sp2s*_ss);
    const _s2y = _dd * ((_sp2c*-_sp0s + _sp2s*_sp1s*_sp0c)*_losin + (_sp2s*_sp1c)*_locos);
    const _s2z = _dd * ((_sp2s*_sp1c)*-_losin + (_sp2c*-_sp0s + _sp2s*_sp1s*_sp0c)*_locos);
    let _wx = _s0x + _s1x + _s2x;
    let _wy = _lo_y + _s0y + _s1y + _s2y;
    let _wz = _lo_z + _s0z + _s1z + _s2z;
    const _xs = Math.exp(0.5 * _log_dense);
    _wx *= _xs; _wy *= _xs; _wz *= _xs;
    const _f004 = _xs / 4;
    let _yf = 0;
    if (_f004 < 1) _yf = (1 - _f004) * (1 - _f004);
    const _xoff = _xs * Math.SQRT1_2 * _yf;
    _wx -= _xoff; _wy += _xoff;
    let _vc = 1/1.75;
    const _zd2 = _zdepth/2;
    _vc = _vc + _zd2 - _vc * _zd2;
    _wx *= _vc; _wy *= _vc; _wz *= _vc;
    _wy += 0.25; _wz += 0.36;
    const _rx = _wy, _ry = _wz, _rz = -_wx;
    const _fm = _zdepth * 1.25 * (_rz/2 + 0.5);
    const _m = 1 + _zdepth;
    this.x = (_rx - _fm*_rx) * _m;
    this.y = (_ry - _fm*_ry) * _m;
    this.zh = _rz;
  }`,
};
