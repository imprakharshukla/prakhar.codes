"use client";

import { useRef, useEffect, useState } from "react";
import DottedMap from "dotted-map";
import { motion } from "motion/react";

type Location = {
  lat: number;
  lng: number;
  label: string;
};

type TravelLogMapProps = {
  locations: Location[];
};

export default function TravelLogMap({ locations }: TravelLogMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDark, setIsDark] = useState(false);
  const [svgMap, setSvgMap] = useState<string>("");

  useEffect(() => {
    // Check theme on mount and when it changes
    const checkTheme = () => {
      const dark = document.documentElement.classList.contains('dark');
      setIsDark(dark);

      // Generate dotted map with correct theme
      const map = new DottedMap({ height: 100, grid: "diagonal" });
      const svg = map.getSVG({
        radius: 0.22,
        color: dark ? "#FFFFFF40" : "#00000040",
        shape: "circle",
        backgroundColor: "transparent",
      });
      setSvgMap(svg);
    };
    checkTheme();

    // Watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  // Project lat/lng to x/y coordinates (equirectangular projection)
  const projectPoint = (lat: number, lng: number) => {
    const x = (lng + 180) * (800 / 360);
    const y = (90 - lat) * (400 / 180);
    return { x, y };
  };

  const markerColor = "rgb(164, 174, 244)"; // Indigo color matching the globe

  return (
    <motion.div
      className="font-sans grid gap-2 px-6 mt-2 md:px-6 w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="w-full aspect-[2/1] rounded-lg relative">
        <img
          src={`data:image/svg+xml;utf8,${encodeURIComponent(svgMap)}`}
          className="h-full w-full pointer-events-none select-none"
          alt="world map"
          height="495"
          width="1056"
          draggable={false}
        />
        <svg
          ref={svgRef}
          viewBox="0 0 800 400"
          className="w-full h-full absolute inset-0 pointer-events-none select-none"
        >
          {locations.map((location, i) => {
            const point = projectPoint(location.lat, location.lng);
            return (
              <g key={`location-${i}`}>
                {/* Static marker circle */}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="3"
                  fill={markerColor}
                />
                {/* Pulsing animation circle */}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="3"
                  fill={markerColor}
                  opacity="0.5"
                >
                  <animate
                    attributeName="r"
                    from="3"
                    to="10"
                    dur="1.5s"
                    begin="0s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    from="0.5"
                    to="0"
                    dur="1.5s"
                    begin="0s"
                    repeatCount="indefinite"
                  />
                </circle>
              </g>
            );
          })}
        </svg>
      </div>
    </motion.div>
  );
}
