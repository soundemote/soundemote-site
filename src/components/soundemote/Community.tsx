const socials = [
  { name: "GitHub", href: "https://github.com/soundemote", handle: "@soundemote" },
  { name: "Discord", href: "https://discord.gg/hjpBC8kZ3s", handle: "join the server" },
  { name: "X", href: "https://x.com/soundemote", handle: "@soundemote" },
  { name: "Bluesky", href: "https://bsky.app/profile/soundemote.bsky.social", handle: "@soundemote.bsky.social" },
];

export const Community = () => (
  <section id="community" className="relative py-24 md:py-32 border-t border-border/40 bg-secondary/20">
    <div className="container max-w-2xl text-center">
      <p className="mono text-xs uppercase tracking-[0.3em] text-scope mb-4">/* community */</p>
      <h2 className="display text-3xl md:text-5xl text-warm-white leading-tight">
        Follow the build. Shape what comes next.
      </h2>
      <p className="mt-6 text-muted-foreground leading-relaxed mx-auto max-w-md">
        We build in public. Come hang out, try early stuff, and talk with Binary Architects, Chaostronauts, Acoustic Aviators, Melody Scouts, and Sonic Adventurers.
      </p>
      <ul className="mt-12 grid gap-3 w-full max-w-md mx-auto text-left">
          {socials.map((s) => (
            <li key={s.name}>
              <a
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-between rounded-xl border border-border bg-card/40 px-5 py-4 transition-all hover:border-scope/50 hover:bg-card"
              >
                <span className="flex items-center gap-4">
                  <span className="mono text-xs uppercase tracking-[0.2em] text-scope w-20">
                    {s.name}
                  </span>
                  <span className="text-warm-white">{s.handle}</span>
                </span>
                <span className="text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-scope">
                  →
                </span>
              </a>
            </li>
          ))}
        </ul>
    </div>
  </section>
);

export default Community;