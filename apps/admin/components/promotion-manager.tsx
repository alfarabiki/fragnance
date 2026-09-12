"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface PromotionRow {
  id: string;
  name: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  min_order: number;
  coupon_code: string | null;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
}

function formatValue(p: Pick<PromotionRow, "type" | "value">): string {
  return p.type === "PERCENTAGE" ? `${p.value}%` : `Rp${p.value.toLocaleString("id-ID")}`;
}

export function PromotionManager({ initial }: { initial: PromotionRow[] }) {
  const [promotions, setPromotions] = useState(initial);

  async function toggleActive(promo: PromotionRow) {
    const res = await fetch(`/api/promotions/${promo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !promo.is_active }),
    });
    if (res.ok) {
      setPromotions((prev) => prev.map((p) => (p.id === promo.id ? { ...p, is_active: !p.is_active } : p)));
    }
  }

  async function remove(promo: PromotionRow) {
    if (!confirm(`Hapus promo "${promo.name}"?`)) return;
    const res = await fetch(`/api/promotions/${promo.id}`, { method: "DELETE" });
    if (res.ok) {
      setPromotions((prev) => prev.filter((p) => p.id !== promo.id));
    }
  }

  return (
    <div className="space-y-4">
      <NewPromotionCard onCreated={(p) => setPromotions((prev) => [p, ...prev])} />

      {promotions.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Belum ada promosi aktif.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {promotions.map((p) => (
            <Card key={p.id}>
              <CardContent className="flex items-start justify-between gap-3 pt-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{p.name}</span>
                    <Badge variant={p.is_active ? "default" : "secondary"}>
                      {p.is_active ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Diskon {formatValue(p)} · Min. order Rp{p.min_order.toLocaleString("id-ID")}
                  </p>
                  {p.coupon_code ? (
                    <p className="mt-1 font-mono text-xs text-muted-foreground">Kode: {p.coupon_code}</p>
                  ) : null}
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button size="sm" variant="outline" onClick={() => toggleActive(p)}>
                    {p.is_active ? "Nonaktifkan" : "Aktifkan"}
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => remove(p)}>
                    Hapus
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function NewPromotionCard({ onCreated }: { onCreated: (p: PromotionRow) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
  const [value, setValue] = useState(10);
  const [minOrder, setMinOrder] = useState(0);
  const [couponCode, setCouponCode] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create() {
    if (!name.trim()) {
      setError("Nama promo wajib diisi.");
      return;
    }
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          type,
          value,
          minOrder,
          couponCode: couponCode || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error?.message || "Gagal membuat promo.");
        return;
      }
      onCreated(data.promotion);
      setName("");
      setValue(10);
      setMinOrder(0);
      setCouponCode("");
      setOpen(false);
    } catch {
      setError("Gagal membuat promo. Periksa koneksi.");
    } finally {
      setCreating(false);
    }
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>Buat Promo</Button>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Promo Baru</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Nama</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="mis. Promo Ramadan" autoFocus />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Tipe</Label>
            <Select value={type} onValueChange={(v) => v && setType(v as "PERCENTAGE" | "FIXED")}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="PERCENTAGE">Persen (%)</SelectItem>
                <SelectItem value="FIXED">Nominal (Rp)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">
              Nilai {type === "PERCENTAGE" ? "(%)" : "(Rp)"}
            </Label>
            <Input type="number" min={0} value={value} onChange={(e) => setValue(Number(e.target.value))} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Minimal Order (Rp)</Label>
            <Input type="number" min={0} value={minOrder} onChange={(e) => setMinOrder(Number(e.target.value))} />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label className="text-xs text-muted-foreground">Kode Kupon (opsional)</Label>
            <Input
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="mis. HEMAT10"
            />
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
          <div className="flex gap-2">
            <Button onClick={create} disabled={creating}>
              {creating ? "Membuat..." : "Buat"}
            </Button>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={creating}>
              Batal
            </Button>
          </div>
          {error ? <span className="text-xs text-destructive">{error}</span> : null}
        </div>
      </CardContent>
    </Card>
  );
}
