"use client";

import { useState } from "react";
import { Pill, PriceDisplay } from "@atlase/ui";
import { ProductImage } from "@/components/ProductImage";
import { useCart } from "@/components/cart/CartProvider";
import type { LiveFragrance, LiveBottle, LivePackaging } from "@/lib/catalog";

interface Props {
  fragrance: LiveFragrance;
  bottle: LiveBottle;
  packaging: LivePackaging;
  unitPrice: number;
}

// Denser sibling of ProductCard — same ATLASE colors/typography, Shopee-style
// browsability: smaller square image, corner badge instead of a big pill,
// compact icon-only add button, so many fit on screen at once (§ etalase).
export function ProductGridCard({ fragrance, bottle, packaging, unitPrice }: Props) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const inStock = fragrance.inStock && bottle.inStock && packaging.inStock;

  const handleAdd = () => {
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
    window.setTimeout(() => setAdded(false), 1500);
  };

  return (
    <article className="group overflow-hidden rounded-md border border-black-400 bg-black-600">
      <a href={`/produk/${fragrance.slug}`} className="relative block" aria-label={fragrance.name}>
        <ProductImage alt={fragrance.name} aspect="aspect-square" {...(fragrance.imageUrl ? { src: fragrance.imageUrl } : {})} />
        <div className="absolute left-1.5 top-1.5 flex flex-col gap-1">
          {fragrance.discountPercent > 0 ? (
            <Pill variant="active" className="min-h-0 px-1.5 py-0.5 text-[10px]">
              -{fragrance.discountPercent}%
            </Pill>
          ) : fragrance.badge ? (
            <Pill className="min-h-0 px-1.5 py-0.5 text-[10px]">{fragrance.badge}</Pill>
          ) : null}
        </div>
        {!inStock ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70">
            <span className="rounded bg-black-600 px-2 py-1 text-caption text-ivory">Habis</span>
          </div>
        ) : null}
      </a>
      <div className="p-2.5">
        <a href={`/produk/${fragrance.slug}`}>
          <h3 className="line-clamp-2 min-h-[2.5em] text-body-sm font-medium leading-tight">{fragrance.name}</h3>
        </a>
        <div className="mt-1.5 flex items-end justify-between gap-2">
          <PriceDisplay price={unitPrice} prefix />
          <button
            type="button"
            onClick={handleAdd}
            disabled={!inStock}
            aria-label="Tambah ke keranjang"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald text-black transition disabled:cursor-not-allowed disabled:opacity-40"
          >
            {added ? "✓" : "+"}
          </button>
        </div>
      </div>
    </article>
  );
}
