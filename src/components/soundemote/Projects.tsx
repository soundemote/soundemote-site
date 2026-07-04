import { featuredArticles } from "@/data/featuredArticles";

type RepositoryLink = {
    emoji: string;
    name: string;
    href: string;
    pulse?: boolean;
};

const repositoryLinks: RepositoryLink[] = [
    {
        emoji: "⌨️",
        name: "asciiscope",
        href: "https://github.com/soundemote/asciiscope-clap",
    },
    {
        emoji: "📡",
        name: "prettyscope",
        href: "https://github.com/soundemote/prettyscope-clap",
    },
    {
        emoji: "⚔️",
        name: "aliasing-wars",
        href: "https://github.com/elanhickler/soemdsp-sandbox-aliasing-wars",
    },
    {
        emoji: "🌺",
        name: "analog-filters",
        href: "https://github.com/elanhickler/soemdsp-sandbox-analog-filters",
    },
    {
        emoji: "⚡",
        name: "efficient-patch-system",
        href: "https://github.com/elanhickler/soemdsp-sandbox-digital-efficient-patch-system",
    },
    {
        emoji: "🔲",
        name: "white-wire",
        href: "https://github.com/elanhickler/soemdsp-sandbox-digital-signals-audio",
    },
    {
        emoji: "🌀",
        name: "jerobeam-modules",
        href: "https://github.com/elanhickler/jerobeam-modules",
    },
    {
        emoji: "💡",
        name: "light-physics",
        href: "https://github.com/elanhickler/soemdsp-sandbox-vactrols",
    },
    {
        emoji: "🌕",
        name: "phosphor",
        href: "https://github.com/elanhickler/soemdsp-sandbox-phosphor",
        pulse: true,
    },
    {
        emoji: "🥁",
        name: "rhythmandpitchgenerator",
        href: "https://github.com/elanhickler/soemdsp-sandbox-rhythmandpitchgenerator",
    },
    {
        emoji: "🦋",
        name: "vactrols",
        href: "https://github.com/elanhickler/soemdsp-sandbox-vactrols",
    },
    {
        emoji: "🌦️",
        name: "weather",
        href: "https://github.com/elanhickler/soemdsp-sandbox-analog-filters",
    },
    {
        emoji: "🚀",
        name: "soemdsp-simd",
        href: "https://github.com/elanhickler/soemdsp-simd",
    },
    {
        emoji: "🔥",
        name: "combustion",
        href: "https://github.com/elanhickler/combustion",
    },
    {
        emoji: "🌆",
        name: "synthwave-orchestra",
        href: "https://github.com/elanhickler/supersaw",
        pulse: true,
    },
];

type ProjectsProps = {
    selectedSlug: string;
    onSelectArticle: (slug: string) => void;
};

// The page's <main> already has Tailwind's scroll-smooth class, so a plain
// scrollIntoView (behavior: "auto") still animates smoothly via CSS --
// explicitly passing behavior: "smooth" here was silently not scrolling.
const scrollToFeaturedArticle = () => {
    document.getElementById("featured-article")?.scrollIntoView({ block: "start" });
};

export const Projects = ({ selectedSlug, onSelectArticle }: ProjectsProps) => {
    const handleSelect = (slug: string) => {
        onSelectArticle(slug);
        scrollToFeaturedArticle();
    };

    return (
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
                            <div className="flex items-center gap-3">
                                <p className="mono hidden text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground md:block">
                                    click a name to feature its article above · github icon always opens the repo
                                </p>
                                <button
                                    type="button"
                                    onClick={scrollToFeaturedArticle}
                                    title="Jump to the top of the featured article"
                                    aria-label="Jump to the top of the featured article"
                                    className="mono flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-scope/50 text-scope transition-colors hover:bg-scope/10"
                                >
                                    ↑
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 divide-y divide-border/50 md:grid-cols-2 md:divide-x md:divide-y-0 xl:grid-cols-3">
                        {repositoryLinks.map((repo, index) => {
                            const article = featuredArticles.find((a) => a.repoHref === repo.href);
                            const isSelected = article && article.slug === selectedSlug;
                            return (
                                <div
                                    key={`${repo.name}-${index}`}
                                    className={`group relative flex min-w-0 items-start gap-3 overflow-hidden px-3 py-2.5 transition-colors hover:bg-scope/5 ${
                                        isSelected ? "bg-scope/10" : ""
                                    }`}
                                >
                                    <span
                                        className={`absolute inset-y-0 left-0 w-px transition-colors group-hover:bg-scope/70 ${
                                            isSelected ? "bg-scope/70" : "bg-scope/0"
                                        }`}
                                    />
                                    <span
                                        className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded border border-border/70 bg-background/70 text-base leading-none transition-all group-hover:border-scope/60 group-hover:shadow-[0_0_18px_hsl(var(--scope)/0.18)] ${
                                            repo.pulse ? "animate-pulse" : ""
                                        }`}
                                        aria-hidden
                                    >
                                        {repo.emoji}
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        {article ? (
                                            <button
                                                type="button"
                                                onClick={() => handleSelect(article.slug)}
                                                className={`mono block text-left text-[0.68rem] uppercase tracking-[0.13em] transition-colors hover:text-scope ${
                                                    isSelected ? "text-scope" : "text-muted-foreground"
                                                }`}
                                            >
                                                {repo.name}
                                            </button>
                                        ) : (
                                            <span className="mono block text-[0.68rem] uppercase tracking-[0.13em] text-muted-foreground">
                                                {repo.name}
                                            </span>
                                        )}
                                        <span className="mono flex items-center gap-1.5 text-[0.62rem] leading-snug">
                                            {article && (
                                                <span className="text-warm-white/80">
                                                    {isSelected ? "★ featured above" : "feature above ↑"}
                                                </span>
                                            )}
                                            <a
                                                href={repo.href}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1 text-scope/80 underline-offset-2 transition-colors hover:text-scope hover:underline"
                                            >
                                                github ↗
                                            </a>
                                        </span>
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Projects;
