import { useState, useEffect } from "react";
import Nav from "@/components/soundemote/Nav";
import Hero from "@/components/soundemote/Hero";
import StarField from "@/components/soundemote/StarField";
import FeaturedArticleSection from "@/components/soundemote/FeaturedArticleSection";
import Projects from "@/components/soundemote/Projects";
import ScopeLab from "@/components/soundemote/ScopeLab";
import Footer from "@/components/soundemote/Footer";
import { useNavigate } from "react-router-dom";
import { featuredArticles, findFeaturedArticle } from "@/data/featuredArticles";

const DEFAULT_FEATURED_SLUG = "simd";

const Index = ({ featuredSlug }: { featuredSlug?: string }) => {
  const navigate = useNavigate();
  const [selectedSlug, setSelectedSlug] = useState(
    featuredSlug && findFeaturedArticle(featuredSlug) ? featuredSlug : DEFAULT_FEATURED_SLUG,
  );

  // When arriving on an article route (e.g. /simd, /lastclock), feature that
  // article on the front page and scroll down to it.
  useEffect(() => {
    if (featuredSlug && findFeaturedArticle(featuredSlug)) {
      setSelectedSlug(featuredSlug);
      requestAnimationFrame(() => {
        document.getElementById("featured-article")?.scrollIntoView({ block: "start" });
      });
    }
  }, [featuredSlug]);

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
      <Hero />
      <FeaturedArticleSection id="featured-article" article={selectedArticle} />
      <Projects selectedSlug={selectedSlug} onSelectArticle={handleSelectArticle} />
      <ScopeLab />
      <Footer />
    </main>
  );
};

export default Index;
