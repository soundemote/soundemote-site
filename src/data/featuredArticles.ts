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

  const isRelative = (target: string) => !/^https?:\/\//i.test(target) && !target.startsWith("#");
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
];

export const findFeaturedArticleByRepoHref = (href: string) =>
  featuredArticles.find((article) => article.repoHref === href);

export const findFeaturedArticle = (slug: string) =>
  featuredArticles.find((article) => article.slug === slug);
