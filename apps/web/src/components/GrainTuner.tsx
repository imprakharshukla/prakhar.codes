// Dev-only grain control: one slider from "no grain" to "very grainy". It drives the grain
// variables in global.css (opacity in light and dark mode). Rendered only when
// import.meta.env.DEV, so it never shows in production. The level is remembered in localStorage.
import { useEffect, useState } from "react";

const KEY = "grain-level";
const DEFAULT = 23; // matches the shipped defaults: 0.07 light, 0.11 dark (rounded)

const light = (level: number) => +(level * 0.003).toFixed(3);
const dark = (level: number) => +(level * 0.0048).toFixed(3);

export function GrainTuner() {
  const [level, setLevel] = useState(() => Number(localStorage.getItem(KEY) ?? DEFAULT));
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const s = document.documentElement.style;
    s.setProperty("--grain-opacity", String(light(level)));
    s.setProperty("--grain-opacity-dark", String(dark(level)));
    localStorage.setItem(KEY, String(level));
  }, [level]);

  if (!open)
    return (
      <button onClick={() => setOpen(true)} className="fixed bottom-4 left-4 z-[70] rounded-full border bg-background px-3 py-1 text-xs shadow">
        grain {level}
      </button>
    );

  return (
    <div className="fixed bottom-4 left-4 z-[70] w-56 rounded-lg border bg-background/95 p-3 text-xs text-foreground shadow-lg backdrop-blur flex flex-col gap-2">
      <div className="flex justify-between font-semibold">
        <span>Grain: {level}</span>
        <button onClick={() => setOpen(false)} aria-label="Hide">✕</button>
      </div>
      <input type="range" min={0} max={100} step={1} value={level} onChange={(e) => setLevel(Number(e.target.value))} aria-label="Grain" />
      <div className="flex justify-between text-muted-foreground">
        <span>less</span>
        <span>more</span>
      </div>
    </div>
  );
}
