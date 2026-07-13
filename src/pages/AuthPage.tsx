import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { supabase, supabaseConfigError } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const handleSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9_]{3,30}$/, {
    message: "Handle must be 3-30 chars: a-z, 0-9, underscore.",
  });
const emailSchema = z.string().trim().email({ message: "Enter a valid email" }).max(255);
const passwordSchema = z.string().min(8, { message: "Password must be at least 8 characters" }).max(72);

type Mode = "signin" | "signup";

const AuthPage = () => {
  const navigate = useNavigate();
  const { session, profile, loading } = useAuth();
  const [mode, setMode] = useState<Mode>("signup");
  const [handle, setHandle] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [needsHandle, setNeedsHandle] = useState(false);

  useEffect(() => {
    if (loading || !session) return;

    const go = async () => {
      // We have a session. Ensure a profile row exists, then redirect.
      if (profile) {
        navigate(`/@${profile.handle}`, { replace: true });
        return;
      }
      const user = session.user;
      const metaHandle = (user.user_metadata?.handle as string | undefined)?.toLowerCase();
      if (metaHandle && /^[a-z0-9_]{3,30}$/.test(metaHandle)) {
        await supabase
          .from("profiles")
          .upsert({ id: user.id, handle: metaHandle, name: metaHandle }, { onConflict: "id" });
        window.location.assign(`/@${metaHandle}`);
        return;
      }
      // OAuth (Discord/Google) users arrive with no handle — ask them to pick one.
      setNeedsHandle(true);
    };
    void go();
  }, [loading, session, profile, navigate]);

  const claimHandle = async () => {
    setError(null);
    if (!session?.user) return;
    const handleParsed = handleSchema.safeParse(handle);
    if (!handleParsed.success) return setError(handleParsed.error.errors[0].message);

    setBusy(true);
    try {
      const { data: reserved } = await supabase
        .from("reserved_handles")
        .select("handle")
        .eq("handle", handleParsed.data)
        .maybeSingle();
      if (reserved) return setError("That handle is reserved.");

      const { data: taken } = await supabase
        .from("profiles")
        .select("id")
        .ilike("handle", handleParsed.data)
        .maybeSingle();
      if (taken && (taken as { id: string }).id !== session.user.id) {
        return setError("That handle is already taken.");
      }

      const { error: upsertError } = await supabase
        .from("profiles")
        .upsert(
          { id: session.user.id, handle: handleParsed.data, name: handleParsed.data },
          { onConflict: "id" },
        );
      if (upsertError) return setError(upsertError.message);
      window.location.assign(`/@${handleParsed.data}`);
    } finally {
      setBusy(false);
    }
  };

  const oauth = async (provider: "google" | "discord") => {
    setError(null);
    if (supabaseConfigError) return setError(supabaseConfigError);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth` },
    });
    if (oauthError) setError(oauthError.message);
  };

  const submit = async () => {
    setError(null);
    setNotice(null);
    if (supabaseConfigError) return setError(supabaseConfigError);

    setBusy(true);
    try {
      if (mode === "signin") {
        // Sign in by @handle: resolve the handle to its account email first.
        const handleParsed = handleSchema.safeParse(handle);
        if (!handleParsed.success) return setError(handleParsed.error.errors[0].message);
        if (!password) return setError("Enter your password.");

        const { data: resolvedEmail, error: lookupError } = await supabase.rpc(
          "email_for_handle",
          { p_handle: handleParsed.data },
        );
        if (lookupError) return setError(lookupError.message);
        if (!resolvedEmail) return setError("Invalid handle or password.");

        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: resolvedEmail as string,
          password,
        });
        if (signInError) setError("Invalid handle or password.");
        return;
      }

      const emailParsed = emailSchema.safeParse(email);
      if (!emailParsed.success) return setError(emailParsed.error.errors[0].message);
      const pwParsed = passwordSchema.safeParse(password);
      if (!pwParsed.success) return setError(pwParsed.error.errors[0].message);

      // signup: validate + check handle availability first
      const handleParsed = handleSchema.safeParse(handle);
      if (!handleParsed.success) return setError(handleParsed.error.errors[0].message);

      const { data: reserved } = await supabase
        .from("reserved_handles")
        .select("handle")
        .eq("handle", handleParsed.data)
        .maybeSingle();
      if (reserved) return setError("That handle is reserved.");

      const { data: taken } = await supabase
        .from("profiles")
        .select("handle")
        .ilike("handle", handleParsed.data)
        .maybeSingle();
      if (taken) return setError("That handle is already taken.");

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: emailParsed.data,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
          data: { handle: handleParsed.data },
        },
      });
      if (signUpError) return setError(signUpError.message);

      // If session exists (email confirmation off), ensure the profile row.
      if (data.session && data.user) {
        await supabase
          .from("profiles")
          .upsert({ id: data.user.id, handle: handleParsed.data, name: handleParsed.data }, { onConflict: "id" });
      } else {
        setNotice("Check your email to confirm your account, then sign in.");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto max-w-sm px-4 py-16">
        <Link to="/" className="mono text-xs text-muted-foreground hover:text-foreground">
          &lt; soundemote
        </Link>
        {needsHandle ? (
          <>
            <h1 className="display mt-4 text-2xl">Choose your handle</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              You're signed in. Pick a @handle to finish setting up your account.
            </p>
            <div className="mt-8 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="claim-handle">Handle</Label>
                <div className="flex items-center gap-1">
                  <span className="mono text-sm text-muted-foreground">@</span>
                  <Input
                    id="claim-handle"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    placeholder="yourname"
                    autoComplete="off"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") claimHandle();
                    }}
                  />
                </div>
              </div>
              {error && <p className="text-sm text-destructive break-words">{error}</p>}
              <Button className="w-full" onClick={claimHandle} disabled={busy}>
                {busy ? "Working…" : "Claim handle"}
              </Button>
            </div>
          </>
        ) : (
        <>
        <h1 className="display mt-4 text-2xl">
          {mode === "signup" ? "Create account" : "Sign in"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {mode === "signup"
            ? "Claim your @handle and build your banks."
            : "Welcome back."}
        </p>

        <div className="mt-8 space-y-3">
          <Button variant="outline" className="w-full" onClick={() => oauth("google")}>
            Continue with Google
          </Button>
          <Button variant="outline" className="w-full" onClick={() => oauth("discord")}>
            Continue with Discord
          </Button>
        </div>

        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          or
          <span className="h-px flex-1 bg-border" />
        </div>

        <div className="space-y-4">
          {mode === "signup" ? (
            <div className="space-y-2">
              <Label htmlFor="auth-handle">Handle</Label>
              <div className="flex items-center gap-1">
                <span className="mono text-sm text-muted-foreground">@</span>
                <Input
                  id="auth-handle"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="yourname"
                  autoComplete="off"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="auth-handle">Handle</Label>
              <div className="flex items-center gap-1">
                <span className="mono text-sm text-muted-foreground">@</span>
                <Input
                  id="auth-handle"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="yourname"
                  autoComplete="username"
                />
              </div>
            </div>
          )}
          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="auth-email">Email</Label>
              <Input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="auth-password">Password</Label>
            <Input
              id="auth-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
              }}
            />
          </div>
          {error && <p className="text-sm text-destructive break-words">{error}</p>}
          {notice && <p className="text-sm text-foreground break-words">{notice}</p>}
          <Button className="w-full" onClick={submit} disabled={busy}>
            {busy ? "Working…" : mode === "signup" ? "Create account" : "Sign in"}
          </Button>
        </div>

        <button
          className="mono mt-6 text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
          onClick={() => {
            setMode((m) => (m === "signup" ? "signin" : "signup"));
            setError(null);
            setNotice(null);
          }}
        >
          {mode === "signup" ? "Already have an account? Sign in" : "Need an account? Sign up"}
        </button>
        </>
        )}
      </div>
    </main>
  );
};

export default AuthPage;
