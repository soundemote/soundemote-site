import { useEffect, useRef, useState } from "react";

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

// Shared with Nav.tsx's SandboxNavLink zap effect -- same .sandbox-burst /
// .sandbox-bolt-* keyframes defined in index.css, reused here for a
// mousedown "electric explosion" instead of a hover-triggered one.
export function useElectricBurst() {
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

  return { bursts, triggerBurst };
}

export function ElectricBurst({ bursts }: { bursts: Burst[] }) {
  return (
    <>
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
    </>
  );
}
