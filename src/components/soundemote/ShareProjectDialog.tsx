import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase, supabaseConfigError } from "@/lib/supabase";

const SHARE_BASE_URL = "https://soundemote.io/share";

function makeSlug(title: string): string {
  const base =
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "scope";
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base}-${suffix}`;
}

export function ShareProjectDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [bankName, setBankName] = useState("");
  const [visibility, setVisibility] = useState("unlisted");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = async () => {
    setError(null);
    setLink(null);
    if (supabaseConfigError) {
      setError(supabaseConfigError);
      return;
    }
    setSaving(true);
    const slug = makeSlug(title);
    const project_data = {
      source: "soundemote-lovable",
      path: "/sandbox",
      url: typeof window !== "undefined" ? window.location.href : null,
      title: title.trim(),
      bank_name: bankName.trim(),
      created_client_timestamp: new Date().toISOString(),
    };
    try {
      const { data, error: insertError } = await supabase
        .from("shared_projects")
        .insert({
          slug,
          title: title.trim() || "Untitled scope",
          bank_name: bankName.trim() || null,
          visibility,
          project_data,
        })
        .select("slug")
        .single();
      if (insertError) {
        setError(insertError.message);
        return;
      }
      setLink(`${SHARE_BASE_URL}/${data.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error creating link.");
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setError(null);
          setLink(null);
          setCopied(false);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="mono normal-case text-[0.82rem] tracking-normal"
        >
          Share Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="mono">Share Project</DialogTitle>
          <DialogDescription>
            Create a shareable link to this scope.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="share-title">Title</Label>
            <Input
              id="share-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My scope"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="share-bank">Bank Name</Label>
            <Input
              id="share-bank"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="Default bank"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="share-visibility">Visibility</Label>
            <Select value={visibility} onValueChange={setVisibility}>
              <SelectTrigger id="share-visibility">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unlisted">Unlisted</SelectItem>
                <SelectItem value="public">Public</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <p className="text-sm text-destructive break-words">{error}</p>
          )}

          {link ? (
            <div className="space-y-2">
              <Label>Share link</Label>
              <div className="flex items-center gap-2">
                <Input readOnly value={link} className="mono text-xs" />
                <Button type="button" size="sm" onClick={handleCopy}>
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
            </div>
          ) : (
            <Button
              type="button"
              className="w-full"
              onClick={handleCreate}
              disabled={saving}
            >
              {saving ? "Creating…" : "Create Link"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ShareProjectDialog;