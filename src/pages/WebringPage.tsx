import { Link } from "react-router-dom";
import Nav from "@/components/soundemote/Nav";

const WebringPage = () => (
  <main className="min-h-screen bg-background text-foreground">
    <Nav />
    <section className="container mx-auto max-w-2xl px-6 py-20">
      <p className="mono text-xs uppercase tracking-[0.22em] text-scope">webring</p>
      <h1 className="display mt-5 text-4xl font-semibold leading-tight text-warm-white">
        Friends of the station
      </h1>
      <p className="mt-5 text-base leading-7 text-muted-foreground">
        A handful of nearby projects and instruments on the same frequency.
      </p>
      <div className="mt-10">
        <a
          href="https://laserpilot.github.io/interactive-installation-multitool/"
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-3 rounded-lg border border-border/60 bg-card/70 p-4 shadow-[var(--shadow-panel)] transition hover:border-scope/70"
        >
          <span className="text-2xl">🌐</span>
          <div>
            <span className="display block text-lg font-semibold text-warm-white group-hover:text-scope">
              Interactive Installation Multitool
            </span>
            <span className="mono text-xs text-muted-foreground">
              laserpilot.github.io
            </span>
          </div>
        </a>
      </div>
      <div className="mt-10">
        <Link
          to="/"
          className="mono text-xs text-muted-foreground hover:text-foreground"
        >
          ← soundemote
        </Link>
      </div>
    </section>
  </main>
);

export default WebringPage;
