"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface BottleRow {
  id: string;
  name: string;
  volume_ml?: number | null;
  cost_price?: number | null;
  sell_price?: number | null;
  is_active?: boolean | null;
  current_stock?: number | null;
}

export function BottleManager({ initial }: { initial: BottleRow[] }) {
  const [bottles, setBottles] = useState(initial);

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <NewBottleCard onCreated={(b) => setBottles((rows) => [b, ...rows])} />
      {bottles.map((b) => (
        <BottleCard key={b.id} bottle={b} />
      ))}
    </div>
  );
}

function BottleCard({ bottle }: { bottle: BottleRow }) {
  const [form, setForm] = useState({
    name: bottle.name,
    volumeMl: bottle.volume_ml ?? 30,
    costPrice: bottle.cost_price ?? 0,
    sellPrice: bottle.sell_price ?? 0,
    currentStock: bottle.current_stock ?? 0,
    isActive: bottle.is_active ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  function updateForm<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setDirty(true);
  }

  async function save() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/bottles/${bottle.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Tersimpan.");
        setDirty(false);
      } else {
        setMessage(data?.error?.message || "Gagal menyimpan.");
      }
    } catch {
      setMessage("Gagal menyimpan. Periksa koneksi.");
    } finally {
      setSaving(false);
    }
  }

  const margin = form.sellPrice - form.costPrice;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-base">{bottle.name}</CardTitle>
        <div className="flex items-center gap-2">
          {form.currentStock <= 0 ? <Badge variant="destructive">Habis</Badge> : null}
          <Badge variant={form.isActive ? "default" : "secondary"}>{form.isActive ? "Aktif" : "Nonaktif"}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nama">
            <Input value={form.name} onChange={(e) => updateForm("name", e.target.value)} />
          </Field>
          <Field label="Volume (ml)">
            <Input type="number" value={form.volumeMl} onChange={(e) => updateForm("volumeMl", Number(e.target.value))} />
          </Field>
        </div>

        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Cost (Rp)">
              <Input type="number" value={form.costPrice} onChange={(e) => updateForm("costPrice", Number(e.target.value))} />
            </Field>
            <Field label="Jual (Rp)">
              <Input type="number" value={form.sellPrice} onChange={(e) => updateForm("sellPrice", Number(e.target.value))} />
            </Field>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Margin Rp{margin.toLocaleString("id-ID")}</p>
        </div>

        <Field label="Stok">
          <Input type="number" value={form.currentStock} onChange={(e) => updateForm("currentStock", Number(e.target.value))} />
        </Field>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isActive} onChange={(e) => updateForm("isActive", e.target.checked)} />
          Aktif (tampil di storefront)
        </label>

        <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
          <Button onClick={save} disabled={saving || !dirty}>
            {saving ? "Menyimpan..." : dirty ? "Simpan Perubahan" : "Tersimpan"}
          </Button>
          {message ? <span className="text-xs text-muted-foreground">{message}</span> : null}
        </div>
      </CardContent>
    </Card>
  );
}

function NewBottleCard({ onCreated }: { onCreated: (bottle: BottleRow) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [volumeMl, setVolumeMl] = useState(30);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create() {
    if (!name.trim()) {
      setError("Nama botol wajib diisi.");
      return;
    }
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/bottles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, volumeMl }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error?.message || "Gagal membuat botol.");
        return;
      }
      onCreated(data.bottle);
      setName("");
      setVolumeMl(30);
      setOpen(false);
    } catch {
      setError("Gagal membuat botol. Periksa koneksi.");
    } finally {
      setCreating(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
      >
        <span className="text-2xl leading-none">+</span>
        <span className="text-sm font-medium">Tambah Botol Baru</span>
      </button>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Botol Baru</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Field label="Nama">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="mis. Premium 30 ml" autoFocus />
        </Field>
        <Field label="Volume (ml)">
          <Input type="number" value={volumeMl} onChange={(e) => setVolumeMl(Number(e.target.value))} />
        </Field>
        <p className="text-xs text-muted-foreground">Harga dan stok bisa diatur setelah botol dibuat.</p>
        <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
          <div className="flex gap-2">
            <Button onClick={create} disabled={creating}>
              {creating ? "Membuat..." : "Buat"}
            </Button>
            <Button variant="ghost" onClick={() => { setOpen(false); setError(null); }} disabled={creating}>
              Batal
            </Button>
          </div>
          {error ? <span className="text-xs text-destructive">{error}</span> : null}
        </div>
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
