// Post-build step: writes a static, crawler-friendly index.html for each
// patch wiki route (dist/<slug>/index.html) with page-specific
// title/description/OpenGraph/Twitter meta tags.
//
// Why this exists: Discord, Twitter, Slack, etc. link-preview bots fetch the
// URL and read <meta> tags straight out of the initial HTML response -- they
// do not run JavaScript, so a client-side React Router title/meta update
// (see PatchArticlePage's document.title effect) is invisible to them. Every
// route would otherwise show the same homepage OG tags.
//
// The fix: most static hosts (Lovable's included, most likely, since it's
// the standard convention) serve a physical <path>/index.html file for a
// request to <path> before falling back to the SPA's catch-all index.html.
// So we duplicate the built index.html once per route, swapping only the
// <head> meta values -- the <div id="root"> + script tags are untouched, so
// a real browser hitting the page still boots the normal React app and
// client-side-routes exactly as before. Crawlers just see the right meta on
// the very first byte.
//
// If the host does NOT prioritize static files over the SPA catch-all, this
// is a no-op: requests still resolve to the root index.html exactly as they
// did before this script existed. No regression either way.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(here, "..", "dist");
const siteUrl = "https://soundemote.io";
const defaultImage =
  "https://storage.googleapis.com/gpt-engineer-file-uploads/EYgj1zfmybWdSJ37FVpPSkoh0wg1/social-images/social-1779702811269-soundemote_logo_youtube_800x800_transparent.webp";

// Keep in sync with src/data/patchArticles.ts -- this is a plain .mjs
// script (no TS loader in the postbuild step), so the title/tagline pairs
// are duplicated here rather than imported directly.
const PAGES = [
  { slug: "shootingstar", title: "Shooting Star", tagline: "Click a star, kick a chaos attractor." },
  { slug: "sinewave", title: "Sine Wave", tagline: "The simplest patch in the sandbox." },
  { slug: "dsf", title: "DSF Oscillator", tagline: "A closed-form trick for a whole harmonic series." },
  { slug: "polyblep", title: "PolyBLEP", tagline: "Anti-aliased square, the workhorse trick." },
  { slug: "surgeoscillator", title: "Surge Oscillator", tagline: "Hard sync without the alias war." },
  { slug: "phosphillator", title: "Phosphillator", tagline: "An oscillator with a CRT's memory." },
  { slug: "rhythmandpitchgenerator", title: "Rhythm & Pitch Generator", tagline: "One source, two dimensions of music." },
  { slug: "flowerchildfilter", title: "Flower Child Filter", tagline: "The analog-modeled sibling of an existing module." },
];

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function main() {
  let template;
  try {
    template = readFileSync(path.join(distDir, "index.html"), "utf8");
  } catch {
    console.warn("[generate-og-pages] dist/index.html not found -- skipping (did the build run?)");
    return;
  }

  for (const page of PAGES) {
    const title = `${escapeHtml(page.title)} — soundemote wiki`;
    const description = escapeHtml(`${page.tagline} A soundemote.io patch wiki page.`);
    const url = `${siteUrl}/${page.slug}`;

    let html = template;
    html = html.replace(/<title>.*?<\/title>/s, `<title>${title}</title>`);
    html = html.replace(/(<meta name="description" content=")[^"]*(")/, `$1${description}$2`);
    html = html.replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`);
    html = html.replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${title}$2`);
    html = html.replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${title}$2`);
    html = html.replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${description}$2`);
    html = html.replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${description}$2`);
    // og:image / twitter:image stay on the shared default artwork for now --
    // swap in a per-page image later if these pages get dedicated art.
    void defaultImage;

    const outDir = path.join(distDir, page.slug);
    mkdirSync(outDir, { recursive: true });
    writeFileSync(path.join(outDir, "index.html"), html);
    console.log(`[generate-og-pages] wrote dist/${page.slug}/index.html`);
  }
}

main();
