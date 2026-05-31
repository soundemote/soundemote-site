function setNodeUiDevHelperVisible(visible) {
  const helper = document.getElementById("nodeUiDevHelper");
  const button = document.getElementById("nodeUiDevButton");
  if (!helper || !button) {
    return;
  }
  helper.hidden = !visible;
  button.classList.toggle("active", visible);
  button.setAttribute("aria-pressed", String(visible));
  setNodeInteractionHelp(
    visible
      ? "UIDEV helper open. Future UI tuning controls can live in this floating window."
      : "UIDEV helper closed.",
  );
}

function toggleNodeUiDevHelper() {
  const helper = document.getElementById("nodeUiDevHelper");
  setNodeUiDevHelperVisible(Boolean(helper?.hidden));
}

function setNodeUserUiSettingsVisible(visible) {
  const panel = document.getElementById("nodeUserUiSettingsPanel");
  const button = document.getElementById("nodeUserUiSettingsButton");
  if (!panel || !button) {
    return;
  }
  panel.hidden = !visible;
  button.classList.toggle("active", visible);
  button.setAttribute("aria-pressed", String(visible));
  if (visible) {
    renderNodeUserUiSettingsControls();
  }
}

function toggleNodeUserUiSettings() {
  const panel = document.getElementById("nodeUserUiSettingsPanel");
  setNodeUserUiSettingsVisible(Boolean(panel?.hidden));
}

function installNodeUiDevExposeControls() {
  for (const definition of nodeUiDevSettingControls) {
    const input = document.getElementById(definition.id);
    const row = input?.closest?.(".node-ui-dev-control, .node-ui-dev-color-control, .node-ui-dev-check");
    if (!row || row.querySelector("[data-node-ui-dev-expose]")) {
      continue;
    }
    row.classList.add("has-expose");
    const label = document.createElement("label");
    label.className = "node-ui-dev-expose";
    label.title = "Show this control in the user UI settings panel.";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = nodeUiDevExposeCheckboxId(definition.key);
    checkbox.dataset.nodeUiDevExpose = definition.key;
    checkbox.checked = Boolean(definition.exposeDefault);
    checkbox.setAttribute("aria-label", `Expose ${nodeUiDevControlLabel(definition)} in UI settings`);
    label.append(checkbox);
    row.append(label);
    checkbox.addEventListener("change", () => {
      renderNodeUserUiSettingsControls();
      setNodeUiDevSettingsStatus(
        checkbox.checked ? "control exposed to ui settings" : "control hidden from ui settings",
        true,
      );
    });
  }
}

function organizeNodeUiDevSections() {
  const helperBody = document.querySelector(".node-ui-dev-helper-body");
  if (!helperBody || helperBody.dataset.sectionsOrganized === "true") {
    return;
  }
  const sections = [
    {
      title: "workspace",
      ids: [
        "nodeUiDevModularHeaderButtonBackground",
        "nodeUiDevTooltipTextSize",
        "nodeUiDevMinimumGridBrightness",
        "nodeUiDevModuleLightSpread",
        "nodeUiDevModuleGridInset",
        "nodeUiDevModuleRoundness",
        "nodeUiDevGridColor",
        "nodeUiDevWorkspaceBackgroundColor",
      ],
    },
    {
      title: "settings header",
      ids: [
        "nodeUiDevSettingsHeaderTextSize",
        "nodeUiDevButtonTextSize",
        "nodeUiDevSettingsHeaderTopRatio",
        "nodeUiDevSettingsHeaderPadding",
        "nodeUiDevSettingsHeaderHighlights",
      ],
    },
    {
      title: "modules and nodes",
      ids: [
        "nodeUiDevModuleTitleFont",
        "nodeUiDevModuleTitleHeight",
        "nodeUiDevModuleTitleTextFill",
        "nodeUiDevModuleIoSectionHeight",
        "nodeUiDevLiveToggleTextSize",
        "nodeUiDevModuleNodeSize",
        "nodeUiDevNodeGlowSize",
        "nodeUiDevSliderDotSize",
        "nodeUiDevWirePatchPointSize",
        "nodeUiDevWireThickness",
      ],
    },
    {
      title: "bypass",
      ids: [
        "nodeUiDevBypassIconSize",
        "nodeUiDevBypassIconGlowSpread",
        "nodeUiDevBypassIconGlowColor",
        "nodeUiDevBypassIconOnColor",
        "nodeUiDevBypassOnBackgroundColor",
        "nodeUiDevBypassOffBackgroundColor",
      ],
    },
    {
      title: "icons",
      ids: [
        "nodeUiDevMoveSymbolSize",
        "nodeUiDevCloseIconSize",
      ],
    },
  ];
  const rowForId = (id) => document
    .getElementById(id)
    ?.closest(".node-ui-dev-control, .node-ui-dev-color-control, .node-ui-dev-check");
  for (const section of sections) {
    const rows = section.ids.map(rowForId).filter(Boolean);
    if (!rows.length) {
      continue;
    }
    const details = document.createElement("details");
    details.className = "node-ui-dev-section";
    details.open = true;
    const summary = document.createElement("summary");
    summary.textContent = section.title;
    const body = document.createElement("div");
    body.className = "node-ui-dev-section-body";
    rows[0].before(details);
    details.append(summary, body);
    for (const row of rows) {
      body.append(row);
    }
  }
  helperBody.dataset.sectionsOrganized = "true";
}
