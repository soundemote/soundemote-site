function nodeGraphPatchFileName() {
  const info = normalizeNodeGraphPatchInfo(nodeGraphMvp.patch.info);
  const baseName = info.name || "soemdsp-patch";
  const tagName = info.tags && info.tags !== "tags"
    ? `-${info.tags}`
    : "";
  const safeName = `${baseName}${tagName}`
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${safeName || "soemdsp-patch"}.json`;
}

function nodeGraphVisualOutputFileName(fingerprint = nodeGraphMvp.rendered?.patchFingerprint || nodeGraphPatchFingerprint()) {
  const fingerprintSuffix = fingerprint ? `-${fingerprint}` : "";
  return nodeGraphPatchFileName().replace(/\.json$/i, `${fingerprintSuffix}-visual.png`);
}

function saveNodeGraphScript() {
  if (!nodeGraphScriptReadyForGraphAction("save")) {
    return;
  }
  const blob = new Blob([`${serializeNodeGraphPatch()}\n`], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nodeGraphPatchFileName();
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
  setNodeGraphScriptStatus("script saved", true);
}

function loadNodeGraphScript() {
  if (!nodeGraphScriptReadyForGraphAction("load")) {
    return;
  }
  document.getElementById("nodePatchScriptFileInput")?.click();
}

function handleNodeGraphScriptFileLoad(event) {
  const [file] = event.currentTarget.files || [];
  if (!file) {
    return;
  }
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      commitNodeGraphPatch(loadNodeGraphPatchFromScript(String(reader.result || "")), {
        status: "script loaded",
      });
    } catch (error) {
      setNodeGraphScriptStatus(error.message, false);
    } finally {
      event.currentTarget.value = "";
    }
  });
  reader.addEventListener("error", () => {
    setNodeGraphScriptStatus("script file read failed", false);
    event.currentTarget.value = "";
  });
  reader.readAsText(file);
}
