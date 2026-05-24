import Nav from "@/components/soundemote/Nav";
import Hero from "@/components/soundemote/Hero";
import Projects from "@/components/soundemote/Projects";
import Philosophy from "@/components/soundemote/Philosophy";
import Audiences from "@/components/soundemote/Audiences";
import Community from "@/components/soundemote/Community";
import Contact from "@/components/soundemote/Contact";
import Footer from "@/components/soundemote/Footer";

const Index = () => (
  <main className="min-h-screen bg-background text-foreground scroll-smooth">
    <Nav />
    <Hero />
    <Projects />
    <Philosophy />
    <Audiences />
    <Community />
    <Contact />
    <Footer />
  </main>
);

export default Index;
