function serializeNodeGraphPatch(patch = nodeGraphMvp.patch) {
  const cameraState = normalizeNodeGraphPatchCameras(patch.cameras, patch.activeCameraId);
  return JSON.stringify(
    {
      activeCameraId: cameraState.activeCameraId,
      audio: normalizeNodeGraphPatchAudio(patch.audio),
      bypassedNodes: patch.bypassedNodes || [],
      cameras: cameraState.cameras,
      connections: patch.connections,
      format: { ...nodeGraphPatchFormat },
      grid: patch.grid,
      info: normalizeNodeGraphPatchInfo(patch.info),
      modulations: patch.modulations || [],
      monitors: normalizeNodeGraphPatchMonitors(patch.monitors, patch),
      nodes: patch.nodes,
      requiredAssets: typeof nodeGraphRequiredAssetsForPatch === "function"
        ? nodeGraphRequiredAssetsForPatch(patch)
        : [],
      samples: typeof normalizeNodeGraphPatchSamples === "function"
        ? normalizeNodeGraphPatchSamples(patch.samples)
        : [],
      timing: normalizeNodeGraphPatchTiming(patch.timing),
      uiItems: normalizeNodeGraphPatchUiItems(patch.uiItems),
      view: normalizeNodeGraphPatchView(patch.view),
      visual: normalizeNodeGraphPatchVisual(patch.visual),
    },
    null,
    2,
  );
}

function nodeGraphShareProjectData(patch = nodeGraphMvp.patch) {
  const patchToShare = typeof nodeGraphPatchWithLiveHeaderInfo === "function"
    ? nodeGraphPatchWithLiveHeaderInfo(patch)
    : patch;
  const info = normalizeNodeGraphPatchInfo(patchToShare.info);
  const userName = nodeGraphShareRouteSlug(info.author || "soundemote", "soundemote");
  const bankSlug = nodeGraphShareRouteSlug(info.bankName || "main", "main");
  const patchSlug = nodeGraphShareRouteSlug(info.name || "patch", "patch");
  return {
    kind: "sandbox_patch",
    version: 1,
    title: info.name || "Untitled Project",
    bank_name: info.bankName || "",
    user_name: userName,
    bank_slug: bankSlug,
    patch_slug: patchSlug,
    patch_data: JSON.parse(serializeNodeGraphPatch(patchToShare)),
    assets: typeof nodeGraphRequiredAssetsForPatch === "function"
      ? nodeGraphRequiredAssetsForPatch(patchToShare)
      : [],
    created_with: {
      app: "soemdsp-sandbox",
      patch_format: { ...nodeGraphPatchFormat },
    },
  };
}

function nodeGraphSharePayload(patch = nodeGraphMvp.patch) {
  const projectData = nodeGraphShareProjectData(patch);
  return {
    title: projectData.title,
    visibility: "unlisted",
    project_data: projectData,
  };
}

function nodeGraphEncodeSharePayload(payload) {
  const json = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function nodeGraphDecodeSharePayload(encoded = "") {
  const normalized = String(encoded || "").replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

function nodeGraphPatchFromShareProjectData(projectData = {}) {
  if (projectData?.kind !== "sandbox_patch") {
    throw new Error(`unsupported share kind: ${projectData?.kind || "unknown"}`);
  }
  if (!projectData.patch_data) {
    throw new Error("share payload is missing patch_data");
  }
  return loadNodeGraphPatchFromScript(JSON.stringify(projectData.patch_data));
}

function nodeGraphSharePayloadFromUrl(search = window.location.search) {
  const params = new URLSearchParams(search || "");
  const encoded = params.get("share");
  return encoded ? nodeGraphDecodeSharePayload(encoded) : null;
}

function nodeGraphSandboxPatchRouteInfoFromUrl(search = window.location.search) {
  const params = new URLSearchParams(search || "");
  if (params.get("sandboxMode") !== "patch") {
    return null;
  }
  const patch = String(params.get("sandboxPatch") || "").trim();
  if (!patch) {
    return null;
  }
  return {
    user: String(params.get("sandboxUser") || "").trim(),
    bank: String(params.get("sandboxBank") || "").trim(),
    patch,
  };
}

function nodeGraphPatchWithSandboxRouteInfo(patch, routeInfo) {
  if (!patch || !routeInfo?.patch) {
    return patch;
  }
  return {
    ...patch,
    info: normalizeNodeGraphPatchInfo({
      ...(patch.info || {}),
      author: routeInfo.user || patch.info?.author || "",
      bankName: routeInfo.bank || patch.info?.bankName || "",
      name: routeInfo.patch || patch.info?.name || "",
    }),
  };
}

function nodeGraphShareRouteSlug(value, fallback = "patch") {
  const slug = String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
  return slug || fallback;
}

function nodeGraphShareRouteForProjectData(projectData = {}) {
  const userSlug = nodeGraphShareRouteSlug(projectData.user_name || "soundemote", "soundemote");
  const bankSlug = nodeGraphShareRouteSlug(projectData.bank_slug || projectData.bank_name || "main", "main");
  const patchSlug = nodeGraphShareRouteSlug(projectData.patch_slug || projectData.title || "patch", "patch");
  return `/sandbox/${userSlug}/${bankSlug}/${patchSlug}`;
}

function nodeGraphShareLinkForPatch(patch = nodeGraphMvp.patch) {
  const payload = nodeGraphSharePayload(patch);
  const url = new URL(nodeGraphShareRouteForProjectData(payload.project_data), "https://soundemote.io");
  url.hash = "";
  return url.toString();
}

function nodeGraphPatchFingerprint(patch = nodeGraphMvp.patch) {
  const text = typeof patch === "string" ? patch : serializeNodeGraphPatch(patch);
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}
