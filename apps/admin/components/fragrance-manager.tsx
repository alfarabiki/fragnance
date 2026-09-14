"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface FragranceRow {
  id: string;
  name: string;
  description?: string | null;
  category?: string | null;
  min_ml?: number | null;
  max_ml?: number | null;
  cost_per_ml?: number | null;
  price_per_ml?: number | null;
  discount_percent?: number | null;
  is_active?: boolean | null;
  is_featured?: boolean | null;
  image_url?: string | null;
  video_url?: string | null;
}

function formatRupiah(n: number): string {
  return `Rp${n.toLocaleString("id-ID")}`;
}

export function FragranceManager({ initial }: { initial: FragranceRow[] }) {
  const [fragrances, setFragrances] = useState(initial);

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <NewFragranceCard onCreated={(f) => setFragrances((rows) => [f, ...rows])} />
      {fragrances.map((f) => (
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
    discountPercent: fragrance.discount_percent ?? 0,
    isActive: fragrance.is_active ?? true,
    isFeatured: fragrance.is_featured ?? false,
  });
  const [imageUrl, setImageUrl] = useState(fragrance.image_url ?? null);
  const [videoUrl, setVideoUrl] = useState(fragrance.video_url ?? null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<"image" | "video" | null>(null);
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
      const res = await fetch(`/api/fragrances/${fragrance.id}`, {
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

  const margin = form.pricePerMl - form.costPerMl;
  const marginPct = form.pricePerMl > 0 ? Math.round((margin / form.pricePerMl) * 100) : 0;
  const discountedPricePerMl = Math.round(form.pricePerMl * (1 - form.discountPercent / 100));

  return (
    <Card className="overflow-hidden">
      <MediaPreview
        imageUrl={imageUrl}
        videoUrl={videoUrl}
        uploadingImage={uploading === "image"}
        uploadingVideo={uploading === "video"}
        onImageFile={(file) => uploadFile("image", file)}
        onVideoFile={(file) => uploadFile("video", file)}
      />

      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-base">{fragrance.name}</CardTitle>
        <Badge variant={form.isActive ? "default" : "secondary"}>
          {form.isActive ? "Aktif" : "Nonaktif"}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nama">
            <Input value={form.name} onChange={(e) => updateForm("name", e.target.value)} />
          </Field>
          <Field label="Kategori">
            <Input value={form.category} onChange={(e) => updateForm("category", e.target.value)} />
          </Field>
        </div>

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
            <Field label="Cost/ml (Rp)">
              <Input
                type="number"
                value={form.costPerMl}
                onChange={(e) => updateForm("costPerMl", Number(e.target.value))}
              />
            </Field>
            <Field label="Jual/ml (Rp)">
              <Input
                type="number"
                value={form.pricePerMl}
                onChange={(e) => updateForm("pricePerMl", Number(e.target.value))}
              />
            </Field>
            <Field label="Min ml">
              <Input
                type="number"
                value={form.minMl}
                onChange={(e) => updateForm("minMl", Number(e.target.value))}
              />
            </Field>
            <Field label="Max ml">
              <Input
                type="number"
                value={form.maxMl}
                onChange={(e) => updateForm("maxMl", Number(e.target.value))}
              />
            </Field>
            <Field label="Diskon (%)">
              <Input
                type="number"
                min={0}
                max={100}
                value={form.discountPercent}
                onChange={(e) => updateForm("discountPercent", Number(e.target.value))}
              />
            </Field>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Margin {formatRupiah(margin)}/ml ({marginPct}%)
          </p>
          {form.discountPercent > 0 ? (
            <p className="text-xs text-muted-foreground">
              Harga setelah diskon:{" "}
              <span className="line-through">{formatRupiah(form.pricePerMl)}</span>{" "}
              <span className="font-medium text-foreground">{formatRupiah(discountedPricePerMl)}</span>/ml
            </p>
          ) : null}
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => updateForm("isActive", e.target.checked)}
          />
          Aktif (tampil di storefront)
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isFeatured}
            onChange={(e) => updateForm("isFeatured", e.target.checked)}
          />
          ✨ Featured (tampil di etalase homepage)
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

function NewFragranceCard({ onCreated }: { onCreated: (fragrance: FragranceRow) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create() {
    if (!name.trim()) {
      setError("Nama aroma wajib diisi.");
      return;
    }
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/fragrances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, category: category || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error?.message || "Gagal membuat aroma.");
        return;
      }
      onCreated(data.fragrance);
      setName("");
      setCategory("");
      setOpen(false);
    } catch {
      setError("Gagal membuat aroma. Periksa koneksi.");
    } finally {
      setCreating(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex min-h-[280px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
      >
        <span className="text-2xl leading-none">+</span>
        <span className="text-sm font-medium">Tambah Aroma Baru</span>
      </button>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Aroma Baru</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Field label="Nama">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="mis. Amber Musk" autoFocus />
        </Field>
        <Field label="Kategori">
          <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="mis. Premium" />
        </Field>
        <p className="text-xs text-muted-foreground">
          Harga, deskripsi, foto, dan video bisa diatur setelah aroma dibuat.
        </p>
        <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
          <div className="flex gap-2">
            <Button onClick={create} disabled={creating}>
              {creating ? "Membuat..." : "Buat"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setOpen(false);
                setError(null);
              }}
              disabled={creating}
            >
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

function MediaPreview({
  imageUrl,
  videoUrl,
  uploadingImage,
  uploadingVideo,
  onImageFile,
  onVideoFile,
}: {
  imageUrl: string | null;
  videoUrl: string | null;
  uploadingImage: boolean;
  uploadingVideo: boolean;
  onImageFile: (file: File) => void;
  onVideoFile: (file: File) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-px bg-border">
      <Dropzone
        label="Foto"
        accept="image/jpeg,image/png,image/webp"
        uploading={uploadingImage}
        onFile={onImageFile}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="" className="h-full w-full object-cover" />
        ) : null}
      </Dropzone>
      <Dropzone
        label="Video"
        accept="video/mp4,video/webm"
        uploading={uploadingVideo}
        onFile={onVideoFile}
      >
        {videoUrl ? (
          <video src={videoUrl} className="h-full w-full object-cover" muted loop playsInline />
        ) : null}
      </Dropzone>
    </div>
  );
}

function Dropzone({
  label,
  accept,
  uploading,
  onFile,
  children,
}: {
  label: string;
  accept: string;
  uploading: boolean;
  onFile: (file: File) => void;
  children: React.ReactNode;
}) {
  const [dragOver, setDragOver] = useState(false);
  const hasMedia = Boolean(children);

  return (
    <label
      className={cn(
        "group relative flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 overflow-hidden bg-muted text-center transition-colors",
        dragOver && "bg-accent",
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) onFile(file);
      }}
    >
      {children}

      <div
        className={cn(
          "absolute inset-0 flex flex-col items-center justify-center gap-1 bg-background/80 text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100",
          !hasMedia && "opacity-100 bg-transparent",
        )}
      >
        <span className="font-medium">{label}</span>
        <span>{hasMedia ? "Ganti" : "Upload / drop"}</span>
      </div>

      {uploading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-background/90 text-xs text-muted-foreground">
          Mengupload...
        </div>
      ) : null}

      <input
        type="file"
        accept={accept}
        disabled={uploading}
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = "";
        }}
      />
    </label>
  );
}
