import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAdmin } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

type ProfileRow = {
  id: string;
  handle: string;
  display_name: string | null;
};

type RoleRow = { user_id: string; role: string };

const MANAGED_ROLES = ["admin", "trusted"] as const;
type ManagedRole = (typeof MANAGED_ROLES)[number];

const AdminUsers = () => {
  const navigate = useNavigate();
  const { loading, session, isAdmin } = useAdmin();
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!loading && (!session || !isAdmin)) {
      navigate("/admin/login", { replace: true });
    }
  }, [loading, session, isAdmin, navigate]);

  const load = useCallback(async () => {
    setFetching(true);
    setError(null);
    const [{ data: p, error: pe }, { data: r, error: re }] = await Promise.all([
      supabase.from("profiles").select("id, handle, display_name").order("handle"),
      supabase.from("user_roles").select("user_id, role"),
    ]);
    if (pe) setError(pe.message);
    else setProfiles((p as ProfileRow[]) || []);
    if (re) setError((prev) => prev ?? re.message);
    else setRoles((r as RoleRow[]) || []);
    setFetching(false);
  }, []);

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin, load]);

  const hasRole = (uid: string, role: ManagedRole) =>
    roles.some((r) => r.user_id === uid && r.role === role);

  const toggleRole = async (uid: string, role: ManagedRole, next: boolean) => {
    const key = `${uid}:${role}`;
    setBusyKey(key);
    setError(null);
    if (next) {
      const { error: e } = await supabase
        .from("user_roles")
        .insert({ user_id: uid, role });
      if (e) setError(e.message);
    } else {
      const { error: e } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", uid)
        .eq("role", role);
      if (e) setError(e.message);
    }
    await load();
    setBusyKey(null);
  };

  const filtered = profiles.filter((p) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      p.handle.toLowerCase().includes(q) ||
      (p.display_name || "").toLowerCase().includes(q)
    );
  });

  if (loading || (!isAdmin && session)) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto max-w-3xl px-4 py-12 mono text-sm text-muted-foreground">
          Checking access…
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="mono text-xs text-muted-foreground hover:text-foreground">
              &lt; soundemote
            </Link>
            <Link to="/admin" className="mono text-xs text-muted-foreground hover:text-foreground">
              /admin
            </Link>
          </div>
          <div className="flex gap-2">
            <Link to="/admin/claims" className="mono text-xs text-muted-foreground hover:text-foreground self-center">
              claims
            </Link>
            <Link to="/admin/wiki" className="mono text-xs text-muted-foreground hover:text-foreground self-center">
              wiki
            </Link>
            <Button variant="outline" size="sm" onClick={() => supabase.auth.signOut()}>
              Sign out
            </Button>
          </div>
        </div>
        <h1 className="display mt-4 text-2xl">Users &amp; Roles</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Toggle <span className="mono">admin</span> and <span className="mono">trusted</span> roles.
          Trusted users' wiki edits auto-publish.
        </p>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by handle or name…"
          className="mt-6 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />

        {error && <p className="mt-4 text-sm text-destructive break-words">{error}</p>}

        <div className="mt-6 space-y-2">
          {fetching && <p className="mono text-sm text-muted-foreground">Loading…</p>}
          {!fetching && filtered.length === 0 && (
            <p className="mono text-sm text-muted-foreground">No users found.</p>
          )}
          {filtered.map((p) => (
            <div
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded border border-border p-3"
            >
              <div>
                <p className="mono text-sm">@{p.handle}</p>
                {p.display_name && (
                  <p className="text-xs text-muted-foreground">{p.display_name}</p>
                )}
              </div>
              <div className="flex items-center gap-6">
                {MANAGED_ROLES.map((role) => {
                  const key = `${p.id}:${role}`;
                  return (
                    <label key={role} className="flex items-center gap-2">
                      <span className="mono text-xs text-muted-foreground">{role}</span>
                      <Switch
                        checked={hasRole(p.id, role)}
                        disabled={busyKey === key}
                        onCheckedChange={(v) => toggleRole(p.id, role, v)}
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default AdminUsers;
