import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Nav from "@/components/soundemote/Nav";
import Hero from "@/components/soundemote/Hero";
import StarField from "@/components/soundemote/StarField";
import FeaturedArticleSection from "@/components/soundemote/FeaturedArticleSection";
import GradientCurveSpotlight from "@/components/soundemote/GradientCurveSpotlight";
import Projects from "@/components/soundemote/Projects";
import ScopeLab from "@/components/soundemote/ScopeLab";
import Footer from "@/components/soundemote/Footer";
import { featuredArticles, findFeaturedArticle } from "@/data/featuredArticles";

const DEFAULT_FEATURED_SLUG = "phosphor";

type IndexProps = {
  /** Article to feature in the front-page article section (e.g. /simd). */
  featuredSlug?: string;
  /** Patch slug for the hero sandbox (e.g. /reverb, /shootingstar). */
  patchSlug?: string;
  /** Replace the hero sandbox with the gradient widget (phosphor page). */
  gradientHero?: boolean;
};

const Index = ({ featuredSlug, patchSlug, gradientHero }: IndexProps) => {
  const navigate = useNavigate();
  const [selectedSlug, setSelectedSlug] = useState(
    featuredSlug && findFeaturedArticle(featuredSlug) ? featuredSlug : DEFAULT_FEATURED_SLUG,
  );

  // Arriving on an article route features that article and scrolls to it.
  useEffect(() => {
    if (featuredSlug && findFeaturedArticle(featuredSlug)) {
      setSelectedSlug(featuredSlug);
      requestAnimationFrame(() => {
        document.getElementById("featured-article")?.scrollIntoView({ block: "start" });
      });
    }
  }, [featuredSlug]);

  const selectedArticle = findFeaturedArticle(selectedSlug) ?? featuredArticles[0];

  // Selecting a repo in the constellation updates the URL to /article-slug
  // while keeping the full front page in view.
  const handleSelectArticle = (slug: string) => {
    setSelectedSlug(slug);
    navigate(`/${slug}`);
  };

  return (
    <main className="relative z-10 min-h-screen text-foreground scroll-smooth">
      <StarField />
      <Nav />
      {gradientHero ? (
        <section className="relative overflow-hidden px-4 py-8 md:py-10">
          <div className="absolute inset-0 scope-grid opacity-40" aria-hidden />
          <div className="absolute inset-0 bg-[var(--gradient-hero)]" aria-hidden />
          <div className="relative mx-auto flex max-w-6xl justify-center">
            <GradientCurveSpotlight compact />
          </div>
        </section>
      ) : (
        <Hero patchSlug={patchSlug} />
      )}
      <FeaturedArticleSection article={selectedArticle} />
      <Projects selectedSlug={selectedSlug} onSelectArticle={handleSelectArticle} />
      <ScopeLab />
      <Footer />
    </main>
  );
};

export default Index;
