const groups = [
  {
    label: "for developers",
    title: "Build with the same primitives we use.",
    items: [
      "C++ DSP objects with SIMD-friendly internals",
      "CLAP plugin foundations and JUCE-based scaffolding",
      "Parameters, metadata, wires, and routing primitives",
      "Permissive open-source licensing (MIT)",
    ],
    accent: "scope",
  },
  {
    label: "for musicians",
    title: "Tools that show you what you hear.",
    items: [
      "Aesthetic oscilloscopes and waveform visualizers",
      "Expressive synth interfaces designed by ear",
      "Recordable plugin windows for clips and study",
      "Experimental instruments built in the open",
    ],
    accent: "accent",
  },
];

export const Audiences = () => (
  <section id="developers" className="relative py-24 md:py-32 border-t border-border/40">
    <div className="container grid gap-6 md:grid-cols-2">
      {groups.map((g) => (
        <div
          key={g.label}
          className="relative rounded-2xl border border-border bg-[var(--gradient-panel)] p-8 md:p-10 overflow-hidden"
        >
          <div
            className={`absolute -top-24 -right-24 h-64 w-64 rounded-full blur-3xl opacity-20 ${
              g.accent === "scope" ? "bg-scope" : "bg-accent"
            }`}
            aria-hidden
          />
          <p
            className={`mono text-xs uppercase tracking-[0.3em] mb-4 ${
              g.accent === "scope" ? "text-scope" : "text-accent"
            }`}
          >
            {g.label}
          </p>
          <h3 className="display text-2xl md:text-3xl text-warm-white mb-6 leading-tight">
            {g.title}
          </h3>
          <ul className="space-y-3">
            {g.items.map((i) => (
              <li key={i} className="flex items-start gap-3 text-warm-white/80">
                <span className={`mono mt-1 text-xs ${g.accent === "scope" ? "text-scope" : "text-accent"}`}>
                  ◇
                </span>
                <span>{i}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </section>
);

export default Audiences;