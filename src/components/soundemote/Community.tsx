const socials = [
  { name: "Discord", href: "https://discord.gg/hjpBC8kZ3s", handle: "https://discord.gg/hjpBC8kZ3s" },
  { name: "YouTube", href: "http://www.youtube.com/@soundemote0", handle: "@soundemote0" },
  { name: "X", href: "https://x.com/soundemote", handle: "@soundemote" },
  { name: "Bluesky", href: "https://bsky.app/profile/soundemote.bsky.social", handle: "@soundemote.bsky.social" },
];

export const Community = () => (
  <section id="community" className="relative py-24 md:py-32 border-t border-border/40 bg-secondary/20">
    <div className="container max-w-2xl text-center">
      <p className="mono text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">/* community */</p>
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
