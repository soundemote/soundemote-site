# URL scheme: @users + bare claimed patches

Lock in the final routing scheme. Drop the `~` patch prefix and the `!` bank prefix entirely. Users live under `@`, claimed patches stay bare.

## Final URL contract

```text
/sinewave                     -> claimed patch (bare slug)
/@argitoth                    -> user page          (reserved, stub for now)
/@argitoth/bank               -> bank page          (reserved, stub for now)
/@argitoth/bank/patch         -> patch in a bank    (reserved, stub for now)
/sandbox, /share/:slug, ...   -> real app routes always win
```

Decisions confirmed:
- Reserved words = real routes only. Any path with a real `<Route>` wins; everything else bare falls through to patch lookup.
- Unknown bare slug `/sinewave` (no claimed patch) -> open sandbox with the claim banner (`/sandbox?claim=sinewave`), current behavior.
- `@user` and bank pages: reserve the URL structure now, build the actual pages later.

## Routing changes (`src/App.tsx`)

Replace the current ambiguous `/:user/:bank/:patch` + `/:shortlink` pair with `@`-aware routes. Because React Router can't bind a param inside a prefixed segment, use a single `:handle` param and validate the `@` prefix inside the page component.

```text
/:handle/:bank/:patch   -> UserPatchPage   (requires @handle, else NotFound)
/:handle/:bank          -> UserBankPage    (requires @handle, else NotFound)
/:handle                -> HandleRouter     (decides: @user page vs bare claimed patch)
```

`HandleRouter` logic for `/:handle`:
- If `handle` starts with `@` -> render the user-page stub (reserve structure).
- Otherwise (bare slug) -> run the existing claimed-patch lookup (current `PatchShortlinkPage` behavior): found -> serve patch; not found -> redirect to `/sandbox?claim=<slug>`.

All real routes stay above the catch-all and keep winning automatically.

## Page work

- Keep `PatchShortlinkPage` as the bare-slug resolver (claimed patch -> sandbox patch route, else claim banner). Remove any `~`-specific handling.
- Add a minimal `@user` stub page (and reuse it for `/@user/bank` and `/@user/bank/patch`) that just shows the handle/bank/patch and a "coming soon" note, so the URL space is reserved without real profile logic.
- Strip `~`/`!` references from prior planning (none are live in code yet beyond the existing bare-slug flow, so this is mostly confirming current files match the new scheme).

## Technical notes

- The existing DB contract (`shared_projects` with `owner_name`/`bank_slug`/`patch_slug`, plus `patch_shortlinks`) already matches `/owner/bank/patch` + bare shortlink, so no schema change is required now.
- The patch loader in `SandboxPage` already accepts `/:user/:bank/:patch`; the only change is that the public-facing user route gains the `@` prefix and the internal sandbox iframe params stay the same.
- No `~` or `!` characters anywhere in routes.

## Out of scope (later)

- Real user profile pages, bank listing pages, auth-tied `@handle` ownership.
- Removing a slug from the claimable pool when soundemote.io itself needs it (manual/admin step later).
