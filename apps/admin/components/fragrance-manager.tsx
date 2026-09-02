"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface FragranceRow {
  id: string;
  name: string;
  description?: string | null;
  category?: string | null;
  min_ml?: number | null;
  max_ml?: number | null;
  cost_per_ml?: number | null;
  price_per_ml?: number | null;
  is_active?: boolean | null;
  image_url?: string | null;
  video_url?: string | null;
}

export function FragranceManager({ initial }: { initial: FragranceRow[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {initial.map((f) => (
        <FragranceCard key={f.id} fragrance={f} />
      ))}
    </div>
  );
}

function FragranceCard({ fragrance }: { fragrance: FragranceRow }) {
  const [form, setForm] = useState({
    name: fragrance.name,
    description: fragrance.description ?? "",
    category: fragrance.category ?? "",
    minMl: fragrance.min_ml ?? 5,
    maxMl: fragrance.max_ml ?? 50,
    costPerMl: fragrance.cost_per_ml ?? 0,
    pricePerMl: fragrance.price_per_ml ?? 0,
    isActive: fragrance.is_active ?? true,
  });
  const [imageUrl, setImageUrl] = useState(fragrance.image_url ?? null);
  const [videoUrl, setVideoUrl] = useState(fragrance.video_url ?? null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<"image" | "video" | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/fragrances/${fragrance.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setMessage(res.ok ? "Tersimpan." : data?.error?.message || "Gagal menyimpan.");
    } catch {
      setMessage("Gagal menyimpan. Periksa koneksi.");
    } finally {
      setSaving(false);
    }
  }

  async function uploadFile(kind: "image" | "video", file: File) {
    setUploading(kind);
    setMessage(null);
    try {
      const body = new FormData();
      body.set("file", file);
      body.set("kind", kind);
      const res = await fetch(`/api/fragrances/${fragrance.id}/media`, { method: "POST", body });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data?.error?.message || "Upload gagal.");
        return;
      }
      if (kind === "image") setImageUrl(data.url);
      else setVideoUrl(data.url);
      setMessage("Media terupload.");
    } catch {
      setMessage("Upload gagal. Periksa koneksi.");
    } finally {
      setUploading(null);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-base">{fragrance.name}</CardTitle>
        <Badge variant={form.isActive ? "default" : "secondary"}>
          {form.isActive ? "Aktif" : "Nonaktif"}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nama">
            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </Field>
          <Field label="Kategori">
            <Input value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} />
          </Field>
        </div>

        <Field label="Deskripsi">
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={2}
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Cost/ml (Rp)">
            <Input
              type="number"
              value={form.costPerMl}
              onChange={(e) => setForm((f) => ({ ...f, costPerMl: Number(e.target.value) }))}
            />
          </Field>
          <Field label="Jual/ml (Rp)">
            <Input
              type="number"
              value={form.pricePerMl}
              onChange={(e) => setForm((f) => ({ ...f, pricePerMl: Number(e.target.value) }))}
            />
          </Field>
          <Field label="Min ml">
            <Input
              type="number"
              value={form.minMl}
              onChange={(e) => setForm((f) => ({ ...f, minMl: Number(e.target.value) }))}
            />
          </Field>
          <Field label="Max ml">
            <Input
              type="number"
              value={form.maxMl}
              onChange={(e) => setForm((f) => ({ ...f, maxMl: Number(e.target.value) }))}
            />
          </Field>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
          />
          Aktif (tampil di storefront)
        </label>

        <div className="grid grid-cols-2 gap-3">
          <MediaField
            label="Foto"
            url={imageUrl}
            uploading={uploading === "image"}
            accept="image/jpeg,image/png,image/webp"
            onFile={(file) => uploadFile("image", file)}
          />
          <MediaField
            label="Video"
            url={videoUrl}
            uploading={uploading === "video"}
            accept="video/mp4,video/webm"
            onFile={(file) => uploadFile("video", file)}
          />
        </div>

        <div className="flex items-center justify-between gap-3 pt-2">
          <Button onClick={save} disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan"}
          </Button>
          {message ? <span className="text-xs text-muted-foreground">{message}</span> : null}
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

function MediaField({
  label,
  url,
  uploading,
  accept,
  onFile,
}: {
  label: string;
  url: string | null;
  uploading: boolean;
  accept: string;
  onFile: (file: File) => void;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {url ? (
        <p className="truncate text-xs text-emerald-600" title={url}>
          {url.split("/").pop()}
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">Belum ada.</p>
      )}
      <input
        type="file"
        accept={accept}
        disabled={uploading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = "";
        }}
        className="text-xs"
      />
      {uploading ? <p className="text-xs text-muted-foreground">Mengupload...</p> : null}
    </div>
  );
}
