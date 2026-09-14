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

/**
 * Compact product card for the homepage featured "Etalase" grid.
 * Smaller than the full ProductCard, optimized for quick browsing and add-to-cart.
 */
export function EtalaseCard({ fragrance, bottle, packaging, unitPrice }: Props) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const inStock = fragrance.inStock && bottle.inStock && packaging.inStock;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
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
    <a
      href={`/produk/${fragrance.slug}`}
      className="group block overflow-hidden rounded-lg border border-black-400 bg-black-600 transition hover:border-emerald"
    >
      <div className="relative aspect-square overflow-hidden">
        <ProductImage
          alt={fragrance.name}
          aspect="aspect-square"
          {...(fragrance.imageUrl ? { src: fragrance.imageUrl } : {})}
        />
        {/* Badges */}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {fragrance.discountPercent > 0 ? (
            <Pill variant="active" className="min-h-0 px-2 py-0.5 text-[10px]">
              -{fragrance.discountPercent}%
            </Pill>
          ) : fragrance.badge ? (
            <Pill className="min-h-0 px-2 py-0.5 text-[10px]">{fragrance.badge}</Pill>
          ) : null}
        </div>
        {/* Add to cart button */}
        <button
          type="button"
          onClick={handleAdd}
          disabled={!inStock}
          className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-emerald text-sm font-bold text-black opacity-0 transition group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={`Tambah ${fragrance.name} ke keranjang`}
        >
          {added ? "✓" : "+"}
        </button>
        {!inStock ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70">
            <span className="rounded bg-black-600 px-2 py-1 text-caption text-ivory">Habis</span>
          </div>
        ) : null}
      </div>
      <div className="p-3">
        <h3 className="line-clamp-1 text-body-sm font-medium leading-tight text-ivory">
          {fragrance.name}
        </h3>
        <p className="mt-1 text-caption text-muted-gray line-clamp-1">{fragrance.description}</p>
        <div className="mt-2">
          <PriceDisplay price={unitPrice} prefix />
        </div>
      </div>
    </a>
  );
}
