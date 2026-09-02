"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Button, Pill, PriceDisplay, Stack } from "@atlase/ui";
import { ProductImage } from "@/components/ProductImage";
import { EASE_ATLASE } from "@/components/motion/Reveal";

interface Fragrance {
  slug: string;
  name: string;
  desc: string;
  price: number;
  badge: "BEST SELLER" | "POPULAR" | "NEW";
}

export function ProductCard({ fragrance: f, priority = false }: { fragrance: Fragrance; priority?: boolean }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.article
      className="rounded-lg border border-black-400 bg-black-600 p-6"
      transition={{ duration: 0.3, ease: EASE_ATLASE }}
      {...(!reduceMotion && { whileHover: { y: -6, borderColor: "var(--color-emerald)" } })}
    >
      <Stack className="gap-3">
        <ProductImage alt={f.name} priority={priority} />
        <Pill>{f.badge}</Pill>
        <h3 className="text-heading-1">{f.name}</h3>
        <p className="text-body-sm text-muted-gray">{f.desc}</p>
        <PriceDisplay price={f.price} prefix />
        <Button intent="primary" size="md" asChild>
          <a href={`/produk/${f.slug}`}>Pilih Aroma</a>
        </Button>
      </Stack>
    </motion.article>
  );
}
