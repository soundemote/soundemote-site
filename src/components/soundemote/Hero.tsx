import Oscilloscope from "./Oscilloscope";

export const Hero = () => (
  <section id="top" className="relative overflow-hidden pt-32 pb-24 md:pt-40 md:pb-32">
    <div className="absolute inset-0 scope-grid opacity-40" aria-hidden />
    <div className="absolute inset-0 bg-[var(--gradient-hero)]" aria-hidden />
    <div className="container relative grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:items-center">
      <div className="animate-fade-in">
        <p className="mono text-xs uppercase tracking-[0.35em] text-scope mb-6">
          ⋆⁺₊✧ soundemote ✧₊⁺⋆ &nbsp;·&nbsp; mesa, az
        </p>
        <h1 className="display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-medium leading-[1.05] text-warm-white">
          Audio tools for{" "}
          <span className="text-scope text-glow">seeing</span>,{" "}
          <span className="text-accent text-glow">shaping</span>, and{" "}
          <span className="italic text-warm-white/90">feeling</span> sound.
        </h1>
        <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground">
          Soundemote builds audio-visual plugins, DSP libraries, and experimental
          music technology for creators who care about signal, motion, and beauty.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-4">
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
        <div className="mt-12 grid grid-cols-3 max-w-md gap-6 mono text-xs text-muted-foreground">
          <div>
            <div className="text-scope text-2xl display">04</div>
            open projects
          </div>
          <div>
            <div className="text-scope text-2xl display">C++</div>
            CLAP / DSP
          </div>
          <div>
            <div className="text-scope text-2xl display">MIT</div>
            open source
          </div>
        </div>
      </div>
      <div className="relative aspect-[5/4] w-full animate-fade-in [animation-delay:200ms]">
        <Oscilloscope />
      </div>
    </div>
  </section>
);

export default Hero;