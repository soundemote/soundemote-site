import Nav from "@/components/soundemote/Nav";

const SandboxPage = () => (
  <main className="min-h-screen bg-background text-foreground">
    <Nav />
    <section className="h-[calc(100vh-4rem)] w-full overflow-hidden">
      <iframe
        title="soemdsp sandbox"
        src="/soemdsp-sandbox/index.html"
        className="h-full w-full border-0"
        allow="autoplay; microphone"
      />
    </section>
  </main>
);

export default SandboxPage;
