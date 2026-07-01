# Pull latest soemdsp-sandbox (commit 231aaf6) into the embedded copy

Source: `github.com/soundemote/soemdsp-sandbox` @ `master` head `231aaf6` (today, "Fix boot overlay flashing the modular shell during the fade transition" — the boot-view fix we relayed to Codex has landed upstream). Repo is public; fetched via codeload tarball.

## Layout mapping (verified)
The embed is the repo's `public/` folder, with two files hoisted to the embed root:

```text
repo/public/index.html                  -> public/soemdsp-sandbox/index.html
repo/public/native-modules-catalog.json -> public/soemdsp-sandbox/native-modules-catalog.json
repo/public/*  (everything else)        -> public/soemdsp-sandbox/public/*
repo/native_modules/*                   -> public/soemdsp-sandbox/native_modules/*
```

## What's already merged upstream (no action)
- postMessage bridge in `node-graph-external-ui-events.js` (`soundemote:sandbox-event`, `:current-patch`, `:hero-event`) — present upstream.
- Boot-overlay / modular-only fade fix in `boot-loading.js` + `styles.css` — this is the head commit.

## Website-specific customizations NOT upstream — preserve these
Upstream ships a different startup demo (ChaosArp Lorenz). Our site intentionally uses the reverb default patch + "Silently Dreaming" startup audio, so after the overwrite I restore:
1. `public/soemdsp-sandbox/public/presets/default.json` (our reverb default patch)
2. `public/soemdsp-sandbox/public/resources/manifest.json` (the "Silently Dreaming" audio entry)
3. `public/soemdsp-sandbox/public/resources/audio/Elan Hickler - Silently Dreaming.mp3`

## Steps
1. Back up the 3 customization files above to a temp location.
2. Overwrite `public/soemdsp-sandbox/{index.html,native-modules-catalog.json,public/,native_modules/}` from the tarball per the mapping (clean replace of the sandbox tree only).
3. Restore the 3 customization files.
4. Sanity-check: confirm the bridge + boot fix are present, and that `default.json`/manifest still point to Silently Dreaming.
5. Validate in preview: load `/`, `/reverb`, `/shootingstar`, `/tweet` — modular-only boots clean (no header/backend flash), default reverb patch + startup audio load, patch-nav and shooting-star bridge still fire.

## Website code (`src/`)
No changes expected — the postMessage contract (`SandboxPage.tsx`, `StarField.tsx`) is unchanged. Only re-verify if a message-type name changed upstream (none observed).

## Notes
- Excluded from the embed (repo-only, not served): `backups/`, `docs/`, `scripts/`, `tools/`, `saved-patches/`, `server.py`, `progress.md`, `LICENSE`, `README.md`, `.gitignore`.
- The ChaosArp Lorenz mp3 from upstream will land in `resources/audio/` but is unused; harmless. Can prune if you want it gone.
