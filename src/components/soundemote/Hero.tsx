import patchImage from "@/assets/soemdsp-patch.png";

export const Hero = () => {
  return (
  <section id="top" className="relative overflow-hidden pt-4 pb-20 md:pt-6 md:pb-28">
    <div className="absolute inset-0 scope-grid opacity-40" aria-hidden />
    <div className="absolute inset-0 bg-[var(--gradient-hero)]" aria-hidden />
    <div className="container relative max-w-3xl mx-auto text-center animate-fade-in">
      <p className="mono mb-6 whitespace-nowrap text-base font-medium normal-case lowercase tracking-[0.16em] text-scope sm:text-2xl sm:tracking-[0.28em] md:text-3xl md:tracking-[0.35em] font-sans">
        ⋆⁺₊✧ soemdsp ✧₊⁺⋆
      </p>
      <a
        href="/sandbox"
        className="mt-5 mx-auto inline-flex items-center gap-3 rounded-2xl border border-scope/30 bg-gradient-to-r from-scope/10 via-accent/10 to-scope/10 px-6 py-4 transition-all hover:border-scope/60 hover:shadow-[0_0_40px_hsl(var(--scope)/0.25)] animate-fade-in [animation-delay:100ms]"
      >
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-scope opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-scope" />
        </span>
        <span className="mono text-xs lowercase tracking-[0.1em] text-scope text-glow">
          live sandbox
        </span>
        <span className="mono text-xs text-muted-foreground/60 hidden sm:inline">→</span>
      </a>
      <p className="mt-8 mx-auto max-w-xl text-lg leading-relaxed text-muted-foreground" />
      
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <a
          href="#projects"
          className="group inline-flex items-center gap-2 rounded-full bg-scope px-6 py-3 mono text-xs uppercase tracking-[0.2em] text-primary-foreground transition-all hover:shadow-[0_0_30px_hsl(var(--scope)/0.6)]"
        >
          Explore Projects
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </a>
        <a
          href="https://discord.gg/hjpBC8kZ3s"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 mono text-xs uppercase tracking-[0.2em] text-warm-white hover:border-scope/60 hover:text-scope transition-colors"
        >
          Join Discord
        </a>
      </div>
      <div className="w-fit mx-auto mt-16 animate-fade-in [animation-delay:200ms]">
        <a href="/sandbox" className="group block">
          <img
            src={patchImage}
            alt="soemdsp modular patch — oscillators, noise, gain and output nodes"
            className="w-[36rem] max-w-[calc(100vw-3rem)] rounded-xl border border-border/60 shadow-[0_0_40px_hsl(var(--scope)/0.15)] transition-all group-hover:border-scope/50 group-hover:shadow-[0_0_60px_hsl(var(--scope)/0.3)]"
          />
        </a>
      </div>
    </div>
  </section>
  );
};

export default Hero;
