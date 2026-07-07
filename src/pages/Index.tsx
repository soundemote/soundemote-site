import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Nav from "@/components/soundemote/Nav";
import Hero from "@/components/soundemote/Hero";
import StarField from "@/components/soundemote/StarField";
import GradientCurveSpotlight from "@/components/soundemote/GradientCurveSpotlight";
import FeaturedArticleSection from "@/components/soundemote/FeaturedArticleSection";
import Projects from "@/components/soundemote/Projects";
import ScopeLab from "@/components/soundemote/ScopeLab";
import Footer from "@/components/soundemote/Footer";
import { featuredArticles, findFeaturedArticle } from "@/data/featuredArticles";

const DEFAULT_FEATURED_SLUG = "simd";

type IndexProps = {
  /** Article to feature in the front-page article section (e.g. /simd). */
  featuredSlug?: string;
  /** Patch slug for the hero sandbox (e.g. /reverb, /shootingstar). */
  patchSlug?: string;
};

const Index = ({ featuredSlug, patchSlug }: IndexProps) => {
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
      <Hero patchSlug={patchSlug} />

      {/* Part of the template: gradient widget sits above the article. */}
      <section className="relative overflow-hidden px-4 pb-2 pt-4 md:pt-6">
        <div className="relative mx-auto flex max-w-6xl justify-center">
          <GradientCurveSpotlight compact />
        </div>
      </section>

      <FeaturedArticleSection article={selectedArticle} />
      <Projects selectedSlug={selectedSlug} onSelectArticle={handleSelectArticle} />
      <ScopeLab />
      <Footer />
    </main>
  );
};

export default Index;
