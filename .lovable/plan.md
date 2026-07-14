## Goal

Separate three entities that currently collide at the root — **user**, **patch**, **wiki** — into their own namespaces, with a forgiving shorthand layer that redirects sigils to clean canonical URLs.

## Sigils → canonical (all shorthands redirect)

```text
@<user>        →  /@<user>              (user is the one namespace that stays literal + canonical)
~<slug>        →  /patch/<slug>
#<slug>        →  /wiki/<slug>
```

`#` can never be a real path char (it's the URL fragment), and `~` is fragile bare; so both are typed/branded shorthands only. A hash/prefix catcher rewrites them to the canonical path.

## Canonical routes

```text
/                          front page (unchanged)
/<article>                 article routes: phosphor, simd… (unchanged)
/@<user>                   user profile + default patch
/@<user>/~<patch>          a user's own patch      → redirects to /@<user>/patch/<patch>
/@<user>/patch/<patch>     canonical user patch
/@<user>/wiki/<wiki>       canonical user wiki
/@<user>/files             user files (unchanged behavior)
/patch/<slug>              global named patch (the old /robinsupersaw case) — showcase view
/patch/<slug>/sandbox      same patch, sandbox-only entry
/wiki/<slug>               global wiki (explanation + media, embeds the patch)
```

Key relation: **`/patch/<slug>` and `/wiki/<slug>` are two views of the same subject** (shared slug), cross-linked. The `/@<user>/...` forms are a **separate, user-owned** namespace and never equal the global one.

Modular stays a **setting, not a route**: `?modular=1` / `?hideui=1` append to any patch/embed URL.

## Forgiving redirect layer

A single resolver handles all shorthands and legacy links, redirecting (replace history) to canonical:

- `~<slug>` (bare root) → `/patch/<slug>`
- `#<slug>` (typed/hash) → `/wiki/<slug>`
- `/@<user>/~<patch>` → `/@<user>/patch/<patch>`
- `/@<user>/#<wiki>` → `/@<user>/wiki/<wiki>`
- legacy bare `/robinsupersaw` and other old named-patch slugs → `/patch/<slug>`
- legacy bare `/<handle>` (no sigil) that matches a profile → `/@<handle>`
- hash form `soundemote.io/#foo` / `/~foo` caught client-side and rewritten

Anything unmatched falls through to the existing article routes, then NotFound.

## Code changes

1. **`src/App.tsx`**
   - Remove the hardcoded `/robinsupersaw` route.
   - Add `/patch/:slug` (SandboxPage showcase) and `/patch/:slug/sandbox` (sandbox-only).
   - Add `/wiki/:slug` stays; add `/@:handle`, `/@:handle/patch/:patch`, `/@:handle/wiki/:wiki`, `/@:handle/files`.
   - Constrain the old `/:handle` catch-all so it can't swallow `/patch`, `/wiki`, articles — turn it into a redirect resolver instead.

2. **New `src/lib/routeResolver` (or a small `<RedirectResolver>` route element)**
   - Central place that maps sigils/legacy paths → canonical and issues `<Navigate replace>`.
   - Client-side hash listener for `#`/`~` forms landing on `/`.

3. **`src/pages/SandboxPage.tsx`**
   - Add `view: "showcase" | "sandbox"` prop; both use existing `pagePatch` load/share logic.
   - Support user-scoped patches via `/@user/patch/x` (reuse existing `loadSandboxRouteProject`).

4. **`src/pages/UserPage.tsx`**
   - Require `@`; bare handle redirects to `/@handle`.
   - Wire `/@user/patch/:patch` and `/@user/wiki/:wiki` sub-views.

5. **`src/pages/WikiArticlePage.tsx`**
   - "open full sandbox" points to `/patch/<slug>/sandbox` when the slug has a global patch; keep `?wiki=` fallback.
   - Cross-link to `/patch/<slug>` and vice-versa when slugs match.

6. **`src/config/site.ts`**
   - Add the legacy redirect entries (`robinsupersaw` → `/patch/robinsupersaw`, etc.). Article routes untouched.

## DB

No schema change. `page_patches` (slug + owner + project_data) already backs `/patch/<slug>`; `wiki_pages` backs `/wiki/<slug>`; `profiles` backs `/@user`. User-scoped patches already exist in `shared_projects` (owner/bank/patch).

## Untouched

Front page `/`, article routes, `/sandbox`, `/embed`, `*-live` embeds, and the existing `share to /<slug>` save flow all keep working.
</content>
<summary>Namespace user/patch/wiki with clean canonical paths (/@user, /patch/slug, /wiki/slug) and a forgiving redirect layer that maps the @/~/# sigils and legacy links onto them; modular stays an iframe setting.</summary>
</invoke>
