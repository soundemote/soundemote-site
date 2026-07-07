# Archimedes-generated Superdot curve

Add a new **Lightness** curve mode, `Archimedes`, to the gradient curve widget. When selected, the Superdot's brightness falloff is shaped by a wavetable **captured from our Archimedes oscillator** instead of a smooth math function — so the oscillator's fixed-point + dithered-noise character bakes a subtle shimmer/jitter into the dot's radial banding. This is exactly the "generate a curve over time, capture it, apply it" idea.

## How it works

- On widget mount, run the Archimedes oscillator forward in time (step-by-step) and **capture one shaped cycle into a ~256-entry wavetable**, normalized to `[0,1]`. This happens once and is cached at module scope, so repeated re-renders reuse the same table.
- The capture source is the real compiled module: fetch and instantiate `/soemdsp-sandbox/native_modules/archimedes/archimedes.wasm`, then call `soemdsp_archimedes_create` / `set_profile` / `set_frequency` / `step` to fill the table. If the fetch/instantiate fails, fall back to a faithful in-file JS port of the same integer symplectic + xorshift-dither math (identical algorithm to `archimedes.cpp`), so the UI never breaks.
- A new `lightnessCurveValue` branch for `mode === "archimedes"` reads `t` from that captured table (with linear interpolation between entries). Because the table carries the dither jitter, the falloff wobbles slightly rather than being perfectly smooth — the demonstration you want.

## UI

- New button in the existing **Lightness** row: `Linear · Smooth · Gaussian · Filmic · Bokeh · **Archimedes**`.
- Selecting it switches the Superdot (and every other preview mode) to the captured curve. It persists across reloads via the widget's existing localStorage settings (it already stores `lightnessMode`).

## Scope

- Single file touched: `src/good-code/gradient-curve-widget/gradient-curve-widget.js`
  - add the `archimedes` button markup in the Lightness segment
  - add `"archimedes"` to the three places the lightness mode is validated (initial state, button handler, settings import)
  - add the capture helper (wasm load + JS fallback + cached wavetable)
  - add the `archimedes` branch in `lightnessCurveValue`
- No changes to the Archimedes module, the article, or the constellation.

## Technical notes

- The captured curve is **static** (the jitter is spatial across the dot's radius, captured from the oscillator's time evolution). No animation loop is added — the CSS-driven dot stays a static gradient, matching the capture-and-apply approach and keeping it cheap.
- Capture parameters (profile `dtShift`, frequency, dither bits, sample count) will be tuned so the jitter is visible but tasteful — a shimmer, not noise.
