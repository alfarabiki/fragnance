"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Button, Pill, PriceDisplay, Stack } from "@atlase/ui";
import { ProductImage } from "@/components/ProductImage";
import { EASE_ATLASE } from "@/components/motion/Reveal";
import { useCart } from "@/components/cart/CartProvider";
import { thumbUrl } from "@/lib/catalog";
import type { LiveFragrance, LiveBottle, LivePackaging } from "@/lib/catalog";

interface Props {
  fragrance: LiveFragrance;
  bottle: LiveBottle;
  packaging: LivePackaging;
  unitPrice: number;
  originalUnitPrice: number | null;
  priority?: boolean;
}

export function ProductCard({ fragrance, bottle, packaging, unitPrice, originalUnitPrice, priority = false }: Props) {
  const reduceMotion = useReducedMotion();
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const inStock = fragrance.inStock && bottle.inStock && packaging.inStock;

  const handleAddToCart = () => {
    if (!inStock) return;
    addItem({
      fragranceId: fragrance.id,
      fragranceName: fragrance.name,
      volumeMl: bottle.volumeMl,
      fragranceMl: Math.min(Math.max(25, fragrance.minMl), fragrance.maxMl),
      bottleId: bottle.id,
      bottleName: bottle.name,
      packagingId: packaging.id,
      packagingName: packaging.name,
      unitPrice,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  return (
    <motion.article
      className="rounded-lg border border-black-400 bg-black-600 p-6"
      transition={{ duration: 0.3, ease: EASE_ATLASE }}
      {...(!reduceMotion && { whileHover: { y: -6, borderColor: "var(--color-emerald)" } })}
    >
      <Stack className="gap-3">
        <a href={`/produk/${fragrance.slug}`} aria-label={`Atur sendiri ${fragrance.name}`}>
          <ProductImage alt={fragrance.name} priority={priority} {...(thumbUrl(fragrance.imageUrl, priority ? 600 : 320) ? { src: thumbUrl(fragrance.imageUrl, priority ? 600 : 320)! } : {})} />
          {!inStock ? (
            <Pill className="bg-black-400 text-ivory">Habis</Pill>
          ) : fragrance.discountPercent > 0 ? (
            <Pill className="bg-error text-ivory">Diskon {fragrance.discountPercent}%</Pill>
          ) : fragrance.badge ? (
            <Pill>{fragrance.badge}</Pill>
          ) : null}
          <h3 className="text-heading-1">{fragrance.name}</h3>
          <p className="text-body-sm text-muted-gray">{fragrance.description}</p>
        </a>
        <div className="flex items-baseline gap-2">
          {originalUnitPrice && originalUnitPrice > unitPrice ? (
            <span className="text-body-sm text-muted-gray line-through">
              Rp{originalUnitPrice.toLocaleString("id-ID")}
            </span>
          ) : null}
          <PriceDisplay price={unitPrice} prefix />
        </div>
        <Button intent="primary" size="md" onClick={handleAddToCart} disabled={!inStock}>
          {!inStock ? "Stok Habis" : added ? "✓ Masuk keranjang" : "Tambah ke Keranjang"}
        </Button>
        <a href={`/produk/${fragrance.slug}`} className="text-center text-caption text-muted-gray hover:text-emerald">
          Atur sendiri wanginya
        </a>
      </Stack>
    </motion.article>
  );
}
