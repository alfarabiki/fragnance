"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

// Premium "expo out" — decisive settle, no bounce. Used for every reveal so
// the whole page shares one motion signature instead of mismatched eases.
export const EASE_ATLASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  /** "mount" plays once on render (hero); "scroll" plays once when it enters view. */
  mode?: "mount" | "scroll";
}

export function Reveal({ children, className, delay = 0, y = 20, mode = "scroll" }: RevealProps) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return <div className={className}>{children}</div>;

  const hidden = { opacity: 0, y };
  const shown = { opacity: 1, y: 0, transition: { duration: 0.6, delay, ease: EASE_ATLASE } };

  return (
    <motion.div
      className={className}
      initial={hidden}
      {...(mode === "mount"
        ? { animate: shown }
        : { whileInView: shown, viewport: { once: true, margin: "-80px" } })}
    >
      {children}
    </motion.div>
  );
}

const groupVariants = (stagger: number): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren: 0.05 } },
});

interface StaggerGroupProps {
  children: ReactNode;
  className?: string;
  stagger?: number;
  mode?: "mount" | "scroll";
}

export function StaggerGroup({ children, className, stagger = 0.1, mode = "scroll" }: StaggerGroupProps) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial="hidden"
      variants={groupVariants(stagger)}
      {...(mode === "mount" ? { animate: "show" } : { whileInView: "show", viewport: { once: true, margin: "-80px" } })}
    >
      {children}
    </motion.div>
  );
}

const itemVariants = (y: number): Variants => ({
  hidden: { opacity: 0, y },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_ATLASE } },
});

export function StaggerItem({ children, className, y = 16 }: { children: ReactNode; className?: string; y?: number }) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return <div className={className}>{children}</div>;

  return (
    <motion.div className={className} variants={itemVariants(y)}>
      {children}
    </motion.div>
  );
}
