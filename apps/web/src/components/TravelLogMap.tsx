"use client";

import { useRef, useEffect, useCallback } from "react";
import createGlobe from "cobe";
import { motion } from "motion/react";

type Location = {
  lat: number;
  lng: number;
  label: string;
};

type TravelLogMapProps = {
  locations: Location[];
};

function slugify(label: string) {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function rectsOverlap(a: DOMRect, b: DOMRect, padding = 4) {
  return !(
    a.right + padding < b.left - padding ||
    b.right + padding < a.left - padding ||
    a.bottom + padding < b.top - padding ||
    b.bottom + padding < a.top - padding
  );
}

function resolveOverlaps(container: HTMLElement, labels: HTMLElement[]) {
  // Reset all before measuring so previous hidden state doesn't interfere
  for (const el of labels) {
    delete el.dataset.hidden;
  }

  const containerStyles = getComputedStyle(container);
  const kept: DOMRect[] = [];
  for (const el of labels) {
    const id = el.dataset.markerId;
    // Read the cobe visibility variable (0 = back of globe, 1 = visible)
    const cobeVis = parseFloat(
      containerStyles.getPropertyValue(`--cobe-visible-${id}`)
    );
    if (isNaN(cobeVis) || cobeVis < 0.1) {
      continue; // cobe already hides it via inline opacity
    }

    const rect = el.getBoundingClientRect();
    const overlapping = kept.some((r) => rectsOverlap(r, rect));
    if (overlapping) {
      el.dataset.hidden = "";
    } else {
      kept.push(rect);
    }
  }
}

export default function TravelLogMap({ locations }: TravelLogMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);
  const phiRef = useRef(1.2);
  const widthRef = useRef(0);

  const markersWithIds = locations.map((loc) => ({
    id: slugify(loc.label),
    label: loc.label,
    location: [loc.lat, loc.lng] as [number, number],
    size: 0.04,
  }));

  const onResize = useCallback(() => {
    if (canvasRef.current) {
      widthRef.current = canvasRef.current.offsetWidth;
    }
  }, []);

  useEffect(() => {
    window.addEventListener("resize", onResize);
    onResize();

    const isDark = document.documentElement.classList.contains("dark");

    const globe = createGlobe(canvasRef.current!, {
      devicePixelRatio: 2,
      width: widthRef.current * 2,
      height: widthRef.current * 2,
      phi: phiRef.current,
      theta: 0.2,
      dark: isDark ? 1 : 0,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: isDark ? 2 : 6,
      baseColor: isDark ? [0.3, 0.3, 0.3] : [1, 1, 1],
      markerColor: [0.64, 0.68, 0.96],
      glowColor: isDark ? [0.15, 0.15, 0.2] : [1, 1, 1],
      markers: markersWithIds.map((m) => ({
        location: m.location,
        size: m.size,
        id: m.id,
      })),
      markerElevation: 0.02,
      scale: 1.05,
      offset: [0, 0],
      opacity: 0.85,
    });

    let frameId: number;
    let frameCount = 0;
    function animate() {
      if (!pointerInteracting.current) {
        phiRef.current += 0.003;
      }
      globe.update({
        phi: phiRef.current + pointerInteractionMovement.current,
        width: widthRef.current * 2,
        height: widthRef.current * 2,
      });
      // Check overlaps every 6 frames (~10Hz at 60fps)
      if (frameCount++ % 6 === 0 && containerRef.current) {
        const labels = Array.from(
          containerRef.current.querySelectorAll<HTMLElement>(".cobe-marker-label")
        );
        resolveOverlaps(containerRef.current, labels);
      }
      frameId = requestAnimationFrame(animate);
    }
    frameId = requestAnimationFrame(animate);

    const observer = new MutationObserver(() => {
      const dark = document.documentElement.classList.contains("dark");
      globe.update({
        dark: dark ? 1 : 0,
        mapBrightness: dark ? 2 : 6,
        baseColor: dark ? [0.3, 0.3, 0.3] : [1, 1, 1],
        glowColor: dark ? [0.15, 0.15, 0.2] : [1, 1, 1],
      });
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      cancelAnimationFrame(frameId);
      globe.destroy();
      observer.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <motion.div
      className="font-sans grid gap-2 px-6 mt-2 md:px-6 w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div
        ref={containerRef}
        className="relative mx-auto aspect-square w-full max-w-[600px]"
      >
        <canvas
          ref={canvasRef}
          className="h-full w-full cursor-grab active:cursor-grabbing"
          onPointerDown={(e) => {
            pointerInteracting.current =
              e.clientX - pointerInteractionMovement.current;
            canvasRef.current!.style.cursor = "grabbing";
          }}
          onPointerUp={() => {
            pointerInteracting.current = null;
            canvasRef.current!.style.cursor = "grab";
          }}
          onPointerOut={() => {
            pointerInteracting.current = null;
            canvasRef.current!.style.cursor = "grab";
          }}
          onMouseMove={(e) => {
            if (pointerInteracting.current !== null) {
              const delta = e.clientX - pointerInteracting.current;
              pointerInteractionMovement.current = delta / 200;
            }
          }}
          onTouchMove={(e) => {
            if (pointerInteracting.current !== null && e.touches[0]) {
              const delta = e.touches[0].clientX - pointerInteracting.current;
              pointerInteractionMovement.current = delta / 100;
            }
          }}
        />
        {markersWithIds.map((m) => (
          <div
            key={m.id}
            data-marker-id={m.id}
            className="cobe-marker-label"
            style={{
              positionAnchor: `--cobe-${m.id}`,
              opacity: `var(--cobe-visible-${m.id}, 0)`,
              filter: `blur(calc((1 - var(--cobe-visible-${m.id}, 0)) * 4px))`,
            } as React.CSSProperties}
          >
            {m.label}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
