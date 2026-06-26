const nodeGraphResourcesManifestUrl = "./public/resources/manifest.json";

function normalizeNodeGraphResourcePath(path = "") {
  const text = String(path || "").trim().replace(/\\/g, "/").slice(0, 512);
  if (!text) {
    return "";
  }
  if (/^(?:https?:|data:|blob:)/i.test(text)) {
    return text;
  }
  if (text.startsWith("./") || text.startsWith("/")) {
    return text;
  }
  return `./public/resources/${text.replace(/^public\/resources\//, "")}`;
}

function normalizeNodeGraphResourceEntry(entry = {}) {
  const source = entry && typeof entry === "object" ? entry : {};
  const id = typeof normalizeNodeGraphSampleId === "function"
    ? normalizeNodeGraphSampleId(source.id || source.resourceId)
    : String(source.id || source.resourceId || "").trim();
  if (!id) {
    return null;
  }
  const kind = typeof normalizeNodeGraphAssetKind === "function"
    ? normalizeNodeGraphAssetKind(source.kind)
    : String(source.kind || "audio").trim().toLowerCase();
  const path = normalizeNodeGraphResourcePath(source.path || source.url || source.sourcePath);
  if (!path) {
    return null;
  }
  const nameFromPath = typeof nodeGraphAssetFileNameFromPath === "function"
    ? nodeGraphAssetFileNameFromPath(path)
    : path.split("/").pop();
  const metadata = typeof normalizeNodeGraphAssetMetadata === "function"
    ? normalizeNodeGraphAssetMetadata(source.metadata)
    : {};
  const file = typeof normalizeNodeGraphAssetFile === "function"
    ? normalizeNodeGraphAssetFile(source.file, {
      name: source.name || nameFromPath || id,
      sourceName: source.sourceName || nameFromPath || id,
      sourcePath: path,
    })
    : { name: source.name || nameFromPath || id, sourcePath: path };
  return {
    acceptedTypes: Array.isArray(source.acceptedTypes) && source.acceptedTypes.length
      ? source.acceptedTypes.map((value) => String(value || "").trim()).filter(Boolean).slice(0, 16)
      : [`${kind}/*`],
    file,
    id,
    kind,
    metadata,
    name: String(source.name || file.name || nameFromPath || id).trim().slice(0, 160),
    path,
    resourceId: id,
    sourceName: String(source.sourceName || file.name || nameFromPath || id).trim().slice(0, 160),
    sourcePath: path,
  };
}

function normalizeNodeGraphResourceManifest(manifest = {}) {
  const source = manifest && typeof manifest === "object" ? manifest : {};
  const resources = Array.isArray(source.resources) ? source.resources : [];
  const map = new Map();
  for (const resource of resources) {
    const normalized = normalizeNodeGraphResourceEntry(resource);
    if (!normalized || map.has(normalized.id)) {
      continue;
    }
    map.set(normalized.id, normalized);
  }
  return {
    resources: [...map.values()],
    version: Math.max(1, Math.round(Number(source.version) || 1)),
  };
}

async function loadNodeGraphResourceManifest() {
  const fallback = normalizeNodeGraphResourceManifest();
  try {
    const response = await fetch(nodeGraphResourcesManifestUrl, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`resource manifest load failed (${response.status})`);
    }
    nodeGraphMvp.resources = normalizeNodeGraphResourceManifest(await response.json());
  } catch (error) {
    nodeGraphMvp.resources = fallback;
    nodeGraphMvp.resourceManifestError = String(error?.message || error || "");
  }
  nodeGraphMvp.resourceMap = new Map((nodeGraphMvp.resources?.resources || []).map((resource) => [resource.id, resource]));
  return nodeGraphMvp.resources;
}

function nodeGraphResourceById(resourceId) {
  const id = typeof normalizeNodeGraphSampleId === "function"
    ? normalizeNodeGraphSampleId(resourceId)
    : String(resourceId || "").trim();
  if (!id) {
    return null;
  }
  return nodeGraphMvp.resourceMap?.get?.(id) || null;
}

function nodeGraphSampleReferenceFromResource(resourceId) {
  const resource = nodeGraphResourceById(resourceId);
  if (!resource || resource.kind !== "audio") {
    return null;
  }
  return normalizeNodeGraphSampleReference({
    id: resource.id,
    kind: "audio",
    metadata: resource.metadata,
    name: resource.name,
    resourceId: resource.id,
    sourceName: resource.sourceName || resource.name,
    sourcePath: resource.path,
    file: resource.file,
  });
}
