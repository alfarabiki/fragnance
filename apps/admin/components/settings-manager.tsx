"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// ─── Types ───────────────────────────────────────────────────────────────────
interface FaqItem { q: string; a: string }
interface Testimonial { name: string; role: string; quote: string }

interface SettingValue {
  key: string;
  value: unknown;
}

// ─── Section editors ─────────────────────────────────────────────────────────
function saveSetting(key: string, value: unknown, setMsg: (m: string | null) => void, setSaving: (b: boolean) => void) {
  setSaving(true);
  setMsg(null);
  fetch("/api/settings", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key, value }),
  })
    .then(async (res) => {
      const data = await res.json();
      setMsg(res.ok ? "Tersimpan ✓" : data?.error?.message || "Gagal menyimpan.");
    })
    .catch(() => setMsg("Gagal menyimpan. Periksa koneksi."))
    .finally(() => setSaving(false));
}

// ─── Hero Editor ─────────────────────────────────────────────────────────────
function HeroEditor({ setting }: { setting: SettingValue }) {
  const initial = (setting.value ?? {}) as Record<string, unknown>;
  const [form, setForm] = useState({
    eyebrow: String(initial.eyebrow ?? ""),
    title: String(initial.title ?? ""),
    subtitle: String(initial.subtitle ?? ""),
    description: String(initial.description ?? ""),
    ctaText: String(initial.ctaText ?? ""),
    ctaLink: String(initial.ctaLink ?? ""),
    startingPriceText: String(initial.startingPriceText ?? "Mulai dari"),
    badge: String(initial.badge ?? ""),
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  function save() {
    saveSetting(setting.key, form, setMsg, setSaving);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">🏠 Hero — Halaman Depan</CardTitle>
        <CardDescription>Teks pada bagian paling atas website.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <TextField label="Badge / Tag Kecil" value={form.badge} onChange={update("badge")} placeholder="Premium · Made Personal" />
        <TextField label="Judul Utama (Baris 1)" value={form.title} onChange={update("title")} placeholder="PREMIUM FRAGRANCE." />
        <TextField label="Judul Utama (Baris 2)" value={form.subtitle} onChange={update("subtitle")} placeholder="MADE PERSONAL." />
        <TextField label="Deskripsi" value={form.description} onChange={update("description")} placeholder="Parfum premium yang bisa kamu sesuaikan..." />
        <TextField label="Label Harga" value={form.startingPriceText} onChange={update("startingPriceText")} placeholder="Mulai dari" />
        <TextField label="Teks Tombol" value={form.ctaText} onChange={update("ctaText")} placeholder="Pilih Aroma" />
        <TextField label="Link Tombol" value={form.ctaLink} onChange={update("ctaLink")} placeholder="/buat-parfum" />
        <SaveBar onSave={save} saving={saving} msg={msg} />
      </CardContent>
    </Card>
  );
}

// ─── Footer Editor ───────────────────────────────────────────────────────────
function FooterEditor({ setting }: { setting: SettingValue }) {
  const initial = (setting.value ?? {}) as Record<string, unknown>;
  const [form, setForm] = useState({
    copyright: String(initial.copyright ?? ""),
    address: String(initial.address ?? ""),
    phone: String(initial.phone ?? ""),
    instagram: String(initial.instagram ?? ""),
    tiktok: String(initial.tiktok ?? ""),
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  function save() {
    saveSetting(setting.key, form, setMsg, setSaving);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">🦶 Footer — Bagian Paling Bawah</CardTitle>
        <CardDescription>Teks ©, alamat, dan sosial media. Gunakan %d untuk tahun otomatis.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <TextField label="Copyright" value={form.copyright} onChange={update("copyright")} placeholder="Parfum Premium, Sesuai Kamu. © %d Miz." />
        <TextField label="Alamat" value={form.address} onChange={update("address")} placeholder="Padang, Sumatera Barat" />
        <TextField label="No. WhatsApp" value={form.phone} onChange={update("phone")} placeholder="6287887753802" />
        <TextField label="Instagram" value={form.instagram} onChange={update("instagram")} placeholder="@mizparfume" />
        <TextField label="TikTok" value={form.tiktok} onChange={update("tiktok")} placeholder="@mizparfume" />
        <SaveBar onSave={save} saving={saving} msg={msg} />
      </CardContent>
    </Card>
  );
}

// ─── Checkout Editor ─────────────────────────────────────────────────────────
function CheckoutEditor({ setting }: { setting: SettingValue }) {
  const initial = (setting.value ?? {}) as Record<string, unknown>;
  const [form, setForm] = useState({
    step1Title: String(initial.step1Title ?? ""),
    step2Title: String(initial.step2Title ?? ""),
    step3Title: String(initial.step3Title ?? ""),
    notePlaceholder: String(initial.notePlaceholder ?? ""),
    whatsappButton: String(initial.whatsappButton ?? ""),
    qrisButton: String(initial.qrisButton ?? ""),
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  function save() {
    saveSetting(setting.key, form, setMsg, setSaving);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">🛒 Checkout — Proses Pemesanan</CardTitle>
        <CardDescription>Judul tiap tahap dan tombol di halaman checkout.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <TextField label="Step 1 — Judul Pesanan" value={form.step1Title} onChange={update("step1Title")} placeholder="Pesananmu" />
        <TextField label="Step 2 — Judul Alamat" value={form.step2Title} onChange={update("step2Title")} placeholder="Alamat Pengiriman" />
        <TextField label="Step 3 — Judul Cara Pesan" value={form.step3Title} onChange={update("step3Title")} placeholder="Cara Pesan" />
        <TextField label="Placeholder Catatan" value={form.notePlaceholder} onChange={update("notePlaceholder")} placeholder="Catatan tambahan..." />
        <TextField label="Tombol WhatsApp" value={form.whatsappButton} onChange={update("whatsappButton")} placeholder="Pesan via WhatsApp" />
        <TextField label="Tombol QRIS" value={form.qrisButton} onChange={update("qrisButton")} placeholder="Bayar dengan QRIS" />
        <SaveBar onSave={save} saving={saving} msg={msg} />
      </CardContent>
    </Card>
  );
}

// ─── FAQ Editor ──────────────────────────────────────────────────────────────
function FaqEditor({ setting }: { setting: SettingValue }) {
  const initial = (setting.value ?? {}) as { items?: FaqItem[] };
  const [items, setItems] = useState<FaqItem[]>(
    Array.isArray(initial.items) && initial.items.length > 0
      ? initial.items
      : [{ q: "", a: "" }],
  );
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  function updateItem(i: number, field: keyof FaqItem, value: string) {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, [field]: value } : it)));
  }

  function add() {
    setItems((prev) => [...prev, { q: "", a: "" }]);
  }

  function remove(i: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  }

  function save() {
    const clean = items.filter((it) => it.q.trim() && it.a.trim());
    if (clean.length === 0) {
      setMsg("Tambahkan minimal 1 pertanyaan.");
      return;
    }
    saveSetting(setting.key, { items: clean }, setMsg, setSaving);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-base">❓ FAQ — Pertanyaan Umum</CardTitle>
          <CardDescription>Pertanyaan & jawaban di halaman depan.</CardDescription>
        </div>
        <Button size="sm" variant="outline" onClick={add}>+ Tambah</Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((it, i) => (
          <div key={i} className="space-y-2 rounded-lg border border-border p-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Pertanyaan #{i + 1}</Label>
              <button
                type="button"
                onClick={() => remove(i)}
                className="text-xs text-destructive hover:underline"
              >
                Hapus
              </button>
            </div>
            <Input value={it.q} onChange={(e) => updateItem(i, "q", e.target.value)} placeholder="Pertanyaan" />
            <textarea
              value={it.a}
              onChange={(e) => updateItem(i, "a", e.target.value)}
              rows={2}
              placeholder="Jawaban"
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
            />
          </div>
        ))}
        <SaveBar onSave={save} saving={saving} msg={msg} />
      </CardContent>
    </Card>
  );
}

// ─── Testimonials Editor ─────────────────────────────────────────────────────
function TestimonialEditor({ setting }: { setting: SettingValue }) {
  const initial = (setting.value ?? {}) as { testimonials?: Testimonial[] };
  const [items, setItems] = useState<Testimonial[]>(
    Array.isArray(initial.testimonials) && initial.testimonials.length > 0
      ? initial.testimonials
      : [{ name: "", role: "", quote: "" }],
  );
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  function updateItem(i: number, field: keyof Testimonial, value: string) {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, [field]: value } : it)));
  }

  function add() {
    setItems((prev) => [...prev, { name: "", role: "", quote: "" }]);
  }

  function remove(i: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  }

  function save() {
    const clean = items.filter((it) => it.name.trim() && it.quote.trim());
    if (clean.length === 0) {
      setMsg("Tambahkan minimal 1 testimoni.");
      return;
    }
    saveSetting(setting.key, { testimonials: clean }, setMsg, setSaving);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-base">⭐ Testimoni — Kata Mereka</CardTitle>
          <CardDescription>Ulasan pelanggan di halaman depan.</CardDescription>
        </div>
        <Button size="sm" variant="outline" onClick={add}>+ Tambah</Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((it, i) => (
          <div key={i} className="space-y-2 rounded-lg border border-border p-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Testimoni #{i + 1}</Label>
              <button
                type="button"
                onClick={() => remove(i)}
                className="text-xs text-destructive hover:underline"
              >
                Hapus
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input value={it.name} onChange={(e) => updateItem(i, "name", e.target.value)} placeholder="Nama" />
              <Input value={it.role} onChange={(e) => updateItem(i, "role", e.target.value)} placeholder="Peran (mis. Ibu Rumah Tangga)" />
            </div>
            <textarea
              value={it.quote}
              onChange={(e) => updateItem(i, "quote", e.target.value)}
              rows={2}
              placeholder="Kutipan/ulasan"
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
            />
          </div>
        ))}
        <SaveBar onSave={save} saving={saving} msg={msg} />
      </CardContent>
    </Card>
  );
}

// ─── Shared UI ───────────────────────────────────────────────────────────────
function TextField({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string;
}) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <Input value={value} onChange={onChange} placeholder={placeholder} className="mt-1" />
    </div>
  );
}

function SaveBar({ onSave, saving, msg }: { onSave: () => void; saving: boolean; msg: string | null }) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
      <Button size="sm" onClick={onSave} disabled={saving}>
        {saving ? "Menyimpan..." : "Simpan"}
      </Button>
      {msg ? <span className="text-xs text-muted-foreground">{msg}</span> : null}
    </div>
  );
}

// ─── Homepage Sections Editor ─────────────────────────────────────────────────
const DEFAULT_HOMEPAGE: Record<string, unknown> = {
  collection: { eyebrow: "Koleksi", title: "Pilih aroma favoritmu", description: "Setiap aroma bisa kamu sesuaikan kekuatannya." },
  etalase: { eyebrow: "Etalase", title: "Rekomendasi Minggu Ini", description: "Pilihan favorit dari koleksi kami." },
  howItWorks: { eyebrow: "Cara Kerja", title: "Gampang, 4 langkah", steps: [
    { title: "Pilih Aroma", desc: "Tentukan wangi favoritmu" },
    { title: "Atur Ukuran", desc: "30, 50, 70, atau 100 ml" },
    { title: "Sesuaikan", desc: "Kekuatan aroma & botol" },
    { title: "Pesan", desc: "Langsung via WhatsApp atau QRIS" },
  ]},
  buildYourPerfume: { eyebrow: "Buat Sendiri", title: "Buat Parfum Kamu", description: "Sesuaikan dengan budget kamu. Info langsung berubah.", ctaText: "Mulai Buat Parfum", ctaLink: "/buat-parfum" },
  valueBand: { title: "Wangi mewah. Harga bersahabat.", subtitle: "Pilih aroma, atur sendiri, dan simpan uangmu." },
  testimonial: { eyebrow: "Testimoni", title: "Kata Mereka" },
  faq: { eyebrow: "FAQ", title: "Pertanyaan Umum" },
  whatsappCta: { title: "Tinggal WhatsApp.", description: "Pesan mudah, harga transparan, dan bisa bayar QRIS.", ctaText: "Pesan via WhatsApp" },
};

function HomepageEditor({ setting }: { setting: SettingValue }) {
  const initial = (setting.value ?? {}) as Record<string, unknown>;
  type SectionKey = keyof typeof DEFAULT_HOMEPAGE;
  const as = (k: SectionKey) => ({ ...(DEFAULT_HOMEPAGE[k] as Record<string, unknown>), ...((initial[k] ?? {}) as Record<string, unknown>) });
  const [form, setForm] = useState<Record<string, unknown>>(() => {
    const init: Record<string, unknown> = {};
    for (const k of Object.keys(DEFAULT_HOMEPAGE)) init[k] = as(k as SectionKey);
    return init;
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);

  function update(section: string, field: string, value: string) {
    setForm((prev) => ({
      ...prev,
      [section]: { ...(prev[section] as Record<string, unknown>), [field]: value },
    }));
  }

  function updateStep(i: number, field: "title" | "desc", value: string) {
    setForm((prev) => {
      const how = prev.howItWorks as Record<string, unknown>;
      const steps = [...((how.steps as Array<Record<string, string>>) ?? [])];
      steps[i] = { ...(steps[i] ?? {}), [field]: value };
      return { ...prev, howItWorks: { ...how, steps } };
    });
  }

  function save() {
    saveSetting(setting.key, form, setMsg, setSaving);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">📄 Teks Halaman Depan</CardTitle>
        <CardDescription>
          Judul, deskripsi & langkah di homepage. Klik bagian yang ingin diubah.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {(
          [
            ["collection", "Koleksi", ["eyebrow", "title", "description"] as string[]],
            ["etalase", "Etalase Grid", ["eyebrow", "title", "description"] as string[]],
            ["howItWorks", "Cara Kerja", ["eyebrow", "title"] as string[]],
            ["buildYourPerfume", "Buat Parfum Kamu", ["eyebrow", "title", "description", "ctaText", "ctaLink"] as string[]],
            ["valueBand", "Sabuk Nilai", ["title", "subtitle"] as string[]],
            ["testimonial", "Testimoni", ["eyebrow", "title"] as string[]],
            ["faq", "FAQ", ["eyebrow", "title"] as string[]],
            ["whatsappCta", "CTA WhatsApp", ["title", "description", "ctaText"] as string[]],
          ] as Array<[string, string, string[]]>
        ).map(([key, label, fields]) => {
          const sec = form[key] as Record<string, string>;
          const isOpen = editing === key;
          return (
            <div key={key} className="rounded-lg border border-border p-3">
              <button
                type="button"
                onClick={() => setEditing(isOpen ? null : key)}
                className="flex w-full items-center justify-between text-sm font-medium"
              >
                {label}
                <span className="text-xs text-muted-foreground">{isOpen ? "Sembunyikan" : "Edit"}</span>
              </button>
              {isOpen ? (
                <div className="mt-3 space-y-2">
                  {fields.map((f) => (
                    <div key={f}>
                      <Label className="text-xs capitalize">{f}</Label>
                      <Input
                        value={String(sec?.[f] ?? "")}
                        onChange={(e) => update(key, f, e.target.value)}
                        placeholder={String((DEFAULT_HOMEPAGE[key as keyof typeof DEFAULT_HOMEPAGE] as Record<string, unknown>)?.[f] ?? "")}
                        className="mt-1"
                      />
                    </div>
                  ))}
                  {key === "howItWorks" ? (
                    <div className="space-y-2">
                      {(((form.howItWorks as Record<string, unknown>).steps as Array<{ title: string; desc: string }>) ?? []).map(
                        (s, i) => (
                          <div key={i} className="rounded border border-dashed p-2">
                            <Label className="text-xs">Langkah {i + 1}</Label>
                            <Input value={s.title} onChange={(e) => updateStep(i, "title", e.target.value)} placeholder="Judul" className="mt-1" />
                            <Input value={s.desc} onChange={(e) => updateStep(i, "desc", e.target.value)} placeholder="Deskripsi" className="mt-1" />
                          </div>
                        ),
                      )}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}
        <SaveBar onSave={save} saving={saving} msg={msg} />
      </CardContent>
    </Card>
  );
}

// ─── Volume & Price Editor ───────────────────────────────────────────────────
function VolumePriceEditor({ settings }: { settings: SettingValue[] }) {
  const presetRow = settings.find((r) => r.key === "volume_presets");
  const alcoholRow = settings.find((r) => r.key === "alcohol_price_per_ml");

  const initialPresets = (presetRow?.value as { value?: unknown } | unknown[] | undefined) ?? [30, 50, 70, 100];
  const initialPresetArray = Array.isArray(initialPresets)
    ? ((initialPresets as unknown[]).map(Number).filter((n) => Number.isFinite(n) && n > 0))
    : (Array.isArray((initialPresets as { value?: unknown })?.value)
      ? ((initialPresets as { value: unknown[] }).value).map(Number).filter((n) => Number.isFinite(n) && n > 0)
      : [30, 50, 70, 100]);

  const alcoholDefault = alcoholRow ? Number((alcoholRow.value as { value?: unknown } | number | undefined) === null || (alcoholRow.value as { value?: unknown } | number | undefined) === undefined
    ? 300
    : (typeof alcoholRow.value === "object"
        ? ((alcoholRow.value as { value?: unknown }).value ?? 300)
        : alcoholRow.value)) : 300;

  const [presets, setPresets] = useState<string[]>(initialPresetArray.map(String));
  const [alcohol, setAlcohol] = useState<string>(String(Number.isFinite(alcoholDefault) ? alcoholDefault : 300));
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  function updatePreset(i: number, v: string) {
    setPresets((prev) => prev.map((p, idx) => (idx === i ? v : p)));
  }

  function addPreset() {
    setPresets((prev) => [...prev, ""]);
  }

  function removePreset(i: number) {
    setPresets((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function save() {
    const presetNums = presets.map(Number).filter((n) => Number.isFinite(n) && n > 0);
    const alcoholNum = Number(alcohol);
    if (presetNums.length === 0) {
      setMsg("Masukkan minimal 1 ukuran.");
      return;
    }
    if (!Number.isFinite(alcoholNum) || alcoholNum <= 0) {
      setMsg("Harga alkohol harus angka positif.");
      return;
    }
    setSaving(true);
    setMsg(null);
    try {
      await Promise.all([
        fetch("/api/settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "volume_presets", value: [...new Set(presetNums)].sort((a, b) => a - b) }),
        }),
        fetch("/api/settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "alcohol_price_per_ml", value: alcoholNum }),
        }),
      ]);
      setMsg("Tersimpan ✓");
    } catch {
      setMsg("Gagal menyimpan. Periksa koneksi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">📏 Ukuran & Harga Alkohol</CardTitle>
        <CardDescription>
          Ukuran botol yang tersedia di builder & harga alkohol per ml (Rp).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <Label className="text-xs">Ukuran Tersedia (ml)</Label>
          {presets.map((p, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                type="number"
                value={p}
                onChange={(e) => updatePreset(i, e.target.value)}
                placeholder="mis. 50"
              />
              <button
                type="button"
                onClick={() => removePreset(i)}
                className="text-xs text-destructive hover:underline"
              >
                Hapus
              </button>
            </div>
          ))}
          <Button size="sm" variant="outline" onClick={addPreset}>+ Tambah Ukuran</Button>
        </div>
        <div>
          <Label className="text-xs">Harga Alkohol / ml (Rp)</Label>
          <Input
            type="number"
            value={alcohol}
            onChange={(e) => setAlcohol(e.target.value)}
            placeholder="300"
            className="mt-1"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Memengaruhi harga semua produk. Contoh: ukuran 50 ml (25 ml alkohol) berarti +{Math.round((Number(alcohol) || 300) * 25).toLocaleString("id-ID")} untuk alkohol.
          </p>
        </div>
        <SaveBar onSave={save} saving={saving} msg={msg} />
      </CardContent>
    </Card>
  );
}

// ─── Strength Preset Editor ──────────────────────────────────────────────────
// Lembut/Sedang/Kuat used to be fixed ml values (15/25/35) shared by the
// builder and cart drawer — broke for any fragrance whose min/max range
// didn't include those numbers (e.g. min_ml=30 left only "Kuat", or nothing
// at all). They're now percentages of each fragrance's own [min_ml, max_ml]
// range, computed per-fragrance in the storefront (apps/web/lib/strength.ts)
// — always exactly 3 valid, distinct, in-range options.
function StrengthPresetEditor({ settings }: { settings: SettingValue[] }) {
  const row = settings.find((r) => r.key === "strength_presets");
  const raw = (row?.value as { value?: unknown } | unknown[] | undefined) ?? [25, 50, 75];
  const initial = Array.isArray(raw)
    ? (raw as unknown[]).map(Number)
    : Array.isArray((raw as { value?: unknown })?.value)
      ? ((raw as { value: unknown[] }).value).map(Number)
      : [25, 50, 75];

  const [lembut, setLembut] = useState(String(initial[0] ?? 25));
  const [sedang, setSedang] = useState(String(initial[1] ?? 50));
  const [kuat, setKuat] = useState(String(initial[2] ?? 75));
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function save() {
    const nums = [Number(lembut), Number(sedang), Number(kuat)];
    if (nums.some((n) => !Number.isFinite(n) || n < 0 || n > 100)) {
      setMsg("Persen harus angka 0-100.");
      return;
    }
    if (!(nums[0]! < nums[1]! && nums[1]! < nums[2]!)) {
      setMsg("Urutan harus naik: Lembut < Sedang < Kuat.");
      return;
    }
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "strength_presets", value: nums }),
      });
      const data = await res.json();
      setMsg(res.ok ? "Tersimpan ✓" : data?.error?.message || "Gagal menyimpan.");
    } catch {
      setMsg("Gagal menyimpan. Periksa koneksi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">💨 Kekuatan Aroma</CardTitle>
        <CardDescription>
          Posisi Lembut/Sedang/Kuat sebagai persen dari rentang ml setiap aroma (min-max masing-masing produk).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <div>
            <Label className="text-xs">Lembut (%)</Label>
            <Input type="number" min={0} max={100} value={lembut} onChange={(e) => setLembut(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Sedang (%)</Label>
            <Input type="number" min={0} max={100} value={sedang} onChange={(e) => setSedang(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Kuat (%)</Label>
            <Input type="number" min={0} max={100} value={kuat} onChange={(e) => setKuat(e.target.value)} />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Contoh: aroma dengan rentang 30-100 ml dan Kuat=75% → 30 + 75% × (100-30) = 82 ml.
        </p>
        <SaveBar onSave={save} saving={saving} msg={msg} />
      </CardContent>
    </Card>
  );
}

// ─── Main Manager ────────────────────────────────────────────────────────────
export function SettingsManager({ initial }: { initial: SettingValue[] }) {
  const find = (key: string) => initial.find((r) => r.key === key) ?? { key, value: {} };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <HeroEditor setting={find("hero")} />
      <FooterEditor setting={find("footer")} />
      <HomepageEditor setting={find("homepage")} />
      <CheckoutEditor setting={find("checkout")} />
      <VolumePriceEditor settings={initial} />
      <StrengthPresetEditor settings={initial} />
      <TestimonialEditor setting={find("social_proof")} />
      <FaqEditor setting={find("faq")} />
    </div>
  );
}