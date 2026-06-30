import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase, supabaseConfigError } from "@/lib/supabase";
import { useAdmin } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { session, isAdmin, loading } = useAdmin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && session && isAdmin) {
      navigate("/admin/claims", { replace: true });
    }
  }, [loading, session, isAdmin, navigate]);

  const handleLogin = async () => {
    setError(null);
    if (supabaseConfigError) {
      setError(supabaseConfigError);
      return;
    }
    setBusy(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setBusy(false);
    if (signInError) setError(signInError.message);
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto max-w-sm px-4 py-16">
        <Link to="/" className="mono text-xs text-muted-foreground hover:text-foreground">
          &lt; soundemote
        </Link>
        <h1 className="display mt-4 text-2xl">Admin Login</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Review and approve claimed URLs.
        </p>

        {session && !isAdmin && !loading && (
          <p className="mt-6 text-sm text-destructive">
            Signed in, but this account is not an admin.
          </p>
        )}

        <div className="mt-8 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-email">Email</Label>
            <Input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-password">Password</Label>
            <Input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleLogin();
              }}
            />
          </div>
          {error && <p className="text-sm text-destructive break-words">{error}</p>}
          <Button className="w-full" onClick={handleLogin} disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </Button>
          {session && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => supabase.auth.signOut()}
            >
              Sign out
            </Button>
          )}
        </div>
      </div>
    </main>
  );
};

export default AdminLogin;
