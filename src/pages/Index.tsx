import { useState } from "react";
import Nav from "@/components/soundemote/Nav";
import Hero from "@/components/soundemote/Hero";
import StarField from "@/components/soundemote/StarField";
import FeaturedArticleSection from "@/components/soundemote/FeaturedArticleSection";
import Projects from "@/components/soundemote/Projects";
import ScopeLab from "@/components/soundemote/ScopeLab";
import Footer from "@/components/soundemote/Footer";
import { featuredArticles, findFeaturedArticle } from "@/data/featuredArticles";

// Superdot (the Gradient Curve Widget, embedded in the "simd" article) is
// the default thing visitors see in the featured spotlight on load.
const DEFAULT_FEATURED_SLUG = "simd";

const Index = () => {
  const [selectedSlug, setSelectedSlug] = useState(
    findFeaturedArticle(DEFAULT_FEATURED_SLUG) ? DEFAULT_FEATURED_SLUG : featuredArticles[0].slug,
  );
  const selectedArticle = findFeaturedArticle(selectedSlug) ?? featuredArticles[0];

  return (
    <main className="relative z-10 min-h-screen text-foreground scroll-smooth">
      <StarField />
      <Nav />
      <Hero />
      <FeaturedArticleSection article={selectedArticle} />
      <Projects selectedSlug={selectedSlug} onSelectArticle={setSelectedSlug} />
      <ScopeLab />
      <Footer />
    </main>
  );
};

export default Index;
