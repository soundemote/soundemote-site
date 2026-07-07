// On-site Soundemote article: "The Last Clock for Humanity".
// A chaotic temporal oscillator engine that derives sinewave, distortion,
// noise floor, and spacetime keeping from a single self-oscillating loop.

export const LAST_CLOCK_ARTICLE_SOURCE_URL = "https://github.com/soundemote/soemdsp-last-clock";

export const LAST_CLOCK_ARTICLE_MARKDOWN = `# 🕰️ The Last Clock for Humanity

**Non-linear chaos synthesis via temporal signal re-generation.** One
self-oscillating feedback loop. From it we derive a sinewave, a distortion
level, a noise floor, and a two-way time reference — all at once, with no call
to \`sin()\`.

---

## 🌀 The core loop

We don't compute trigonometry every sample. We run a lightweight coupled
resonator and let a sinewave *fall out* of the recurrence:

\`\`\`
u[n] = u[n-1] - k * v[n-1]
v[n] = v[n-1] + k * u[n]
\`\`\`

Two state variables in quadrature. \`k\` sets the angular step. This is a
biquad in disguise — a discrete rotation matrix that orbits the origin
forever. The orbit *is* the waveform. No table lookup, no polynomial, no
branch.

---

## ⏳ Temporal cycle-capture

By tracking **zero-crossings** we capture one complete, closed-loop cycle.
That cycle is a self-contained unit of time.

- Read it **forward** → prediction of the signal into the future.
- Read it **backward** → reconstruction of the signal into the past.

Reading the captured cycle symmetrically gives a **stable temporal anchor**:
a clock that regenerates itself every sample and can be run in either time
direction. The same captured cycle doubles as an **ultra-low-overhead
\`sin()\` approximation** — you already paid for it by oscillating.

> The clock keeps itself. Each sample re-derives the one before and the one
> after, so drift is corrected against the loop's own geometry, not an
> external reference.

---

## 🎚️ Noise floor purification (dithering distortion)

Floating-point math throws away its deepest fractional bits every operation.
We **don't discard them** — we isolate the sub-bit remnant and mix it back
into the loop as a **correlated noise floor**.

Paradoxically, this *purifies* the macroscopic sine:

- Sub-bit chaos acts as **dither**, decorrelating quantization error from the
  signal.
- Harsh truncation steps and harmonic distortion get **smoothed** below the
  ear's resolution.
- Digital aliasing is replaced with **warm, analog-style phase noise**.

Noise, applied correctly, is what makes the wave clean.

---

## ⚙️ CPU ↔ noise floor scaling

The engine turns **processor time into an audio parameter**:

| Compute depth | CPU | Noise floor | Character |
|---|---|---|---|
| Few decimal places | 🟢 minimal | 🔺 high | gritty, lo-fi, vintage |
| Deep-bit profile | 🔴 heavy | 🔻 near-silence | hyper-pure waveform |

**CPU usage inversely tracks how much noise is present.** Fidelity is a dial,
not a fixed cost. You spend cycles to buy silence.

---

## 🔐 Sinewaves out of noise (the cryptographic angle)

A pure tone and white noise sit at opposite ends of predictability — exactly
the axis cryptography cares about. We exploit that:

1. Feed the loop's chaotic sub-bit stream through a **highpass split**.
2. The highpass separates the stream into **structured energy** (the orbit)
   and **residual noise** (the entropy).
3. The structured half re-seeds the resonator; the residual half becomes the
   dither pool.

The recurrence is deterministic given its seed, so the "noise" is really a
**keyed pseudo-random stream** — reproducible, correlated, and reversible in
time. Same seed, same waveform, forward or backward. That's a sinewave
recovered from noise by knowing the key.

---

## 🕳️ Black-hole theory (a home for aliasing error)

Every filter has an error term it can't account for — the part of the signal
that falls past what the model can represent. We treat that residual as
falling into a **black hole for aliasing**.

Here's why the analogy holds. Aliasing is energy moving *faster than the
system's speed limit*:

\`\`\`
simulation_speed_limit = ½ × sample_rate × oversampling_ratio
\`\`\`

Because everything here is derived from an **approximate sine computed
forward and backward in time every sample**, nothing in the engine is ever
asked to move faster than that limit. Frequencies that would alias would have
to cross the universe's speed limit — and they can't. The unrepresentable
error doesn't fold back as harsh aliases; it crosses the horizon and is
**gone**. What escapes is the small, warm phase-noise term we already fold
back as dither.

> No signal crosses the speed limit → no aliasing folds back → the error
> disappears into the hole instead of into your ears.

---

## 🧭 Summary

| Derived quantity | Source |
|---|---|
| 〰️ Sinewave | the quadrature orbit itself |
| ⏱️ Spacetime keeping | zero-crossing cycle read both directions |
| 🎛️ Distortion level | compute-depth truncation |
| 🌫️ Noise floor | isolated sub-bit remnant, re-injected |

One loop. Four outputs. A clock that regenerates itself every sample and
refuses to let anything cross the speed limit.

---

## 📄 License

Source-available for noncommercial use. Commercial use requires a written
license from Soundemote.
`;
