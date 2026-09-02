"use client";

import { useEffect, useState } from "react";
import { formatRupiah } from "@atlase/ui";

/**
 * Animate the starting price from 0 → target on mount.
 * Respects prefers-reduced-motion (jumps straight to target).
 */
export function PriceTicker({ target = 29000 }: { target?: number }) {
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setAmount(target);
      return;
    }
    const duration = 900;
    const start = performance.now();
    let raf: number;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setAmount(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  return (
    <span className="inline-block tabular-nums text-display-2 text-emerald">
      {formatRupiah(amount, { prefix: true })}
    </span>
  );
}