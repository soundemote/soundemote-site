type FeaturedSandboxSectionProps = {
  /** Hash route to the sandbox patch, e.g. "/reverb". */
  route: string;
  title: string;
  tagline: string;
};

// Embeds a live, playable sandbox patch inside the front-page layout (same
// visual frame the featured article uses). The iframe points at the app's own
// embed route so the existing static-patch loading + autostart logic runs.
const FeaturedSandboxSection = ({ route, title, tagline }: FeaturedSandboxSectionProps) => (
  <section
    id="featured-article"
    className="relative scroll-mt-16 border-y border-scope/30 bg-gradient-to-b from-scope/10 via-black/60 to-background py-16 md:py-24"
  >
    <div className="container mx-auto max-w-4xl px-4">
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <h2 className="display text-3xl md:text-4xl">{title}</h2>
        <p className="mono max-w-xl text-sm text-muted-foreground">{tagline}</p>
      </div>

      <div className="overflow-hidden rounded-lg border border-border/60 bg-card/40 shadow-[0_0_60px_-15px_hsl(var(--scope)/0.5)]">
        <iframe
          title={title}
          src={`/#${route}?embed=1&autoframe=1`}
          className="h-[70vh] min-h-[520px] w-full border-0"
          allow="autoplay; microphone"
          allowFullScreen
          loading="lazy"
        />
      </div>
    </div>
  </section>
);

export default FeaturedSandboxSection;
