"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PackagingRow {
  id: string;
  name: string;
  description?: string | null;
  cost_price?: number | null;
  sell_price?: number | null;
  is_mandatory?: boolean | null;
  is_active?: boolean | null;
  current_stock?: number | null;
}

export function PackagingManager({ initial }: { initial: PackagingRow[] }) {
  const [rows, setRows] = useState(initial);

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <NewPackagingCard onCreated={(p) => setRows((r) => [p, ...r])} />
      {rows.map((p) => (
        <PackagingCard key={p.id} packaging={p} />
      ))}
    </div>
  );
}

function PackagingCard({ packaging }: { packaging: PackagingRow }) {
  const [form, setForm] = useState({
    name: packaging.name,
    description: packaging.description ?? "",
    costPrice: packaging.cost_price ?? 0,
    sellPrice: packaging.sell_price ?? 0,
    isMandatory: packaging.is_mandatory ?? false,
    currentStock: packaging.current_stock ?? 0,
    isActive: packaging.is_active ?? true,
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
      const res = await fetch(`/api/packaging/${packaging.id}`, {
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
        <CardTitle className="text-base">{packaging.name}</CardTitle>
        <div className="flex items-center gap-2">
          {form.currentStock <= 0 ? <Badge variant="destructive">Habis</Badge> : null}
          <Badge variant={form.isActive ? "default" : "secondary"}>{form.isActive ? "Aktif" : "Nonaktif"}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Field label="Nama">
          <Input value={form.name} onChange={(e) => updateForm("name", e.target.value)} />
        </Field>
        <Field label="Deskripsi">
          <textarea
            value={form.description}
            onChange={(e) => updateForm("description", e.target.value)}
            rows={2}
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
          />
        </Field>

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
          <input type="checkbox" checked={form.isMandatory} onChange={(e) => updateForm("isMandatory", e.target.checked)} />
          Wajib dipilih
        </label>
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

function NewPackagingCard({ onCreated }: { onCreated: (packaging: PackagingRow) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create() {
    if (!name.trim()) {
      setError("Nama packaging wajib diisi.");
      return;
    }
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/packaging", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description: description || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error?.message || "Gagal membuat packaging.");
        return;
      }
      onCreated(data.packaging);
      setName("");
      setDescription("");
      setOpen(false);
    } catch {
      setError("Gagal membuat packaging. Periksa koneksi.");
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
        <span className="text-sm font-medium">Tambah Packaging Baru</span>
      </button>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Packaging Baru</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Field label="Nama">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="mis. Kotak Kado" autoFocus />
        </Field>
        <Field label="Deskripsi">
          <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="mis. Kotak eksklusif" />
        </Field>
        <p className="text-xs text-muted-foreground">Harga dan stok bisa diatur setelah packaging dibuat.</p>
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
