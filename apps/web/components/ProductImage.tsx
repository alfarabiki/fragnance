"use client";

import Image from "next/image";

interface ProductImageProps {
  src?: string;
  alt: string;
  priority?: boolean;
  className?: string;
  aspect?: string;
}

/**
 * Product image. Uses next/image when a src exists, or a stylized gradient
 * block placeholder (no broken images). Always sets ratio + sized hint to
 * prevent CLS per docs/performance.md §41.
 */
export function ProductImage({
  src,
  alt,
  priority = false,
  className = "",
  aspect = "aspect-[4/5]",
}: ProductImageProps) {
  if (src) {
    return (
      <div className={`relative overflow-hidden ${aspect} ${className}`}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 640px) 50vw, 25vw"
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={alt}
      className={`flex items-center justify-center ${aspect} ${className} bg-linear-to-br from-black-600 to-deep-green`}
    >
      <span className="text-display-3 font-semibold text-ivory/40">ATLASE</span>
    </div>
  );
}