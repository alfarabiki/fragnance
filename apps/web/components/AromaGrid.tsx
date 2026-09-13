"use client";

import { useState } from "react";
import { Button } from "@atlase/ui";
import { ProductGridCard } from "@/components/ProductGridCard";
import type { LiveFragrance, LiveBottle, LivePackaging } from "@/lib/catalog";

const PAGE_SIZE = 24;

export interface AromaGridEntry {
  fragrance: LiveFragrance;
  bottle: LiveBottle;
  packaging: LivePackaging;
  unitPrice: number;
}

// Every fragrance loaded server-side already (cheap — just metadata/prices);
// only reveal them in batches so first paint stays light on low-end phones
// (§40/41) while photos still lazy-load per-card regardless via next/image.
export function AromaGrid({ entries }: { entries: AromaGridEntry[] }) {
  const [visible, setVisible] = useState(PAGE_SIZE);
  const shown = entries.slice(0, visible);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {shown.map(({ fragrance, bottle, packaging, unitPrice }) => (
          <ProductGridCard
            key={fragrance.slug}
            fragrance={fragrance}
            bottle={bottle}
            packaging={packaging}
            unitPrice={unitPrice}
          />
        ))}
      </div>
      {visible < entries.length ? (
        <div className="mt-8 flex justify-center">
          <Button intent="outline" size="lg" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
            Muat Lebih Banyak
          </Button>
        </div>
      ) : null}
    </>
  );
}
