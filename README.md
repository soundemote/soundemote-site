# soundemote

**soundemote.io** — the production site. Real accounts, a real DSP sandbox
running in the browser, and a growing wiki of patch articles that read more
like documentation than blog posts.

## What lives here

- **The sandbox** ([`SandboxPage.tsx`](src/pages/SandboxPage.tsx)) — the
  soemdsp modular DSP engine, embedded live. Every signal on screen is an
  equation evaluated fresh every sample, not a recording — this is SVG for
  audio.
- **Patch articles** ([`PatchArticlePage.tsx`](src/pages/PatchArticlePage.tsx),
  [`FeaturedArticlePage.tsx`](src/pages/FeaturedArticlePage.tsx)) — GitHub
  README meets Wikipedia. Each one explains a patch by walking through the
  physics of the modules that make it up.
- **The wiki** ([`WikiPage.tsx`](src/pages/WikiPage.tsx),
  [`WikiArticlePage.tsx`](src/pages/WikiArticlePage.tsx)) — community-editable,
  moderated through the admin tools below.
- **User space** ([`UserPage.tsx`](src/pages/UserPage.tsx),
  [`FilesPage.tsx`](src/pages/FilesPage.tsx)) — `/:handle`, `/:handle/:bank`,
  `/:handle/:bank/:patch` — every user gets a bank of patches at a URL.
- **The video engine's first module** —
  [`gradient-curve-widget`](src/good-code/gradient-curve-widget/), live at
  [`/gradient-curve`](src/pages/GradientCurvePage.tsx). Same idea as the
  audio side: a dot drawn from a curve instead of a stored image. The falloff
  handles reshape the curve; the render is just the curve, evaluated.
- **Scratch space** ([`src/good-code/`](src/good-code/)) — vendored or
  in-progress widgets that haven't earned a permanent home yet.
- **Admin** ([`AdminDashboard.tsx`](src/pages/AdminDashboard.tsx) and
  friends) — wiki edit review, user management, claims.

## Stack

React + Vite + TypeScript, `react-router-dom` for routing, Tailwind for
styling, Supabase for auth/data.

```
npm install
npm run dev
```

## Routing convention

All routes live in [`src/App.tsx`](src/App.tsx). New pages go above the
`*` catch-all. Curated content (patch articles, featured articles) resolves
both dashed and non-dashed slugs to the same route where there's no
conflict with an existing one.
