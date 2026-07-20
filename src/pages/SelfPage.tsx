import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

type SelfData = {
  display_name?: string;
  bio?: string;
  personality?: string;
  communication_style?: string;
  interests?: string;
  boundaries?: string;
  updated_at?: string;
};

const SelfPage = () => {
  const { session, profile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [selfData, setSelfData] = useState<SelfData>({
    display_name: profile?.display_name || profile?.handle || "",
    bio: "",
    personality: "",
    communication_style: "",
    interests: "",
    boundaries: "",
  });

  const updateField = (field: keyof SelfData, value: string) => {
    setSelfData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = useCallback(async () => {
    if (!session?.user?.id) return;
    setSaving(true);
    try {
      const payload = {
        ...selfData,
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase
        .from("user_self")
        .upsert(
          { owner_id: session.user.id, self_data: payload, updated_at: new Date().toISOString() },
          { onConflict: "owner_id" },
        );
      if (error) throw error;
      toast({ title: "Self saved" });
    } catch (error) {
      toast({
        title: "Save failed",
        description: String((error as Error)?.message || error),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }, [selfData, session?.user?.id]);

  if (!session) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto max-w-2xl px-4 py-20 text-center">
          <h1 className="display text-3xl">Create Your Self</h1>
          <p className="mt-4 text-muted-foreground">
            Sign in to describe yourself. Your self description helps AI chatbots
            understand who they're talking to.
          </p>
          <Link
            to="/auth"
            className="mono mt-6 inline-block rounded border border-scope/30 bg-scope/10 px-6 py-3 text-sm text-scope hover:bg-scope/20"
          >
            sign in →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto max-w-2xl px-4 py-12">
        <Link to="/" className="mono text-xs text-muted-foreground hover:text-foreground">
          ← soundemote
        </Link>
        <h1 className="display mt-4 text-3xl">Define Your Self</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Describe who you are and how you'd like AI to interact with you. This
          reference travels with your account and will be used by chatbots to
          personalize conversations.
        </p>

        <div className="mt-8 grid gap-6">
          <FieldRow label="Display Name" hint="What should AI call you?">
            <input
              type="text"
              value={selfData.display_name || ""}
              onChange={(e) => updateField("display_name", e.target.value)}
              placeholder="e.g. Argit, Elan, YourName"
              className="mono w-full rounded border border-border bg-transparent px-3 py-2 text-sm"
              maxLength={128}
            />
          </FieldRow>

          <FieldRow label="Bio" hint="A short summary of who you are.">
            <textarea
              value={selfData.bio || ""}
              onChange={(e) => updateField("bio", e.target.value)}
              placeholder="I'm a DSP engineer and visual artist building audio tools..."
              className="mono w-full rounded border border-border bg-transparent px-3 py-2 text-sm"
              rows={3}
              maxLength={1024}
            />
          </FieldRow>

          <FieldRow label="Personality" hint="General personality traits.">
            <textarea
              value={selfData.personality || ""}
              onChange={(e) => updateField("personality", e.target.value)}
              placeholder="Creative, analytical, direct, playful..."
              className="mono w-full rounded border border-border bg-transparent px-3 py-2 text-sm"
              rows={2}
              maxLength={512}
            />
          </FieldRow>

          <FieldRow label="Communication Style" hint="How should AI talk to you?">
            <textarea
              value={selfData.communication_style || ""}
              onChange={(e) => updateField("communication_style", e.target.value)}
              placeholder="Concise and technical. No fluff. I prefer direct answers over lengthy explanations. Use emoji sparingly."
              className="mono w-full rounded border border-border bg-transparent px-3 py-2 text-sm"
              rows={2}
              maxLength={512}
            />
          </FieldRow>

          <FieldRow label="Interests" hint="Topics you care about.">
            <textarea
              value={selfData.interests || ""}
              onChange={(e) => updateField("interests", e.target.value)}
              placeholder="DSP, audio synthesis, Rust, Tauri, shaders, chaos theory, video game audio..."
              className="mono w-full rounded border border-border bg-transparent px-3 py-2 text-sm"
              rows={2}
              maxLength={512}
            />
          </FieldRow>

          <FieldRow label="Boundaries" hint="Topics or tones to avoid.">
            <textarea
              value={selfData.boundaries || ""}
              onChange={(e) => updateField("boundaries", e.target.value)}
              placeholder="Don't explain basic concepts I already know. Keep it professional but friendly."
              className="mono w-full rounded border border-border bg-transparent px-3 py-2 text-sm"
              rows={2}
              maxLength={512}
            />
          </FieldRow>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="mono rounded border border-scope/30 bg-scope/10 px-6 py-3 text-sm text-scope hover:bg-scope/20 disabled:opacity-50"
          >
            {saving ? "saving…" : "save self"}
          </button>
        </div>
      </div>
    </main>
  );
};

const FieldRow = ({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) => (
  <div>
    <div className="mb-1.5 flex items-baseline gap-2">
      <label className="mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </label>
      {hint && (
        <span className="text-[0.65rem] text-muted-foreground/60">{hint}</span>
      )}
    </div>
    {children}
  </div>
);

export default SelfPage;
