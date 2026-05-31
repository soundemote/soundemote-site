function nodeUserUiSettingsMirrorValue(definition) {
  const input = document.getElementById(definition.id);
  if (!input) {
    return definition.defaultValue;
  }
  return definition.type === "boolean" ? input.checked : input.value;
}

let nodeUserUiSettingsActiveMirrorKey = null;

function dispatchNodeUiDevControlInput(source, commit = false) {
  source.dispatchEvent(new Event("input", { bubbles: true }));
  if (commit) {
    source.dispatchEvent(new Event("change", { bubbles: true }));
  }
}

function createNodeUserUiSettingsControl(definition) {
  const source = document.getElementById(definition.id);
  if (!source) {
    return null;
  }
  const row = document.createElement("label");
  row.className = `node-user-ui-setting-control ${definition.type}`;
  const title = document.createElement("span");
  title.textContent = nodeUiDevControlLabel(definition);
  row.append(title);

  if (definition.type === "boolean") {
    const input = document.createElement("input");
    input.type = "checkbox";
    input.dataset.nodeUiDevMirror = definition.key;
    input.checked = Boolean(nodeUserUiSettingsMirrorValue(definition));
    input.addEventListener("change", () => {
      source.checked = input.checked;
      dispatchNodeUiDevControlInput(source, true);
    });
    row.append(input);
    return row;
  }

  const input = definition.type === "select"
    ? document.createElement("select")
    : document.createElement("input");
  if (definition.type === "select") {
    for (const optionDefinition of definition.options || []) {
      const option = document.createElement("option");
      option.value = optionDefinition.value;
      option.textContent = optionDefinition.label;
      input.append(option);
    }
  } else {
    input.type = definition.type === "color" ? "color" : "range";
  }
  input.value = String(nodeUserUiSettingsMirrorValue(definition));
  input.dataset.nodeUiDevMirror = definition.key;
  if (definition.type === "number") {
    input.min = String(definition.min);
    input.max = String(definition.max);
    input.step = "1";
  }
  const output = definition.type === "number"
    ? document.createElement("input")
    : document.createElement("output");
  if (definition.type === "number") {
    output.type = "number";
    output.min = String(definition.min);
    output.max = String(definition.max);
    output.step = "1";
    output.dataset.nodeUiDevMirrorValue = definition.key;
    output.value = input.value;
  } else {
    output.textContent = definition.type === "select"
      ? nodeUiDevSelectLabel(definition, input.value)
      : input.value;
  }
  const syncOutput = () => {
    if (definition.type === "number") {
      output.value = input.value;
      return;
    }
    output.textContent = definition.type === "select"
        ? nodeUiDevSelectLabel(definition, input.value)
        : `${input.value}`;
  };
  const claimControl = () => {
    nodeUserUiSettingsActiveMirrorKey = definition.key;
  };
  const releaseControl = () => {
    window.setTimeout(() => {
      if (nodeUserUiSettingsActiveMirrorKey === definition.key) {
        nodeUserUiSettingsActiveMirrorKey = null;
      }
    }, 0);
  };
  input.addEventListener("pointerdown", claimControl);
  input.addEventListener("focus", claimControl);
  input.addEventListener("pointerup", releaseControl);
  input.addEventListener("pointercancel", releaseControl);
  input.addEventListener("blur", releaseControl);
  input.addEventListener("input", () => {
    claimControl();
    source.value = input.value;
    dispatchNodeUiDevControlInput(source, false);
    syncOutput();
  });
  input.addEventListener("change", () => {
    source.value = input.value;
    dispatchNodeUiDevControlInput(source, true);
    syncOutput();
  });
  if (definition.type === "number") {
    output.addEventListener("pointerdown", claimControl);
    output.addEventListener("focus", claimControl);
    output.addEventListener("blur", releaseControl);
    output.addEventListener("input", () => {
      claimControl();
      const value = normalizeNodeUiDevControlValue(definition, output.value);
      input.value = String(value);
      source.value = String(value);
      dispatchNodeUiDevControlInput(source, false);
    });
    output.addEventListener("change", () => {
      const value = normalizeNodeUiDevControlValue(definition, output.value);
      output.value = String(value);
      input.value = String(value);
      source.value = String(value);
      dispatchNodeUiDevControlInput(source, true);
    });
  }
  row.append(input, output);
  return row;
}

function createNodeUserUiSettingsViewControl() {
  const row = document.createElement("label");
  row.className = "node-user-ui-setting-control boolean";
  const title = document.createElement("span");
  title.textContent = "Show grid";
  const input = document.createElement("input");
  input.type = "checkbox";
  input.dataset.nodeUiViewSetting = "gridVisible";
  input.checked = Boolean(nodeGraphMvp.gridVisible);
  input.addEventListener("change", () => {
    nodeGraphMvp.gridVisible = Boolean(input.checked);
    renderNodeGraphGridToggle();
  });
  row.append(title, input);
  return row;
}

function renderNodeUserUiSettingsControls() {
  const container = document.getElementById("nodeUserUiSettingsControls");
  if (!container) {
    return;
  }
  container.textContent = "";
  container.append(createNodeUserUiSettingsViewControl());
  const exposedDefinitions = nodeUiDevSettingControls.filter((definition) => nodeUiDevControlIsExposed(definition.key));
  if (!exposedDefinitions.length) {
    return;
  }
  for (const definition of exposedDefinitions) {
    const control = createNodeUserUiSettingsControl(definition);
    if (control) {
      container.append(control);
    }
  }
}

function syncNodeUserUiSettingsViewControls() {
  for (const input of document.querySelectorAll("[data-node-ui-view-setting='gridVisible']")) {
    if (document.activeElement === input) {
      continue;
    }
    input.checked = Boolean(nodeGraphMvp.gridVisible);
  }
}

function syncNodeUserUiSettingsMirrorControls() {
  syncNodeUserUiSettingsViewControls();
  for (const input of document.querySelectorAll("[data-node-ui-dev-mirror]")) {
    if (
      document.activeElement === input ||
      (nodeUserUiSettingsActiveMirrorKey && nodeUserUiSettingsActiveMirrorKey === input.dataset.nodeUiDevMirror)
    ) {
      continue;
    }
    const definition = nodeUiDevSettingControls.find((candidate) => candidate.key === input.dataset.nodeUiDevMirror);
    if (!definition) {
      continue;
    }
    const source = document.getElementById(definition.id);
    if (!source) {
      continue;
    }
    if (definition.type === "boolean") {
      input.checked = Boolean(source.checked);
    } else {
      input.value = String(source.value);
      const output = input.parentElement?.querySelector("output, [data-node-ui-dev-mirror-value]");
      if (output) {
        if (definition.type === "number") {
          output.value = input.value;
        } else {
          output.textContent = definition.type === "select"
            ? nodeUiDevSelectLabel(definition, input.value)
            : input.value;
        }
      }
    }
  }
}
