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

export type BankItem = BankPatch | BankVideo;

export const SOUNDEMOTE_BANK: BankItem[] = [
  { kind: "video", slug: "intro-video", label: "soundemote sandbox — intro", youtubeId: "PpcdN-DXYdc" },
  { slug: "shootingstar", label: "shooting star", url: "/patches/shootingstar.json" },
  { slug: "silently-dreaming", label: "silently dreaming", url: "/patches/silently-dreaming.json" },
  { slug: "reverb", label: "reverb", url: "/patches/reverb.json" },
];
