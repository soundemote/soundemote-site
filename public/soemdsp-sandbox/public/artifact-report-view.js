function renderArtifactCoverage(manifest) {
  const links = manifest.artifactLinks || [];
  const phases = manifest.phases || [];
  const handoff = manifest.sandboxHandoff || {};
  const phaseReportCount = countArtifactKind(links, "phase-report");
  const missingPathCount = links.filter((link) => !link.path).length;
  const entryPointPath = findArtifactPath(links, "entry-point");
  const primaryAudioPath = findArtifactPath(links, "audio");
  const entryPointMatches = entryPointPath === handoff.entryPoint;
  const primaryAudioMatches = primaryAudioPath === handoff.primaryAudioArtifact;
  const phaseReportIssue = phaseReportCoverageIssue(manifest);
  const rows = [
    ["total links", String(links.length)],
    ["missing paths", String(missingPathCount), 0],
    ["reachability method", "HEAD", "HEAD"],
    ["entry point", String(countArtifactKind(links, "entry-point")), 1],
    ["entry point path", entryPointMatches ? "match" : "mismatch", "match"],
    ["audio", String(countArtifactKind(links, "audio")), 1],
    ["audio path", primaryAudioMatches ? "match" : "mismatch", "match"],
    ["manifest", String(countArtifactKind(links, "manifest")), 1],
    ["text summary", String(countArtifactKind(links, "text-summary")), 1],
    ["wav report", String(countArtifactKind(links, "wav-report")), 1],
    ["phase reports", String(phaseReportCount), phases.length],
    ["phase report coverage", phaseReportIssue === "" ? "match" : phaseReportIssue, "match"],
  ];
  const ok =
    links.length > 0 &&
    missingPathCount === 0 &&
    countArtifactKind(links, "entry-point") === 1 &&
    countArtifactKind(links, "audio") === 1 &&
    entryPointMatches &&
    primaryAudioMatches &&
    countArtifactKind(links, "manifest") === 1 &&
    countArtifactKind(links, "text-summary") === 1 &&
    countArtifactKind(links, "wav-report") === 1 &&
    phaseReportCount === phases.length &&
    phaseReportIssue === "";

  setStatus("artifactCoverageStatus", ok ? "Complete" : "Check", ok);
  renderKeyValue(document.getElementById("artifactCoverage"), rows);
}

function renderUnavailableArtifactCoverage() {
  renderKeyValue(document.getElementById("artifactCoverage"), [
    ["artifact links", "unavailable", "available"],
    ["entry point", "unavailable", "present"],
    ["audio", "unavailable", "present"],
    ["phase reports", "unavailable", "present"],
  ]);
}

function renderSource(response) {
  const info = response.manifestInfo || {};
  const hasPath = Boolean(response.manifestPath);
  const hasRoot = Boolean(response.artifactRoot);
  const bytes = Number(info.bytes);
  const hasBytes = Number.isFinite(bytes) && bytes > 0;
  const modified = formatTimestamp(info.modifiedUtc);
  const hasModified = modified !== "missing" && modified !== "invalid";
  const headers = response.responseHeaders || {};
  const cacheControl = headers.cacheControl || "missing";
  const pragma = headers.pragma || "missing";
  const expires = headers.expires || "missing";
  const cacheOk =
    cacheControl.includes("no-store") &&
    pragma === "no-cache" &&
    expires === "0";
  const ok = hasPath && hasRoot && hasBytes && hasModified && cacheOk;
  const httpStatus = formatHttpStatus(response.responseStatus, response.responseStatusText);
  const loadedAt = formatTimestamp(new Date().toISOString());

  setStatus("sourceStatus", ok ? "Loaded" : "Check", ok);
  setSourceText("manifestPath", "Manifest", response.manifestPath || "missing", "present", hasPath);
  setSourceText("sourceError", "Source Error", "none", "none", true);
  setSourceText("sourceDetail", "Source Detail", "none", "none", true);
  setSourceText("manifestHttpStatus", "HTTP Status", httpStatus, "200 OK", response.responseStatus === 200);
  setSourceText("artifactRoot", "Artifact Root", response.artifactRoot || "missing", "present", hasRoot);
  setSourceText("manifestBytes", "Manifest Bytes", hasBytes ? formatBytes(bytes) : "missing", "positive", hasBytes);
  setSourceText("manifestModified", "Manifest Modified", modified, "valid timestamp", hasModified);
  setSourceText("manifestLoadedAt", "Response Loaded", loadedAt, "valid timestamp", loadedAt !== "missing" && loadedAt !== "invalid");
  setSourceText("manifestCacheControl", "Cache Control", cacheControl, "no-store", cacheControl.includes("no-store"));
  setSourceText("manifestPragma", "Pragma", pragma, "no-cache", pragma === "no-cache");
  setSourceText("manifestExpires", "Expires", expires, "0", expires === "0");
}
