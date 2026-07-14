import { useEffect } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { siteConfig } from "@/config/site";
import UserPage from "@/pages/UserPage";

// -----------------------------------------------------------------------------
// Forgiving link layer.
//
// Canonical namespaces:  /@<user>   /patch/<slug>   /wiki/<slug>
// Shorthand sigils:      @<user>    ~<slug>         #<slug>
//
// `@` and `~` are valid path characters; `#` is always a URL fragment and never
// reaches the router, so it is handled client-side by ShorthandHashCatcher.
// -----------------------------------------------------------------------------

/**
 * Handles the bare single-segment route `/:handle`. Decides whether the segment
 * is a user, a shorthand, or a legacy named patch and redirects accordingly.
 */
export const RootSlugResolver = () => {
  const { handle = "" } = useParams<{ handle: string }>();
  const decoded = decodeURIComponent(handle);

  // Already a canonical user handle -> render the profile.
  if (decoded.startsWith("@")) {
    return <UserPage />;
  }

  // ~slug -> /patch/slug
  if (decoded.startsWith("~")) {
    return <Navigate to={`/patch/${decoded.slice(1)}`} replace />;
  }

  // #slug -> /wiki/slug (only reaches here if percent-encoded)
  if (decoded.startsWith("#") || decoded.startsWith("%23")) {
    return <Navigate to={`/wiki/${decoded.replace(/^#|^%23/, "")}`} replace />;
  }

  // Legacy bare named-patch slugs -> /patch/slug
  if (siteConfig.legacyPatchSlugs.includes(decoded.toLowerCase())) {
    return <Navigate to={`/patch/${decoded.toLowerCase()}`} replace />;
  }

  // Anything else: assume a user handle and canonicalize to /@handle.
  return <Navigate to={`/@${decoded}`} replace />;
};

/**
 * Catches `#~slug`, `#slug` style shorthands that land on the root because the
 * fragment never reaches the server, and rewrites them to canonical paths.
 */
export const ShorthandHashCatcher = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const resolve = () => {
      // Only treat the hash as a shorthand on the bare root, so in-page anchor
      // links (TOC `#heading` on articles/wiki) are never hijacked.
      if (window.location.pathname !== "/") return;
      const raw = window.location.hash.replace(/^#/, "");
      if (!raw) return;
      if (raw.startsWith("~")) {
        navigate(`/patch/${raw.slice(1)}`, { replace: true });
      } else if (raw.startsWith("@")) {
        navigate(`/@${raw.slice(1)}`, { replace: true });
      } else if (/^[a-z0-9][a-z0-9-]*$/i.test(raw)) {
        // Bare `#slug` is the wiki shorthand.
        navigate(`/wiki/${raw}`, { replace: true });
      }
    };
    resolve();
    window.addEventListener("hashchange", resolve);
    return () => window.removeEventListener("hashchange", resolve);
  }, [navigate]);
  return null;
};