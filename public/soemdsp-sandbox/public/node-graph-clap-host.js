const nodeGraphClapHostDefaultPort = 47991;
const nodeGraphClapHostName = "Soundemote WebUI CLAP Host";

const nodeGraphClapHostState = {
  status: "disconnected",
  baseUrl: `http://127.0.0.1:${nodeGraphClapHostDefaultPort}`,
  version: "",
  plugins: [],
  pluginCount: null,
  parameterPayloads: new Map(),
  parameterWriteTimers: new Map(),
  lastError: "",
};

function setNodeGraphClapHostStatus(status, detail = "") {
  nodeGraphClapHostState.status = status;
  const statusElement = document.getElementById("nodeClapHostStatus");
  const detailElement = document.getElementById("nodeClapHostDetail");
  const connectButton = document.getElementById("nodeClapHostConnectButton");
  const pluginsButton = document.getElementById("nodeClapHostPluginsButton");
  if (!statusElement || !detailElement || !connectButton) return;

  statusElement.classList.toggle("warn", status !== "connected");
  statusElement.classList.toggle("error", status === "error");
  connectButton.disabled = status === "connecting";
  if (pluginsButton) {
    pluginsButton.disabled = status !== "connected";
  }

  if (status === "connected") {
    const versionText = nodeGraphClapHostState.version
      ? ` ${nodeGraphClapHostState.version}`
      : "";
    statusElement.textContent = `CLAP Host: Connected${versionText}`;
    detailElement.textContent = detail || "local companion answered health check";
    syncNodeGraphClapPluginElements();
    return;
  }
  if (status === "connecting") {
    statusElement.textContent = "CLAP Host: Connecting";
    detailElement.textContent = "checking localhost";
    syncNodeGraphClapPluginElements();
    return;
  }
  if (status === "error") {
    statusElement.textContent = "CLAP Host: Error";
    detailElement.textContent = detail || nodeGraphClapHostState.lastError || "connection failed";
    syncNodeGraphClapPluginElements();
    return;
  }
  statusElement.textContent = "CLAP Host: Disconnected";
  detailElement.textContent = detail || "run the local companion, then connect";
  syncNodeGraphClapPluginElements();
}

function nodeGraphClapPluginCountText(count) {
  const label = count === 1 ? "entry" : "entries";
  return `${count} CLAP plugin ${label} discovered; select a plugin to create a host instance`;
}

function nodeGraphClapPluginCatalogText(plugins) {
  const pluginList = Array.isArray(plugins) ? plugins : [];
  const inspectedCount = pluginList.filter((plugin) => plugin?.metadataInspected).length;
  const descriptorCount = pluginList.filter(
    (plugin) => plugin?.metadataInspected && !plugin?.metadataError
  ).length;
  const instantiationTestedCount = pluginList.filter(
    (plugin) => plugin?.instantiationTested
  ).length;
  const instantiableCount = pluginList.filter((plugin) => plugin?.instantiable).length;
  if (instantiationTestedCount > 0) {
    return `${pluginList.length} CLAP plugin entries discovered; ${descriptorCount} descriptors inspected; ${instantiableCount} init probes passed; bounded Render Sample processing available`;
  }
  if (inspectedCount > 0) {
    return `${pluginList.length} CLAP plugin entries discovered; ${descriptorCount} descriptors inspected; create an instance to enable bounded Render Sample processing`;
  }
  return nodeGraphClapPluginCountText(pluginList.length);
}

async function fetchNodeGraphClapHostJson(path, timeoutMs = 1400, options = {}) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${nodeGraphClapHostState.baseUrl}${path}`, {
      cache: "no-store",
      ...options,
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } finally {
    window.clearTimeout(timeout);
  }
}

async function postNodeGraphClapHostJson(path, payload = {}, timeoutMs = 1800) {
  return fetchNodeGraphClapHostJson(path, timeoutMs, {
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
}

async function deleteNodeGraphClapHostJson(path, timeoutMs = 1400) {
  return fetchNodeGraphClapHostJson(path, timeoutMs, { method: "DELETE" });
}

function nodeGraphClapPluginOptionLabel(plugin = {}) {
  const vendor = String(plugin.vendor || "").trim();
  const name = String(plugin.name || plugin.path || "CLAP plugin").trim();
  return vendor ? `${vendor} - ${name}` : name;
}

function nodeGraphClapPluginBindingFromCatalog(plugin = {}) {
  return normalizeNodeGraphClapPluginBinding({
    catalogId: plugin.id,
    clapId: plugin.clapId,
    name: plugin.name,
    path: plugin.path,
    vendor: plugin.vendor,
  });
}

function nodeGraphClapParameterPayload(instanceId = "") {
  return nodeGraphClapHostState.parameterPayloads.get(String(instanceId || "")) || null;
}

function nodeGraphClapParameterKey(parameter = {}) {
  const id = Number(parameter.id);
  if (Number.isFinite(id)) {
    return `clap_${Math.round(id)}`;
  }
  const index = Number(parameter.index);
  return `clap_index_${Number.isFinite(index) ? Math.round(index) : 0}`;
}

function nodeGraphClapParameterMetadata(parameter = {}) {
  const range = nodeGraphClapParameterRange(parameter);
  const value = nodeGraphClapParameterValue(parameter);
  const stepped = Array.isArray(parameter.flagNames) && (
    parameter.flagNames.includes("stepped") ||
    parameter.flagNames.includes("enum")
  );
  const label = String(parameter.name || `Param ${parameter.index ?? parameter.id ?? 0}`).trim();
  const clapParamId = Number(parameter.id);
  const clapParamIndex = Number(parameter.index);
  return normalizeNodeGraphPatchParameterMetadata("clapPlugin", nodeGraphClapParameterKey(parameter), {
    clapParamId: Number.isFinite(clapParamId) ? Math.round(clapParamId) : undefined,
    clapParamIndex: Number.isFinite(clapParamIndex) ? Math.round(clapParamIndex) : undefined,
    clapParamName: label,
    def: Number.isFinite(Number(parameter.default)) ? Number(parameter.default) : value,
    displayChoices: false,
    divideChoicesVisibly: false,
    kind: "decimal",
    linearSmoothing: true,
    max: range.max,
    maxDigits: 6,
    mid: Number.isFinite(Number(parameter.default)) ? Number(parameter.default) : (range.min + range.max) / 2,
    min: range.min,
    nonlinearSlider: false,
    showSign: range.min < 0,
    step: stepped ? 1 : 0,
    unit: "",
    wraparound: false,
  });
}

function nodeGraphClapParameterDefinition(parameter = {}) {
  const metadata = nodeGraphClapParameterMetadata(parameter);
  const label = String(parameter.name || `Param ${parameter.index ?? parameter.id ?? 0}`).trim();
  return {
    ...metadata,
    defaultValue: metadata.def,
    key: nodeGraphClapParameterKey(parameter),
    label,
  };
}

function nodeGraphClapPatchParametersFromPayload(payload = {}) {
  return (Array.isArray(payload.parameters) ? payload.parameters : [])
    .map(nodeGraphClapParameterDefinition)
    .filter((parameter) => parameter?.key);
}

function nodeGraphCommitClapPluginParameterPayload(nodeId, payload = {}) {
  const parameters = nodeGraphClapPatchParametersFromPayload(payload);
  if (!parameters.length) {
    return false;
  }
  const patch = cloneNodeGraphPatch(nodeGraphMvp.patch);
  const patchNode = patch.nodes.find((node) => node.id === nodeId && node.type === "clapPlugin");
  if (!patchNode) {
    return false;
  }
  patchNode.paramMeta = { ...(patchNode.paramMeta || {}) };
  patchNode.params = { ...(patchNode.params || {}) };
  for (const parameter of parameters) {
    patchNode.paramMeta[parameter.key] = parameter;
    const current = Number(
      payload.parameters.find((candidate) => nodeGraphClapParameterKey(candidate) === parameter.key)?.current,
    );
    patchNode.params[parameter.key] = normalizeNodeGraphPatchParameter(
      patchNode.type,
      parameter.key,
      Object.hasOwn(patchNode.params, parameter.key) ? patchNode.params[parameter.key] : current,
      patchNode.paramMeta[parameter.key],
    );
  }
  commitNodeGraphPatch(patch, {
    record: false,
    status: "CLAP parameters synced",
  });
  return true;
}

function syncNodeGraphClapPatchParameterFromHostSlider(nodeId, parameter, value) {
  const patchNode = nodeGraphMvp.patch.nodes.find((node) => node.id === nodeId && node.type === "clapPlugin");
  if (!patchNode) {
    return;
  }
  const key = nodeGraphClapParameterKey(parameter);
  const metadata = nodeGraphClapParameterMetadata(parameter);
  patchNode.paramMeta = {
    ...(patchNode.paramMeta || {}),
    [key]: metadata,
  };
  patchNode.params = {
    ...(patchNode.params || {}),
    [key]: normalizeNodeGraphPatchParameter("clapPlugin", key, value, metadata),
  };
  syncNodeGraphScriptView("CLAP parameter synced", true);
  renderNodeGraphExecutionPlanDebug();
  markNodeGraphRenderPending();
}

async function syncStoredNodeGraphClapParametersToHost(nodeId, binding, payload = {}) {
  const patchNode = nodeGraphPatchNode(nodeId);
  if (!patchNode || !binding.instanceId || !Array.isArray(payload.parameters)) {
    return false;
  }
  const parameters = [];
  for (const parameter of payload.parameters) {
    const key = nodeGraphClapParameterKey(parameter);
    if (!Object.hasOwn(patchNode.params || {}, key)) {
      continue;
    }
    const value = Number(patchNode.params[key]);
    if (!Number.isFinite(value) || Math.abs(value - Number(parameter.current)) < 1e-9) {
      continue;
    }
    parameters.push({ paramId: Number(parameter.id), value });
  }
  if (!parameters.length) {
    return false;
  }
  await postNodeGraphClapHostJson(
    `/instances/${encodeURIComponent(binding.instanceId)}/params`,
    { parameters },
    5000,
  );
  return true;
}

function nodeGraphClapParameterValue(parameter = {}) {
  const current = Number(parameter.current);
  if (Number.isFinite(current)) {
    return current;
  }
  const fallback = Number(parameter.default);
  return Number.isFinite(fallback) ? fallback : 0;
}

function nodeGraphClapParameterRange(parameter = {}) {
  const min = Number(parameter.min);
  const max = Number(parameter.max);
  const value = nodeGraphClapParameterValue(parameter);
  const safeMin = Number.isFinite(min) ? min : Math.min(0, value);
  const safeMax = Number.isFinite(max) && max > safeMin ? max : safeMin + 1;
  return { max: safeMax, min: safeMin };
}

function formatNodeGraphClapParameterValue(parameter = {}, value = nodeGraphClapParameterValue(parameter)) {
  const display = String(parameter.display || "").trim();
  if (display && Math.abs(Number(parameter.current) - Number(value)) < 1e-9) {
    return display;
  }
  if (!Number.isFinite(Number(value))) {
    return "";
  }
  const absolute = Math.abs(Number(value));
  return absolute >= 1000 || (absolute > 0 && absolute < 0.001)
    ? Number(value).toExponential(4)
    : Number(value).toFixed(6).replace(/0+$/, "").replace(/\.$/, "");
}

function nodeGraphClapSelectedCatalogPlugin(patchNode) {
  const binding = normalizeNodeGraphClapPluginBinding(patchNode?.clap);
  if (!binding.catalogId) {
    return null;
  }
  return nodeGraphClapHostState.plugins.find((plugin) => plugin.id === binding.catalogId) || null;
}

function nodeGraphCommitClapPluginBinding(nodeId, clap, options = {}) {
  const patch = cloneNodeGraphPatch(nodeGraphMvp.patch);
  const patchNode = patch.nodes.find((node) => node.id === nodeId && node.type === "clapPlugin");
  if (!patchNode) {
    return false;
  }
  patchNode.clap = normalizeNodeGraphClapPluginBinding(clap);
  if (options.clearParameters) {
    patchNode.params = {};
    patchNode.paramMeta = {};
  }
  commitNodeGraphPatch(patch, { status: "CLAP plugin updated" });
  return true;
}

function createNodeGraphClapParameterRow(nodeId, binding, parameter) {
  const definition = nodeGraphClapParameterDefinition(parameter);
  const row = document.createElement("div");
  row.className = "node-clap-plugin-param-row node-parameter-row";
  row.dataset.clapParamId = String(parameter.id);
  row.dataset.param = definition.key;

  row.append(createNodeParameterModulationPort(nodeId, "clapPlugin", definition));

  const control = document.createElement("label");
  control.className = "node-parameter-control node-clap-plugin-param-control";
  control.dataset.paramLabel = definition.label;
  control.setAttribute("aria-label", definition.label);

  const header = document.createElement("span");
  header.className = "node-clap-plugin-param-header";
  const name = document.createElement("span");
  name.className = "node-clap-plugin-param-name";
  name.textContent = definition.label;
  const valueText = document.createElement("span");
  valueText.className = "node-clap-plugin-param-value";
  const key = definition.key;
  const patchNode = nodeGraphPatchNode(nodeId);
  const patchValue = Number(patchNode?.params?.[key]);
  const value = Number.isFinite(patchValue) ? patchValue : nodeGraphClapParameterValue(parameter);
  valueText.textContent = formatNodeGraphClapParameterValue(parameter, value);
  header.append(name, valueText);

  const input = document.createElement("input");
  input.type = "range";
  input.dataset.clapParamId = String(parameter.id);
  input.dataset.param = key;
  input.dataset.step = String(definition.step ?? 0);
  input.dataset.mid = String(definition.mid ?? definition.defaultValue ?? 0);
  input.dataset.default = String(definition.defaultValue ?? 0);
  input.dataset.kind = definition.kind || "decimal";
  input.dataset.maxDigits = String(
    normalizeNodeGraphMetadataMaxDigits(definition.maxDigits, definition.kind),
  );
  input.dataset.unit = definition.unit ?? "";
  input.dataset.choices = formatNodeMetadataChoices(definition.choices || []);
  input.dataset.displayChoices = definition.displayChoices ? "true" : "false";
  input.dataset.divideChoicesVisibly = definition.divideChoicesVisibly ? "true" : "false";
  input.dataset.linearSmoothing = definition.linearSmoothing === false ? "false" : "true";
  input.dataset.nonlinearSlider = definition.nonlinearSlider ? "true" : "false";
  input.dataset.showSign = definition.showSign ? "true" : "false";
  input.dataset.wraparound = definition.wraparound ? "true" : "false";
  const range = nodeGraphClapParameterRange(parameter);
  input.min = String(range.min);
  input.max = String(range.max);
  input.step = Array.isArray(parameter.flagNames) && (
    parameter.flagNames.includes("stepped") ||
    parameter.flagNames.includes("enum")
  ) ? "1" : "any";
  input.value = String(Math.max(range.min, Math.min(range.max, value)));
  input.disabled = Array.isArray(parameter.flagNames) && parameter.flagNames.includes("readonly");
  input.addEventListener("input", () => {
    valueText.textContent = formatNodeGraphClapParameterValue(parameter, Number(input.value));
    syncNodeGraphClapPatchParameterFromHostSlider(nodeId, parameter, Number(input.value));
    queueNodeGraphClapParameterWrite(nodeId, binding.instanceId, Number(parameter.id), Number(input.value));
  });

  control.append(header, input);
  row.append(control);
  row.append(createNodeParameterOutputPort(nodeId, "clapPlugin", definition));
  return row;
}

function createNodeGraphClapPluginBody(nodeId) {
  const body = document.createElement("div");
  body.className = "dsp-node-body node-clap-plugin-body";
  body.dataset.clapPluginNode = nodeId;

  const select = document.createElement("select");
  select.className = "node-clap-plugin-select";
  select.dataset.clapPluginSelect = nodeId;
  select.setAttribute("aria-label", "CLAP plugin");
  select.addEventListener("change", () => {
    const plugin = nodeGraphClapHostState.plugins.find((candidate) => candidate.id === select.value);
    const previous = normalizeNodeGraphClapPluginBinding(nodeGraphPatchNode(nodeId)?.clap);
    const next = plugin ? nodeGraphClapPluginBindingFromCatalog(plugin) : {};
    nodeGraphCommitClapPluginBinding(nodeId, next, {
      clearParameters: previous.catalogId !== next.catalogId,
    });
  });

  const detail = document.createElement("div");
  detail.className = "node-clap-plugin-detail";
  detail.dataset.clapPluginDetail = nodeId;

  const actions = document.createElement("div");
  actions.className = "node-clap-plugin-actions";
  const createButton = document.createElement("button");
  createButton.type = "button";
  createButton.className = "node-secondary-button";
  createButton.textContent = "Create Instance";
  createButton.dataset.clapPluginCreate = nodeId;
  createButton.addEventListener("click", () => createNodeGraphClapPluginInstance(nodeId));
  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "node-secondary-button";
  deleteButton.textContent = "Delete Instance";
  deleteButton.dataset.clapPluginDelete = nodeId;
  deleteButton.addEventListener("click", () => deleteNodeGraphClapPluginInstance(nodeId));
  const refreshButton = document.createElement("button");
  refreshButton.type = "button";
  refreshButton.className = "node-secondary-button";
  refreshButton.textContent = "Refresh Params";
  refreshButton.dataset.clapPluginRefreshParams = nodeId;
  refreshButton.addEventListener("click", () => refreshNodeGraphClapPluginParameters(nodeId));
  actions.append(createButton, deleteButton, refreshButton);

  const params = document.createElement("div");
  params.className = "node-clap-plugin-param-list";
  params.dataset.clapPluginParamList = nodeId;

  body.append(select, detail, actions, params);
  syncNodeGraphClapPluginBody(body, nodeGraphPatchNode(nodeId));
  return body;
}

function syncNodeGraphClapPluginElement(element, patchNode) {
  const body = element?.querySelector?.(".node-clap-plugin-body");
  if (body) {
    syncNodeGraphClapPluginBody(body, patchNode);
  }
}

function syncNodeGraphClapPluginBody(body, patchNode) {
  if (!body || !patchNode) {
    return;
  }
  const binding = normalizeNodeGraphClapPluginBinding(patchNode.clap);
  const select = body.querySelector("[data-clap-plugin-select]");
  const detail = body.querySelector("[data-clap-plugin-detail]");
  const createButton = body.querySelector("[data-clap-plugin-create]");
  const deleteButton = body.querySelector("[data-clap-plugin-delete]");
  const refreshButton = body.querySelector("[data-clap-plugin-refresh-params]");
  const paramList = body.querySelector("[data-clap-plugin-param-list]");
  if (select) {
    const selectedValue = binding.catalogId;
    select.replaceChildren();
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = nodeGraphClapHostState.status === "connected"
      ? "Select CLAP plugin"
      : "Connect host first";
    select.append(placeholder);
    for (const plugin of nodeGraphClapHostState.plugins) {
      const option = document.createElement("option");
      option.value = plugin.id;
      option.textContent = nodeGraphClapPluginOptionLabel(plugin);
      select.append(option);
    }
    select.value = selectedValue;
    select.disabled = nodeGraphClapHostState.status !== "connected" || nodeGraphClapHostState.plugins.length === 0;
  }
  const selectedPlugin = nodeGraphClapSelectedCatalogPlugin(patchNode);
  if (detail) {
    if (!binding.catalogId) {
      detail.textContent = "No plugin selected. Select a host catalog entry, then create an instance.";
    } else if (selectedPlugin?.metadataError) {
      detail.textContent = `Descriptor error: ${selectedPlugin.metadataError}`;
    } else {
      const source = selectedPlugin || binding;
      const identity = [source.vendor, source.name].filter(Boolean).join(" - ") || source.clapId || source.path || "Selected CLAP plugin";
      const instanceText = binding.instanceId ? ` Instance: ${binding.instanceId}.` : " No host instance.";
      detail.textContent = `${identity}.${instanceText} Render Sample uses the host instance when connected.`;
    }
  }
  if (createButton) {
    createButton.disabled = nodeGraphClapHostState.status !== "connected" || !binding.path || !binding.clapId || Boolean(binding.instanceId);
  }
  if (deleteButton) {
    deleteButton.disabled = nodeGraphClapHostState.status !== "connected" || !binding.instanceId;
  }
  if (refreshButton) {
    refreshButton.disabled = nodeGraphClapHostState.status !== "connected" || !binding.instanceId;
  }
  if (paramList) {
    paramList.replaceChildren();
    if (!binding.instanceId) {
      const empty = document.createElement("div");
      empty.className = "node-clap-plugin-param-empty";
      empty.textContent = "Create an instance to read CLAP parameters.";
      paramList.append(empty);
    } else {
      const payload = nodeGraphClapParameterPayload(binding.instanceId);
      const parameters = Array.isArray(payload?.parameters) ? payload.parameters : [];
      if (!payload) {
        const empty = document.createElement("div");
        empty.className = "node-clap-plugin-param-empty";
        empty.textContent = "Parameters not loaded.";
        paramList.append(empty);
      } else if (!payload.supported) {
        const empty = document.createElement("div");
        empty.className = "node-clap-plugin-param-empty";
        empty.textContent = "Plugin does not expose clap.params.";
        paramList.append(empty);
      } else if (parameters.length === 0) {
        const empty = document.createElement("div");
        empty.className = "node-clap-plugin-param-empty";
        empty.textContent = "No parameters exposed.";
        paramList.append(empty);
      } else {
        for (const parameter of parameters.slice(0, 24)) {
          paramList.append(createNodeGraphClapParameterRow(nodeGraphClapPluginNodeIdFromBody(body), binding, parameter));
        }
        if (parameters.length > 24) {
          const truncated = document.createElement("div");
          truncated.className = "node-clap-plugin-param-empty";
          truncated.textContent = `${parameters.length - 24} more parameters hidden in this prototype.`;
          paramList.append(truncated);
        }
      }
    }
  }
}

function nodeGraphClapPluginNodeIdFromBody(body) {
  return String(body?.dataset?.clapPluginNode || "");
}

function syncNodeGraphClapPluginElements() {
  for (const element of document.querySelectorAll(".dsp-node[data-node-type='clapPlugin']")) {
    syncNodeGraphClapPluginElement(element, nodeGraphPatchNode(element.dataset.node));
  }
}

async function refreshNodeGraphClapPluginParameters(nodeId) {
  const patchNode = nodeGraphPatchNode(nodeId);
  const binding = normalizeNodeGraphClapPluginBinding(patchNode?.clap);
  if (!patchNode || !binding.instanceId || nodeGraphClapHostState.status !== "connected") {
    return;
  }
  try {
    const payload = await fetchNodeGraphClapHostJson(
      `/instances/${encodeURIComponent(binding.instanceId)}/params`,
      3000,
    );
    if (payload?.ok !== true) {
      throw new Error("parameter read failed");
    }
    if (await syncStoredNodeGraphClapParametersToHost(nodeId, binding, payload)) {
      const updatedPayload = await fetchNodeGraphClapHostJson(
        `/instances/${encodeURIComponent(binding.instanceId)}/params`,
        3000,
      );
      if (updatedPayload?.ok === true) {
        payload.parameters = updatedPayload.parameters;
        payload.count = updatedPayload.count;
        payload.supported = updatedPayload.supported;
      }
    }
    nodeGraphClapHostState.parameterPayloads.set(binding.instanceId, payload);
    nodeGraphCommitClapPluginParameterPayload(nodeId, payload);
  } catch (error) {
    const detailElement = document.getElementById("nodeClapHostDetail");
    if (detailElement) {
      detailElement.textContent = `connected; parameter error: ${error?.message || error}`;
    }
  }
  syncNodeGraphClapPluginElements();
}

function queueNodeGraphClapParameterWrite(nodeId, instanceId, paramId, value) {
  if (!instanceId || !Number.isFinite(paramId) || !Number.isFinite(value)) {
    return;
  }
  const key = `${instanceId}:${paramId}`;
  const existing = nodeGraphClapHostState.parameterWriteTimers.get(key);
  if (existing) {
    window.clearTimeout(existing);
  }
  const timer = window.setTimeout(async () => {
    nodeGraphClapHostState.parameterWriteTimers.delete(key);
    try {
      const payload = await postNodeGraphClapHostJson(
        `/instances/${encodeURIComponent(instanceId)}/param`,
        { paramId, value },
        3000,
      );
      if (payload?.ok !== true) {
        throw new Error("parameter write failed");
      }
      await refreshNodeGraphClapPluginParameters(nodeId);
    } catch (error) {
      const detailElement = document.getElementById("nodeClapHostDetail");
      if (detailElement) {
        detailElement.textContent = `connected; parameter write error: ${error?.message || error}`;
      }
      syncNodeGraphClapPluginElements();
    }
  }, 180);
  nodeGraphClapHostState.parameterWriteTimers.set(key, timer);
}

async function createNodeGraphClapPluginInstance(nodeId) {
  const patchNode = nodeGraphPatchNode(nodeId);
  const binding = normalizeNodeGraphClapPluginBinding(patchNode?.clap);
  if (!patchNode || !binding.path || !binding.clapId || binding.instanceId) {
    return;
  }
  try {
    const payload = await postNodeGraphClapHostJson("/instances", {
      clapId: binding.clapId,
      path: binding.path,
    }, 4000);
    if (payload?.ok !== true || !payload.instance?.instanceId) {
      throw new Error("instance creation failed");
    }
    nodeGraphCommitClapPluginBinding(nodeId, {
      ...binding,
      audioInputs: payload.instance.audioInputs,
      audioOutputs: payload.instance.audioOutputs,
      instanceId: payload.instance.instanceId,
    });
    await refreshNodeGraphClapPluginParameters(nodeId);
  } catch (error) {
    const detailElement = document.getElementById("nodeClapHostDetail");
    if (detailElement) {
      detailElement.textContent = `connected; instance error: ${error?.message || error}`;
    }
    syncNodeGraphClapPluginElements();
  }
}

async function deleteNodeGraphClapPluginInstance(nodeId) {
  const patchNode = nodeGraphPatchNode(nodeId);
  const binding = normalizeNodeGraphClapPluginBinding(patchNode?.clap);
  if (!patchNode || !binding.instanceId) {
    return;
  }
  try {
    await deleteNodeGraphClapHostJson(`/instances/${encodeURIComponent(binding.instanceId)}`, 2500);
  } catch {
    // The browser patch should still forget stale host instance ids after host restarts.
  }
  const { instanceId, ...nextBinding } = binding;
  nodeGraphClapHostState.parameterPayloads.delete(instanceId);
  nodeGraphCommitClapPluginBinding(nodeId, nextBinding);
}

async function connectNodeGraphClapHost() {
  setNodeGraphClapHostStatus("connecting");
  try {
    const payload = await fetchNodeGraphClapHostJson("/health");
    if (!payload || payload.ok !== true || payload.name !== nodeGraphClapHostName) {
      throw new Error("unexpected host response");
    }
    nodeGraphClapHostState.version = String(payload.version || "");
    nodeGraphClapHostState.lastError = "";
    setNodeGraphClapHostStatus("connected");
    refreshNodeGraphClapHostPlugins();
  } catch (error) {
    nodeGraphClapHostState.version = "";
    nodeGraphClapHostState.plugins = [];
    nodeGraphClapHostState.pluginCount = null;
    nodeGraphClapHostState.lastError =
      error?.name === "AbortError" ? "connection timed out" : String(error?.message || error);
    setNodeGraphClapHostStatus("error", nodeGraphClapHostState.lastError);
  }
}

async function refreshNodeGraphClapHostPlugins() {
  if (nodeGraphClapHostState.status !== "connected") return;
  const pluginsButton = document.getElementById("nodeClapHostPluginsButton");
  const detailElement = document.getElementById("nodeClapHostDetail");
  if (pluginsButton) {
    pluginsButton.disabled = true;
    pluginsButton.textContent = "Scanning Plugins";
  }
  if (detailElement) {
    detailElement.textContent = "scanning CLAP catalog";
  }
  try {
    const payload = await fetchNodeGraphClapHostJson("/plugins", 6000);
    if (!payload || payload.ok !== true || !Array.isArray(payload.plugins)) {
      throw new Error("unexpected plugin catalog response");
    }
    nodeGraphClapHostState.plugins = payload.plugins;
    nodeGraphClapHostState.pluginCount = Number(payload.count || payload.plugins.length || 0);
    if (detailElement) {
      detailElement.textContent = nodeGraphClapPluginCatalogText(payload.plugins);
    }
    syncNodeGraphClapPluginElements();
  } catch (error) {
    nodeGraphClapHostState.plugins = [];
    nodeGraphClapHostState.pluginCount = null;
    if (detailElement) {
      const message =
        error?.name === "AbortError" ? "plugin scan timed out" : String(error?.message || error);
      detailElement.textContent = `connected; plugin catalog error: ${message}`;
    }
    syncNodeGraphClapPluginElements();
  } finally {
    if (pluginsButton) {
      pluginsButton.textContent = "Refresh Plugins";
      pluginsButton.disabled = nodeGraphClapHostState.status !== "connected";
    }
  }
}

function bindNodeGraphClapHostControls() {
  const connectButton = document.getElementById("nodeClapHostConnectButton");
  const pluginsButton = document.getElementById("nodeClapHostPluginsButton");
  connectButton?.addEventListener("click", () => {
    connectNodeGraphClapHost();
  });
  pluginsButton?.addEventListener("click", () => {
    refreshNodeGraphClapHostPlugins();
  });
  setNodeGraphClapHostStatus("disconnected");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bindNodeGraphClapHostControls);
} else {
  bindNodeGraphClapHostControls();
}
