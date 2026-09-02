"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Stack,
  Pill,
  Button,
  PriceDisplay,
} from "@atlase/ui";
import { calculate, PricingError } from "@atlase/pricing";
import {
  fragrances,
  packaging,
  volumePresets,
  getBottlesByVolume,
  alcoholSellPerMl,
} from "@atlase/config";
import { useCart } from "./cart/CartProvider";

const STRENGTH_PRESETS = [
  { label: "Lembut", ml: 15 },
  { label: "Sedang", ml: 25 },
  { label: "Kuat", ml: 35 },
] as const;

export function PerfumeBuilder({
  initialSlug,
}: {
  initialSlug?: string;
}) {
  const [fragranceId, setFragranceId] = useState<string>(
    initialSlug
      ? (fragrances.find((f) => f.slug === initialSlug)?.id ?? fragrances[0]!.id)
      : fragrances[0]!.id,
  );
  const [volumeMl, setVolumeMl] = useState<number>(50);
  const [strengthMl, setStrengthMl] = useState<number>(25);
  const [customStrength, setCustomStrength] = useState<boolean>(false);
  const [bottleId, setBottleId] = useState<string>("b50-s");
  const [packagingId, setPackagingId] = useState<string>("pkg-standard");

  const fragrance = useMemo(
    () => fragrances.find((f) => f.id === fragranceId)!,
    [fragranceId],
  );
  const availableBottles = useMemo(
    () => getBottlesByVolume(volumeMl),
    [volumeMl],
  );
  const selectedPackaging = useMemo(
    () => packaging.find((p) => p.id === packagingId)!,
    [packagingId],
  );

  const effectiveBottle =
    availableBottles.find((b) => b.id === bottleId) ?? availableBottles[0]!;

  const quote = useMemo(() => {
    try {
      const fragranceMlForCalc = Math.min(Math.max(strengthMl, fragrance.minMl), fragrance.maxMl);
      const alcoholMlForCalc = volumeMl - fragranceMlForCalc;
      if (alcoholMlForCalc < 0) return null;
      return calculate({
        fragrance: { id: fragrance.id, name: fragrance.name, pricePerMl: fragrance.pricePerMl, minMl: fragrance.minMl, maxMl: fragrance.maxMl },
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
  }, [fragrance, strengthMl, volumeMl, effectiveBottle, selectedPackaging]);

  const handleVolume = (vol: number) => {
    setVolumeMl(vol);
    const firstBottle = getBottlesByVolume(vol)[0];
    if (firstBottle) setBottleId(firstBottle.id);
  };

  const strength = strengthMl;
  const { addItem } = useCart();
  const router = useRouter();
  const [added, setAdded] = useState(false);

  const handleAddToCart = (channel?: "whatsapp") => {
    if (!quote) return;
    addItem({
      fragranceId: fragrance.id,
      fragranceName: fragrance.name,
      volumeMl,
      fragranceMl: strength,
      bottleId: effectiveBottle.id,
      bottleName: effectiveBottle.name,
      packagingId: selectedPackaging.id,
      packagingName: selectedPackaging.name,
      unitPrice: quote.total,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
    router.push(channel ? "/checkout?channel=whatsapp" : "/checkout");
  };

  return (
    <Container>
      <Stack className="gap-8 lg:flex-row lg:gap-12">
        {/* Left: selection */}
        <Stack className="gap-6 flex-1">
          {/* Step 1: Aroma */}
          <section>
            <h2 className="text-subheading text-muted-gray">1 · Pilih Aroma</h2>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {fragrances.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFragranceId(f.id)}
                  aria-pressed={fragranceId === f.id}
                  className={`rounded-lg border p-4 text-left transition ${
                    fragranceId === f.id
                      ? "border-emerald bg-emerald-50"
                      : "border-black-400 bg-black-600"
                  }`}
                >
                  <span className="block text-body font-medium text-ivory">
                    {f.name}
                  </span>
                  <span className="block text-caption text-muted-gray">
                    {f.description}
                  </span>
                  {f.badge ? (
                    <Pill className="mt-2 text-black">{f.badge}</Pill>
                  ) : null}
                </button>
              ))}
            </div>
          </section>

          {/* Step 2: Volume */}
          <section>
            <h2 className="text-subheading text-muted-gray">2 · Pilih Ukuran</h2>
            <div className="mt-3 flex flex-wrap gap-3">
              {volumePresets.map((vol) => (
                <button
                  key={vol}
                  type="button"
                  onClick={() => handleVolume(vol)}
                  aria-pressed={volumeMl === vol}
                  className={`rounded-full px-5 py-2 text-body transition ${
                    volumeMl === vol
                      ? "bg-emerald text-black"
                      : "bg-black-600 text-ivory"
                  }`}
                >
                  {vol} ml
                </button>
              ))}
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
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {availableBottles.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setBottleId(b.id)}
                  aria-pressed={effectiveBottle.id === b.id}
                  className={`rounded-lg border p-4 text-left transition ${
                    effectiveBottle.id === b.id
                      ? "border-emerald bg-emerald-50"
                      : "border-black-400 bg-black-600"
                  }`}
                >
                  <span className="block text-body font-medium text-ivory">{b.name}</span>
                  <span className="block text-caption text-muted-gray">
                    {b.volumeMl} ml
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* Step 5: Packaging */}
          <section>
            <h2 className="text-subheading text-muted-gray">5 · Pilih Packaging</h2>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {packaging.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPackagingId(p.id)}
                  aria-pressed={packagingId === p.id}
                  className={`rounded-lg border p-4 text-left transition ${
                    packagingId === p.id
                      ? "border-emerald bg-emerald-50"
                      : "border-black-400 bg-black-600"
                  }`}
                >
                  <span className="block text-body font-medium text-ivory">{p.name}</span>
                  <span className="block text-caption text-muted-gray">
                    Terinspirasi keindahan persembahan
                  </span>
                </button>
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
                <Row label="Botol" value={effectiveBottle.name} />
                <Row label="Packaging" value={selectedPackaging.name} />
              </dl>
              {quote ? (
                <div className="border-t border-black-400 pt-4">
                  <PriceDisplay
                    price={quote.total}
                    prefix
                    sub={`${quote.lineItems.fragrance.amount.toLocaleString("id-ID")} + alkohol + botol + box`}
                  />
                </div>
              ) : (
                <p className="text-body text-error">Konfigurasi tidak tersedia.</p>
              )}
              <Button intent="primary" size="lg" className="w-full" onClick={() => handleAddToCart()}>
                {added ? "✓ Masuk keranjang" : "Lanjut Pesan"}
              </Button>
              <Button
                intent="outline"
                size="lg"
                className="w-full"
                onClick={() => handleAddToCart("whatsapp")}
              >
                Pesan via WhatsApp
              </Button>
            </Stack>
          </div>
        </aside>
      </Stack>
    </Container>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted-gray">{label}</dt>
      <dd className="text-ivory">{value}</dd>
    </div>
  );
}