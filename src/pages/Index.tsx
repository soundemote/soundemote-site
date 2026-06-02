import Nav from "@/components/soundemote/Nav";
import Hero from "@/components/soundemote/Hero";
import StarField from "@/components/soundemote/StarField";
import Projects from "@/components/soundemote/Projects";
import Philosophy from "@/components/soundemote/Philosophy";
import Audiences from "@/components/soundemote/Audiences";
import Community from "@/components/soundemote/Community";
import ScopeLab from "@/components/soundemote/ScopeLab";
import Footer from "@/components/soundemote/Footer";

const Index = () => (
  <main className="relative z-10 min-h-screen text-foreground scroll-smooth">
    <StarField />
    <Nav />
    <Hero />
    <Projects />
    <Philosophy />
    <Audiences />
    <Community />
    <ScopeLab />
    <Footer />
  </main>
);

export default Index;
