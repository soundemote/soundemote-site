import { useState } from "react";
import { toast } from "@/hooks/use-toast";

export const Contact = () => {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSent(true);
    toast({
      title: "Signal received",
      description: "Thanks for reaching out — we'll respond soon.",
    });
    (e.target as HTMLFormElement).reset();
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <section id="contact" className="relative py-24 md:py-32 border-t border-border/40">
      <div className="container grid gap-12 md:grid-cols-2 max-w-6xl">
        <div>
          <p className="mono text-xs uppercase tracking-[0.3em] text-scope mb-4">// contact</p>
          <h2 className="display text-3xl md:text-5xl text-warm-white leading-tight">
            Say hello, share a signal.
          </h2>
          <p className="mt-6 text-muted-foreground leading-relaxed max-w-md">
            For collaboration, press, plugin testing, or general curiosity — we'd love to hear from you.
          </p>
          <div className="mt-10 rounded-xl border border-border bg-card/40 p-6 mono text-sm">
            <div className="text-scope mb-2">⌁ soundemote, llc</div>
            <div className="text-warm-white">Mesa, Arizona</div>
            <div className="text-muted-foreground mt-4 text-xs">
              33.4152° N · 111.8315° W
            </div>
          </div>
        </div>
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-border bg-[var(--gradient-panel)] p-8 space-y-5"
        >
          <div>
            <label className="mono text-xs uppercase tracking-[0.2em] text-muted-foreground block mb-2">
              Name
            </label>
            <input
              required
              type="text"
              className="w-full rounded-md border border-border bg-background/60 px-4 py-3 text-warm-white outline-none focus:border-scope transition-colors"
            />
          </div>
          <div>
            <label className="mono text-xs uppercase tracking-[0.2em] text-muted-foreground block mb-2">
              Email
            </label>
            <input
              required
              type="email"
              className="w-full rounded-md border border-border bg-background/60 px-4 py-3 text-warm-white outline-none focus:border-scope transition-colors"
            />
          </div>
          <div>
            <label className="mono text-xs uppercase tracking-[0.2em] text-muted-foreground block mb-2">
              Message
            </label>
            <textarea
              required
              rows={5}
              className="w-full rounded-md border border-border bg-background/60 px-4 py-3 text-warm-white outline-none focus:border-scope transition-colors resize-none"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-full bg-scope px-6 py-3 mono text-xs uppercase tracking-[0.25em] text-primary-foreground transition-all hover:shadow-[0_0_30px_hsl(var(--scope)/0.5)]"
          >
            {sent ? "✓ Sent" : "Transmit"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default Contact;