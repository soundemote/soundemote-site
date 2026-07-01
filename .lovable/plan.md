# Sandbox-driven shooting star timing (PR-based sandbox change)

Goal: let the soemdsp-sandbox app control shooting-star timing on the website, over the existing iframe postMessage channel, with the sandbox change landed upstream via pull request.

## Channel already bidirectional
- Website → sandbox: `soundemote:sandbox-event` (collisions)
- Sandbox → website: `soundemote:current-patch` (patch data)

Add one new message sandbox → website: `soundemote:hero-event`. No new libraries.

## Two repos, two landing paths
- **Emitter → `soemdsp-sandbox` repo, via PR (Codex).** This is the permanent home. Landing it upstream means it survives every sync into this project. I provide the exact diff; Codex opens/merges the PR. (Relay model — I can't push to that repo myself.)
- **Listener → this website repo.** My edits here auto-sync to the connected GitHub repo (or review as a branch/PR if you use branch switching).

Interim option: I can also patch the local `public/soemdsp-sandbox/` copy so it works before the PR merges, but that copy is overwritten on the next sync, so treat it as a preview only.

## Message contract
```text
{
  type: "soundemote:hero-event",
  event: "spawnShootingStar",      // extensible: "burst", "setRate"
  payload: { hue?, speed?, count?, intervalSeconds? }
}
```

## Website side — src/components/soundemote/StarField.tsx (I implement)
- Parameterize spawnShooter() to accept overrides (hue, speed, count).
- Add a window message listener:
  - Guard: event.origin === window.location.origin and source is the hero iframe.
  - Validate type === "soundemote:hero-event" and event is allow-listed.
  - spawnShootingStar → spawnShooter(overrides); setRate → mutate a cadence ref.
- Existing auto-spawn stays as default; sandbox events layer on / override.

## Sandbox side — PR diff for Codex (soemdsp-sandbox repo)
Add an emitter, ideally driven by a patch node output (clock/trigger), calling:
```js
window.parent?.postMessage(
  { type: "soundemote:hero-event", event: "spawnShootingStar", payload: {...} },
  window.location.origin
);
```
Cleanest end state: a dedicated trigger node whose pulse posts this message, so shooting-star timing comes straight from the DSP patch. File in that repo mirrors public/soemdsp-sandbox/public/node-graph-external-ui-events.js.

## Deliverables
1. Website listener + parameterized spawn (this repo).
2. Exact PR-ready diff for the emitter, for Codex to land in the soemdsp-sandbox repo.
3. Optional interim local patch so you can preview before the PR merges.

## Notes
- Hero iframe is same-origin, so origin guards are valid both ways.
- Allow-list prevents arbitrary frames from driving the starfield.
- No emitter yet = stars keep current auto-timing; nothing breaks.
