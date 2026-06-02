const groups = [
  {
    label: "for developers",
    displayLabel: "/* for developers */",
    labelClass: "text-muted-foreground",
    title: (
      <>
        Build with{" "}
        <a
          href="https://github.com/soundemote/soemdsp"
          target="_blank"
          rel="noreferrer"
          className="text-scope transition-colors hover:text-scope-glow"
        >
          soemdsp
        </a>{" "}
        primitives or link to your own.
      </>
    ),
    items: [
      "C++ DSP objects with SIMD-friendly internals",
      "Audio plugin export",
      "Parameters, metadata, wires, and routing",
    ],
    accent: "scope",
  },
  {
    label: "for artists",
    displayLabel: "〜 ♪ for artists ♪ 〜",
    labelClass: "text-accent",
    title: "Tools that show you what you hear.",
    items: [
      "Aesthetic oscilloscopes, waveform visualizers, and visual fx",
      "Expressive synths designed by eye and ear",
      "Recordable plugin window for clips and screenshots",
      "Share your experimental instruments with a link",
    ],
    accent: "accent",
  },
];

export const Audiences = () => (
  <section id="developers" className="relative py-24 md:py-32 border-t border-border/40">
    <div className="container max-w-2xl mx-auto space-y-6">
      {groups.map((g) => (
        <div
          key={g.label}
          className="relative rounded-2xl border border-border bg-[var(--gradient-panel)] p-8 md:p-10 overflow-hidden text-center"
        >
          <div
            className={`absolute -top-24 -right-24 h-64 w-64 rounded-full blur-3xl opacity-20 ${
              g.accent === "scope" ? "bg-scope" : "bg-accent"
            }`}
            aria-hidden
          />
          <p
            className={`mono text-xs uppercase tracking-[0.3em] mb-4 ${g.labelClass}`}
          >
            {g.displayLabel}
          </p>
          <h3 className="display text-2xl md:text-3xl text-warm-white mb-6 leading-tight">
            {g.title}
          </h3>
          <ul className="space-y-3 inline-block text-left">
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
