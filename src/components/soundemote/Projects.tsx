type RepositoryLink = {
    emoji: string;
    name: string;
    href: string;
    pulse?: boolean;
    related?: { label: string; href: string }[];
};

const repositoryLinks: RepositoryLink[] = [
    {
        emoji: "🎛️",
        name: "soemdsp-sandbox",
        href: "https://github.com/soundemote/soemdsp-sandbox",
        pulse: true,
    },
    {
        emoji: "🧬",
        name: "soemdsp",
        href: "https://github.com/soundemote/soemdsp",
    },
    {
        emoji: "📺",
        name: "prettyscope",
        href: "https://github.com/soundemote/prettyscope",
    },
    {
        emoji: "⌨️",
        name: "asciiscope",
        href: "https://github.com/soundemote/asciiscope",
    },
    {
        emoji: "🔌",
        name: "asciiscope-clap",
        href: "https://github.com/soundemote/asciiscope-clap",
    },
    {
        emoji: "📡",
        name: "prettyscope-clap",
        href: "https://github.com/soundemote/prettyscope-clap",
    },
    {
        emoji: "🕸️",
        name: "soundemote-site",
        href: "https://github.com/soundemote/soundemote-site",
    },
    {
        emoji: "📜",
        name: "CODEGUIDE",
        href: "https://github.com/soundemote/CODEGUIDE",
    },
    {
        emoji: "🗃️",
        name: "oldcode",
        href: "https://github.com/soundemote/oldcode",
    },
    {
        emoji: "🤖",
        name: "aiassistant",
        href: "https://github.com/elanhickler/aiassistant",
    },
    {
        emoji: "⚔️",
        name: "soemdsp-sandbox-aliasing-wars",
        href: "https://github.com/elanhickler/soemdsp-sandbox-aliasing-wars",
    },
    {
        emoji: "🌺",
        name: "soemdsp-sandbox-analog-filters",
        href: "https://github.com/elanhickler/soemdsp-sandbox-analog-filters",
    },
    {
        emoji: "⚡",
        name: "soemdsp-sandbox-digital-efficient-patch-system",
        href: "https://github.com/elanhickler/soemdsp-sandbox-digital-efficient-patch-system",
    },
    {
        emoji: "🔲",
        name: "soemdsp-sandbox-digital-signals-audio",
        href: "https://github.com/elanhickler/soemdsp-sandbox-digital-signals-audio",
    },
    {
        emoji: "🌀",
        name: "soemdsp-sandbox-jerobeam-modules",
        href: "https://github.com/elanhickler/soemdsp-sandbox-white-wire",
    },
    {
        emoji: "💡",
        name: "soemdsp-sandbox-light-physics",
        href: "https://github.com/elanhickler/soemdsp-sandbox-phosphor",
    },
    {
        emoji: "🧪",
        name: "soemdsp-sandbox-phosphillator",
        href: "https://github.com/soundemote/soemdsp-sandbox",
    },
    {
        emoji: "🌕",
        name: "soemdsp-sandbox-phosphor",
        href: "https://github.com/elanhickler/soemdsp-sandbox-phosphor",
        pulse: true,
    },
    {
        emoji: "🥁",
        name: "soemdsp-sandbox-rhythmandpitchgenerator",
        href: "https://github.com/elanhickler/soemdsp-sandbox-rhythmandpitchgenerator",
    },
    {
        emoji: "🦋",
        name: "soemdsp-sandbox-vactrols",
        href: "https://github.com/elanhickler/soemdsp-sandbox-vactrols",
    },
    {
        emoji: "🌦️",
        name: "soemdsp-sandbox-weather",
        href: "https://github.com/elanhickler/soemdsp-sandbox-analog-filters",
    },
    {
        emoji: "⬜",
        name: "soemdsp-sandbox-white-wire",
        href: "https://github.com/elanhickler/soemdsp-sandbox-white-wire",
    },
    {
        emoji: "🚀",
        name: "soemdsp-simd",
        href: "https://github.com/elanhickler/soemdsp-simd",
    },
    {
        emoji: "🎻",
        name: "RobinSchmidt/RS-MET",
        href: "https://github.com/RobinSchmidt/RS-MET",
        pulse: true,
        related: [
            {
                label: "soundemote.io/robinschmidt",
                href: "https://soundemote.io/robinschmidt",
            },
            {
                label: "PitchDithering.md",
                href: "https://github.com/RobinSchmidt/RS-MET/blob/work/Notes/Scratch/PitchDithering.md",
            },
            {
                label: "PitchDitherOscs.h",
                href: "https://github.com/RobinSchmidt/RS-MET/blob/work/Libraries/RobsJuceModules/rapt/Generators/PitchDitherOscs.h",
            },
            {
                label: "PitchDitherOscs.cpp",
                href: "https://github.com/RobinSchmidt/RS-MET/blob/work/Libraries/RobsJuceModules/rapt/Generators/PitchDitherOscs.cpp",
            },
        ],
    },
];

export const Projects = () => (
    <section id="projects" className="relative border-t border-border/40 pb-14 pt-14 md:pb-20 md:pt-20">
        <div className="container max-w-5xl">
            <div className="mb-7 text-center md:mb-9">
                <p className="mono mb-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">/* projects */</p>
                <p className="mono text-xs text-muted-foreground">DSP / Audio / Visual</p>
            </div>

            <div className="overflow-hidden rounded-xl border border-scope/30 bg-background/60 shadow-[0_0_38px_hsl(var(--scope)/0.08)]">
                <div className="relative border-b border-scope/20 px-4 py-3">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-scope/60 to-transparent" />
                    <div className="flex items-center justify-between gap-4">
                        <p className="mono text-[0.65rem] uppercase tracking-[0.24em] text-scope">
                            local repository constellation
                        </p>
                        <p className="mono hidden text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground md:block">
                            full links, tiny doors, no mystery meat
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 divide-y divide-border/50 md:grid-cols-2 md:divide-x md:divide-y-0 xl:grid-cols-3">
                    {repositoryLinks.map((repo, index) => (
                        <div
                            key={`${repo.name}-${index}`}
                            className="group relative flex min-w-0 items-start gap-3 overflow-hidden px-3 py-2.5 transition-colors hover:bg-scope/5"
                        >
                            <span className="absolute inset-y-0 left-0 w-px bg-scope/0 transition-colors group-hover:bg-scope/70" />
                            <span
                                className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded border border-border/70 bg-background/70 text-base leading-none transition-all group-hover:border-scope/60 group-hover:shadow-[0_0_18px_hsl(var(--scope)/0.18)] ${
                                    repo.pulse ? "animate-pulse" : ""
                                }`}
                                aria-hidden
                            >
                                {repo.emoji}
                            </span>
                            <span className="min-w-0 flex-1">
                                <a
                                    href={repo.href}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mono block text-[0.68rem] uppercase tracking-[0.13em] text-muted-foreground transition-colors hover:text-scope"
                                >
                                    {repo.name}
                                </a>
                                <a
                                    href={repo.href}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mono block break-all text-[0.62rem] leading-snug text-warm-white/80 transition-colors hover:text-warm-white"
                                >
                                    {repo.href}
                                </a>
                                {repo.related && (
                                    <span className="mt-1.5 grid gap-0.5">
                                        {repo.related.map((link) => (
                                            <a
                                                key={link.href}
                                                href={link.href}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="mono block break-all text-[0.58rem] leading-snug text-scope/80 transition-colors hover:text-scope"
                                            >
                                                ↳ {link.label}: {link.href}
                                            </a>
                                        ))}
                                    </span>
                                )}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </section>
);

export default Projects;
