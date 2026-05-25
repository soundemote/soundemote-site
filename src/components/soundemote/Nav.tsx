const links = [
  { href: "/#projects", label: "Projects" },
  { href: "/#philosophy", label: "Philosophy" },
  { href: "/#developers", label: "Developers" },
  { href: "/#community", label: "Community" },
  { href: "/#contact", label: "Contact" },
];

export const Nav = () => (
  <header className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/70 backdrop-blur-xl">
    <nav className="container flex h-16 items-center justify-between" aria-label="Primary">
      <a href="/" className="group flex items-center gap-2 mono text-sm tracking-wider">
        <span className="text-scope text-glow">✧</span>
        <span className="display text-warm-white">soundemote</span>
        <span className="text-muted-foreground hidden sm:inline">, LLC</span>
      </a>
      <ul className="hidden md:flex items-center gap-8 mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
        {links.map((l) => (
          <li key={l.href}>
            <a href={l.href} className="transition-colors hover:text-scope focus-visible:text-scope outline-none">
              {l.label}
            </a>
          </li>
        ))}
      </ul>
      <a
        href="https://discord.gg/hjpBC8kZ3s"
        target="_blank"
        rel="noreferrer"
        className="mono text-xs uppercase tracking-[0.18em] rounded-full border border-scope/40 px-4 py-2 text-scope hover:bg-scope/10 transition-colors"
      >
        Discord
      </a>
    </nav>
  </header>
);

export default Nav;
