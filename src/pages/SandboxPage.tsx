const SandboxPage = () => (
  <main className="min-h-screen bg-background text-foreground">
    <section className="h-screen w-full overflow-hidden">
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
