export type WebringLink = {
  href: string;
  emoji: string;
  title: string;
  host: string;
  description: string;
};

// -----------------------------------------------------------------------------
// SITE SETTINGS — edit this file to change basic website behavior.
//
// This is the one place to tweak "template" level things: which article the
// home page shows, which URLs map to which article / patch, which old URLs
// redirect where, and the webring links on /webring. App.tsx builds all of its
// routes from the tables below, so adding a page usually means adding one line
// here instead of editing routing JSX.
// -----------------------------------------------------------------------------

export const siteConfig = {
  /** Article featured on the home page ("/"). Must match a slug in featuredArticles.ts. */
  homeFeaturedSlug: "simd",

  /**
   * URL -> featured article. Visiting the path shows the front page with that
   * article featured and scrolled into view. Key = path (no leading slash).
   */
  articleRoutes: {
    simd: "simd",
    "last-clock": "last-clock",
    lastclock: "last-clock",
    phosphor: "phosphor",
    "aliasing-wars": "aliasing-wars",
    archimedes: "archimedes",
    "analog-filters": "analog-filters",
    "efficient-patch-system": "efficient-patch-system",
    "white-wire": "white-wire",
    "rhythm-and-pitch-generator": "rhythmandpitchgenerator",
    rhythmandpitchgenerator: "rhythmandpitchgenerator",
    vactrols: "vactrols",
    "jerobeam-modules": "jerobeam-modules",
    combustion: "combustion",
    "synthwave-orchestra": "synthwave-orchestra",
  } as Record<string, string>,

  /**
   * URL -> hero patch. Visiting the path loads that patch in the hero sandbox.
   * Key = path (no leading slash), value = patch slug in patchBank.ts.
   */
  patchRoutes: {
    reverb: "reverb",
    silentlydreaming: "silently-dreaming",
    shootingstar: "shootingstar",
  } as Record<string, string>,

  /**
   * Legacy article slugs that now just land on the plain front page. Wiki
   * pages for these are kept as unreachable code for now.
   */
  frontPageRoutes: [
    "analogbox",
    "aliasingwars",
    "sinewave",
    "dsf",
    "polyblep",
    "surgeoscillator",
    "phosphillator",
    "flowerchildfilter",
    "robinschmidt",
    "rsmet",
  ],

  /** Old URL -> new URL redirects (301-style, replace history). */
  redirects: {
    "soemdsp-simd": "/simd",
    "soemdsp-last-clock": "/last-clock",
    "soemdsp-sandbox": "/analogbox",
    analogfilters: "/analog-filters",
    efficientpatchsystem: "/efficient-patch-system",
    whitewire: "/white-wire",
    jerobeammodules: "/jerobeam-modules",
    synthwaveorchestra: "/synthwave-orchestra",
  } as Record<string, string>,

  /** Version text shown next to the analogbox link in the hero. */
  analogBoxVersion: "v0.2.0",

  webringLinks: [
    {
      href: "https://spacious.fm/",
      emoji: "🎵",
      title: "Spacious.fm",
      host: "spacious.fm",
      description: "Soundtracks for focus, flow, and rest — conscious, meditative music from master artists.",
    },
    {
      href: "https://laserpilot.github.io/interactive-installation-multitool/",
      emoji: "🌐",
      title: "Interactive Installation Multitool",
      host: "laserpilot.github.io",
      description: "A toolkit for building and deploying interactive installations.",
    },
    /*https://www.shadertoy.com/view/MldcW2 clouds*/
    {
      href: "https://github.com/veryCoolTimo/texture-auto-upscaler",
      emoji: "🖼️",
      title: "TEXUP",
      host: "github.com/veryCoolTimo",
      description: "An AI-powered texture upscaler for image workflows.",
    },
    {
      href: "https://opendaw.org/",
      emoji: "🎛️",
      title: "OpenDAW",
      host: "opendaw.org",
      description: "An open-source digital audio workstation project.",
    },
    {
      href: "https://cosmicxr.brdystudios.com/",
      emoji: "🌌",
      title: "Cosmic XR",
      host: "cosmicxr.brdystudios.com",
      description: "Touch and explore the universe in mixed reality from your own room, built for Meta Quest.",
    },
  ] as WebringLink[],
};


export const { webringLinks } = siteConfig;

export type SiteConfig = typeof siteConfig;
