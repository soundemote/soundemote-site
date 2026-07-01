import { Link } from "react-router-dom";

type Release = {
  version: string;
  date: string;
  tag?: string;
  changes: string[];
};

const releases: Release[] = [
  {
    version: "0.2.0",
    date: "2026-07-01",
    tag: "alpha",
    changes: [
      "User accounts with Google, Discord, and email/password sign-in, with persistent sessions.",
      "Profiles with reserved handles, avatar upload + 512×512 crop editor, and a profile picture square.",
      "Per-user file links with per-file privacy controls.",
      "Per-user init patches saved to your account, falling back to the wikireview default for new users.",
      "Claim & review workflow for community wiki articles.",
      "Admin dashboard with a Users page and role-based moderation.",
      "Wiki page system with an index and patch shortlinks routed to wiki sublinks.",
      "Static patch routes: /reverb, /shootingstar, and /tweet, with polyblep_reverb as the default patch.",
      "Lorenz shooting-star field driven by the sandbox, with asteroid collisions and explosion-power sound triggers.",
      "Embedded sandbox synced to latest: module browser fixes, native-module WASM support, and Code button fix on static hosting.",
      "Curated patch banks (Wikireview / soundemote) and bird_sounds patch.",
      "\"Silently Dreaming\" by Elan Hickler as the startup audio.",
    ],
  },
  {
    version: "0.1.0",
    date: "2026-05-01",
    tag: "alpha",
    changes: [
      "Initial community wiki with open pages and edits.",
      "Patch and DSP knowledge reference structure.",
      "Lorenz attractor oscilloscope with zoom, rotate, and trace controls.",
    ],
  },
];

const ChangelogPage = () => (
  <main className="min-h-screen bg-background text-foreground">
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <Link to="/" className="mono text-xs text-muted-foreground hover:text-foreground">
        &lt; soundemote
      </Link>

      <header className="mt-8 mb-10">
        <h1 className="display text-4xl">soemdsp-wiki changelog</h1>
        <p className="mono text-xs text-muted-foreground mt-2">
          Release history for the community wiki.
        </p>
      </header>

      <div className="space-y-10">
        {releases.map((r) => (
          <section key={r.version}>
            <div className="flex items-baseline gap-3 mb-3">
              <h2 className="display text-2xl text-scope">v{r.version}</h2>
              {r.tag && (
                <span className="mono text-[0.625rem] uppercase tracking-[0.25em] text-muted-foreground">
                  {r.tag}
                </span>
              )}
              <span className="mono text-xs text-muted-foreground ml-auto">{r.date}</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-warm-white/80 leading-relaxed">
              {r.changes.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  </main>
);

export default ChangelogPage;
