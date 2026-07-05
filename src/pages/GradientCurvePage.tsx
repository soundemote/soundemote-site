import { useState } from "react";
import Nav from "@/components/soundemote/Nav";
import StarField from "@/components/soundemote/StarField";
import GradientCurveWidget from "@/good-code/gradient-curve-widget/GradientCurveWidget";

const GradientCurvePage = () => {
  const [avoidDotArea, setAvoidDotArea] = useState(true);

  return (
    <main className="min-h-screen text-foreground">
      <StarField avoidDotArea={avoidDotArea} />
      <Nav />
      <section className="relative px-4 pb-8 pt-24 md:px-6">
        <div className="mx-auto flex w-full max-w-[1800px] flex-col gap-4">
          <div className="flex flex-col gap-4 rounded-lg border border-border/60 bg-background/70 p-4 backdrop-blur-sm md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mono text-[10px] uppercase tracking-[0.3em] text-accent">/* the dot */</p>
              <h1 className="display mt-2 text-3xl text-warm-white">Gradient Curve Widget</h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                The start of our video engine. A dot drawn from a curve — the
                same "equation over time" idea behind our audio oscillators,
                applied to color and falloff instead of pitch and amplitude.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAvoidDotArea((prev) => !prev)}
              title="Ambient stars still fill the rest of the page; shooting stars always pass through the widget either way"
              className="mono inline-flex w-fit items-center gap-2 rounded-full border border-scope/50 px-4 py-1.5 text-[0.65rem] uppercase tracking-[0.14em] text-scope transition-colors hover:bg-scope/10"
            >
              {avoidDotArea ? "show stars over dot" : "keep stars off dot"}
            </button>
          </div>
          <div className="relative h-[min(78vh,calc((100vw-2rem)*0.72))] min-h-[36rem] w-full overflow-hidden rounded-xl border border-border bg-[var(--gradient-panel)]">
            <GradientCurveWidget />
          </div>
        </div>
      </section>
    </main>
  );
};

export default GradientCurvePage;
