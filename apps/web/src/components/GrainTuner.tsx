// Dev-only panel for tuning the film-grain overlay (see the grain variables in global.css).
// Rendered only when import.meta.env.DEV, so it never ships. Settings persist in localStorage;
// "Copy CSS" gives the :root block to paste into global.css once the look is final.
import { useEffect, useState } from "react";

type Grain = {
  opacity: number;
  opacityDark: number;
  size: number;
  frequency: number;
  octaves: number;
  blend: string;
  blendDark: string;
};

const DEFAULTS: Grain = {
  opacity: 0.07,
  opacityDark: 0.11,
  size: 220,
  frequency: 0.85,
  octaves: 3,
  blend: "multiply",
  blendDark: "screen",
};
const KEY = "grain-tuner";
const BLENDS = ["multiply", "screen", "overlay", "soft-light", "normal"];

const noise = (g: Grain) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='${g.size}' height='${g.size}'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='${g.frequency}' numOctaves='${g.octaves}' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`,
  )}")`;

function apply(g: Grain) {
  const s = document.documentElement.style;
  s.setProperty("--grain-opacity", String(g.opacity));
  s.setProperty("--grain-opacity-dark", String(g.opacityDark));
  s.setProperty("--grain-size", `${g.size}px`);
  s.setProperty("--grain-blend", g.blend);
  s.setProperty("--grain-blend-dark", g.blendDark);
  s.setProperty("--grain-image", noise(g));
}

const css = (g: Grain) => `:root {
  --grain-opacity: ${g.opacity};
  --grain-opacity-dark: ${g.opacityDark};
  --grain-size: ${g.size}px;
  --grain-blend: ${g.blend};
  --grain-blend-dark: ${g.blendDark};
  --grain-image: ${noise(g)};
}`;

export function GrainTuner() {
  const [open, setOpen] = useState(true);
  const [g, setG] = useState<Grain>(() => {
    try {
      return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || "{}") };
    } catch {
      return DEFAULTS;
    }
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    apply(g);
    localStorage.setItem(KEY, JSON.stringify(g));
  }, [g]);

  const set = <K extends keyof Grain>(k: K, v: Grain[K]) => setG((p) => ({ ...p, [k]: v }));
  const slider = (label: string, k: "opacity" | "opacityDark" | "size" | "frequency" | "octaves", min: number, max: number, step: number) => (
    <label className="flex flex-col gap-1">
      <span className="flex justify-between">
        <span>{label}</span>
        <span className="tabular-nums">{g[k]}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={g[k]} onChange={(e) => set(k, Number(e.target.value))} />
    </label>
  );
  const select = (label: string, k: "blend" | "blendDark") => (
    <label className="flex justify-between items-center gap-2">
      <span>{label}</span>
      <select className="bg-background border rounded px-1" value={g[k]} onChange={(e) => set(k, e.target.value)}>
        {BLENDS.map((b) => (
          <option key={b}>{b}</option>
        ))}
      </select>
    </label>
  );

  if (!open)
    return (
      <button onClick={() => setOpen(true)} className="fixed bottom-4 left-4 z-[70] rounded-full border bg-background px-3 py-1 text-xs shadow">
        grain
      </button>
    );

  return (
    <div className="fixed bottom-4 left-4 z-[70] w-64 rounded-lg border bg-background/95 p-3 text-xs text-foreground shadow-lg backdrop-blur flex flex-col gap-3">
      <div className="flex justify-between font-semibold">
        <span>Grain tuner (dev only)</span>
        <button onClick={() => setOpen(false)}>✕</button>
      </div>
      {slider("Opacity (light)", "opacity", 0, 0.4, 0.005)}
      {slider("Opacity (dark)", "opacityDark", 0, 0.4, 0.005)}
      {slider("Grain fineness (baseFrequency)", "frequency", 0.2, 2, 0.05)}
      {slider("Octaves (detail)", "octaves", 1, 6, 1)}
      {slider("Tile size (px)", "size", 64, 512, 8)}
      {select("Blend (light)", "blend")}
      {select("Blend (dark)", "blendDark")}
      <div className="flex gap-2">
        <button
          className="flex-1 rounded border px-2 py-1 hover:bg-primary/10"
          onClick={() => {
            navigator.clipboard.writeText(css(g));
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
          }}
        >
          {copied ? "Copied" : "Copy CSS"}
        </button>
        <button className="rounded border px-2 py-1 hover:bg-primary/10" onClick={() => setG(DEFAULTS)}>
          Reset
        </button>
      </div>
    </div>
  );
}
