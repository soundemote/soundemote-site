# Forgiving sigil resolution (v2)

## Rule
A link's type is decided by which sigil appears **anywhere** in it:

- `~` anywhere → **patch**
- `@` anywhere → **user**
- `#` anywhere → **wiki**

These combine for user-owned resources:

```text
@robin            -> user page
~robinsupersaw    -> global patch
#supersaw         -> global wiki page
@robin/~mypatch   -> robin's patch "mypatch"
@robin/#mynote    -> robin's wiki page "mynote"
```

Precedence when multiple sigils appear: `@` scopes the owner, then `~`/`#` picks the resource. A link with both `~` and `#` resolves to the first resource sigil found, else 404.

## Canonical targets
Shorthands always redirect (`replace`) to canonical routes:

```text
~<slug>            -> /patch/<slug>
#<slug>            -> /wiki/<slug>
@<user>            -> /@<user>
@<user> + ~<slug>  -> /@<user>/patch/<slug>
@<user> + #<slug>  -> /@<user>/wiki/<slug>
```

## The `#` problem
`#` is always a URL fragment and never reaches the router. So `#slug` and `@user/#slug` arrive as `location.hash`, not a path segment, and must be caught client-side. `~` and `@` are valid path chars and route normally.

## Work

1. **`src/lib/routeResolver.tsx`**
   - `RootSlugResolver` (`/:handle`): scan the decoded segment for a sigil anywhere (not just prefix). `@`→user, `~`→patch, else legacy/user fallback.
   - New `UserScopedResolver` (`/@:handle/:resource`): detect `~`/`#` anywhere in `:resource`, strip the sigil, redirect to `/@handle/patch/<x>` or `/@handle/wiki/<x>`.
   - `ShorthandHashCatcher`: handle `#` fragments, rewriting `@user/#note` → `/@user/wiki/note` and bare `#slug` → `/wiki/slug`. Guard against in-page TOC anchors (see note).

2. **`src/App.tsx`**
   - Add canonical `/@:handle/patch/:slug` and `/@:handle/wiki/:slug` routes.
   - Add `/@:handle/:resource` → `UserScopedResolver` for `~`/legacy shorthand form.
   - Keep existing `/patch/:slug`, `/wiki/:slug`, `/@:handle`.

3. **`src/pages/SandboxPage.tsx`**
   - Accept `/@user/patch/:slug`: when a `handle` param is present, load that user's patch (reuse `loadSandboxRouteProject` with owner=handle) instead of the global `page_patches` lookup.

4. **`src/pages/WikiArticlePage.tsx`**
   - Support user-scoped `/@user/wiki/:slug` reads; cross-link to `/patch/<slug>` when a matching global patch exists.

5. **`src/config/site.ts`** — `legacyPatchSlugs` stays as the legacy bare-slug allowlist.

No DB schema changes: `page_patches` / `wiki_pages` back global; `shared_projects` + `profiles` back user-scoped.

## Anchor-safety note
Since `#` resolves anywhere, the hash catcher must distinguish wiki shorthands from ordinary in-page anchors. Guard: only treat a hash as a wiki shorthand when the path is `/`, `/@<user>`, or otherwise has no article/wiki TOC context. On real article/wiki routes, leave `#heading` alone for the table of contents.