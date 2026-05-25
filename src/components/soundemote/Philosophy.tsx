const tenets = [
  {
    n: "01",
    title: "Signal as material",
    body: "We treat DSP as a craft — low-level, precise, and worth shaping by hand.",
  },
  {
    n: "02",
    title: "Sound made visible",
    body: "Music software shouldn't only process sound; it should reveal motion, structure, and feel.",
  },
  {
    n: "03",
    title: "Open by default",
    body: "Open-source libraries, interfaces made for artists, and code that plays nice with whatever you're building.",
  },
];

export const Philosophy = () => (
  <section id="philosophy" className="relative py-24 md:py-32 border-t border-border/40 bg-secondary/20">
    <div className="container max-w-2xl text-center">
      <p className="mono text-xs uppercase tracking-[0.3em] text-scope mb-4">/* philosophy */</p>
      <h2 className="display text-3xl md:text-5xl text-warm-white leading-tight">
        Low-level DSP craft, met with visual beauty.
      </h2>
      <div className="mt-16 space-y-10">
        {tenets.map((t) => (
          <div key={t.n} className="border-t border-scope/30 pt-6 text-center">
            <div className="mono text-xs text-scope mb-3">{t.n}</div>
            <h3 className="display text-xl text-warm-white mb-3">{t.title}</h3>
            <p className="text-muted-foreground leading-relaxed">{t.body}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Philosophy;