"use client";

import { motion, useReducedMotion } from "framer-motion";
import { AmbientVideo } from "@/components/AmbientVideo";

// The hero's signature element: real Atlase product footage (glass bottle,
// dewdrops, mint sprig) under a slow-drifting field of soft emerald blooms —
// evoking a fragrance diffusing through air rather than a static product
// shot. The blooms are purely decorative — hidden from assistive tech, never
// intercept pointer events, freeze under prefers-reduced-motion.
export function ScentField() {
  const reduceMotion = useReducedMotion();

  const blooms = [
    { size: 420, top: "8%", left: "58%", duration: 22, delay: 0 },
    { size: 300, top: "45%", left: "78%", duration: 18, delay: 2 },
    { size: 260, top: "68%", left: "48%", duration: 26, delay: 4 },
  ];

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <AmbientVideo
        mp4="/video/hero-bg.mp4"
        webm="/video/hero-bg.webm"
        poster="/video/hero-bg-poster.jpg"
        className="absolute inset-0 h-full w-full object-cover opacity-40"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
      {blooms.map((b, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-emerald/25 blur-3xl"
          style={{ width: b.size, height: b.size, top: b.top, left: b.left }}
          transition={{ duration: b.duration, delay: b.delay, repeat: Infinity, ease: "easeInOut" }}
          {...(!reduceMotion && {
            animate: {
              x: [0, 30, -20, 0],
              y: [0, -25, 15, 0],
              opacity: [0.35, 0.55, 0.4, 0.35],
            },
          })}
        />
      ))}
    </div>
  );
}
