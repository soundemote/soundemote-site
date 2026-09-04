// soundemote patch bank — the soundemote.io/<name> custom links.
// Entries are either a sandbox patch or a video "track" in the playlist.
export type BankPatch = {
  kind?: "patch";
  slug: string;
  label: string;
  url: string;
};

export type BankVideo = {
  kind: "video";
  slug: string;
  label: string;
  youtubeId: string;
};

export type BankAudius = {
  kind: "audius";
  slug: string;
  label: string;
  /** Audius embed id (from /v1/resolve). */
  audiusId: string;
};

export type BankItem = BankPatch | BankVideo | BankAudius;

export const SOUNDEMOTE_BANK: BankItem[] = [
  { kind: "video", slug: "hero-video", label: "Soundemote", youtubeId: "KSPypZKIRVE" },
  // First live modular entry — Additive Yellow Graph beta showcase (silent until Play).
  { slug: "additive-beta", label: "additive beta", url: "/soemdsp-sandbox/patches/additive-beta.json" },
  { slug: "lcd", label: "lcd", url: "/soemdsp-sandbox/patches/lcd.json" },
  { kind: "video", slug: "intro-video", label: "Hydrus - Retro Fusion", youtubeId: "PpcdN-DXYdc" },
  {
    kind: "audius",
    slug: "synthesizer-audio-demos",
    label: "synthesizer audio demos",
    audiusId: "Q4xp1vv",
  },
  { kind: "video", slug: "sandbox-demo-2", label: "Soundemote Sandbox", youtubeId: "FHT0u1GDvw0" },
  { slug: "shootingstar", label: "shooting star", url: "/soemdsp-sandbox/patches/shootingstar.json" },
  { slug: "silently-dreaming", label: "silently dreaming", url: "/soemdsp-sandbox/patches/silently-dreaming.json" },
  { slug: "reverb", label: "reverb", url: "/soemdsp-sandbox/patches/reverb.json" },
];

/** Default Hero bank index when the route has no patch slug — prefer Additive beta. */
export const SOUNDEMOTE_BANK_DEFAULT_SLUG = "additive-beta";

