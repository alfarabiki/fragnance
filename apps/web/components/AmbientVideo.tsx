"use client";

import { useEffect, useRef, useState } from "react";

interface AmbientVideoProps {
  mp4: string;
  webm: string;
  poster: string;
  className?: string;
}

/**
 * Silent, looping, self-hosted product footage. Autoplay only when the
 * browser allows it and the visitor hasn't asked for reduced motion — the
 * poster frame alone is a perfectly good static image otherwise.
 */
export function AmbientVideo({ mp4, webm, poster, className = "" }: AmbientVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (reduceMotion) el.pause();
    else el.play().catch(() => {}); // autoplay can still be blocked; poster covers that
  }, [reduceMotion]);

  return (
    <video
      ref={videoRef}
      className={className}
      poster={poster}
      muted
      loop
      playsInline
      autoPlay={!reduceMotion}
      preload="metadata"
      aria-hidden
    >
      <source src={webm} type="video/webm" />
      <source src={mp4} type="video/mp4" />
    </video>
  );
}
