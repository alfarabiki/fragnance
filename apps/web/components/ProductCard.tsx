"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Button, Pill, PriceDisplay, Stack } from "@atlase/ui";
import { calculate, PricingError } from "@atlase/pricing";
import { getFragranceBySlug, getBottlesByVolume, packaging, alcoholSellPerMl } from "@atlase/config";
import { ProductImage } from "@/components/ProductImage";
import { EASE_ATLASE } from "@/components/motion/Reveal";
import { useCart } from "@/components/cart/CartProvider";

interface Fragrance {
  slug: string;
  name: string;
  desc: string;
  price: number;
  badge: "BEST SELLER" | "POPULAR" | "NEW";
}

const DEFAULT_VOLUME_ML = 50;
const DEFAULT_STRENGTH_ML = 25;
const DEFAULT_PACKAGING_ID = "pkg-standard";

export function ProductCard({ fragrance: f, priority = false }: { fragrance: Fragrance; priority?: boolean }) {
  const reduceMotion = useReducedMotion();
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    const fragrance = getFragranceBySlug(f.slug);
    const bottle = getBottlesByVolume(DEFAULT_VOLUME_ML)[0];
    const pkg = packaging.find((p) => p.id === DEFAULT_PACKAGING_ID);
    if (!fragrance || !bottle || !pkg) return;

    const fragranceMl = Math.min(Math.max(DEFAULT_STRENGTH_ML, fragrance.minMl), fragrance.maxMl);

    let quote;
    try {
      quote = calculate({
        fragrance: { id: fragrance.id, name: fragrance.name, pricePerMl: fragrance.pricePerMl, minMl: fragrance.minMl, maxMl: fragrance.maxMl },
        bottle: { id: bottle.id, name: bottle.name, volumeMl: bottle.volumeMl, price: bottle.sellPrice, active: bottle.isActive },
        packaging: { id: pkg.id, name: pkg.name, price: pkg.sellPrice, mandatory: pkg.isMandatory, active: pkg.isActive },
        alcohol: { pricePerMl: alcoholSellPerMl },
        volumeMl: DEFAULT_VOLUME_ML,
        fragranceMl,
      });
    } catch (e) {
      if (e instanceof PricingError) return;
      throw e;
    }

    addItem({
      fragranceId: fragrance.id,
      fragranceName: fragrance.name,
      volumeMl: DEFAULT_VOLUME_ML,
      fragranceMl,
      bottleId: bottle.id,
      bottleName: bottle.name,
      packagingId: pkg.id,
      packagingName: pkg.name,
      unitPrice: quote.total,
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
        <a href={`/produk/${f.slug}`} aria-label={`Atur sendiri ${f.name}`}>
          <ProductImage alt={f.name} priority={priority} />
          <Pill>{f.badge}</Pill>
          <h3 className="text-heading-1">{f.name}</h3>
          <p className="text-body-sm text-muted-gray">{f.desc}</p>
        </a>
        <PriceDisplay price={f.price} prefix />
        <Button intent="primary" size="md" onClick={handleAddToCart}>
          {added ? "✓ Masuk keranjang" : "Tambah ke Keranjang"}
        </Button>
        <a href={`/produk/${f.slug}`} className="text-center text-caption text-muted-gray hover:text-emerald">
          Atur sendiri wanginya
        </a>
      </Stack>
    </motion.article>
  );
}
