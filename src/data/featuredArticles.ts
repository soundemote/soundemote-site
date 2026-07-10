import { PHOSPHOR_ARTICLE_MARKDOWN, PHOSPHOR_ARTICLE_SOURCE_URL } from "./phosphorArticle";
import {
  ALIASING_WARS_MARKDOWN,
  ALIASING_WARS_REPO,
  ANALOG_FILTERS_MARKDOWN,
  ANALOG_FILTERS_REPO,
  DIGITAL_EFFICIENT_PATCH_SYSTEM_MARKDOWN,
  DIGITAL_EFFICIENT_PATCH_SYSTEM_REPO,
  DIGITAL_SIGNALS_AUDIO_MARKDOWN,
  DIGITAL_SIGNALS_AUDIO_REPO,
  RHYTHM_AND_PITCH_GENERATOR_MARKDOWN,
  RHYTHM_AND_PITCH_GENERATOR_REPO,
  VACTROLS_MARKDOWN,
  VACTROLS_REPO,
} from "./forkReadmes";
import { JEROBEAM_MODULES_MARKDOWN } from "./jerobeamModules";
import { COMBUSTION_MARKDOWN, COMBUSTION_REPO } from "./combustionArticle";
import { SUPERSAW_MARKDOWN, SUPERSAW_REPO, SUPERSAW_BRANCH } from "./supersawArticle";
import { SIMD_ARTICLE_MARKDOWN, SIMD_ARTICLE_SOURCE_URL } from "./simdArticle";
import { LAST_CLOCK_ARTICLE_MARKDOWN, LAST_CLOCK_ARTICLE_SOURCE_URL } from "./lastClockArticle";
import { ARCHIMEDES_ARTICLE_MARKDOWN, ARCHIMEDES_ARTICLE_SOURCE_URL } from "./archimedesArticle";
import { CREATURES_ARTICLE_MARKDOWN, CREATURES_ARTICLE_SOURCE_URL, CREATURES_REPO } from "./creaturesArticle";

export type FeaturedArticle = {
  slug: string;
  /** Must match a repositoryLinks[].href in Projects.tsx so its button can switch to this article. */
  repoHref: string;
  emoji: string;
  title: string;
  tagline: string;
  sourceUrl: string;
  markdown: string;
};

// READMEs are fetched verbatim from raw.githubusercontent.com, but their
// image/link paths are relative to the repo itself -- rewrite them so they
// resolve from wherever this article renders on the site instead of 404ing.
const rewriteRelativeLinks = (markdown: string, repo: string, branch = "master") => {
  const rawBase = `https://raw.githubusercontent.com/${repo}/${branch}/`;
  const blobBase = `https://github.com/${repo}/blob/${branch}/`;
  const treeBase = `https://github.com/${repo}/tree/${branch}/`;

  const isRelative = (target: string) =>
    !/^https?:\/\//i.test(target) && !target.startsWith("#") && !target.startsWith("/");
  const isImage = (target: string) => /\.(png|jpe?g|gif|svg|webp)(\?.*)?$/i.test(target);
  const isFileLike = (target: string) => /\.[a-z0-9]+(\?.*)?$/i.test(target) || /(^|\/)LICENSE$/i.test(target);

  const rewrite = (target: string) => {
    if (!isRelative(target)) return target;
    if (isImage(target)) return rawBase + target;
    return (isFileLike(target) ? blobBase : treeBase) + target;
  };

  return markdown
    .replace(/(<img[^>]*\ssrc=")([^"]+)(")/g, (_match, pre, target, post) => `${pre}${rewrite(target)}${post}`)
    .replace(/(]\()([^)]+)(\))/g, (_match, pre, target, post) => `${pre}${rewrite(target)}${post}`);
};

export const featuredArticles: FeaturedArticle[] = [
  {
    slug: "phosphor",
    repoHref: "https://github.com/elanhickler/soemdsp-sandbox-phosphor",
    emoji: "🌕",
    title: "Phosphor — an oscilloscope glow field guide",
    tagline: "Why our scopes glow the way they do.",
    sourceUrl: PHOSPHOR_ARTICLE_SOURCE_URL,
    markdown: PHOSPHOR_ARTICLE_MARKDOWN,
  },
  {
    slug: "aliasing-wars",
    repoHref: "https://github.com/elanhickler/soemdsp-sandbox-aliasing-wars",
    emoji: "⚔️",
    title: "Aliasing Wars — the Surge Oscillator & the DSF technique",
    tagline: "Two different ways to make an oscillator that never aliases.",
    sourceUrl: ALIASING_WARS_REPO ? `https://github.com/${ALIASING_WARS_REPO}` : "",
    markdown: rewriteRelativeLinks(ALIASING_WARS_MARKDOWN, ALIASING_WARS_REPO),
  },
  {
    slug: "archimedes",
    repoHref: "https://github.com/soundemote/soemdsp-sandbox-archimedes",
    emoji: "🥧",
    title: "Computing π for Free — the Archimedes Oscillator",
    tagline: "A 2-cycle integer engine that makes sine/cosine and hands you π as a free byproduct.",
    sourceUrl: ARCHIMEDES_ARTICLE_SOURCE_URL,
    markdown: ARCHIMEDES_ARTICLE_MARKDOWN,
  },
  {
    slug: "analog-filters",
    repoHref: "https://github.com/elanhickler/soemdsp-sandbox-analog-filters",
    emoji: "🌺",
    title: "Analog Filters — chasing circuits that were never digital",
    tagline: "The Flower Child family and what makes analog filters hard to fake.",
    sourceUrl: `https://github.com/${ANALOG_FILTERS_REPO}`,
    markdown: rewriteRelativeLinks(ANALOG_FILTERS_MARKDOWN, ANALOG_FILTERS_REPO),
  },
  {
    slug: "efficient-patch-system",
    repoHref: "https://github.com/elanhickler/soemdsp-sandbox-digital-efficient-patch-system",
    emoji: "⚡",
    title: "Efficient Patch System",
    tagline: "Finding the real bottleneck in patch commits, and a real multiplayer merge engine.",
    sourceUrl: `https://github.com/${DIGITAL_EFFICIENT_PATCH_SYSTEM_REPO}`,
    markdown: rewriteRelativeLinks(DIGITAL_EFFICIENT_PATCH_SYSTEM_MARKDOWN, DIGITAL_EFFICIENT_PATCH_SYSTEM_REPO),
  },
  {
    slug: "white-wire",
    repoHref: "https://github.com/elanhickler/soemdsp-sandbox-digital-signals-audio",
    emoji: "🔲",
    title: "White Wire — beauty = binary × chaos",
    tagline: "What if some wires carried bits instead of a voltage?",
    sourceUrl: `https://github.com/${DIGITAL_SIGNALS_AUDIO_REPO}`,
    markdown: rewriteRelativeLinks(DIGITAL_SIGNALS_AUDIO_MARKDOWN, DIGITAL_SIGNALS_AUDIO_REPO),
  },
  {
    slug: "rhythmandpitchgenerator",
    repoHref: "https://github.com/elanhickler/soemdsp-sandbox-rhythmandpitchgenerator",
    emoji: "🥁",
    title: "Rhythm and Pitch Generator",
    tagline: "Rebuilding a legacy Soundemote instrument as patchable native modules.",
    sourceUrl: `https://github.com/${RHYTHM_AND_PITCH_GENERATOR_REPO}`,
    markdown: rewriteRelativeLinks(RHYTHM_AND_PITCH_GENERATOR_MARKDOWN, RHYTHM_AND_PITCH_GENERATOR_REPO),
  },
  {
    slug: "vactrols",
    repoHref: "https://github.com/elanhickler/soemdsp-sandbox-vactrols",
    emoji: "🦋",
    title: "Vactrols — a light-physics field guide",
    tagline: "Two components that have never touched, whispering to each other in light.",
    sourceUrl: `https://github.com/${VACTROLS_REPO}`,
    markdown: rewriteRelativeLinks(VACTROLS_MARKDOWN, VACTROLS_REPO),
  },
  {
    slug: "jerobeam-modules",
    // The original source (the jerobeam-modules branch of soemdsp-sandbox-phosphor)
    // has been deleted -- this article, its images, and its dedication doc are now
    // preserved locally (see jerobeamModules.ts and public/media/jerobeam-modules/)
    // rather than depending on a repo that no longer exists.
    repoHref: "https://github.com/elanhickler/jerobeam-modules",
    emoji: "🌀",
    title: "Jerobeam Modules — porting a scope artist's patches to native code",
    tagline: "Giving Jerobeam Fenderson's oscilloscope-music patches a real native implementation.",
    sourceUrl: "https://github.com/elanhickler/jerobeam-modules",
    markdown: JEROBEAM_MODULES_MARKDOWN,
  },
  {
    slug: "combustion",
    repoHref: "https://github.com/elanhickler/combustion",
    emoji: "🔥",
    title: "POWER — combustion, rotors, and fire",
    tagline: "Chasing the sound of engines through a spiral generator, emulation not simulation.",
    sourceUrl: `https://github.com/${COMBUSTION_REPO}`,
    markdown: rewriteRelativeLinks(COMBUSTION_MARKDOWN, COMBUSTION_REPO, "main"),
  },
  {
    slug: "simd",
    repoHref: "https://github.com/soundemote/soemdsp-simd",
    emoji: "🚀",
    title: "soemdsp-simd — block processing, SIMD, and the honest speed ladder",
    tagline: "Measured WASM SIMD work for the audio engine, with the gradient tool as the visual front door.",
    sourceUrl: SIMD_ARTICLE_SOURCE_URL,
    markdown: rewriteRelativeLinks(SIMD_ARTICLE_MARKDOWN, "soundemote/soemdsp-simd", "main"),
  },
  {
    slug: "last-clock",
    repoHref: "https://github.com/soundemote/soemdsp-last-clock",
    emoji: "🕰️",
    title: "The Last Clock for Humanity — a chaotic temporal oscillator engine",
    tagline: "One self-oscillating loop that derives a sinewave, distortion, noise floor, and two-way spacetime keeping.",
    sourceUrl: LAST_CLOCK_ARTICLE_SOURCE_URL,
    markdown: LAST_CLOCK_ARTICLE_MARKDOWN,
  },
  {
    slug: "synthwave-orchestra",
    repoHref: "https://github.com/elanhickler/supersaw",
    emoji: "🌆",
    title: "Synthwave Orchestra",
    tagline: "Pitch-dithered supersaws meeting a full orchestra, from RS-MET's aliasing research.",
    sourceUrl: `https://github.com/${SUPERSAW_REPO}`,
    markdown: rewriteRelativeLinks(SUPERSAW_MARKDOWN, SUPERSAW_REPO, SUPERSAW_BRANCH),
  },
];

export const findFeaturedArticleByRepoHref = (href: string) =>
  featuredArticles.find((article) => article.repoHref === href);

export const findFeaturedArticle = (slug: string) =>
  featuredArticles.find((article) => article.slug === slug);
