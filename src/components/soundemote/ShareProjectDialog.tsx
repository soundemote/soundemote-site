import { useState } from "react";
import type { RefObject } from "react";
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

type SandboxProjectData = {
  title?: string;
  bank_name?: string;
  user_name?: string;
  bank_slug?: string;
  patch_slug?: string;
  [key: string]: unknown;
};

type SandboxWindow = Window & {
  nodeGraphShareProjectData?: () => SandboxProjectData;
};

type ShareProjectDialogProps = {
  iframeRef?: RefObject<HTMLIFrameElement>;
  triggerClassName?: string;
  triggerLabel?: string;
};

const CANONICAL_BASE_URL = "https://soundemote.io";

function canShowPatchPublisher(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  const params = new URLSearchParams(window.location.search);
  return host === "localhost" || host === "127.0.0.1" || params.get("publish") === "1";
}

function makeRouteSlug(value: string, fallback: string): string {
  const slug =
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 64) || fallback;
  return slug;
}

function sandboxWindowFromDialog(iframeRef?: RefObject<HTMLIFrameElement>): SandboxWindow | null {
  const iframe =
    iframeRef?.current ??
    document.querySelector<HTMLIFrameElement>("#hero-sandbox-iframe") ??
    document.querySelector<HTMLIFrameElement>("iframe[src^='/soemdsp-sandbox']");
  return (iframe?.contentWindow as SandboxWindow | null) ?? null;
}

function readSandboxProjectData(iframeRef?: RefObject<HTMLIFrameElement>): SandboxProjectData | null {
  try {
    const sandboxWindow = sandboxWindowFromDialog(iframeRef);
    const data = sandboxWindow?.nodeGraphShareProjectData?.();
    return data && typeof data === "object" ? data : null;
  } catch {
    return null;
  }
}

export function ShareProjectDialog({
  iframeRef,
  triggerClassName,
  triggerLabel = "Publish",
}: ShareProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [ownerName, setOwnerName] = useState("elanhickler");
  const [bankName, setBankName] = useState("basics");
  const [patchTitle, setPatchTitle] = useState("sinewave");
  const [shortlink, setShortlink] = useState("sinewave");
  const [visibility, setVisibility] = useState("public");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canonicalLink, setCanonicalLink] = useState<string | null>(null);
  const [shortLink, setShortLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const ownerSlug = makeRouteSlug(ownerName, "soundemote");
  const bankSlug = makeRouteSlug(bankName, "main");
  const patchSlug = makeRouteSlug(patchTitle, "patch");
  const shortlinkSlug = makeRouteSlug(shortlink, "");

  if (!canShowPatchPublisher()) {
    return null;
  }

  const primeFromSandbox = () => {
    const projectData = readSandboxProjectData(iframeRef);
    if (!projectData) return;
    if (
      typeof projectData.user_name === "string" &&
      projectData.user_name.trim() &&
      projectData.user_name !== "soundemote"
    ) {
      setOwnerName(projectData.user_name);
    }
    if (
      typeof projectData.bank_name === "string" &&
      projectData.bank_name.trim() &&
      projectData.bank_name !== "main"
    ) {
      setBankName(projectData.bank_name);
    }
    if (
      typeof projectData.title === "string" &&
      projectData.title.trim() &&
      projectData.title !== "patch"
    ) {
      setPatchTitle(projectData.title);
    }
  };

  const handleCreate = async () => {
    setError(null);
    setCanonicalLink(null);
    setShortLink(null);
    if (supabaseConfigError) {
      setError(supabaseConfigError);
      return;
    }
    const sandboxProjectData = readSandboxProjectData(iframeRef);
    if (!sandboxProjectData) {
      setError("No sandbox patch is available yet. Load the sandbox, then publish again.");
      return;
    }

    setSaving(true);
    const safeOwner = ownerSlug;
    const safeBankName = bankName.trim() || "main";
    const safeBankSlug = bankSlug;
    const safeTitle = patchTitle.trim() || "patch";
    const safePatchSlug = patchSlug;
    const safeVisibility = visibility || "unlisted";
    const safeProjectData = {
      ...sandboxProjectData,
      title: safeTitle,
      bank_name: safeBankName,
      user_name: safeOwner,
      bank_slug: safeBankSlug,
      patch_slug: safePatchSlug,
    };

    try {
      const { error: upsertError } = await supabase
        .from("shared_projects")
        .upsert(
          {
            slug: safePatchSlug,
            title: safeTitle,
            bank_name: safeBankName,
            visibility: safeVisibility,
            project_data: safeProjectData,
            owner_name: safeOwner,
            bank_slug: safeBankSlug,
            patch_slug: safePatchSlug,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "owner_name,bank_slug,patch_slug" },
        );
      if (upsertError) {
        setError(upsertError.message);
        return;
      }

      const canonical = `${CANONICAL_BASE_URL}/${safeOwner}/${safeBankSlug}/${safePatchSlug}`;
      setCanonicalLink(canonical);

      if (shortlinkSlug) {
        const { error: shortlinkError } = await supabase
          .from("patch_shortlinks")
          .upsert(
            {
              slug: shortlinkSlug,
              target_user: safeOwner,
              target_bank: safeBankSlug,
              target_patch: safePatchSlug,
            },
            { onConflict: "slug" },
          );
        if (shortlinkError) {
          setError(shortlinkError.message);
          return;
        }
        setShortLink(`${CANONICAL_BASE_URL}/${shortlinkSlug}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error publishing patch.");
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = async (value: string | null) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
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
        if (next) {
          primeFromSandbox();
        } else {
          setError(null);
          setCopied(false);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={triggerClassName ?? "mono normal-case text-[0.82rem] tracking-normal"}
        >
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="mono">Publish Patch</DialogTitle>
          <DialogDescription>
            Save the current sandbox patch to a canonical URL and optional shortlink.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-2">
              <Label htmlFor="share-owner">User</Label>
              <Input id="share-owner" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="share-bank">Bank</Label>
              <Input id="share-bank" value={bankName} onChange={(e) => setBankName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="share-title">Patch</Label>
              <Input id="share-title" value={patchTitle} onChange={(e) => setPatchTitle(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="share-shortlink">Root shortlink</Label>
            <Input
              id="share-shortlink"
              value={shortlink}
              onChange={(e) => setShortlink(e.target.value)}
              placeholder="optional, for example sinewave"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="share-visibility">Visibility</Label>
            <Select value={visibility} onValueChange={setVisibility}>
              <SelectTrigger id="share-visibility">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="unlisted">Unlisted</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mono rounded border border-border/70 bg-muted/20 p-2 text-xs text-muted-foreground">
            {CANONICAL_BASE_URL}/{ownerSlug}/{bankSlug}/{patchSlug}
            {shortlinkSlug ? <><br />{CANONICAL_BASE_URL}/{shortlinkSlug}</> : null}
          </div>

          {error && <p className="text-sm text-destructive break-words">{error}</p>}

          {canonicalLink ? (
            <div className="space-y-2">
              <Label>Published links</Label>
              <div className="space-y-2">
                <Button type="button" variant="secondary" className="w-full justify-start mono text-xs" onClick={() => handleCopy(canonicalLink)}>
                  {copied ? "Copied" : canonicalLink}
                </Button>
                {shortLink && (
                  <Button type="button" variant="secondary" className="w-full justify-start mono text-xs" onClick={() => handleCopy(shortLink)}>
                    {copied ? "Copied" : shortLink}
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <Button type="button" className="w-full" onClick={handleCreate} disabled={saving}>
              {saving ? "Publishing..." : "Publish Patch"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ShareProjectDialog;
