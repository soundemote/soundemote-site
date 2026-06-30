import { useState } from "react";
import { z } from "zod";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase, supabaseConfigError } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

const claimSchema = z.object({
  contact_email: z
    .string()
    .trim()
    .email({ message: "Enter a valid email" })
    .max(255, { message: "Email too long" }),
  note: z.string().trim().max(1000, { message: "Note too long" }).optional(),
});

type ClaimUrlDialogProps = {
  slug: string;
  requestPatch: () => Promise<unknown>;
};

export function ClaimUrlDialog({ slug, requestPatch }: ClaimUrlDialogProps) {
  const { session, profile, loading: authLoading } = useAuth();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const user = session?.user ?? null;
  const email = user?.email ?? "";
  const handle = profile?.handle ?? (user?.user_metadata?.handle as string | undefined) ?? null;

  const handleSubmit = async () => {
    setError(null);
    if (supabaseConfigError) {
      setError(supabaseConfigError);
      return;
    }
    if (!user) {
      setError("You must be signed in to claim a URL.");
      return;
    }
    const parsed = claimSchema.safeParse({ contact_email: email, note });
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message || "Invalid input");
      return;
    }
    setBusy(true);
    try {
      // Already claimed?
      const { data: existing } = await supabase
        .from("shared_projects")
        .select("slug")
        .eq("slug", slug)
        .maybeSingle();
      if (existing) {
        setError("This URL is already claimed.");
        setBusy(false);
        return;
      }
      const projectData = await requestPatch();
      if (!projectData) {
        setError("Could not read your current patch. Try again.");
        setBusy(false);
        return;
      }
      const { error: insertError } = await supabase.from("patch_claims").insert({
        requested_slug: slug,
        contact_email: parsed.data.contact_email,
        claimant_id: user.id,
        note: parsed.data.note || null,
        project_data: projectData,
        status: "pending",
      });
      if (insertError) {
        setError(insertError.message);
        setBusy(false);
        return;
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setError(null);
          setSubmitted(false);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="mono normal-case text-[0.8rem] tracking-normal"
        >
          claim this url
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="mono">Claim /{slug}</DialogTitle>
          <DialogDescription>
            Submit your current patch for this URL. We review every claim before it goes live.
          </DialogDescription>
        </DialogHeader>
        {submitted ? (
          <p className="text-sm">
            Submitted for review. If approved, <span className="mono">soundemote.io/{slug}</span>{" "}
            will serve your patch.
          </p>
        ) : !authLoading && !user ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Sign in to claim this URL with your account.
            </p>
            <Button asChild className="w-full">
              <Link to="/auth">Sign in</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="mono text-xs text-muted-foreground">
              Claiming as {handle ? `@${handle}` : email}
              {handle && email ? ` (${email})` : ""}
            </p>
            <div className="space-y-2">
              <Label htmlFor="claim-note">Note (optional)</Label>
              <Textarea
                id="claim-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Anything you want us to know"
                rows={3}
              />
            </div>
            {error && <p className="text-sm text-destructive break-words">{error}</p>}
            <Button className="w-full" onClick={handleSubmit} disabled={busy}>
              {busy ? "Submitting…" : "Submit claim"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ClaimUrlDialog;
