import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { supabase, supabaseConfigError } from "@/lib/supabase";
import { ClaimUrlDialog } from "@/components/soundemote/ClaimUrlDialog";

type SandboxRouteParams = {
  user?: string;
  bank?: string;
  patch?: string;
};

type SharedProjectRow = {
  project_data: unknown;
};

function sandboxIframeSrc(search: string, params: SandboxRouteParams) {
  const iframeParams = new URLSearchParams(search);
  const hasPatchRoute = Boolean(params.patch);

  if (hasPatchRoute) {
    iframeParams.set("sandboxMode", "patch");
    iframeParams.set("sandboxUser", params.user || "soundemote");
    iframeParams.set("sandboxBank", params.bank || "main");
    iframeParams.set("sandboxPatch", params.patch || "");
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

const SandboxPage = () => {
  const location = useLocation();
  const params = useParams<SandboxRouteParams>();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [projectData, setProjectData] = useState<unknown>(null);
  const [projectError, setProjectError] = useState<string | null>(null);
  const hasPatchRoute = Boolean(params.patch);
  const claimSlug = new URLSearchParams(location.search).get("claim");
  const targetLabel = hasPatchRoute
    ? `${params.user || "soundemote"} / ${params.bank || "main"} / ${params.patch}`
    : "soemdsp sandbox";
  const iframeSrc = sandboxIframeSrc(location.search, params);

  useEffect(() => {
    let cancelled = false;
    setProjectData(null);
    setProjectError(null);
    if (!hasPatchRoute || new URLSearchParams(location.search).has("share")) {
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
  }, [hasPatchRoute, location.search, params.user, params.bank, params.patch]);

  const postProjectData = () => {
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

  return (
    <main className="min-h-screen bg-background text-foreground">
      {hasPatchRoute && (
        <Link
          to="/sandbox"
          className="mono fixed left-3 top-3 z-50 rounded border border-cyan-300/35 bg-black/75 px-3 py-2 text-xs text-cyan-100 shadow-[0_0_18px_rgba(103,232,249,0.22)] backdrop-blur hover:bg-cyan-950/80"
          aria-label="Open full sandbox"
        >
          &lt; full sandbox
        </Link>
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
