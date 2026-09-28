/** Which public brand host this build is serving. Lovable points all three
 *  domains at this repo; we branch UI by hostname (not by separate repos). */
export type SiteRole = "io" | "com" | "dev";

function hostnameRole(host: string): SiteRole | null {
  const h = host.toLowerCase().replace(/\.$/, "");
  if (h === "soundemote.com" || h === "www.soundemote.com") return "com";
  if (h === "soundemote.dev" || h === "www.soundemote.dev") return "dev";
  if (h === "soundemote.io" || h === "www.soundemote.io") return "io";
  return null;
}

/**
 * - soundemote.io  → sandbox product (default)
 * - soundemote.dev → old articles / video-hero marketing site
 * - soundemote.com → logo-only brand splash
 * Local / preview: pass ?site=io|com|dev (defaults to io).
 */
export function getSiteRole(): SiteRole {
  if (typeof window === "undefined") return "io";
  const fromHost = hostnameRole(window.location.hostname);
  if (fromHost) return fromHost;
  const q = new URLSearchParams(window.location.search).get("site");
  if (q === "com" || q === "dev" || q === "io") return q;
  return "io";
}
