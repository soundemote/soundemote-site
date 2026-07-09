import { Link } from "react-router-dom";
import Nav from "@/components/soundemote/Nav";
import { webringLinks } from "@/config/site";


const WebringPage = () => (
  <main className="min-h-screen bg-background text-foreground">
    <Nav />
    <section className="container mx-auto max-w-2xl px-6 py-12">
      <p className="mono text-xs uppercase tracking-[0.22em] text-scope">webring</p>
      <p className="mt-3 text-sm text-muted-foreground">
        Want to join?{" "}
        <a
          href="mailto:soundemote@gmail.com"
          className="text-scope hover:underline"
        >
          Email soundemote@gmail.com
        </a>
        .
      </p>
      <div className="mt-7 grid gap-3">

        {webringLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 rounded-lg border border-border/60 bg-card/70 p-3 shadow-[var(--shadow-panel)] transition hover:border-scope/70"
          >
            <span className="text-xl">{link.emoji}</span>
            <div>
              <span className="display block text-base font-semibold text-warm-white group-hover:text-scope">
                {link.title}
              </span>
              <span className="mono block text-[0.7rem] text-muted-foreground">
                {link.host}
              </span>
              <p className="mt-0.5 text-sm leading-snug text-muted-foreground">
                {link.description}
              </p>
            </div>

          </a>
        ))}
      </div>
      <div className="mt-7">
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
