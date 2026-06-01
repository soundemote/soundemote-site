const nodeGraphEarProtectionDefaults = Object.freeze({
  clipLimit: 0.8,
  decrementTime: 0.15,
  incrementTime: 0.0005,
  highPassFrequency: 1000,
  threshold: Math.pow(10, 6 / 20),
});

function createNodeGraphEarProtector(sampleRate = nodeGraphMvp.sampleRate, options = {}) {
  const settings = { ...nodeGraphEarProtectionDefaults, ...options };
  const rate = Math.max(1, Number(sampleRate) || nodeGraphMvp.sampleRate || 44100);
  const increment = 1 / Math.max(1, settings.incrementTime * rate);
  const decrement = 1 / Math.max(1, settings.decrementTime * rate);
  const hpAlpha = Math.exp(-2 * Math.PI * settings.highPassFrequency / rate);
  let counter = 0;
  let previousInput = 0;
  let previousHighPass = 0;

  const run = (left = 0, right = left) => {
    const mono = (Number(left) + Number(right)) * 0.5 || 0;
    const highPass = hpAlpha * (previousHighPass + mono - previousInput);
    previousInput = mono;
    previousHighPass = highPass;
    if (Math.abs(highPass) >= settings.threshold) {
      counter += increment;
    }
    const gain = counter >= 1 ? 0 : 1;
    counter = Math.max(0, Math.min(2, counter)) - decrement;
    return gain;
  };

  return {
    protect(left = 0, right = left) {
      const gain = run(left, right);
      return {
        gain,
        left: nodeGraphClampProtectedSample((Number(left) || 0) * gain, settings.clipLimit),
        muted: gain <= 0,
        right: nodeGraphClampProtectedSample((Number(right) || 0) * gain, settings.clipLimit),
      };
    },
  };
}

function nodeGraphClampProtectedSample(value, limit = nodeGraphEarProtectionDefaults.clipLimit) {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(-limit, Math.min(limit, value));
}
