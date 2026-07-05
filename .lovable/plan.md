## Goal

Bring the editable wiki article pages (`/wiki/<slug>`) up to the polished "Wikipedia" styling already used by the patch/featured article pages: an enforced contents/navigation table, indexed sections, condensed but readable typography, and a layout that stays clean on phones.

Right now `WikiArticlePage.tsx` renders the body as raw `whitespace-pre-wrap` text — no markdown, no headings, no table of contents. The good pattern already exists in `PatchArticlePage.tsx` (breadcrumb → header → `TableOfContents` → `WikiMarkdown` → infobox sidebar). We reuse those shared components.

## What changes

### 1. `src/pages/WikiArticlePage.tsx` (main work)
Replace the plain-text article render (currently lines ~237-246) with the shared wiki reading experience:

- Render the body through `WikiMarkdown` instead of raw pre-wrapped text, so headings, lists, tables, and code format properly.
- Compute `chapters = extractChapters(page.body)` and render `TableOfContents` above the body — this is the enforced navigation table, auto-built from every `## Heading`.
- Add a Wikipedia-style breadcrumb row (`soundemote / wiki / <slug>`) and a tightened header block (title + `/wiki/<slug>` path line), matching the patch article header rhythm but lighter.
- Wrap the reading area in a responsive two-column grid on desktop (`lg:grid-cols-[1fr_260px]`): main column = TOC + markdown, side column = a compact "page info" box (last updated date, slug, edit link). On phones it collapses to a single column with the contents table first, then the article.
- Keep the existing edit/create flow, auth gating, and the sandbox patch iframe untouched — only the read view is restyled.

### 2. Contents table: sticky + condensed
- On desktop, make the contents navigation sticky so it stays visible while scrolling long articles (the shared `TableOfContents` stays inline on mobile at the top).
- Keep font sizes small/condensed (reuse the existing `prose-sm md:prose-base` scale in `WIKI_PROSE_CLASSNAME`), so text isn't too large but stays phone-friendly.

### 3. Typography polish in `WikiMarkdown.tsx` (shared, light touch)
- Tighten the prose token string so wiki reading is condensed: slightly reduced heading top-margins and paragraph leading, comfortable max measure, and mobile-safe table wrapping (horizontal scroll for wide tables instead of overflow). This improves every consumer (wiki, featured spotlight, patch articles) consistently since they all share this class.

### 4. Optional: `WikiPage.tsx` index polish
- Give the wiki index list the same condensed card styling and widen it slightly so it reads as the front door to the articles. Low-risk, cosmetic.

## Notes / trade-offs

- Moving the wiki body from raw text to markdown means existing pages authored as plain paragraphs still render fine (markdown passes plain text through), but authors can now use `##` headings to populate the contents table. The edit textarea placeholder will be updated to hint at this.
- No database or backend changes. No changes to auth, editing permissions, or the sandbox embed.
- All styling uses existing semantic tokens (`scope`, `border`, `card`, `muted-foreground`) — no hardcoded colors.

## Technical anchors
- Reuse: `WikiMarkdown` / `WIKI_PROSE_CLASSNAME` (`src/components/soundemote/WikiMarkdown.tsx`), `TableOfContents` + `extractChapters` (`src/components/soundemote/TableOfContents.tsx`).
- Pattern reference: `src/pages/PatchArticlePage.tsx` lines 84-201.
- Primary edit target: `src/pages/WikiArticlePage.tsx` read-view branch.
