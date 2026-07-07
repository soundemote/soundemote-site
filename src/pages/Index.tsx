import { useState, useEffect } from "react";
import Nav from "@/components/soundemote/Nav";
import Hero from "@/components/soundemote/Hero";
import StarField from "@/components/soundemote/StarField";
import FeaturedArticleSection from "@/components/soundemote/FeaturedArticleSection";
import Projects from "@/components/soundemote/Projects";
import ScopeLab from "@/components/soundemote/ScopeLab";
import Footer from "@/components/soundemote/Footer";
import { featuredArticles, findFeaturedArticle } from "@/data/featuredArticles";

const DEFAULT_FEATURED_SLUG = "simd";

const Index = () => {
  const [selectedSlug, setSelectedSlug] = useState(DEFAULT_FEATURED_SLUG);

  // Handle hash links like #last-clock
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1); // remove #
      if (hash) {
        const article = findFeaturedArticle(hash) || featuredArticles.find((a) => a.slug === hash);
        if (article) {
          setSelectedSlug(hash);
          // Optional: smooth scroll to the featured section
          document.getElementById("featured-article")?.scrollIntoView({ behavior: "smooth" });
        }
      }
    };

    // Initial load
    handleHashChange();

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const selectedArticle = findFeaturedArticle(selectedSlug) ?? featuredArticles[0];

  return (
    <main className="relative z-10 min-h-screen text-foreground scroll-smooth">
      <StarField />
      <Nav />
      <Hero />
      <FeaturedArticleSection id="featured-article" article={selectedArticle} />
      <Projects selectedSlug={selectedSlug} onSelectArticle={setSelectedSlug} />
      <ScopeLab />
      <Footer />
    </main>
  );
};

export default Index;
