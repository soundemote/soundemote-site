import Nav from "@/components/soundemote/Nav";
import Hero from "@/components/soundemote/Hero";
import StarField from "@/components/soundemote/StarField";
import PhosphorSpotlight from "@/components/soundemote/PhosphorSpotlight";
import Projects from "@/components/soundemote/Projects";
import ScopeLab from "@/components/soundemote/ScopeLab";
import Footer from "@/components/soundemote/Footer";

const Index = () => (
  <main className="relative z-10 min-h-screen text-foreground scroll-smooth">
    <StarField />
    <Nav />
    <Hero />
    <PhosphorSpotlight />
    <Projects />
    <ScopeLab />
    <Footer />
  </main>
);

export default Index;
