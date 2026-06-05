function nodeGraphRenderPendingSummary() {
  try {
    return nodeGraphValidate().scheduleText;
  } catch (_error) {
    return "waiting for render";
  }
}

function renderedNodeGraphWavBlob(rendered) {
  return nodeGraphRenderedWavBlob(rendered, nodeGraphMvp.sampleRate);
}

function nodeGraphOutputClipCountText(count = 0) {
  return count === 1 ? "1 clip" : `${count} clips`;
}

function nodeGraphClampOutputSample(value) {
  if (typeof nodeGraphBadValueReason === "function" && nodeGraphBadValueReason(value)) {
    return 0;
  }
  if (!Number.isFinite(Number(value))) {
    return 0;
  }
  return Math.max(
    -nodeGraphOutputClipLimit,
    Math.min(nodeGraphOutputClipLimit, Number(value)),
  );
}

function nodeGraphOutputSampleClipped(value) {
  return (
    (typeof nodeGraphBadValueReason === "function" && Boolean(nodeGraphBadValueReason(value))) ||
    !Number.isFinite(Number(value)) ||
    value < -nodeGraphOutputClipLimit ||
    value > nodeGraphOutputClipLimit
  );
}

function nodeGraphTemporaryPrefilterForResample(samples, sourceRate, outputRate) {
  if (!samples?.length || !Number.isFinite(sourceRate) || !Number.isFinite(outputRate) || sourceRate <= outputRate) {
    return samples;
  }
  const radius = Math.max(1, Math.min(12, Math.ceil(sourceRate / outputRate)));
  const filtered = new Float32Array(samples.length);
  for (let index = 0; index < samples.length; index += 1) {
    let sum = 0;
    let weightSum = 0;
    for (let offset = -radius; offset <= radius; offset += 1) {
      const sampleIndex = Math.max(0, Math.min(samples.length - 1, index + offset));
      const weight = radius + 1 - Math.abs(offset);
      sum += samples[sampleIndex] * weight;
      weightSum += weight;
    }
    filtered[index] = weightSum > 0 ? sum / weightSum : samples[index];
  }
  return filtered;
}

function nodeGraphResampleLinear(samples, outputFrames) {
  const frames = Math.max(1, Math.floor(Number(outputFrames)));
  if (!samples?.length) {
    return new Float32Array(frames);
  }
  if (samples.length === frames) {
    return new Float32Array(samples);
  }
  if (frames === 1) {
    return new Float32Array([samples[0]]);
  }
  const resampled = new Float32Array(frames);
  const scale = (samples.length - 1) / (frames - 1);
  for (let frame = 0; frame < frames; frame += 1) {
    const position = frame * scale;
    const leftIndex = Math.floor(position);
    const rightIndex = Math.min(samples.length - 1, leftIndex + 1);
    const blend = position - leftIndex;
    resampled[frame] = samples[leftIndex] * (1 - blend) + samples[rightIndex] * blend;
  }
  return resampled;
}

function nodeGraphResampleRenderedChannel(samples, sourceRate, outputRate, outputFrames) {
  const filtered = nodeGraphTemporaryPrefilterForResample(samples, sourceRate, outputRate);
  return nodeGraphResampleLinear(filtered, outputFrames);
}

function setNodeGraphAudioStats(peak = 0, rms = 0, details = {}) {
  const audioStats = document.getElementById("nodeAudioStats");
  if (!audioStats) {
    return;
  }
  const frames = Number(details.frames) || 0;
  const sampleRate = Number(details.sampleRate) || nodeGraphMvp.sampleRate;
  const engineSampleRate = Number(details.engineSampleRate) || sampleRate;
  const oversamplingRatio = Number(details.oversamplingRatio) || 1;
  const stateReadCount = Number(details.stateReadCount) || 0;
  const clipCount = Number(details.clipCount) || 0;
  const protectionMuteCount = Number(details.protectionMuteCount) || 0;
  const badNumberCount = Number(details.badNumberCount) || 0;
  const durationSeconds = frames > 0 && sampleRate > 0 ? frames / sampleRate : 0;
  const clipText = clipCount ? ` / ${nodeGraphOutputClipCountText(clipCount)}` : "";
  const protectionText = protectionMuteCount ? ` / protected ${protectionMuteCount}` : "";
  const badNumberText = badNumberCount ? ` / bad ${badNumberCount}` : "";
  audioStats.textContent = `peak ${peak.toFixed(3)} / rms ${rms.toFixed(3)}${clipText}${protectionText}${badNumberText}`;
  audioStats.className = `pill ${clipCount || protectionMuteCount || badNumberCount ? "warn" : ""}`.trim();
  audioStats.dataset.renderClips = String(clipCount);
  audioStats.dataset.renderProtectionMutes = String(protectionMuteCount);
  audioStats.dataset.renderBadNumbers = String(badNumberCount);
  audioStats.dataset.renderFrames = String(frames);
  audioStats.dataset.renderSampleRate = String(sampleRate);
  audioStats.dataset.renderEngineSampleRate = String(engineSampleRate);
  audioStats.dataset.renderOversamplingRatio = String(oversamplingRatio);
  audioStats.dataset.renderDuration = durationSeconds.toFixed(3);
  audioStats.dataset.renderStateReads = String(stateReadCount);
  const stateReadText = stateReadCount ? ` / ${nodeGraphStateReadText(stateReadCount)}` : "";
  const clipTitle = clipCount ? ` / ${nodeGraphOutputClipCountText(clipCount)}` : "";
  const protectionTitle = protectionMuteCount ? ` / ear protection muted ${protectionMuteCount} frames` : "";
  const badNumberTitle = badNumberCount ? ` / bad numbers recovered ${badNumberCount}` : "";
  audioStats.title = frames > 0
    ? `Rendered sample: ${frames} frames / ${durationSeconds.toFixed(3)}s / ${sampleRate} Hz output / ${nodeGraphFormatSampleRate(engineSampleRate)} engine / ${nodeGraphFormatOversamplingRatio(oversamplingRatio)}${stateReadText}${clipTitle}${protectionTitle}${badNumberTitle}`
    : "Rendered sample unavailable";
}

function markNodeGraphRenderPending(summary = "") {
  stopNodeGraphRenderedPlayback();
  nodeGraphMvp.rendered = null;
  clearNodeGraphRenderedModuleScopeBuffers();
  clearNodeGraphRenderedAudioElement();
  labelPrimaryAudioTitle("Render Sample creates preview audio here", false);
  document.getElementById("nodeGraphRenderStatus").textContent = "render pending";
  document.getElementById("nodeGraphRenderStatus").className = "pill warn";
  setNodeGraphAudioStats();
  const outputSummary = document.getElementById("nodeOutputSummary");
  if (outputSummary) {
    outputSummary.textContent = summary || nodeGraphRenderPendingSummary();
  }
  renderNodeGraphExecutionPlanDebug();
  drawNodeRenderedAudio();
}

function nodeGraphPlanClapRenderNodes(plan) {
  const reachableNodeIds = new Set(plan.reachableNodes || plan.order || []);
  const nodeOrder = new Map((plan.order || []).map((nodeId, index) => [nodeId, index]));
  return (plan.nodes || [])
    .filter((node) =>
      node?.type === "clapPlugin" &&
      normalizeNodeGraphClapPluginBinding(node.clap).instanceId &&
      (!reachableNodeIds.size || reachableNodeIds.has(node.id))
    )
    .sort((a, b) =>
      (nodeOrder.get(a.id) ?? Number.MAX_SAFE_INTEGER) -
      (nodeOrder.get(b.id) ?? Number.MAX_SAFE_INTEGER)
    );
}

function nodeGraphClapProcessChunkFrames() {
  return 48000;
}

function nodeGraphReadRuntimeInputPort(runtime, frameValues, nodeId, port, frame, frames) {
  const connections = runtime.inputConnections.get(nodeGraphInputKey(nodeId, port)) || [];
  return connections.reduce(
    (sum, connection) => sum + readNodeGraphRuntimePortOutput(
      runtime,
      frameValues,
      connection.sourceNode,
      connection.sourcePort,
      frame,
      frames,
    ),
    0,
  );
}

function nodeGraphClapRenderParameterEntries(clapNode) {
  return Object.entries(clapNode.paramMeta || {})
    .map(([key, metadata]) => {
      const parameterId = Number(metadata?.clapParamId);
      const storedValue = Number(clapNode.params?.[key]);
      const defaultValue = Number(metadata?.def);
      return {
        key,
        paramId: Number.isFinite(parameterId) ? Math.round(parameterId) : undefined,
        value: Number.isFinite(storedValue) ? storedValue : defaultValue,
      };
    })
    .filter((entry) => Number.isFinite(entry.paramId) && Number.isFinite(entry.value));
}

function nodeGraphRenderClapParameterValues(runtime, clapNode, entries, frame, frames, frameValues) {
  return entries.map((entry) => ({
    ...entry,
    value: readNodeGraphLiveEffectiveParam(
      runtime,
      clapNode,
      entry.key,
      entry.value,
      frame,
      frames,
      frameValues,
    ),
  }));
}

async function nodeGraphSyncClapRenderParameters(binding, entries) {
  const parameters = (entries || [])
    .map((entry) => ({
      paramId: entry.paramId,
      value: entry.value,
    }))
    .filter((entry) => Number.isFinite(entry.paramId) && Number.isFinite(entry.value));
  if (!parameters.length) {
    return;
  }
  const payload = await postNodeGraphClapHostJson(
    `/instances/${encodeURIComponent(binding.instanceId)}/params`,
    { parameters },
    5000,
  );
  if (payload?.ok !== true) {
    throw new Error(`CLAP parameter sync failed for ${binding.instanceId}`);
  }
}

async function nodeGraphRenderExternalClapOutputs(plan, engineSampleRate, engineFrames) {
  const clapNodes = nodeGraphPlanClapRenderNodes(plan);
  const outputs = new Map();
  if (!clapNodes.length) {
    return outputs;
  }
  if (nodeGraphClapHostState.status !== "connected" || typeof postNodeGraphClapHostJson !== "function") {
    throw new Error("CLAP host is not connected");
  }

  for (const clapNode of clapNodes) {
    const binding = normalizeNodeGraphClapPluginBinding(clapNode.clap);
    const parameterEntries = nodeGraphClapRenderParameterEntries(clapNode);
    const inputPorts = nodeGraphPatchNodeClapAudioInputPorts(clapNode);
    const outputPorts = nodeGraphPatchNodeClapAudioOutputPorts(clapNode);
    const inputAudio = inputPorts.map(() => new Array(engineFrames).fill(0));
    const chunkFrames = nodeGraphClapProcessChunkFrames();
    const parameterChunks = new Map();
    const preRuntime = createNodeGraphLiveRuntime(plan);
    preRuntime.externalClapOutputs = outputs;
    for (let blockStart = 0; blockStart < engineFrames; blockStart += nodeGraphAudioBlockSize) {
      const blockFrames = Math.min(nodeGraphAudioBlockSize, engineFrames - blockStart);
      for (let blockFrame = 0; blockFrame < blockFrames; blockFrame += 1) {
        const frame = blockStart + blockFrame;
        preRuntime.absoluteFrame = frame;
        const frameOutput = evaluateNodeGraphPlanFrame(
          preRuntime,
          engineSampleRate,
          blockFrame,
          blockFrames,
        );
        if (parameterEntries.length && frame % chunkFrames === 0) {
          parameterChunks.set(
            frame,
            nodeGraphRenderClapParameterValues(
              preRuntime,
              clapNode,
              parameterEntries,
              blockFrame,
              blockFrames,
              frameOutput.frameValues,
            ),
          );
        }
        for (let portIndex = 0; portIndex < inputPorts.length; portIndex += 1) {
          inputAudio[portIndex][frame] = nodeGraphReadRuntimeInputPort(
            preRuntime,
            frameOutput.frameValues,
            clapNode.id,
            inputPorts[portIndex],
            blockFrame,
            blockFrames,
          );
        }
      }
      finishNodeGraphParameterSmoothing(preRuntime.smoothers);
    }

    const outputAudio = outputPorts.map(() => new Float32Array(engineFrames));
    for (let start = 0; start < engineFrames; start += chunkFrames) {
      const frames = Math.min(chunkFrames, engineFrames - start);
      await nodeGraphSyncClapRenderParameters(
        binding,
        parameterChunks.get(start) || parameterEntries,
      );
      const payload = await postNodeGraphClapHostJson(
        `/instances/${encodeURIComponent(binding.instanceId)}/process`,
        {
          frames,
          inputAudio: inputAudio.map((channel) => channel.slice(start, start + frames)),
          returnAudio: true,
          sampleRate: engineSampleRate,
        },
        20000,
      );
      if (payload?.ok !== true || payload.audioReturned !== true || !Array.isArray(payload.audio)) {
        throw new Error(`CLAP process failed for ${nodeGraphPatchNodeTitle(clapNode)}`);
      }
      for (let portIndex = 0; portIndex < outputAudio.length; portIndex += 1) {
        const source = Array.isArray(payload.audio[portIndex]) ? payload.audio[portIndex] : [];
        for (let frame = 0; frame < frames; frame += 1) {
          outputAudio[portIndex][start + frame] = nodeGraphClampOutputSample(Number(source[frame]) || 0);
        }
      }
    }

    outputs.set(
      clapNode.id,
      Object.fromEntries(outputPorts.map((port, index) => [port, outputAudio[index]])),
    );
  }
  return outputs;
}

async function renderNodeGraphAudio() {
  if (nodeGraphEarProtectionIsTripped()) {
    nodeGraphTripEarProtection({ source: "render" });
    return;
  }
  if (!nodeGraphScriptReadyForGraphAction("render")) {
    markNodeGraphRenderScriptBlocked();
    return;
  }
  stopNodeGraphRenderedPlayback();
  const validation = nodeGraphValidate();
  const renderStatus = document.getElementById("nodeGraphRenderStatus");
  if (!validation.valid) {
    nodeGraphMvp.rendered = null;
    clearNodeGraphModuleScopeBuffers();
    clearNodeGraphRenderedAudioElement();
    labelPrimaryAudioTitle("Fix graph before rendering", false);
    renderStatus.textContent = "render blocked";
    renderStatus.className = "pill warn";
    setNodeGraphAudioStats();
    const outputSummary = document.getElementById("nodeOutputSummary");
    if (outputSummary) {
      outputSummary.textContent = validation.scheduleText;
    }
    renderNodeGraphExecutionPlanDebug();
    drawNodeRenderedAudio();
    return;
  }

  syncNodeGraphRenderSecondsFromInput({ normalize: true });
  const audio = nodeGraphAudioDerivation(nodeGraphMvp.patch);
  const outputSampleRate = audio.outputSampleRate;
  const engineSampleRate = audio.clampedEngineSampleRate;
  const outputFrames = Math.floor(outputSampleRate * nodeGraphMvp.seconds);
  const engineFrames = Math.max(1, Math.round(engineSampleRate * nodeGraphMvp.seconds));
  const patchFingerprint = nodeGraphPatchFingerprint();
  const engineLeftSamples = new Float32Array(engineFrames);
  const engineRightSamples = new Float32Array(engineFrames);
  const plan = nodeGraphBuildLivePlan();
  const stateReadCount = nodeGraphStateReadCount(plan);
  let externalClapOutputs = new Map();
  try {
    renderStatus.textContent = "rendering";
    renderStatus.className = "pill";
    externalClapOutputs = await nodeGraphRenderExternalClapOutputs(plan, engineSampleRate, engineFrames);
  } catch (error) {
    nodeGraphMvp.rendered = null;
    clearNodeGraphModuleScopeBuffers();
    clearNodeGraphRenderedAudioElement();
    labelPrimaryAudioTitle("Fix CLAP host before rendering", false);
    renderStatus.textContent = "render blocked";
    renderStatus.className = "pill warn";
    setNodeGraphAudioStats();
    const outputSummary = document.getElementById("nodeOutputSummary");
    if (outputSummary) {
      outputSummary.textContent = `CLAP render blocked: ${error?.message || error}`;
    }
    renderNodeGraphExecutionPlanDebug();
    drawNodeRenderedAudio();
    return;
  }
  const runtime = createNodeGraphLiveRuntime(plan);
  runtime.externalClapOutputs = externalClapOutputs;
  const scopeCapture = beginNodeGraphRenderedScopeCapture({
    frames: engineFrames,
    patch: nodeGraphMvp.patch,
    patchFingerprint,
    sampleRate: engineSampleRate,
  });
  const earProtector = createNodeGraphEarProtector(engineSampleRate);
  let clipCount = 0;
  let protectionMuteCount = 0;

  for (let blockStart = 0; blockStart < engineFrames; blockStart += nodeGraphAudioBlockSize) {
    const blockFrames = Math.min(nodeGraphAudioBlockSize, engineFrames - blockStart);
    for (let blockFrame = 0; blockFrame < blockFrames; blockFrame += 1) {
      const frame = blockStart + blockFrame;
      runtime.absoluteFrame = frame;
      const frameOutput = evaluateNodeGraphPlanFrame(
        runtime,
        engineSampleRate,
        blockFrame,
        blockFrames,
      );
      captureNodeGraphRenderedScopeFrame(
        scopeCapture,
        runtime,
        frameOutput.frameValues,
        frame,
        blockFrame,
        blockFrames,
      );
      if (nodeGraphOutputSampleClipped(frameOutput.left)) {
        clipCount += 1;
      }
      if (nodeGraphOutputSampleClipped(frameOutput.right)) {
        clipCount += 1;
      }
      const protectedFrame = earProtector.protect(frameOutput.left, frameOutput.right);
      if (protectedFrame.muted) {
        protectionMuteCount += 1;
      }
      const left = nodeGraphClampOutputSample(protectedFrame.left);
      const right = nodeGraphClampOutputSample(protectedFrame.right);
      engineLeftSamples[frame] = left;
      engineRightSamples[frame] = right;
    }
    finishNodeGraphParameterSmoothing(runtime.smoothers);
  }
  finishNodeGraphRenderedScopeCapture(scopeCapture);

  const leftSamples = nodeGraphResampleRenderedChannel(
    engineLeftSamples,
    engineSampleRate,
    outputSampleRate,
    outputFrames,
  );
  const rightSamples = nodeGraphResampleRenderedChannel(
    engineRightSamples,
    engineSampleRate,
    outputSampleRate,
    outputFrames,
  );
  const samples = new Float32Array(outputFrames);
  let peak = 0;
  let squareSum = 0;
  for (let frame = 0; frame < outputFrames; frame += 1) {
    const left = leftSamples[frame] || 0;
    const right = rightSamples[frame] || 0;
    samples[frame] = (left + right) * 0.5;
    peak = Math.max(peak, Math.abs(left), Math.abs(right));
    squareSum += (left * left + right * right) * 0.5;
  }

  const rms = Math.sqrt(squareSum / outputFrames);
  nodeGraphMvp.rendered = {
    channels: 2,
    connectionCount: plan.connections.length,
    durationSeconds: outputFrames / outputSampleRate,
    engineFrames,
    engineSampleRate,
    feedbackConnectionCount: plan.feedbackConnections.length,
    feedbackModulationCount: plan.feedbackModulations.length,
    frames: outputFrames,
    modulationCount: plan.modulations.length,
    nodeCount: plan.nodes.length,
    oversamplingRatio: audio.oversamplingRatio,
    peak,
    leftSamples,
    patchFingerprint,
    rightSamples,
    rms,
    sampleRate: outputSampleRate,
    samples,
    clipCount,
    protectionMuteCount,
    sourceNodes: validation.sourceNodes,
    stateReadCount,
    badNumberCount: runtime.badNumberCount || 0,
  };
  if (protectionMuteCount > 0) {
    nodeGraphTripEarProtection({ source: "render", protectionMuteCount });
    nodeGraphMvp.rendered = null;
    return;
  }
  syncNodeGraphRenderedAudioElement();
  renderStatus.textContent = "render ready";
  renderStatus.className = "pill good";
  setNodeGraphAudioStats(peak, rms, {
    frames: outputFrames,
    sampleRate: outputSampleRate,
    clipCount,
    engineSampleRate,
    oversamplingRatio: audio.oversamplingRatio,
    protectionMuteCount,
    stateReadCount,
    badNumberCount: runtime.badNumberCount || 0,
  });
  renderNodeGraphExecutionPlanDebug();
  const outputSummary = document.getElementById("nodeOutputSummary");
  if (outputSummary) {
    outputSummary.textContent = validation.scheduleText;
  }
  drawNodeRenderedAudio();
}
