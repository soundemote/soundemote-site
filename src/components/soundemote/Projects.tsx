import { useState, useEffect } from "react";
import AsciiWave from "./AsciiWave";

type Project = {
    name: string;
    status: string;
    version?: string;
    changelogHref?: string;
    blurb: string;
    href?: string;
    githubHref?: string;
    tags: string[];
    accent: "scope" | "accent" | "warm";
};

type LocalRepository = {
    name: string;
    href: string;
    role: string;
    note: string;
};

const projects: Project[] = [
    {
        name: "(soemdsp-sandbox)~",
        status: "beta v0.1.0",
        blurb:
            "Next-generation analog-emulation audiovisual prototyping environment and sound engine for games. Musical, aggressive filters, warm saturation, graphs, oscilloscopes, gpu rendering, visual fx, metaparameters, SIMD backend.",
        href: "https://soundemote.io/sandbox",
        githubHref: "https://github.com/soundemote/soemdsp-sandbox",
        tags: ["ecosystem", "audiovisual", "analog"],
        accent: "accent",
    },
    {
        name: "(soemdsp-wiki)~",
        status: "alpha ",
        version: "0.2.0",
        changelogHref: "/changelog",
        blurb:
            "Community-driven patch and DSP knowledge wiki. Open pages, submit edits, and build a living reference for sounds, modules, and techniques.",
        href: "/wiki",
        tags: ["wiki", "community", "reference"],
        accent: "accent",
    },
    {
        name: "prettyscope",
        status: "library · in revival",
        blurb:
            "Aesthetic oscilloscope technology for musicians, synth builders, and visual sound explorers. Free forever, community-driven.",
        href: "https://github.com/soundemote/prettyscope",
        tags: ["visualizer", "library", "open"],
        accent: "scope",
    },
    {
        name: "asciiscope",
        status: "plugin · experimental",
        blurb:
            "Terminal-inspired audio-reactive oscilloscope visuals for live signals, social clips, and experimental plugin windows.",
        href: "https://github.com/soundemote/asciiscope-clap",
        tags: ["clap", "juce", "visual"],
        accent: "warm",
    },
    {
        name: "⋆⁺₊✧ soemdsp ✧₊⁺⋆",
        status: "alpha v0.1 · C++ · MIT",
        blurb:
            "SIMD-minded, easy-to-use low-level DSP objects for oscillators, filters, modulation, dynamics, random, timing, and plugin infrastructure.",
        href: "https://github.com/soundemote/soemdsp",
        tags: ["dsp", "c++", "simd"],
        accent: "scope",
    },
];

const localRepositories: LocalRepository[] = [
    {
        name: "soemdsp-sandbox",
        href: "https://github.com/soundemote/soemdsp-sandbox",
        role: "main instrument",
        note: "the live audiovisual patching environment",
    },
    {
        name: "soemdsp",
        href: "https://github.com/soundemote/soemdsp",
        role: "dsp library",
        note: "C++ primitives and native module ground truth",
    },
    {
        name: "prettyscope",
        href: "https://github.com/soundemote/prettyscope",
        role: "visual reference",
        note: "the original pretty oscilloscope lineage",
    },
    {
        name: "asciiscope-clap",
        href: "https://github.com/soundemote/asciiscope-clap",
        role: "plugin experiment",
        note: "terminal-styled audio-reactive plugin work",
    },
    {
        name: "soemdsp-sandbox-aliasing-wars",
        href: "https://github.com/elanhickler/soemdsp-sandbox-aliasing-wars",
        role: "anti-aliasing front",
        note: "PolyBLEP, Surge, DSF, and edge-clean oscillator research",
    },
    {
        name: "soemdsp-sandbox-phosphor",
        href: "https://github.com/elanhickler/soemdsp-sandbox-phosphor",
        role: "phosphor field guide",
        note: "CRT persistence references, scope glow notes, and renderer direction",
    },
    {
        name: "soemdsp-sandbox-analog-filters",
        href: "https://github.com/elanhickler/soemdsp-sandbox-analog-filters",
        role: "filter bench",
        note: "analog filter models and circuit-flavored experiments",
    },
    {
        name: "soemdsp-sandbox-rhythmandpitchgenerator",
        href: "https://github.com/elanhickler/soemdsp-sandbox-rhythmandpitchgenerator",
        role: "pitch/rhythm bench",
        note: "timing, pitch, and pattern module exploration",
    },
];

const accentClass: Record<Project["accent"], string> = {
    scope: "text-scope",
    accent: "text-accent text-slate-300",
    warm: "text-warm-white",
};

function BlinkingTilde() {
    const [visible, setVisible] = useState(true);
    const [color, setColor] = useState(() => {
        const hue = Math.floor(Math.random() * 360);
        return `hsl(${hue}, 80%, 60%)`;
    });

    useEffect(() => {
        const interval = setInterval(() => {
            setVisible((v) => !v);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (visible) {
            const hue = Math.floor(Math.random() * 360);
            setColor(`hsl(${hue}, 80%, 60%)`);
        }
    }, [visible]);

    return (
        <span style={{ color, opacity: visible ? 1 : 0 }} className="transition-none">
            ~
        </span>
    );
}

export const Projects = () => (
    <section id="projects" className="relative pb-24 pt-14 md:pb-32 md:pt-20 border-t border-border/40">
        <div className="container max-w-2xl">
            <div className="text-center mb-10 md:mb-12">
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
                                {p.name === "prettyscope" ? (
                                    p.href ? (
                                        <a href={p.href} target="_blank" rel="noreferrer" className="inline-block hover:opacity-80 transition-opacity">
                                            <h3 className="display text-3xl bg-[linear-gradient(90deg,#ff5757,#ffb547,#ffe156,#7bd66a,#5ad1ff,#9d7bff,#ff7bdc)] bg-clip-text text-transparent animate-[rainbow-spin_3s_linear_infinite]">
                                                {p.name}
                                            </h3>
                                        </a>
                                    ) : (
                                        <h3 className="display text-3xl bg-[linear-gradient(90deg,#ff5757,#ffb547,#ffe156,#7bd66a,#5ad1ff,#9d7bff,#ff7bdc)] bg-clip-text text-transparent animate-[rainbow-spin_3s_linear_infinite]">
                                            {p.name}
                                        </h3>
                                    )
                                ) : p.name === "asciiscope" ? (
                                    p.href ? (
                                        <a href={p.href} target="_blank" rel="noreferrer" className="inline-block hover:opacity-80 transition-opacity">
                                            <h3 className="mono text-3xl text-scope tracking-tight">
                                                <span className="text-muted-foreground">$&nbsp;</span>
                                                {p.name}
                                                <span className="inline-block w-[0.6em] h-[1em] align-[-0.15em] bg-scope ml-1 animate-pulse" />
                                            </h3>
                                        </a>
                                    ) : (
                                        <h3 className="mono text-3xl text-scope tracking-tight">
                                            <span className="text-muted-foreground">$&nbsp;</span>
                                            {p.name}
                                            <span className="inline-block w-[0.6em] h-[1em] align-[-0.15em] bg-scope ml-1 animate-pulse" />
                                        </h3>
                                    )
                                ) : p.name === "(soemdsp-sandbox)~" || p.name === "(soemdsp-wiki)~" ? (
                                    p.href ? (
                                        <a href={p.href} target={p.href.startsWith("http") ? "_blank" : undefined} rel={p.href.startsWith("http") ? "noreferrer" : undefined} className="inline-block hover:opacity-80 transition-opacity">
                                            <h3 className={`display text-3xl ${accentClass[p.accent]}`}>
                                                {p.name.replace("~", "")}
                                                <BlinkingTilde />
                                            </h3>
                                        </a>
                                    ) : (
                                        <h3 className={`display text-3xl ${accentClass[p.accent]}`}>
                                            {p.name.replace("~", "")}
                                            <BlinkingTilde />
                                        </h3>
                                    )
                                ) : p.name === "⋆⁺₊✧ soemdsp ✧₊⁺⋆" ? (
                                    p.href ? (
                                        <a href={p.href} target="_blank" rel="noreferrer" className="inline-block hover:opacity-80 transition-opacity">
                                            <h3 className={`display text-3xl ${accentClass[p.accent]}`}>{p.name}</h3>
                                        </a>
                                    ) : (
                                        <h3 className={`display text-3xl ${accentClass[p.accent]}`}>{p.name}</h3>
                                    )
                                ) : (
                                    <h3 className={`display text-3xl ${accentClass[p.accent]}`}>{p.name}</h3>
                                )}
                                <p className="mono text-[0.625rem] uppercase tracking-[0.25em] text-muted-foreground mt-2">
                                    {p.status}
                                    {p.version && (
                                        p.changelogHref ? (
                                            <a
                                                href={p.changelogHref}
                                                className="text-scope underline decoration-dotted underline-offset-2 hover:text-scope/80 transition-colors"
                                            >
                                                {p.version}
                                            </a>
                                        ) : (
                                            p.version
                                        )
                                    )}
                                </p>
                            </div>
                            {(p.githubHref || p.href) && (
                                <a
                                    href={p.githubHref || p.href}
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
                                    className="mono text-[0.625rem] uppercase tracking-[0.18em] rounded-full border border-border px-3 py-1 text-muted-foreground"
                                >
                                    {t}
                                </span>
                            ))}
                        </div>
                    </article>
                ))}
            </div>

            <div className="mt-12 overflow-hidden rounded-2xl border border-scope/30 bg-background/60">
                <div className="border-b border-scope/20 px-5 py-4 text-center">
                    <p className="mono text-[0.65rem] uppercase tracking-[0.24em] text-scope">
                        dedicated to the local repositories
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-warm-white/70">
                        A little constellation of work folders, forks, experiments, and reference shelves
                        that keep Soundemote moving.
                    </p>
                </div>
                <div className="grid divide-y divide-border/50 md:grid-cols-2 md:divide-x md:divide-y-0">
                    {localRepositories.map((repo) => (
                        <a
                            key={repo.name}
                            href={repo.href}
                            target="_blank"
                            rel="noreferrer"
                            className="group block p-5 transition-colors hover:bg-scope/5"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <h3 className="mono truncate text-sm text-scope group-hover:text-warm-white">
                                        {repo.name}
                                    </h3>
                                    <p className="mono mt-1 text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
                                        {repo.role}
                                    </p>
                                </div>
                                <span className="mono shrink-0 text-xs text-muted-foreground group-hover:text-scope">
                                    git
                                </span>
                            </div>
                            <p className="mt-3 text-sm leading-relaxed text-warm-white/70">
                                {repo.note}
                            </p>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    </section>
);

export default Projects;
