import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserFiles, type UserFile } from "@/hooks/useUserFiles";
import { supabase, supabaseConfigError } from "@/lib/supabase";

type FilesPageParams = {
  handle?: string;
};

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

const FilesPage = () => {
  const { handle } = useParams<FilesPageParams>();
  const { session, profile } = useAuth();
  const { userFilesUrl, listMyFiles, listPublicFiles, isOwner } = useUserFiles();

  const username = handle ? handle.replace(/^@/, "").toLowerCase() : "";
  const isOwnFiles = !username;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileRow, setProfileRow] = useState<{ id: string; handle: string; display_name: string | null } | null>(null);
  const [files, setFiles] = useState<UserFile[]>([]);

  useEffect(() => {
    if (supabaseConfigError) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        if (isOwnFiles) {
          if (!session?.user?.id) {
            setFiles([]);
            return;
          }
          const list = await listMyFiles();
          if (!cancelled) {
            setFiles(list);
            setProfileRow(profile ? { id: profile.id, handle: profile.handle, display_name: profile.display_name } : null);
          }
        } else {
          const { data: prof } = await supabase
            .from("profiles")
            .select("id, handle, display_name")
            .ilike("handle", username)
            .maybeSingle();
          if (cancelled) return;
          const owner = prof as { id: string; handle: string; display_name: string | null } | null;
          setProfileRow(owner);
          if (owner) {
            const list = await listPublicFiles(owner.id);
            if (!cancelled) setFiles(list);
          } else {
            if (!cancelled) setFiles([]);
          }
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load files.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOwnFiles, username, session?.user?.id, profile, listMyFiles, listPublicFiles]);

  if (isOwnFiles && !session) {
    return <Navigate to="/auth" replace />;
  }

  if (loading) {
    return (
      <Shell>
        <p className="mono mt-6 text-sm text-muted-foreground">Loading files…</p>
      </Shell>
    );
  }

  const title = isOwnFiles
    ? "your files"
    : profileRow?.display_name || `@${username}`;

  return (
    <Shell>
      <div className="mt-6 flex items-center justify-between">
        <h1 className="display text-2xl">
          {isOwnFiles ? "your files" : `${title}'s files`}
        </h1>
        <Link
          to={isOwnFiles ? (profile ? `/@${profile.handle}` : "/") : userFilesUrl(username)}
          className="mono text-xs text-muted-foreground hover:text-foreground"
        >
          {isOwnFiles ? "profile" : "files"}
        </Link>
      </div>

      {error && (
        <p className="mono mt-4 text-sm text-destructive">{error}</p>
      )}

      {!profileRow && !isOwnFiles && !error && (
        <p className="mono mt-6 text-sm text-muted-foreground">
          No account exists for @{username}.
        </p>
      )}

      {files.length === 0 && !error && (
        <p className="mono mt-6 text-sm text-muted-foreground">
          {isOwnFiles
            ? "No files yet."
            : "No public files yet."}
        </p>
      )}

      <ul className="mt-6 space-y-3">
        {files.map((file) => (
          <li
            key={file.id}
            className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/20 px-4 py-3"
          >
            <div className="min-w-0">
              <p className="mono text-sm font-medium text-foreground">
                {file.name || file.slug}
              </p>
              {file.description && (
                <p className="mt-1 text-xs text-muted-foreground">{file.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {isOwner(file) && (
                <span
                  className={`mono text-[0.65rem] uppercase px-2 py-0.5 rounded ${
                    file.is_public ? "bg-green-500/10 text-green-400" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {file.is_public ? "public" : "private"}
                </span>
              )}
              <span className="mono text-[0.65rem] text-muted-foreground">
                {file.storage_path ? "file" : "folder"}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </Shell>
  );
};

export default FilesPage;
