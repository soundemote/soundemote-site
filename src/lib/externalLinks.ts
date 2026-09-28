/** Returns true for GitHub-hosted links that should not appear on soundemote.dev. */
export const isGithubUrl = (href: string): boolean => {
  try {
    const hostname = new URL(href, "https://soundemote.dev").hostname.toLowerCase();
    return (
      hostname === "github.com" ||
      hostname.endsWith(".github.com") ||
      hostname === "github.io" ||
      hostname.endsWith(".github.io") ||
      hostname === "githubusercontent.com" ||
      hostname.endsWith(".githubusercontent.com")
    );
  } catch {
    return /(?:^|[./])github(?:usercontent)?\.com|(?:^|[./])github\.io/i.test(href);
  }
};
