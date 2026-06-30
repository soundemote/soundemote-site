import { useState } from "react";
import patchImage from "@/assets/soemdsp-patch.png";

export const Hero = () => {
  const [sandboxLoaded, setSandboxLoaded] = useState(false);
  const previewFrameClass = "soundemote-sandbox-preview-frame relative overflow-hidden bg-background";

  return (
    <section id="top" className="relative overflow-hidden py-6 md:py-8">
      <div className="absolute inset-0 scope-grid opacity-40" aria-hidden />
      <div className="absolute inset-0 bg-[var(--gradient-hero)]" aria-hidden />
      <div className="relative mx-auto flex min-h-[56vh] max-w-6xl flex-col items-center justify-center animate-fade-in px-4 text-center md:min-h-[62vh]">
        <div className="mx-auto w-full max-w-[min(95vw,56rem)] animate-fade-in [animation-delay:200ms]">
          <div className={previewFrameClass}>
            {sandboxLoaded ? (
              <iframe
                id="hero-sandbox-iframe"
                title="soemdsp sandbox"
                src="/soemdsp-sandbox/index.html?sandboxView=modular-only"
                className="h-full w-full border-0 bg-transparent"
                allow="autoplay; microphone"
              />
            ) : (
              <button
                type="button"
                className="group block h-full w-full border-0 bg-transparent p-0 text-left"
                aria-label="Load soemdsp sandbox in this preview"
                onClick={() => setSandboxLoaded(true)}
              >
                <img
                  id="hero-patch-image"
                  src={patchImage}
                  alt="soemdsp modular patch - oscillators, noise, gain and output nodes"
                  className="h-full w-full object-contain"
                />
                <span className="pointer-events-none absolute inset-0 grid place-items-center bg-background/18 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                  <span className="mono rounded-full border border-scope/70 bg-background/85 px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-scope shadow-[0_0_28px_hsl(var(--scope)/0.22)]">
                    load sandbox
                  </span>
                </span>
              </button>
            )}
          </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;
