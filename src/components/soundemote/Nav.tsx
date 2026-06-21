import { useEffect, useRef, useState } from "react";
import ShareProjectDialog from "./ShareProjectDialog";

const links = [
  { href: "/sandbox", label: "app:(sandbox)", special: true },
  { href: "/#projects", label: "Projects" },
  { href: "/avw-research", label: "Directive" },
  { href: "/#developers", label: "Developers" },
  { href: "/#community", label: "Community" },
];

type Burst = {
  id: number;
  aX: number;
  aY: number;
  bX: number;
  bY: number;
  cX: number;
  cY: number;
  dX: number;
  dY: number;
  eX: number;
  eY: number;
};

const zapJitter = () => Math.round((Math.random() - 0.5) * 20);

function SparkTilde({
  hovered,
  reserveWhenIdle = false,
}: {
  hovered: boolean;
  reserveWhenIdle?: boolean;
}) {
  const [visible, setVisible] = useState(!reserveWhenIdle);
  const [color, setColor] = useState(() => {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 80%, 60%)`;
  });

  useEffect(() => {
    if (!hovered) return;
    let timeout = 0;
    const tick = () => {
      setVisible(Math.random() > (hovered ? 0.54 : 0.32));
      timeout = window.setTimeout(tick, hovered ? 35 + Math.random() * 170 : 280 + Math.random() * 1400);
    };
    timeout = window.setTimeout(tick, hovered ? 80 : 420);
    return () => window.clearTimeout(timeout);
  }, [hovered]);

  useEffect(() => {
    if (visible) {
      const hue = Math.floor(Math.random() * 360);
      setColor(`hsl(${hue}, 80%, 60%)`);
    }
  }, [visible]);

  return (
    <span
      style={{ color, opacity: visible ? 1 : 0 }}
      className="inline-block w-[1ch] transition-none"
    >
      ~
    </span>
  );
}

export function SandboxNavLink({ href, label }: { href: string; label: string }) {
  const [hovered, setHovered] = useState(false);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const nextBurstIdRef = useRef(0);
  const burstTimersRef = useRef<number[]>([]);

  const triggerBurst = () => {
    const id = nextBurstIdRef.current++;
    setBursts((active) => [
      ...active,
      {
        id,
        aX: zapJitter(),
        aY: zapJitter(),
        bX: zapJitter(),
        bY: zapJitter(),
        cX: zapJitter(),
        cY: zapJitter(),
        dX: zapJitter(),
        dY: zapJitter(),
        eX: zapJitter(),
        eY: zapJitter(),
      },
    ]);
    const timer = window.setTimeout(() => {
      setBursts((active) => active.filter((burst) => burst.id !== id));
    }, 1100);
    burstTimersRef.current.push(timer);
  };

  useEffect(
    () => () => {
      burstTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    },
    []
  );

  return (
    <a
      href={href}
      onMouseEnter={() => {
        setHovered(true);
        triggerBurst();
      }}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => {
        setHovered(true);
        triggerBurst();
      }}
      onBlur={() => setHovered(false)}
      className="sandbox-link group relative inline-flex items-center rounded-full px-2 py-1.5 mono normal-case text-[0.82rem] tracking-normal text-slate-300 outline-none transition-colors hover:text-slate-100 focus-visible:text-slate-100"
    >
      <SparkTilde hovered={hovered} reserveWhenIdle />
      <span>{label}</span>
      <SparkTilde hovered={hovered} />
      {bursts.map((burst) => (
        <span key={burst.id} aria-hidden className="sandbox-burst pointer-events-none absolute inset-0">
          <span
            style={{ left: `calc(8% + ${burst.aX}px)`, top: `calc(50% + ${burst.aY}px)` }}
            className="sandbox-bolt sandbox-bolt-a pointer-events-none absolute text-[0.68rem] text-[#ffe156] opacity-0"
          >
            ⚡︎
          </span>
          <span
            style={{ left: `calc(42% + ${burst.bX}px)`, top: `calc(50% + ${burst.bY}px)` }}
            className="sandbox-bolt sandbox-bolt-b pointer-events-none absolute text-[0.52rem] text-[#fff2a8] opacity-0"
          >
            ⚡︎
          </span>
          <span
            style={{ right: `calc(4% + ${burst.cX}px)`, top: `calc(50% + ${burst.cY}px)` }}
            className="sandbox-bolt sandbox-bolt-c pointer-events-none absolute text-[0.82rem] text-[#ffd447] opacity-0"
          >
            ⚡︎
          </span>
          <span
            style={{ left: `calc(66% + ${burst.dX}px)`, top: `calc(50% + ${burst.dY}px)` }}
            className="sandbox-bolt sandbox-bolt-d pointer-events-none absolute text-[0.4rem] text-[#fff7cf] opacity-0"
          >
            ⚡︎
          </span>
          <span
            style={{ left: `calc(22% + ${burst.eX}px)`, top: `calc(50% + ${burst.eY}px)` }}
            className="sandbox-bolt sandbox-bolt-e pointer-events-none absolute text-[0.58rem] text-[#ffc83d] opacity-0"
          >
            ⚡︎
          </span>
        </span>
      ))}
    </a>
  );
}

export const Nav = () => (
  <header className="relative z-50 w-full border-b border-border/40 bg-background/70 backdrop-blur-xl">
    <nav className="container flex h-16 items-center justify-between" aria-label="Primary">
      <a href="/" className="group flex items-center gap-2 mono text-sm tracking-wider">
        <span className="text-scope text-glow">✧</span>
        <span className="display text-warm-white">soundemote</span>
      </a>
      <div className="flex items-center gap-4">
        <div className="xl:hidden">
          <ShareProjectDialog />
        </div>
        <ul className="hidden xl:flex items-center gap-8 mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
          {links.map((l) => (
            <li key={l.href} className={l.special ? "mr-2" : undefined}>
              {l.special ? (
                <SandboxNavLink href={l.href} label={l.label} />
              ) : (
                <a href={l.href} className="transition-colors hover:text-scope focus-visible:text-scope outline-none">
                  {l.label}
                </a>
              )}
            </li>
          ))}
          <li>
            <ShareProjectDialog />
          </li>
        </ul>
      </div>
    </nav>
  </header>
);

export default Nav;
