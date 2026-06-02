import patchImage from "@/assets/soemdsp-patch.png";
import { SandboxNavLink } from "@/components/soundemote/Nav";

export const Hero = () => {
  return (
  <section id="top" className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28">
    <div className="absolute inset-0 scope-grid opacity-40" aria-hidden />
    <div className="absolute inset-0 bg-[var(--gradient-hero)]" aria-hidden />
    <div className="container relative max-w-3xl mx-auto text-center animate-fade-in">
      
      <p className="mt-10 mono text-xs lowercase tracking-[0.1em] text-muted-foreground/60 text-center inline-flex flex-wrap items-center justify-center w-full">
        <span>/* alpha v0.2.0</span>
        <SandboxNavLink href="/sandbox" label="app:(sandbox)" /><span>update */</span>
      </p>
      <div className="w-fit mx-auto mt-6 animate-fade-in [animation-delay:200ms]">
        <a href="/sandbox" className="group block">
          <img
            id="hero-patch-image"
            src={patchImage}
            alt="soemdsp modular patch — oscillators, noise, gain and output nodes"
            className="w-[36rem] max-w-[calc(100vw-3rem)] rounded-xl border border-border/60 shadow-[0_0_40px_hsl(var(--scope)/0.15)] transition-all group-hover:border-scope/50 group-hover:shadow-[0_0_60px_hsl(var(--scope)/0.3)]"
          />
        </a>
      </div>
      <p className="mono mt-6 whitespace-nowrap text-base font-medium normal-case lowercase tracking-[0.16em] text-scope sm:text-2xl sm:tracking-[0.28em] md:text-3xl md:tracking-[0.35em] font-sans">
        ⋆⁺₊✧ soemdsp ✧₊⁺⋆
      </p>
    </div>
  </section>
  );
};

export default Hero;
