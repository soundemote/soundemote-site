async function initNodeGraphMvp() {
  installNodeGraphDebugApi();
  configureNodeGraphDefaultPresetButton();
  await loadNodeGraphTooltips();
  await bindNodeGraphMvpEvents();
  nodeGraphMvp.defaultPatch = await loadNodeGraphDefaultPresetPatch();
  const earProtectionRecovery = typeof nodeGraphConsumeEarProtectionPatchRecovery === "function"
    ? nodeGraphConsumeEarProtectionPatchRecovery()
    : null;
  const recoveryPatchUsable = typeof nodeGraphDefaultPresetPatchIsUsable === "function"
    ? nodeGraphDefaultPresetPatchIsUsable(earProtectionRecovery?.patch)
    : Boolean(earProtectionRecovery?.patch);
  commitNodeGraphPatch(cloneNodeGraphPatch(recoveryPatchUsable ? earProtectionRecovery.patch : nodeGraphMvp.defaultPatch), {
    markPending: false,
    record: false,
    status: recoveryPatchUsable ? "ear protection patch restored" : "script synced",
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
  renderNodeGraphModuleScopeBrightnessControl();
  renderNodeGraphSnapGridButton();
  renderNodeGraphTooltipToggle();
  renderNodeGraphSliderVisibilityToggles();
  renderNodeGraphSliderLayout();
  ensureNodeGraphStartupModulesVisible();
  loadNodeMetadataKindTemplates();
  refreshNodeGraphLiveInputDevices();
  refreshNodeGraphLiveMicrophonePermissionState();
  navigator.mediaDevices?.addEventListener?.("devicechange", refreshNodeGraphLiveInputDevices);
}

function clearNodeGraphStartupPatchRecoveryStorage() {
  try {
    window.localStorage?.removeItem?.(nodeGraphDefaultPresetStorageKey);
  } catch {}
  try {
    const stores = typeof nodeGraphEarProtectionRecoveryStores === "function"
      ? nodeGraphEarProtectionRecoveryStores()
      : [];
    for (const store of stores) {
      store.removeItem(nodeGraphEarProtectionPatchRecoveryStorageKey);
    }
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
