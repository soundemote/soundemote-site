import { useEffect, useState } from "react";

const CHARS = [" ", ".", ":", "-", "=", "+", "*", "#", "%", "@"];

export const AsciiWave = ({ rows = 6, cols = 60 }: { rows?: number; cols?: number }) => {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setFrame((f) => f + 1), 80);
    return () => clearInterval(id);
  }, []);

  const lines: string[] = [];
  for (let y = 0; y < rows; y++) {
    let line = "";
    for (let x = 0; x < cols; x++) {
      const v =
        Math.sin(x * 0.18 + frame * 0.15) * 0.5 +
        Math.sin(x * 0.07 - frame * 0.08 + y * 0.4) * 0.5;
      const center = (rows - 1) / 2;
      const dist = Math.abs(y - center - v * (rows / 2.2));
      const idx = Math.max(0, Math.min(CHARS.length - 1, Math.floor(CHARS.length - dist * 2)));
      line += CHARS[idx];
    }
    lines.push(line);
  }

  return (
    <pre className="mono text-[10px] leading-[1.05] text-scope/80 select-none" aria-hidden>
      {lines.join("\n")}
    </pre>
  );
};

export default AsciiWave;