import AsciiWave from "./AsciiWave";

type Project = {
  name: string;
  status: string;
  blurb: string;
  href?: string;
  tags: string[];
  accent: "scope" | "accent" | "warm";
};

const projects: Project[] = [
  {
    name: "hydrus",
    status: "in development",
    blurb:
      "The next Soundemote instrument. Still forming — check back as it grows.",
    tags: ["instrument", "ecosystem", "soon"],
    accent: "accent",
  },
  {
    name: "prettyscope",
    status: "library · in revival",
    blurb:
      "Aesthetic oscilloscope technology for musicians, synth builders, and visual sound explorers. Free forever, community-driven.",
    href: "https://github.com/soundemote/prettyscope-old",
    tags: ["visualizer", "library", "open"],
    accent: "scope",
  },
  {
    name: "asciiscope",
    status: "plugin · experimental",
    blurb:
      "Terminal-inspired audio-reactive oscilloscope visuals for live signals, social clips, and experimental plugin windows.\n\nBuilt on soemdsp: SIMD-minded, easy-to-use low-level DSP objects for oscillators, filters, modulation, dynamics, random, timing, and plugin infrastructure.",
    href: "https://github.com/soundemote/asciiscope-clap",
    tags: ["clap", "juce", "visual"],
    accent: "warm",
  },
  {
    name: "soemdsp",
    status: "C++ · MIT",
    blurb:
      "SIMD-minded, easy-to-use low-level DSP objects for oscillators, filters, modulation, dynamics, random, timing, and plugin infrastructure.",
    href: "https://github.com/soundemote/soemdsp",
    tags: ["dsp", "c++", "simd"],
    accent: "scope",
  },
];

const accentClass: Record<Project["accent"], string> = {
  scope: "text-scope",
  accent: "text-accent",
  warm: "text-warm-white",
};

export const Projects = () => (
  <section id="projects" className="relative py-24 md:py-32 border-t border-border/40">
    <div className="container max-w-2xl">
      <div className="text-center mb-16">
        <p className="mono text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">/* projects */</p>
        <p className="mono text-xs text-muted-foreground">
          DSP / Audio / Visual
        </p>
      </div>

      <div className="grid gap-6">
        {projects.map((p) => (
          <article
            key={p.name}
            className="group relative overflow-hidden rounded-2xl border border-border bg-[var(--gradient-panel)] p-8 transition-all hover:border-scope/40 hover:-translate-y-1 hover:shadow-[var(--shadow-panel)]"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-scope/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className={`display text-3xl ${accentClass[p.accent]}`}>{p.name}</h3>
                <p className="mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground mt-2">
                  {p.status}
                </p>
              </div>
              {p.href && (
                <a
                  href={p.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Open ${p.name} on GitHub`}
                  className="mono text-xs text-muted-foreground hover:text-scope transition-colors"
                >
                  github ↗
                </a>
              )}
            </div>

            <div className="mb-6 overflow-hidden rounded-md border border-border/60 bg-background/60 p-3">
              <AsciiWave rows={5} cols={48} />
            </div>

            <p className="text-warm-white/80 leading-relaxed whitespace-pre-line">{p.blurb}</p>

            <div className="mt-6 flex flex-wrap gap-2">
              {p.tags.map((t) => (
                <span
                  key={t}
                  className="mono text-[10px] uppercase tracking-[0.18em] rounded-full border border-border px-3 py-1 text-muted-foreground"
                >
                  {t}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>
);

export default Projects;