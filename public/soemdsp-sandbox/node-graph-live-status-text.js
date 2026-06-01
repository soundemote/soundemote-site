function nodeGraphLiveDebug() {
  return {
    evidence: nodeGraphMvp.live.lastEvidence,
    hasContext: Boolean(nodeGraphMvp.live.context),
    hasNode: Boolean(nodeGraphMvp.live.node),
    inputMeter: document.getElementById("nodeLiveInputMeter")?.textContent || "",
    meter: document.getElementById("nodeLiveMeter")?.textContent || "",
    outputEnabled: Boolean(nodeGraphMvp.live.outputEnabled),
    outputToggleSerial: nodeGraphMvp.live.outputToggleSerial,
    contextState: nodeGraphMvp.live.context?.state || "",
    planStatus: document.getElementById("nodeLivePlanStatus")?.textContent || "",
    routeStatus: document.getElementById("nodeLiveRouteStatus")?.textContent || "",
    status: document.getElementById("nodeLiveStatus")?.textContent || "",
  };
}

function nodeGraphLivePlanStatusText(plan, serial = nodeGraphMvp.live.planSerial) {
  const serialText = serial ? ` #${serial}` : "";
  const feedbackCount = nodeGraphStateReadCount(plan);
  const feedbackText = feedbackCount ? ` / ${nodeGraphStateReadText(feedbackCount)}` : "";
  const fingerprintText = plan.patchFingerprint ? ` / fp ${plan.patchFingerprint}` : "";
  return `plan${serialText} ${plan.nodes.length} nodes / ${plan.connections.length} wires / ${plan.modulations.length} mods${feedbackText}${fingerprintText}`;
}

function nodeGraphLiveBlockedStatusText(kind, error) {
  const issues = Array.isArray(error?.issues) && error.issues.length
    ? error.issues
    : [error?.message || "unknown issue"];
  return `${kind} blocked ${issues.length} ${issues.length === 1 ? "issue" : "issues"}`;
}

function nodeGraphLivePlanScheduleTitle(order = []) {
  return order.length
    ? `worklet order: ${order.join(" -> ")}`
    : "";
}

function nodeGraphLivePlanSentStatusText(serial = nodeGraphMvp.live.planSerial) {
  const serialText = serial ? ` #${serial}` : "";
  return `plan${serialText} sent`;
}

function nodeGraphLivePlanEvidenceDetails(plan, details = {}) {
  return {
    connectionCount: plan.connections.length,
    feedbackConnectionCount: plan.feedbackConnections.length,
    feedbackModulationCount: plan.feedbackModulations.length,
    feedbackModulations: plan.feedbackModulations.map((modulation) =>
      `${modulation.sourceNode}.${modulation.sourcePort} -> ${modulation.destinationNode}.${modulation.destinationParam}`,
    ),
    feedbackSignals: plan.feedbackConnections.map((connection) =>
      `${connection.sourceNode}.${connection.sourcePort} -> ${connection.destinationNode}.${connection.destinationPort}`,
    ),
    modulationCount: plan.modulations.length,
    nodeCount: plan.nodes.length,
    patchFingerprint: plan.patchFingerprint,
    stateReadCount: nodeGraphStateReadCount(plan),
    ...details,
  };
}

function nodeGraphLiveParameterCount(nodes = []) {
  return (nodes || []).reduce(
    (total, node) => total + Object.keys(node.params || {}).length,
    0,
  );
}

function nodeGraphLiveParametersSentStatusText(nodes = [], serial = nodeGraphMvp.live.planSerial) {
  const serialText = serial ? ` #${serial}` : "";
  return `params${serialText} sent ${nodes.length} nodes / ${nodeGraphLiveParameterCount(nodes)} params`;
}

function nodeGraphLiveParametersAppliedStatusText(message) {
  const serial = Number(message.planSerial) || 0;
  const serialText = serial ? ` #${serial}` : "";
  const fingerprintText = message.patchFingerprint ? ` / fp ${message.patchFingerprint}` : "";
  return `params${serialText} ${Number(message.nodeCount) || 0} nodes / ${Number(message.parameterCount) || 0} params${fingerprintText}`;
}

function nodeGraphLivePlanAppliedStatusText(message) {
  const serial = Number(message.planSerial) || 0;
  const serialText = serial ? ` #${serial}` : "";
  const feedbackCount = (Number(message.feedbackConnectionCount) || 0) +
    (Number(message.feedbackModulationCount) || 0);
  const feedbackText = feedbackCount ? ` / ${nodeGraphStateReadText(feedbackCount)}` : "";
  const fingerprintText = message.patchFingerprint ? ` / fp ${message.patchFingerprint}` : "";
  return `plan${serialText} ${Number(message.nodeCount) || 0} nodes / ${Number(message.connectionCount) || 0} wires / ${Number(message.modulationCount) || 0} mods${feedbackText}${fingerprintText}`;
}
