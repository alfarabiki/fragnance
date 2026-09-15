"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Stack,
  Pill,
  Button,
  PriceDisplay,
  OptionCard,
} from "@atlase/ui";
import { calculate, PricingError } from "@atlase/pricing";
import type { LiveFragrance, LiveBottle, LivePackaging } from "@/lib/catalog";
import { thumbUrl } from "@/lib/catalog";
import { useCart } from "./cart/CartProvider";

const STRENGTH_PRESETS = [
  { label: "Lembut", ml: 15 },
  { label: "Sedang", ml: 25 },
  { label: "Kuat", ml: 35 },
] as const;

// Only render a few fragrance cards at a time so the builder doesn't fetch
// 126 full-size photos at once on first paint (§40/41 — mobile-first perf).
const AROMA_PAGE = 12;

export function PerfumeBuilder({
  fragrances,
  bottles,
  packaging,
  volumePresets,
  alcoholSellPerMl,
  initialSlug,
}: {
  fragrances: LiveFragrance[];
  bottles: LiveBottle[];
  packaging: LivePackaging[];
  volumePresets: readonly number[];
  alcoholSellPerMl: number;
  initialSlug?: string;
}) {
  const [fragranceId, setFragranceId] = useState<string>(
    initialSlug
      ? (fragrances.find((f) => f.slug === initialSlug)?.id ?? fragrances[0]?.id ?? "")
      : (fragrances[0]?.id ?? ""),
  );
  const [visibleAromas, setVisibleAromas] = useState(AROMA_PAGE);
  const [volumeMl, setVolumeMl] = useState<number>(50);
  const [strengthMl, setStrengthMl] = useState<number>(25);
  const [customStrength, setCustomStrength] = useState<boolean>(false);
  const [bottleId, setBottleId] = useState<string>(
    () => bottles.find((b) => b.volumeMl === 50 && b.name.toLowerCase().includes("standard"))?.id ?? "",
  );
  const [packagingId, setPackagingId] = useState<string>(() => packaging.find((p) => p.slug === "standard")?.id ?? packaging[0]?.id ?? "");

  const fragrance = useMemo(
    () => fragrances.find((f) => f.id === fragranceId) ?? fragrances[0],
    [fragrances, fragranceId],
  );
  const availableBottles = useMemo(
    () => bottles.filter((b) => b.volumeMl === volumeMl),
    [bottles, volumeMl],
  );
  const selectedPackaging = useMemo(
    () => packaging.find((p) => p.id === packagingId) ?? packaging[0],
    [packaging, packagingId],
  );

  const effectiveBottle =
    availableBottles.find((b) => b.id === bottleId) ?? availableBottles[0];

  const quote = useMemo(() => {
    if (!fragrance || !effectiveBottle || !selectedPackaging) return null;
    try {
      const fragranceMlForCalc = Math.min(Math.max(strengthMl, fragrance.minMl), fragrance.maxMl);
      const alcoholMlForCalc = volumeMl - fragranceMlForCalc;
      if (alcoholMlForCalc < 0) return null;
      return calculate({
        fragrance: { id: fragrance.id, name: fragrance.name, pricePerMl: fragrance.effectivePricePerMl, minMl: fragrance.minMl, maxMl: fragrance.maxMl },
        bottle: { id: effectiveBottle.id, name: effectiveBottle.name, volumeMl: effectiveBottle.volumeMl, price: effectiveBottle.sellPrice, active: effectiveBottle.isActive },
        packaging: { id: selectedPackaging.id, name: selectedPackaging.name, price: selectedPackaging.sellPrice, mandatory: selectedPackaging.isMandatory, active: selectedPackaging.isActive },
        alcohol: { pricePerMl: alcoholSellPerMl },
        volumeMl,
        fragranceMl: fragranceMlForCalc,
      });
    } catch (e) {
      if (e instanceof PricingError) return null;
      throw e;
    }
  }, [fragrance, strengthMl, volumeMl, effectiveBottle, selectedPackaging, alcoholSellPerMl]);

  // Same quote at the fragrance's full (undiscounted) price, so the summary
  // can show a struck-through "before" price when a discount is active.
  const originalQuote = useMemo(() => {
    if (!fragrance || !effectiveBottle || !selectedPackaging || !fragrance.discountPercent) return null;
    try {
      const fragranceMlForCalc = Math.min(Math.max(strengthMl, fragrance.minMl), fragrance.maxMl);
      if (volumeMl - fragranceMlForCalc < 0) return null;
      return calculate({
        fragrance: { id: fragrance.id, name: fragrance.name, pricePerMl: fragrance.pricePerMl, minMl: fragrance.minMl, maxMl: fragrance.maxMl },
        bottle: { id: effectiveBottle.id, name: effectiveBottle.name, volumeMl: effectiveBottle.volumeMl, price: effectiveBottle.sellPrice, active: effectiveBottle.isActive },
        packaging: { id: selectedPackaging.id, name: selectedPackaging.name, price: selectedPackaging.sellPrice, mandatory: selectedPackaging.isMandatory, active: selectedPackaging.isActive },
        alcohol: { pricePerMl: alcoholSellPerMl },
        volumeMl,
        fragranceMl: fragranceMlForCalc,
      });
    } catch {
      return null;
    }
  }, [fragrance, strengthMl, volumeMl, effectiveBottle, selectedPackaging, alcoholSellPerMl]);

  // Estimated "starting from" price for EACH volume option, so customers see
  // a real number next to 30/50/70/100 ml instead of guessing. Uses the current
  // fragrance with default strength, the standard bottle for that volume, and
  // the standard packaging — same inputs the cards use for "Mulai dari".
  const volumePrice = useMemo(() => {
    if (!fragrance) return new Map<number, number>();
    const map = new Map<number, number>();
    const strength = Math.min(Math.max(strengthMl, fragrance.minMl), fragrance.maxMl);
    const pack = packaging.find((p) => p.slug === "standard") ?? packaging[0];
    for (const vol of volumePresets) {
      if (strength > vol) continue; // can't fit > volume
      const bottle =
        bottles.find((b) => b.volumeMl === vol && b.name.toLowerCase().includes("standard")) ??
        bottles.find((b) => b.volumeMl === vol);
      if (!bottle || !pack) continue;
      try {
        const q = calculate({
          fragrance: { id: fragrance.id, name: fragrance.name, pricePerMl: fragrance.effectivePricePerMl, minMl: fragrance.minMl, maxMl: fragrance.maxMl },
          bottle: { id: bottle.id, name: bottle.name, volumeMl: bottle.volumeMl, price: bottle.sellPrice, active: bottle.isActive },
          packaging: { id: pack.id, name: pack.name, price: pack.sellPrice, mandatory: pack.isMandatory, active: pack.isActive },
          alcohol: { pricePerMl: alcoholSellPerMl },
          volumeMl: vol,
          fragranceMl: strength,
        });
        map.set(vol, q.total);
      } catch {
        // skip invalid combos
      }
    }
    return map;
  }, [fragrance, volumePresets, bottles, packaging, strengthMl, alcoholSellPerMl]);

  const handleVolume = (vol: number) => {
    setVolumeMl(vol);
    const firstBottle = bottles.find((b) => b.volumeMl === vol);
    if (firstBottle) setBottleId(firstBottle.id);
  };

  const strength = strengthMl;
  const { addItem } = useCart();
  const router = useRouter();
  const [added, setAdded] = useState(false);

  const canOrder = Boolean(
    quote && fragrance?.inStock && effectiveBottle?.inStock && selectedPackaging?.inStock,
  );

  // "cart" stays on the builder so customers can add more than one perfume
  // before checking out — the usual add-to-cart-then-checkout-when-ready
  // shape. "whatsapp" is a deliberate one-click fast path for someone who
  // already knows they only want this one, straight to WhatsApp handoff.
  const handleAddToCart = (mode: "cart" | "whatsapp") => {
    if (!quote || !fragrance || !effectiveBottle || !selectedPackaging || !canOrder) return;
    addItem({
      fragranceId: fragrance.id,
      fragranceName: fragrance.name,
      volumeMl,
      fragranceMl: Math.min(Math.max(strengthMl, fragrance.minMl), fragrance.maxMl),
      bottleId: effectiveBottle.id,
      bottleName: effectiveBottle.name,
      packagingId: selectedPackaging.id,
      packagingName: selectedPackaging.name,
      unitPrice: quote.total,
    });
    if (mode === "whatsapp") {
      router.push("/checkout?channel=whatsapp");
      return;
    }
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  if (!fragrance) {
    return (
      <Container>
        <p className="text-body text-muted-gray">Belum ada aroma tersedia.</p>
      </Container>
    );
  }

  return (
    <Container>
      <Stack className="gap-8 lg:flex-row lg:gap-12">
        {/* Left: selection */}
        <Stack className="gap-6 flex-1">
          {/* Step 1: Aroma — first `visibleAromas` cards only, rest on "Muat lebih banyak" */}
          <section>
            <h2 className="text-subheading text-muted-gray">1 · Pilih Aroma</h2>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {fragrances.slice(0, visibleAromas).map((f) => (
                <OptionCard
                  key={f.id}
                  selected={fragranceId === f.id}
                  onClick={() => setFragranceId(f.id)}
                  disabled={!f.inStock}
                  className={!f.inStock ? "opacity-50" : undefined}
                  title={f.name}
                  description={f.description}
                  image={thumbUrl(f.imageUrl)}
                  badge={
                    !f.inStock ? (
                      <Pill className="bg-black-400 text-ivory">Habis</Pill>
                    ) : f.discountPercent > 0 ? (
                      <Pill className="bg-error text-ivory">Diskon {f.discountPercent}%</Pill>
                    ) : f.badge ? (
                      <Pill className="text-black">{f.badge}</Pill>
                    ) : undefined
                  }
                />
              ))}
            </div>
            {visibleAromas < fragrances.length ? (
              <div className="mt-4 text-center">
                <Button
                  intent="primary"
                  size="lg"
                  className="w-full"
                  onClick={() => setVisibleAromas((v) => Math.min(v + AROMA_PAGE, fragrances.length))}
                >
                  Muat Lebih Banyak ({fragrances.length - visibleAromas} lagi)
                </Button>
              </div>
            ) : null}
          </section>

          {/* Step 2: Volume */}
          <section>
            <h2 className="text-subheading text-muted-gray">2 · Pilih Ukuran</h2>
            <p className="text-caption text-muted-gray">
              Semakin besar, harganya naik. Kamu tetap bisa atur kekuatannya.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {volumePresets.map((vol) => {
                const price = volumePrice.get(vol);
                return (
                  <button
                    key={vol}
                    type="button"
                    onClick={() => handleVolume(vol)}
                    aria-pressed={volumeMl === vol}
                    className={`rounded-lg border p-4 text-left transition ${
                      volumeMl === vol
                        ? "border-emerald bg-emerald-50"
                        : "border-black-400 bg-black-600"
                    }`}
                  >
                    <span className={`block text-body font-semibold ${volumeMl === vol ? "text-emerald-700" : "text-ivory"}`}>
                      {vol} ml
                    </span>
                    {price ? (
                      <span className={`block text-caption mt-0.5 ${volumeMl === vol ? "text-emerald-700/80" : "text-muted-gray"}`}>
                        Mulai {formatRp(price)}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Step 3: Strength */}
          <section>
            <h2 className="text-subheading text-muted-gray">
              3 · Seberapa Kuat Aromanya?
            </h2>
            <p className="text-caption text-muted-gray">
              Semakin banyak aroma, wanginya semakin terasa.
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              {STRENGTH_PRESETS.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => {
                    setCustomStrength(false);
                    setStrengthMl(s.ml);
                  }}
                  aria-pressed={!customStrength && strengthMl === s.ml}
                  className={`rounded-full px-5 py-2 text-body transition ${
                    !customStrength && strengthMl === s.ml
                      ? "bg-emerald text-black"
                      : "bg-black-600 text-ivory"
                  }`}
                >
                  {s.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCustomStrength(true)}
                aria-pressed={customStrength}
                className={`rounded-full px-5 py-2 text-body transition ${
                  customStrength ? "bg-emerald text-black" : "bg-black-600 text-ivory"
                }`}
              >
                Atur sendiri
              </button>
            </div>
            {customStrength ? (
              <div className="mt-4">
                <input
                  type="range"
                  min={fragrance.minMl}
                  max={fragrance.maxMl}
                  step={1}
                  value={strengthMl}
                  onChange={(e) => setStrengthMl(Number(e.target.value))}
                  className="w-full accent-emerald"
                  aria-label="Jumlah aroma"
                />
                <div className="mt-1 flex justify-between text-caption text-muted-gray">
                  <span>{fragrance.minMl} ml</span>
                  <span>{strengthMl} ml</span>
                  <span>{fragrance.maxMl} ml</span>
                </div>
              </div>
            ) : (
              <div className="mt-2 text-caption text-muted-gray">
                Jumlah aroma: {strength} ml
              </div>
            )}
          </section>

          {/* Step 4: Bottle */}
          <section>
            <h2 className="text-subheading text-muted-gray">4 · Pilih Botol</h2>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {availableBottles.map((b) => (
                <OptionCard
                  key={b.id}
                  selected={effectiveBottle?.id === b.id}
                  onClick={() => setBottleId(b.id)}
                  disabled={!b.inStock}
                  className={!b.inStock ? "opacity-50" : undefined}
                  title={b.name}
                  description={`${b.volumeMl} ml`}
                  badge={!b.inStock ? <Pill className="bg-black-400 text-ivory">Habis</Pill> : undefined}
                />
              ))}
            </div>
          </section>

          {/* Step 5: Packaging */}
          <section>
            <h2 className="text-subheading text-muted-gray">5 · Pilih Packaging</h2>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {packaging.map((p) => (
                <OptionCard
                  key={p.id}
                  selected={packagingId === p.id}
                  onClick={() => setPackagingId(p.id)}
                  disabled={!p.inStock}
                  className={!p.inStock ? "opacity-50" : undefined}
                  title={p.name}
                  description={p.description}
                  badge={!p.inStock ? <Pill className="bg-black-400 text-ivory">Habis</Pill> : undefined}
                />
              ))}
            </div>
          </section>
        </Stack>

        {/* Right: live price summary */}
        <aside className="lg:w-80 lg:shrink-0">
          <div className="sticky top-24 rounded-lg border border-black-400 bg-black-600 p-6">
            <Stack className="gap-4">
              <h3 className="text-heading-1 text-ivory">Ringkasan</h3>
              <dl className="flex flex-col gap-2 text-body">
                <Row label="Aroma" value={fragrance.name} />
                <Row label="Ukuran" value={`${volumeMl} ml`} />
                <Row label="Jumlah aroma" value={`${strength} ml`} />
                <Row label="Botol" value={effectiveBottle?.name ?? "-"} />
                <Row label="Packaging" value={selectedPackaging?.name ?? "-"} />
              </dl>
              {quote ? (
                <div className="border-t border-black-400 pt-4">
                  {originalQuote && originalQuote.total > quote.total ? (
                    <p className="text-body text-muted-gray line-through">
                      Rp{originalQuote.total.toLocaleString("id-ID")}
                    </p>
                  ) : null}
                  <PriceDisplay
                    price={quote.total}
                    prefix
                    sub={`${quote.lineItems.fragrance.amount.toLocaleString("id-ID")} + alkohol + botol + box`}
                  />
                </div>
              ) : (
                <p className="text-body text-error">Konfigurasi tidak tersedia.</p>
              )}
              {!canOrder && quote ? (
                <p className="text-caption text-error">Salah satu pilihan sedang habis stok.</p>
              ) : null}
              <Button intent="primary" size="lg" className="w-full" onClick={() => handleAddToCart("cart")} disabled={!canOrder}>
                {added ? "✓ Masuk keranjang" : "Tambah ke Keranjang"}
              </Button>
              <Button
                intent="outline"
                size="lg"
                className="w-full"
                onClick={() => handleAddToCart("whatsapp")}
                disabled={!canOrder}
              >
                Pesan via WhatsApp
              </Button>
              {added ? (
                <p className="text-center text-caption text-muted-gray">
                  Bisa lanjut atur parfum lain, atau buka keranjang buat checkout.
                </p>
              ) : null}
            </Stack>
          </div>
        </aside>
      </Stack>
    </Container>
  );
}

function formatRp(n: number): string {
  return `Rp${n.toLocaleString("id-ID")}`;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted-gray">{label}</dt>
      <dd className="text-ivory">{value}</dd>
    </div>
  );
}
