import { useEffect } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { siteConfig } from "@/config/site";
import UserPage from "@/pages/UserPage";
import NotFound from "@/pages/NotFound";

/**
 * Renders `children` only when the `:handle` param is the `@user` form. For
 * bare handles (legacy `/user/bank/patch` style URLs) it renders `fallback`
 * instead. This lets us mount user-scoped `/:handle/patch/:slug` and
 * `/:handle/wiki/:slug` routes without hijacking legacy user URLs whose bank
 * happens to be named "patch" or "wiki".
 */
export const UserScopedRoute = ({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback: React.ReactNode;
}) => {
  const { handle = "" } = useParams<{ handle: string }>();
  return <>{handle.startsWith("@") ? children : fallback}</>;
};

// -----------------------------------------------------------------------------
// Forgiving link layer.
//
// Canonical namespaces:  /@<user>   /patch/<slug>   /wiki/<slug>
// Shorthand sigils:      @<user>    ~<slug>         #<slug>
//
// A link's type is decided by which sigil appears ANYWHERE in it:
//   `~` anywhere -> patch      `@` anywhere -> user      `#` anywhere -> wiki
//
// `@` and `~` are valid path characters; `#` is always a URL fragment and never
// reaches the router, so it is handled client-side by ShorthandHashCatcher.
// -----------------------------------------------------------------------------

/** Strip a leading sigil and return the slug portion after it. */
const afterSigil = (token: string, sigil: string) => {
  const idx = token.indexOf(sigil);
  return idx === -1 ? token : token.slice(idx + 1);
};

/**
 * Handles the bare single-segment route `/:handle`. Decides whether the segment
 * is a user, a shorthand, or a legacy named patch and redirects accordingly.
 */
export const RootSlugResolver = () => {
  const { handle = "" } = useParams<{ handle: string }>();
  const decoded = decodeURIComponent(handle);

  const normalized = decoded.replace(/%23/g, "#");

  // `@` scopes an owner and takes precedence: `@robin~mypatch` is robin's patch,
  // not a global one. Extract the owner (chars after `@` up to the next sigil)
  // then let `~`/`#` pick the user-owned resource.
  if (normalized.includes("@")) {
    const rest = afterSigil(normalized, "@");
    const owner = rest.split(/[~#]/)[0];
    if (rest.includes("~")) {
      return <Navigate to={`/@${owner}/patch/${afterSigil(rest, "~")}`} replace />;
    }
    if (rest.includes("#")) {
      return <Navigate to={`/@${owner}/wiki/${afterSigil(rest, "#")}`} replace />;
    }
    // Bare user handle. Canonical `/@owner` renders the profile directly.
    if (normalized.startsWith("@")) {
      return <UserPage />;
    }
    return <Navigate to={`/@${owner}`} replace />;
  }

  // `~` anywhere -> global patch.
  if (normalized.includes("~")) {
    return <Navigate to={`/patch/${afterSigil(normalized, "~")}`} replace />;
  }

  // `#` anywhere -> global wiki (only reaches here if percent-encoded as %23).
  if (normalized.includes("#")) {
    return <Navigate to={`/wiki/${afterSigil(normalized, "#")}`} replace />;
  }

  // Legacy bare named-patch slugs -> /patch/slug
  if (siteConfig.legacyPatchSlugs.includes(decoded.toLowerCase())) {
    return <Navigate to={`/patch/${decoded.toLowerCase()}`} replace />;
  }

  // A user handle is ONLY the `@handle` form. A bare slug with no sigil is
  // not a user, so render the 404 page rather than inventing an @handle.
  return <NotFound />;
};

/**
 * Catches `#~slug`, `#slug` style shorthands that land on the root because the
 * fragment never reaches the server, and rewrites them to canonical paths.
 */
export const ShorthandHashCatcher = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const resolve = () => {
      const path = window.location.pathname;
      const raw = window.location.hash.replace(/^#/, "");
      if (!raw) return;

      // A `#` fragment sitting on a user path is the user-scoped wiki shorthand:
      //   /@robin#mynote  ->  /@robin/wiki/mynote
      const userMatch = /^\/@([^/]+)\/?$/.exec(path);
      if (userMatch && /^[a-z0-9][a-z0-9-]*$/i.test(raw)) {
        navigate(`/@${userMatch[1]}/wiki/${raw}`, { replace: true });
        return;
      }

      // Otherwise only treat the hash as a shorthand on the bare root, so
      // in-page anchor links (TOC `#heading` on articles/wiki) are untouched.
      if (path !== "/") return;
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