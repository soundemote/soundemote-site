import Nav from "@/components/soundemote/Nav";
import StarField from "@/components/soundemote/StarField";
import Footer from "@/components/soundemote/Footer";

const LearningLab = () => (
  <main className="min-h-screen text-foreground">
    <StarField />
    <Nav />
    <section className="relative flex min-h-screen items-center justify-center px-6 pt-20">
      <div className="flex flex-wrap justify-center gap-4">
      <a
        href="/oscilloscope"
        className="mono inline-flex items-center justify-center rounded-full border border-scope/50 bg-scope/10 px-6 py-3 text-xs uppercase tracking-[0.2em] text-scope transition-colors hover:bg-scope/20 hover:text-scope-glow"
      >
        Open Oscilloscope
      </a>
      <a
        href="/circle-test"
        className="mono inline-flex items-center justify-center rounded-full border border-accent/50 bg-accent/10 px-6 py-3 text-xs uppercase tracking-[0.2em] text-accent transition-colors hover:bg-accent/20 hover:text-accent"
      >
        Circle Test
      </a>
      </div>
    </section>
    <Footer />
  </main>
);

export default LearningLab;
