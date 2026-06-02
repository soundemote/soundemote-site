const tenets = [
  {
    n: "01",
    title: "Creative systems",
    body: "Prototype instruments, visuals, scenes, and audiovisual experiences inside one connected environment.",
  },
  {
    n: "02",
    title: "Signal-driven worlds",
    body: "Turn oscillators, control signals, and DSP into graphics, rhythm, texture, and real-time visual behavior.",
  },
  {
    n: "03",
    title: "CPU and WebGL",
    body: "Use CPU rendering for precision and WebGL for speed, glow, scale, and live visual performance.",
  },
];

export const Philosophy = () => (
  <section id="directive" className="relative border-t border-border/40 bg-secondary/20 py-24 md:py-32">
    <div className="container max-w-2xl text-center">
      <p className="mono mb-4 text-xs uppercase tracking-[0.3em] text-muted-foreground">/* directive */</p>
      <h2 className="display text-3xl leading-tight text-warm-white md:text-5xl">
        An ecosystem for modular audiovisuals.
      </h2>
      <div className="mt-16 space-y-10">
        {tenets.map((t) => (
          <div key={t.n} className="border-t border-scope/30 pt-6 text-center">
            <div className="mono mb-3 text-xs text-scope">{t.n}</div>
            <h3 className="display mb-3 text-xl text-warm-white">{t.title}</h3>
            <p className="leading-relaxed text-muted-foreground">{t.body}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Philosophy;
