function renderNodeGraphHistoryControls() {
  const undo = document.getElementById("nodeUndoButton");
  const redo = document.getElementById("nodeRedoButton");
  if (!undo || !redo) {
    return;
  }
  const canUndo = nodeGraphMvp.historyIndex > 0;
  const canRedo = nodeGraphMvp.historyIndex < nodeGraphMvp.historySnapshots.length - 1;
  undo.disabled = !canUndo;
  redo.disabled = !canRedo;
  undo.title = nodeGraphTooltipText(canUndo ? "history.undo" : "history.undoUnavailable");
  redo.title = nodeGraphTooltipText(canRedo ? "history.redo" : "history.redoUnavailable");
}

function renderNodeGraphGridToggle() {
  const workspace = document.getElementById("nodeGraphWorkspace");
  const button = document.getElementById("nodeGridToggleButton");
  const visible = Boolean(nodeGraphMvp.gridVisible);
  workspace?.classList.toggle("grid-visible", visible);
  if (button) {
    button.textContent = visible ? "Hide Grid" : "Show Grid";
    button.setAttribute("aria-pressed", visible ? "true" : "false");
    button.title = nodeGraphTooltipText(visible ? "view.gridHide" : "view.gridShow");
  }
  syncNodeUserUiSettingsViewControls();
}

function renderNodeGraphSliderTextToggles() {
  const workspace = document.getElementById("nodeGraphWorkspace");
  const labelsButton = document.getElementById("nodeSliderLabelsToggleButton");
  const valuesButton = document.getElementById("nodeSliderValuesToggleButton");
  const handlesButton = document.getElementById("nodeSliderHandlesToggleButton");
  const labelsVisible = Boolean(nodeGraphMvp.sliderLabelsVisible);
  const valuesVisible = Boolean(nodeGraphMvp.sliderValuesVisible);
  const handlesVisible = Boolean(nodeGraphMvp.sliderHandlesVisible);
  workspace?.classList.toggle("hide-slider-labels", !labelsVisible);
  workspace?.classList.toggle("hide-slider-values", !valuesVisible);
  workspace?.classList.toggle("hide-slider-handles", !handlesVisible);
  if (labelsButton) {
    labelsButton.textContent = labelsVisible ? "Hide Labels" : "Show Labels";
    labelsButton.setAttribute("aria-pressed", labelsVisible ? "true" : "false");
    labelsButton.title = nodeGraphTooltipText(labelsVisible ? "view.sliderLabelsHide" : "view.sliderLabelsShow");
  }
  if (valuesButton) {
    valuesButton.textContent = valuesVisible ? "Hide Values" : "Show Values";
    valuesButton.setAttribute("aria-pressed", valuesVisible ? "true" : "false");
    valuesButton.title = nodeGraphTooltipText(valuesVisible ? "view.sliderValuesHide" : "view.sliderValuesShow");
  }
  if (handlesButton) {
    handlesButton.textContent = handlesVisible ? "Hide Slider" : "Show Slider";
    handlesButton.setAttribute("aria-pressed", handlesVisible ? "true" : "false");
    handlesButton.title = nodeGraphTooltipText(handlesVisible ? "view.sliderHandlesHide" : "view.sliderHandlesShow");
  }
}

function renderNodeGraphTooltipToggle() {
  const helpStack = document.querySelector(".node-help-stack");
  const help = document.getElementById("nodeInteractionHelp");
  const button = document.getElementById("nodeTooltipToggleButton");
  const visible = Boolean(nodeGraphMvp.tooltipVisible);
  helpStack?.classList.toggle("tips-hidden", !visible);
  if (!visible && help) {
    help.textContent = "";
  }
  if (button) {
    button.textContent = visible ? "Hide Tips" : "Show Tips";
    button.setAttribute("aria-pressed", visible ? "true" : "false");
    button.title = nodeGraphTooltipText(visible ? "view.tipsHide" : "view.tipsShow");
  }
}

function toggleNodeGraphGridVisibility() {
  nodeGraphMvp.gridVisible = !nodeGraphMvp.gridVisible;
  renderNodeGraphGridToggle();
}

function toggleNodeGraphTooltipVisibility() {
  nodeGraphMvp.tooltipVisible = !nodeGraphMvp.tooltipVisible;
  renderNodeGraphTooltipToggle();
}

function toggleNodeGraphSliderLabels() {
  nodeGraphMvp.sliderLabelsVisible = !nodeGraphMvp.sliderLabelsVisible;
  renderNodeGraphSliderTextToggles();
}

function toggleNodeGraphSliderValues() {
  nodeGraphMvp.sliderValuesVisible = !nodeGraphMvp.sliderValuesVisible;
  renderNodeGraphSliderTextToggles();
}

function toggleNodeGraphSliderHandles() {
  nodeGraphMvp.sliderHandlesVisible = !nodeGraphMvp.sliderHandlesVisible;
  renderNodeGraphSliderTextToggles();
}

function renderNodeVisibility() {
  for (const node of document.querySelectorAll(".dsp-node")) {
    node.classList.toggle("removed", !nodeGraphMvp.activeNodes.has(node.dataset.node));
  }
  drawNodeGraphWires();
}

function renderNodePalette() {
  for (const button of document.querySelectorAll("[data-palette-node]")) {
    button.classList.remove("active");
    button.setAttribute("aria-pressed", "false");
  }
}

function setNodeGraphViewMode(mode) {
  if (mode !== "script") {
    flushNodeGraphScriptCommit();
  }
  const settingsMode = mode === "settings";
  const scriptMode = mode === "script";
  const modularOnlyMode = mode === "modular-only";
  const modularMode = modularOnlyMode || (!settingsMode && !scriptMode);
  document.getElementById("nodeWiringPanel")?.classList.toggle("modular-only-view", modularOnlyMode);
  document.getElementById("nodeGraphWorkspace").hidden = !modularMode;
  document.getElementById("nodeScriptView").hidden = !scriptMode;
  document.getElementById("nodeSettingsView").hidden = !settingsMode;
  document.getElementById("nodeSettingsViewButton").classList.toggle("active", settingsMode);
  document.getElementById("nodeModularViewButton").classList.toggle("active", modularMode && !modularOnlyMode);
  document.getElementById("nodeModularOnlyViewButton").classList.toggle("active", modularOnlyMode);
  document.getElementById("nodeSettingsScriptViewButton").classList.toggle("active", scriptMode);
  document.getElementById("nodeSettingsViewButton").setAttribute("aria-pressed", String(settingsMode));
  document.getElementById("nodeModularViewButton").setAttribute("aria-pressed", String(modularMode && !modularOnlyMode));
  document.getElementById("nodeModularOnlyViewButton").setAttribute("aria-pressed", String(modularOnlyMode));
  document.getElementById("nodeSettingsScriptViewButton").setAttribute("aria-pressed", String(scriptMode));
  if (scriptMode) {
    syncNodeGraphScriptView();
  } else if (settingsMode) {
    syncNodeGraphSettingsView();
    scheduleNodeSettingsHeaderTextFit();
  } else {
    drawNodeGraphWires();
  }
}
