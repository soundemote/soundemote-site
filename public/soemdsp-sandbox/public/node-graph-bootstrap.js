async function initNodeGraphMvp() {
  installNodeGraphDebugApi();
  configureNodeGraphDefaultPresetButton();
  await loadNodeGraphTooltips();
  await bindNodeGraphMvpEvents();
  if (typeof loadNodeGraphResourceManifest === "function") {
    await loadNodeGraphResourceManifest();
  }
  nodeGraphMvp.defaultPatch = await loadNodeGraphDefaultPresetPatch();
  let startupPatch = nodeGraphMvp.workingPatch || nodeGraphMvp.defaultPatch;
  let startupPatchDirtyState = nodeGraphMvp.workingPatch && ["saved", "edited", "untouched"].includes(nodeGraphMvp.patchDirtyState)
    ? nodeGraphMvp.patchDirtyState
    : "untouched";
  try {
    const sharePayload = typeof nodeGraphSharePayloadFromUrl === "function"
      ? nodeGraphSharePayloadFromUrl()
      : null;
    if (sharePayload?.project_data) {
      startupPatch = nodeGraphPatchFromShareProjectData(sharePayload.project_data);
      startupPatchDirtyState = "untouched";
    }
  } catch (error) {
    window.setTimeout(() => {
      if (typeof setNodeGraphScriptStatus === "function") {
        setNodeGraphScriptStatus(`share link failed: ${error?.message || error}`, false);
      }
    }, 0);
  }
  commitNodeGraphPatch(cloneNodeGraphPatch(startupPatch), {
    autosaveWorkingPatch: false,
    markPending: false,
    patchDirtyState: startupPatchDirtyState,
    record: false,
    status: "script synced",
  });
  resetNodeGraphStartupView();
  recordNodeGraphHistory();
  markNodeGraphRenderPending();
  applyNodeGraphZoom();
  renderNodeGraphGridToggle();
  bindNodeGraphMacroControlModuleEvents();
  bindNodeGraphKeyboardControllerModuleEvents();
  bindNodeGraphMetadataPopoverEvents();
  renderNodeGraphMacroControls();
  renderNodeGraphKeyboardControllerModules();
  renderNodeGraphModuleVisibilityToggles();
  renderNodeGraphPatchTimingControls();
  renderNodeGraphVisibilityMenuButton();
  bindNodeMetadataScriptBeforeUnload();
  scheduleNodeMetadataScriptParserSelfTestStatus();
  renderNodeGraphModuleScopeBrightnessControl();
  renderNodeGraphSnapGridButton();
  renderNodeGraphTooltipToggle();
  renderNodeGraphSliderVisibilityToggles();
  renderNodeGraphSliderLayout();
  ensureNodeGraphStartupModulesVisible();
  if (typeof applyNodeGraphWorkspaceWindowStates === "function") {
    applyNodeGraphWorkspaceWindowStates();
  }
  loadNodeMetadataKindTemplates();
  refreshNodeGraphLiveInputDevices();
  refreshNodeGraphLiveMicrophonePermissionState();
  navigator.mediaDevices?.addEventListener?.("devicechange", refreshNodeGraphLiveInputDevices);
}

function clearNodeGraphStartupPatchRecoveryStorage() {
  try {
    window.localStorage?.removeItem?.(nodeGraphDefaultPresetStorageKey);
  } catch {}
}

function ensureNodeGraphStartupModulesVisible() {
  const container = document.getElementById("nodeGraphNodes");
  if (!container || container.querySelector(".dsp-node")) {
    return;
  }
  clearNodeGraphStartupPatchRecoveryStorage();
  commitNodeGraphPatch(cloneNodeGraphPatch(nodeGraphDefaultPatch), {
    markPending: false,
    record: false,
    status: "startup default restored",
  });
}
