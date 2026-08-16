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
  { slug: "lcd", label: "lcd", url: "/patches/lcd.json" },
  { kind: "video", slug: "intro-video", label: "Hydrus - Retro Fusion", youtubeId: "PpcdN-DXYdc" },
  {
    kind: "audius",
    slug: "synthesizer-audio-demos",
    label: "synthesizer audio demos",
    audiusId: "Q4xp1vv",
  },
  { kind: "video", slug: "sandbox-demo-2", label: "Soundemote Sandbox", youtubeId: "FHT0u1GDvw0" },
  { slug: "shootingstar", label: "shooting star", url: "/patches/shootingstar.json" },
  { slug: "silently-dreaming", label: "silently dreaming", url: "/patches/silently-dreaming.json" },
  { slug: "reverb", label: "reverb", url: "/patches/reverb.json" },
];
