import { featuredArticles, type FeaturedArticle } from "@/data/featuredArticles";
import { useNavigate } from "react-router-dom";
import { ElectricBurst, useElectricBurst } from "./ElectricBurst";

type RepositoryLink = {
    emoji: string;
    name: string;
    href: string;
    pulse?: boolean;
    /** Internal SPA route to navigate to instead of opening href in a new tab. */
    route?: string;
};

const repositoryLinks: RepositoryLink[] = [
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
        emoji: "⌨️",
        name: "asciiscope",
        href: "https://github.com/soundemote/asciiscope-clap",
    },
    {
        emoji: "🔥",
        name: "combustion",
        href: "https://github.com/elanhickler/combustion",
    },
    {
        emoji: "⚡",
        name: "efficient-patch-system",
        href: "https://github.com/elanhickler/soemdsp-sandbox-digital-efficient-patch-system",
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
        emoji: "📡",
        name: "prettyscope",
        href: "https://github.com/soundemote/prettyscope-clap",
    },
    {
        emoji: "🌊",
        name: "reverb",
        href: "/reverb",
        route: "/reverb",
        pulse: true,
    },
    {
        emoji: "🥁",
        name: "rhythmandpitchgenerator",
        href: "https://github.com/elanhickler/soemdsp-sandbox-rhythmandpitchgenerator",
    },
    {
        emoji: "🚀",
        name: "soemdsp-simd",
        href: "https://github.com/soundemote/soemdsp-simd",
    },
    {
        emoji: "🕰️",
        name: "last-clock",
        href: "https://github.com/soundemote/soemdsp-last-clock",
        pulse: true,
    },
    {
        emoji: "🌆",
        name: "synthwave-orchestra",
        href: "https://github.com/elanhickler/supersaw",
        pulse: true,
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
        emoji: "🔲",
        name: "white-wire",
        href: "https://github.com/elanhickler/soemdsp-sandbox-digital-signals-audio",
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

type RepositoryCardProps = {
    repo: RepositoryLink;
    article?: FeaturedArticle;
    isSelected: boolean;
    onActivate: () => void;
};

// The whole card -- emoji, name, and github label -- is one button: a
// subtle hover highlight, an electric burst on mousedown, and the actual
// navigation (feature the article, or open github) fires on mouseup.
const RepositoryCard = ({ repo, article, isSelected, onActivate }: RepositoryCardProps) => {
    const { bursts, triggerBurst } = useElectricBurst();

    return (
        <button
            type="button"
            onMouseDown={triggerBurst}
            onMouseUp={onActivate}
            className={`group relative flex w-full min-w-0 items-start gap-3 overflow-hidden px-3 py-2.5 text-left transition-colors hover:bg-scope/5 ${
                isSelected ? "bg-scope/10" : ""
            }`}
        >
            <span className={`absolute inset-y-0 left-0 w-px ${isSelected ? "bg-scope/70" : "bg-scope/0"}`} />
            <span
                className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded border border-border/70 bg-background/70 text-base leading-none ${
                    repo.pulse ? "animate-pulse" : ""
                }`}
                aria-hidden
            >
                {repo.emoji}
            </span>
            <span className="min-w-0 flex-1">
                <span
                    className={`mono block text-[0.68rem] uppercase tracking-[0.13em] ${
                        isSelected ? "text-scope" : "text-muted-foreground"
                    }`}
                >
                    {repo.name}
                </span>
                <span className="mono flex items-center gap-1.5 text-[0.62rem] leading-snug text-scope/80">
                    {article && <span className="text-warm-white/80">{isSelected ? "★" : "↑"}</span>}
                    <span>github ↗</span>
                </span>
            </span>
            <ElectricBurst bursts={bursts} />
        </button>
    );
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
                    <p className="mono text-xs text-muted-foreground">audiovisual dsp</p>
                </div>

                <div className="overflow-hidden rounded-xl border border-scope/30 bg-background/60 shadow-[0_0_38px_hsl(var(--scope)/0.08)]">
                    <div className="relative border-b border-scope/20 px-4 py-3">
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-scope/60 to-transparent" />
                        <div className="flex items-center justify-between gap-4">
                            <p className="mono text-[0.65rem] uppercase tracking-[0.24em] text-scope">
                                local repository constellation
                            </p>
                            <div className="flex items-center gap-3">
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

                    <div className="grid grid-cols-1 divide-y divide-border/50 md:grid-cols-2 md:grid-flow-col md:grid-rows-[repeat(8,minmax(0,1fr))] md:divide-x md:divide-y-0 xl:grid-cols-3 xl:grid-rows-[repeat(5,minmax(0,1fr))]">
                        {repositoryLinks.map((repo, index) => {
                            const article = featuredArticles.find((a) => a.repoHref === repo.href);
                            const isSelected = Boolean(article && article.slug === selectedSlug);
                            return (
                                <RepositoryCard
                                    key={`${repo.name}-${index}`}
                                    repo={repo}
                                    article={article}
                                    isSelected={isSelected}
                                    onActivate={() =>
                                        article ? handleSelect(article.slug) : window.open(repo.href, "_blank", "noopener,noreferrer")
                                    }
                                />
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Projects;
