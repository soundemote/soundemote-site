import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserFiles, type UserFile } from "@/hooks/useUserFiles";
import { supabase, supabaseConfigError } from "@/lib/supabase";

type UserPageParams = {
  handle?: string;
  bank?: string;
  patch?: string;
};

type Profile = {
  id: string;
  handle: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
};

type Bank = { id: string; slug: string; name: string | null; description: string | null };
type Patch = { id: string; slug: string; name: string | null; description: string | null };

const Shell = ({ children }: { children: React.ReactNode }) => (
  <main className="min-h-screen bg-background text-foreground">
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <Link to="/" className="mono text-xs text-muted-foreground hover:text-foreground">
        &lt; soundemote
      </Link>
      {children}
    </div>
  </main>
);

const UserPage = () => {
  const { handle = "", bank, patch } = useParams<UserPageParams>();
  const username = handle.startsWith("@") ? handle.slice(1).toLowerCase() : "";
  const { session } = useAuth();
  const { userFilesUrl, listPublicFiles } = useUserFiles();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [bankRow, setBankRow] = useState<Bank | null>(null);
  const [patches, setPatches] = useState<Patch[]>([]);
  const [patchRow, setPatchRow] = useState<Patch | null>(null);
  const [files, setFiles] = useState<UserFile[]>([]);

  useEffect(() => {
    if (!username || supabaseConfigError) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);

    (async () => {
      const { data: prof } = await supabase
        .from("profiles")
        .select("id, handle, display_name, bio, avatar_url")
        .ilike("handle", username)
        .maybeSingle();
      if (cancelled) return;
      const profileRow = (prof as Profile) ?? null;
      setProfile(profileRow);

      if (profileRow) {
        if (!bank) {
          const { data } = await supabase
            .from("banks")
            .select("id, slug, name, description")
            .eq("owner_id", profileRow.id)
            .order("created_at", { ascending: true });
          if (!cancelled) setBanks((data as Bank[]) ?? []);
        } else {
          const { data: b } = await supabase
            .from("banks")
            .select("id, slug, name, description")
            .eq("owner_id", profileRow.id)
            .eq("slug", bank.toLowerCase())
            .maybeSingle();
          if (cancelled) return;
          const bRow = (b as Bank) ?? null;
          setBankRow(bRow);
          if (bRow && !patch) {
            const { data } = await supabase
              .from("patches")
              .select("id, slug, name, description")
              .eq("bank_id", bRow.id)
              .order("created_at", { ascending: true });
            if (!cancelled) setPatches((data as Patch[]) ?? []);
          } else if (bRow && patch) {
            const { data: p } = await supabase
              .from("patches")
              .select("id, slug, name, description")
              .eq("bank_id", bRow.id)
              .eq("slug", patch.toLowerCase())
              .maybeSingle();
            if (!cancelled) setPatchRow((p as Patch) ?? null);
          }
        }
      }
      if (!cancelled) setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [username, bank, patch]);

  if (!handle.startsWith("@")) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <Shell>
        <p className="mono mt-6 text-sm text-muted-foreground">Loading…</p>
      </Shell>
    );
  }

  if (!profile) {
    return (
      <Shell>
        <h1 className="display mt-4 text-2xl">@{username}</h1>
        <p className="mono mt-6 text-sm text-muted-foreground">
          No account exists for @{username} yet.
        </p>
        <Link
          to="/auth"
          className="mono mt-6 inline-block text-xs text-foreground underline underline-offset-4"
        >
          claim a handle
        </Link>
      </Shell>
    );
  }

  // Patch view
  if (patch) {
    if (!bankRow || !patchRow) {
      return (
        <Shell>
          <h1 className="display mt-4 text-2xl">@{username} / {bank} / {patch}</h1>
          <p className="mono mt-6 text-sm text-muted-foreground">Patch not found.</p>
        </Shell>
      );
    }
    return (
      <Navigate
        to={`/sandbox/${username}/${bankRow.slug}/${patchRow.slug}`}
        replace
      />
    );
  }

  // Bank view
  if (bank) {
    if (!bankRow) {
      return (
        <Shell>
          <h1 className="display mt-4 text-2xl">@{username} / {bank}</h1>
          <p className="mono mt-6 text-sm text-muted-foreground">Bank not found.</p>
        </Shell>
      );
    }
    return (
      <Shell>
        <h1 className="display mt-4 text-2xl">
          @{username} / {bankRow.name || bankRow.slug}
        </h1>
        {bankRow.description && (
          <p className="mt-2 text-sm text-muted-foreground">{bankRow.description}</p>
        )}
        <ul className="mt-8 space-y-2">
          {patches.length === 0 && (
            <li className="mono text-sm text-muted-foreground">No patches yet.</li>
          )}
          {patches.map((p) => (
            <li key={p.id}>
              <Link
                to={`/@${username}/${bankRow.slug}/${p.slug}`}
                className="mono text-sm text-foreground underline underline-offset-4 hover:text-muted-foreground"
              >
                {p.name || p.slug}
              </Link>
            </li>
          ))}
        </ul>
      </Shell>
    );
  }

  // Profile view
  return (
    <Shell>
      <div className="mt-8 flex flex-col gap-8 sm:flex-row sm:items-end">
        <div className="relative aspect-square w-full max-w-[260px] shrink-0 overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-muted/40 to-background shadow-[0_20px_60px_-20px_hsl(var(--primary)/0.4)]">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={`${profile.display_name || profile.handle} profile picture`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="display text-6xl text-muted-foreground/50">
                {(profile.display_name || profile.handle).charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="display text-4xl leading-tight">
            {profile.display_name || `@${profile.handle}`}
          </h1>
          <p className="mono mt-2 text-sm text-muted-foreground">@{profile.handle}</p>
          {profile.bio && (
            <p className="mt-4 max-w-prose text-sm leading-relaxed text-muted-foreground">
              {profile.bio}
            </p>
          )}
        </div>
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-3">
        <section className="md:col-span-1">
          <h2 className="mono text-xs uppercase tracking-wider text-muted-foreground">Banks</h2>
          <ul className="mt-3 space-y-2">
            {banks.length === 0 && (
              <li className="mono text-sm text-muted-foreground">No banks yet.</li>
            )}
            {banks.map((b) => (
              <li key={b.id}>
                <Link
                  to={`/@${profile.handle}/${b.slug}`}
                  className="mono text-sm text-foreground underline underline-offset-4 hover:text-muted-foreground"
                >
                  {b.name || b.slug}
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section className="md:col-span-2">
          <h2 className="mono text-xs uppercase tracking-wider text-muted-foreground">Music &amp; Video</h2>
          <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex aspect-square items-center justify-center rounded-lg border border-dashed border-border/50 bg-muted/20"
              >
                <span className="mono text-[0.65rem] uppercase tracking-wider text-muted-foreground/50">
                  coming soon
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Shell>
  );
};

export default UserPage;
