"use client";

import { useMemo, useState } from "react";
import { calculate, PricingError } from "@atlase/pricing";
import {
  fragrances,
  bottles,
  packaging,
  volumePresets,
  getBottlesByVolume,
  alcoholSellPerMl,
  alcoholCostPerMl,
} from "@atlase/config";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function PricingSimulator() {
  const [fragranceId, setFragranceId] = useState(fragrances[0]!.id);
  const [volume, setVolume] = useState(50);
  const [fragranceMl, setFragranceMl] = useState(25);
  const [bottleId, setBottleId] = useState(getBottlesByVolume(50)[0]!.id);
  const [packagingId, setPackagingId] = useState(packaging[0]!.id);

  const fragrance = fragrances.find((f) => f.id === fragranceId)!;
  const bottle = bottles.find((b) => b.id === bottleId) ?? getBottlesByVolume(volume)[0]!;
  const pack = packaging.find((p) => p.id === packagingId)!;

  const result = useMemo(() => {
    try {
      const quote = calculate({
        fragrance: { id: fragrance.id, name: fragrance.name, pricePerMl: fragrance.pricePerMl, minMl: fragrance.minMl, maxMl: fragrance.maxMl },
        bottle: { id: bottle.id, name: bottle.name, volumeMl: bottle.volumeMl, price: bottle.sellPrice, active: bottle.isActive },
        packaging: { id: pack.id, name: pack.name, price: pack.sellPrice, mandatory: pack.isMandatory, active: pack.isActive },
        alcohol: { pricePerMl: alcoholSellPerMl },
        volumeMl: volume,
        fragranceMl,
      });
      // cost breakdown
      const alcoholMl = volume - fragranceMl;
      const cost =
        fragranceMl * fragrance.costPerMl +
        alcoholMl * alcoholCostPerMl +
        bottle.costPrice +
        pack.costPrice;
      const margin = quote.total - cost;
      const marginPct = quote.total > 0 ? (margin / quote.total) * 100 : 0;
      return { quote, cost, margin, marginPct };
    } catch (e) {
      if (e instanceof PricingError) return null;
      throw e;
    }
  }, [fragrance, bottle, pack, volume, fragranceMl]);

  function updateVolume(vol: number) {
    setVolume(vol);
    const first = getBottlesByVolume(vol)[0];
    if (first) setBottleId(first.id);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Konfigurasi</CardTitle>
          <CardDescription>Pilih kombinasi untuk menguji harga.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Aroma</Label>
            <Select value={fragranceId} onValueChange={(v) => v && setFragranceId(v)}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {fragrances.map((f) => (
                  <SelectItem key={f.id} value={f.id}>{f.name} (Rp{f.pricePerMl}/ml)</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Volume</Label>
            <div className="flex flex-wrap gap-2">
              {volumePresets.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => updateVolume(v)}
                  className={`rounded-md border px-3 py-1.5 text-sm ${volume === v ? "bg-primary text-primary-foreground" : ""}`}
                >
                  {v} ml
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Jumlah aroma: {fragranceMl} ml</Label>
            <input
              type="range"
              min={fragrance.minMl}
              max={Math.min(fragrance.maxMl, volume)}
              step={1}
              value={fragranceMl}
              onChange={(e) => setFragranceMl(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Botol</Label>
            <Select value={bottleId} onValueChange={(v) => v && setBottleId(v)}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {getBottlesByVolume(volume).map((b) => (
                  <SelectItem key={b.id} value={b.id}>{b.name} — Rp{b.sellPrice}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Packaging</Label>
            <Select value={packagingId} onValueChange={(v) => v && setPackagingId(v)}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {packaging.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name} — Rp{p.sellPrice}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Result */}
      <Card>
        <CardHeader>
          <CardTitle>Ringkasan</CardTitle>
          <CardDescription>Perhitungan harga & margin.</CardDescription>
        </CardHeader>
        <CardContent>
          {result ? (
            <div className="space-y-3">
              <div className="space-y-2 rounded-lg border p-4 text-sm">
                <Row label="Fragrance" value={`${fragranceMl} ml × Rp${result.quote.lineItems.fragrance.unitPrice}`} />
                <Row label="Alkohol" value={`${volume - fragranceMl} ml × Rp${result.quote.lineItems.alcohol.unitPrice}`} />
                <Row label="Botol" value={bottle.name} />
                <Row label="Packaging" value={pack.name} />
              </div>
              <div className="space-y-1.5 border-t pt-3 text-sm">
                <Row label="Harga Jual" value={`Rp${result.quote.total.toLocaleString("id-ID")}`} strong />
                <Row label="Harga Pokok (cost)" value={`Rp${result.cost.toLocaleString("id-ID")}`} />
                <Row label="Laba Kotor" value={`Rp${result.margin.toLocaleString("id-ID")}`} />
                <Row label="Margin" value={`${result.marginPct.toFixed(1)}%`} strong />
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Konfigurasi tidak valid.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={strong ? "font-medium" : "text-muted-foreground"}>{label}</span>
      <span className={strong ? "font-semibold" : ""}>{value}</span>
    </div>
  );
}