// soundemote patch bank — the soundemote.io/<name> custom links.
export type BankPatch = {
  slug: string;
  label: string;
  url: string;
};

export const SOUNDEMOTE_BANK: BankPatch[] = [
  { slug: "silently-dreaming", label: "silently dreaming", url: "/patches/silently-dreaming.json" },
  { slug: "reverb", label: "reverb", url: "/patches/reverb.json" },
  { slug: "shootingstar", label: "shootingstar", url: "/patches/shootingstar.json" },
  { slug: "tweet", label: "tweet", url: "/patches/tweet.json" },
];
