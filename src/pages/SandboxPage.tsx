import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { supabase, supabaseConfigError } from "@/lib/supabase";
import { ClaimUrlDialog } from "@/components/soundemote/ClaimUrlDialog";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

type SandboxRouteParams = {
  user?: string;
  bank?: string;
  patch?: string;
  slug?: string;
};

type SharedProjectRow = {
  project_data: unknown;
};

function sandboxIframeSrc(
  search: string,
  params: SandboxRouteParams,
  wantsAutoframe: boolean,
  wantsAutostart: boolean,
) {
  const iframeParams = new URLSearchParams(search);
  const hasPatchRoute = Boolean(params.patch);

  if (hasPatchRoute) {
    iframeParams.set("sandboxMode", "patch");
    iframeParams.set("sandboxUser", params.user || "soundemote");
    iframeParams.set("sandboxBank", params.bank || "main");
    iframeParams.set("sandboxPatch", params.patch || "");
  }

  // Autoframe is on by default; propagate it into the iframe so the sandbox
  // frames patches it loads internally (init/default patch, manual loads),
  // not just ones we push via postMessage.
  if (wantsAutoframe) {
    iframeParams.set("autoframe", "1");
  }

  // Autostart turns Live Audio output on as soon as the sandbox is ready,
  // skipping the manual power-button press -- opt-in per route via the
  // `autostart` SandboxPage prop.
  if (wantsAutostart) {
    iframeParams.set("autostart", "1");
  }

  const query = iframeParams.toString();
  return `/soemdsp-sandbox/index.html${query ? `?${query}` : ""}`;
}

async function loadSandboxRouteProject(params: SandboxRouteParams) {
  if (!params.patch || supabaseConfigError) {
    return null;
  }

  const owner = params.user || "soundemote";
  const bank = params.bank || "main";
  const patch = params.patch;
  const modern = await supabase
    .from("shared_projects")
    .select("project_data")
    .eq("owner_name", owner)
    .eq("bank_slug", bank)
    .eq("patch_slug", patch)
    .maybeSingle();

  if (!modern.error && modern.data) {
    return (modern.data as SharedProjectRow).project_data || null;
  }

  const legacy = await supabase
    .from("shared_projects")
    .select("project_data")
    .eq("slug", patch)
    .maybeSingle();

  if (legacy.error) {
    throw legacy.error;
  }
  return (legacy.data as SharedProjectRow | null)?.project_data || null;
}

const WIKIREVIEW_HANDLE = "wikireview";

async function profileIdForHandle(handle: string): Promise<string | null> {
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("handle", handle)
    .maybeSingle();
  return (data as { id: string } | null)?.id ?? null;
}

async function initPatchForOwner(ownerId: string): Promise<unknown> {
  const { data } = await supabase
    .from("user_init_patches")
    .select("project_data")
    .eq("owner_id", ownerId)
    .maybeSingle();
  return (data as SharedProjectRow | null)?.project_data ?? null;
}

// Resolve init patch: the signed-in user's own, else wikireview's shared fallback.
async function loadInitPatch(userId: string | undefined): Promise<unknown> {
  if (supabaseConfigError) return null;
  if (userId) {
    const own = await initPatchForOwner(userId);
    if (own) return own;
  }
  const wikiId = await profileIdForHandle(WIKIREVIEW_HANDLE);
  if (wikiId) return initPatchForOwner(wikiId);
  return null;
}

type SandboxPageProps = {
  staticPatchUrl?: string;
  autostart?: boolean;
  pagePatch?: string;
  /** "showcase" opens the patch armed/framed; "sandbox" is a plain tool entry. */
  view?: "showcase" | "sandbox";
};

const SandboxPage = ({ staticPatchUrl, autostart = false, pagePatch: pagePatchProp, view }: SandboxPageProps = {}) => {
  const location = useLocation();
  const params = useParams<SandboxRouteParams>();
  // /patch/:slug and /patch/:slug/sandbox pass the slug via the route param.
  const pagePatch = pagePatchProp ?? params.slug;
  // Showcase view arms audio + frames automatically; sandbox view stays plain.
  const effectiveAutostart = autostart || view === "showcase";
  const { session } = useAuth();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [projectData, setProjectData] = useState<unknown>(null);
  const [projectError, setProjectError] = useState<string | null>(null);
  const [savingInit, setSavingInit] = useState(false);
  const [savingPage, setSavingPage] = useState(false);
  const hasPatchRoute = Boolean(params.patch);
  const claimSlug = new URLSearchParams(location.search).get("claim");
  const wikiSlug = new URLSearchParams(location.search).get("wiki");
  const hasShare = new URLSearchParams(location.search).has("share");
  const isEmbed = new URLSearchParams(location.search).get("embed") === "1";
  // Autoframe is on by default across the site; opt out with ?autoframe=0.
  const autoframeParam = new URLSearchParams(location.search).get("autoframe");
  const wantsAutoframe = autoframeParam !== "0" && autoframeParam !== "false";
  const isPlainSandbox = !hasPatchRoute && !wikiSlug && !hasShare && !pagePatch;
  const targetLabel = hasPatchRoute
    ? `${params.user || "soundemote"} / ${params.bank || "main"} / ${params.patch}`
    : "soemdsp sandbox";
  const iframeSrc = sandboxIframeSrc(location.search, params, wantsAutoframe, autostart);

  useEffect(() => {
    let cancelled = false;
    setProjectData(null);
    setProjectError(null);
    if (staticPatchUrl) {
      fetch(staticPatchUrl)
        .then((res) => res.json())
        .then((data) => {
          if (cancelled) return;
          // The sandbox expects a "sandbox_patch" envelope, not a raw graph patch.
          const projectData =
            data?.kind === "sandbox_patch"
              ? data
              : {
                  kind: "sandbox_patch",
                  version: 1,
                  title: staticPatchUrl,
                  bank_name: "soundemote",
                  patch_data: data,
                };
          setProjectData(projectData);
        })
        .catch((error) => {
          if (!cancelled) setProjectError(error?.message || String(error));
        });
      return () => {
        cancelled = true;
      };
    }
    if (pagePatch && !supabaseConfigError) {
      supabase
        .from("page_patches")
        .select("project_data")
        .eq("slug", pagePatch)
        .maybeSingle()
        .then(({ data }) => {
          if (!cancelled) setProjectData((data as SharedProjectRow | null)?.project_data ?? null);
        });
      return () => {
        cancelled = true;
      };
    }
    if (wikiSlug && !supabaseConfigError) {
      supabase
        .from("wiki_pages")
        .select("project_data")
        .eq("slug", wikiSlug)
        .maybeSingle()
        .then(({ data }) => {
          if (!cancelled) setProjectData((data as SharedProjectRow | null)?.project_data ?? null);
        });
      return () => {
        cancelled = true;
      };
    }
    if (!hasPatchRoute || new URLSearchParams(location.search).has("share")) {
      // Plain sandbox: load the user's init patch (or wikireview fallback).
      if (isPlainSandbox) {
        loadInitPatch(session?.user?.id).then((data) => {
          if (!cancelled) setProjectData(data);
        });
      }
      return () => {
        cancelled = true;
      };
    }
    loadSandboxRouteProject(params)
      .then((data) => {
        if (!cancelled) setProjectData(data);
      })
      .catch((error) => {
        if (!cancelled) setProjectError(error?.message || String(error));
      });
    return () => {
      cancelled = true;
    };
  }, [hasPatchRoute, location.search, params.user, params.bank, params.patch, wikiSlug, isPlainSandbox, session?.user?.id, staticPatchUrl, pagePatch]);

  const postProjectData = () => {
    // Fire autoframe on load regardless of whether we push project data — the
    // sandbox may load its own init/default patch internally, and we still want
    // it framed. Retry a few times to beat the internal async patch commit.
    if (wantsAutoframe && iframeRef.current?.contentWindow) {
      for (const delay of [350, 900, 1600]) {
        window.setTimeout(() => {
          iframeRef.current?.contentWindow?.postMessage(
            { type: "soundemote:autoframe" },
            window.location.origin,
          );
        }, delay);
      }
    }
    if (!projectData || !iframeRef.current?.contentWindow) {
      return;
    }
    iframeRef.current.contentWindow.postMessage(
      {
        type: "soundemote:sandbox-project-data",
        projectData,
      },
      window.location.origin,
    );
  };

  useEffect(postProjectData, [projectData, iframeSrc]);

  const requestCurrentPatch = (): Promise<unknown> =>
    new Promise((resolve) => {
      const target = iframeRef.current?.contentWindow;
      if (!target) {
        resolve(null);
        return;
      }
      const requestId = Math.random().toString(36).slice(2);
      const timer = window.setTimeout(() => {
        window.removeEventListener("message", onMessage);
        resolve(null);
      }, 4000);
      const onMessage = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        if (event.data?.type !== "soundemote:current-patch") return;
        if (event.data.requestId && event.data.requestId !== requestId) return;
        window.clearTimeout(timer);
        window.removeEventListener("message", onMessage);
        resolve(event.data.projectData || null);
      };
      window.addEventListener("message", onMessage);
      target.postMessage(
        { type: "soundemote:request-current-patch", requestId },
        window.location.origin,
      );
    });

  const saveInitPatch = async () => {
    if (!session?.user?.id) return;
    setSavingInit(true);
    try {
      const current = await requestCurrentPatch();
      if (!current) {
        toast({ title: "Could not read the current patch", variant: "destructive" });
        return;
      }
      const { error } = await supabase
        .from("user_init_patches")
        .upsert(
          { owner_id: session.user.id, project_data: current, updated_at: new Date().toISOString() },
          { onConflict: "owner_id" },
        );
      if (error) throw error;
      toast({ title: "Saved as your init patch" });
    } catch (error) {
      toast({ title: "Save failed", description: String((error as Error)?.message || error), variant: "destructive" });
    } finally {
      setSavingInit(false);
    }
  };

  const savePagePatch = async () => {
    if (!session?.user?.id || !pagePatch) return;
    setSavingPage(true);
    try {
      const current = await requestCurrentPatch();
      if (!current) {
        toast({ title: "Could not read the current patch", variant: "destructive" });
        return;
      }
      const { error } = await supabase
        .from("page_patches")
        .upsert(
          {
            slug: pagePatch,
            owner_id: session.user.id,
            project_data: current,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "slug" },
        );
      if (error) throw error;
      toast({
        title: "Shared",
        description: `This patch is now live at /${pagePatch}`,
      });
    } catch (error) {
      toast({ title: "Save failed", description: String((error as Error)?.message || error), variant: "destructive" });
    } finally {
      setSavingPage(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      {hasPatchRoute && !isEmbed && (
        <Link
          to="/sandbox"
          className="mono fixed left-3 top-3 z-50 rounded border border-cyan-300/35 bg-black/75 px-3 py-2 text-xs text-cyan-100 shadow-[0_0_18px_rgba(103,232,249,0.22)] backdrop-blur hover:bg-cyan-950/80"
          aria-label="Open full sandbox"
        >
          &lt; full sandbox
        </Link>
      )}
      {isPlainSandbox && !isEmbed && session?.user?.id && (
        <button
          type="button"
          onClick={saveInitPatch}
          disabled={savingInit}
          className="mono fixed right-3 top-3 z-50 rounded border border-cyan-300/35 bg-black/75 px-3 py-2 text-xs text-cyan-100 shadow-[0_0_18px_rgba(103,232,249,0.22)] backdrop-blur hover:bg-cyan-950/80 disabled:opacity-50"
          aria-label="Save current patch as my init patch"
        >
          {savingInit ? "saving…" : "set as my init patch"}
        </button>
      )}
      {pagePatch && !isEmbed && session?.user?.id && (
        <button
          type="button"
          onClick={savePagePatch}
          disabled={savingPage}
          className="mono fixed right-3 top-3 z-50 rounded border border-cyan-300/35 bg-black/75 px-3 py-2 text-xs text-cyan-100 shadow-[0_0_18px_rgba(103,232,249,0.22)] backdrop-blur hover:bg-cyan-950/80 disabled:opacity-50"
          aria-label={`Share current patch to /${pagePatch}`}
        >
          {savingPage ? "sharing…" : `share to /${pagePatch}`}
        </button>
      )}
      {claimSlug && (
        <div className="mono fixed left-1/2 top-3 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full border border-amber-300/40 bg-black/80 px-4 py-2 text-xs text-amber-200 shadow-[0_0_18px_rgba(251,191,36,0.22)] backdrop-blur">
          <span>⌁ {claimSlug} · unclaimed</span>
          <ClaimUrlDialog slug={claimSlug} requestPatch={requestCurrentPatch} />
        </div>
      )}
      {projectError && (
        <div className="mono fixed right-3 top-3 z-50 max-w-sm rounded border border-red-300/35 bg-black/75 px-3 py-2 text-xs text-red-100">
          Patch lookup failed: {projectError}
        </div>
      )}
      <section className="h-screen w-full overflow-hidden">
        <iframe
          ref={iframeRef}
          title={targetLabel}
          src={iframeSrc}
          className="h-full w-full border-0"
          allow="autoplay; microphone"
          allowFullScreen
          onLoad={postProjectData}
        />
      </section>
    </main>
  );
};

export default SandboxPage;
