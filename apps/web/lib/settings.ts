import { createClient } from "@supabase/supabase-js";

// CMS settings loader for the storefront. Falls back to built-in defaults if
// the database is unreachable or the system_settings table hasn't been
// migrated yet, so the landing page never bricks during deployment drift (§68).

export interface HeroSettings {
  eyebrow: string;
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  startingPriceText?: string;
  badge?: string;
}

export interface FooterSettings {
  copyright: string;
  address: string;
  phone: string;
  instagram: string;
  tiktok: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface Testimonial {
  name: string;
  role: string;
  quote: string;
}

export interface CheckoutSettings {
  step1Title: string;
  step2Title: string;
  step3Title: string;
  notePlaceholder: string;
  whatsappButton?: string;
  qrisButton?: string;
}

export interface HomepageSectionTitle {
  eyebrow?: string;
  title: string;
  description?: string;
}

export interface HomepageStep {
  title: string;
  desc: string;
}

export interface HomepageSectionsSettings {
  collection: HomepageSectionTitle;
  etalase: HomepageSectionTitle;
  howItWorks: HomepageSectionTitle & { steps: HomepageStep[] };
  buildYourPerfume: HomepageSectionTitle & { ctaText: string; ctaLink: string };
  valueBand: { title: string; subtitle: string };
  testimonial: HomepageSectionTitle;
  faq: HomepageSectionTitle;
  whatsappCta: { title: string; description: string; ctaText: string };
}

const DEFAULTS: Record<string, unknown> = {
  hero: {
    eyebrow: "Premium · Made Personal",
    title: "PREMIUM FRAGRANCE.",
    subtitle: "MADE PERSONAL.",
    description:
      "Parfum premium yang bisa kamu sesuaikan dengan aroma dan budget kamu.",
    ctaText: "Pilih Aroma",
    ctaLink: "/buat-parfum",
    startingPriceText: "Mulai dari",
    badge: "Premium · Made Personal",
  },
  footer: {
    copyright: "Parfum Premium, Sesuai Kamu. © %d Miz.",
    address: "Padang, Sumatera Barat",
    phone: "6287887753802",
    instagram: "@mizparfume",
    tiktok: "@mizparfume",
  },
  checkout: {
    step1Title: "Pesananmu",
    step2Title: "Alamat Pengiriman",
    step3Title: "Cara Pesan",
    notePlaceholder: "Catatan tambahan...",
    whatsappButton: "Pesan via WhatsApp",
    qrisButton: "Bayar dengan QRIS",
  },
  social_proof: {
    testimonials: [
      { name: "Siti", role: "Ibu Rumah Tangga", quote: "Wanginya tahan lama, harganya cocok!" },
      { name: "Andi", role: "Mahasiswa", quote: "Gampang banget atur kekuatannya." },
      { name: "Rina", role: "Karyawan", quote: "Pesan via WhatsApp, langsung diantar." },
    ],
  },
  faq: {
    items: [
      { q: "Berapa harga parfumnya?", a: "Mulai dari Rp29.000. Harga naik sesuai ukuran dan kekuatan aroma." },
      { q: "Bisa pilih ukuran?", a: "Tentu. Kamu bisa pilih 30, 50, 70, atau 100 ml." },
      { q: "Bisa menentukan kekuatan aroma?", a: "Bisa. Atur lewat Atur Kekuatan Aroma — dari Lembut hingga Kuat." },
      { q: "Bisa pesan lewat WhatsApp?", a: "Bisa. Itu cara paling mudah. Kamu tinggal lanjut ke WhatsApp setelah pilih parfum." },
      { q: "Bisa bayar dengan QRIS?", a: "Bisa. Bayar via QRIS langsung dari halaman pembayaran." },
    ],
  },
  whatsapp: {
    number: "6287887753802",
    businessName: "Miz",
    orderGreeting: "Halo Miz, saya ingin memesan:",
  },
  homepage: {
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
  },
};

function db() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

function merge<T>(key: string, incoming: unknown): T {
  const base = DEFAULTS[key] as Record<string, unknown>;
  if (!incoming || typeof incoming !== "object" || Array.isArray(incoming)) {
    return (base ?? {}) as T;
  }
  const merged = { ...(base ?? {}) };
  for (const [k, v] of Object.entries(incoming as Record<string, unknown>)) {
    if (v !== null && v !== undefined) merged[k] = v;
  }
  return merged as T;
}

/**
 * Fetch all CMS settings (server-side). Never throws — degraded to defaults
 * when the table doesn't exist or the DB is unreachable.
 */
export async function getAllSettings(): Promise<Record<string, unknown>> {
  const client = db();
  if (!client) return {} as Record<string, unknown>;

  try {
    const { data } = await client.from("system_settings").select("key, value");
    const map: Record<string, unknown> = {};
    for (const row of data ?? []) {
      map[row.key as string] = row.value;
    }
    return map;
  } catch {
    return {} as Record<string, unknown>;
  }
}

export async function getHeroSettings(): Promise<HeroSettings> {
  const all = await getAllSettings();
  return merge<HeroSettings>("hero", all.hero);
}

export async function getFooterSettings(): Promise<FooterSettings> {
  const all = await getAllSettings();
  return merge<FooterSettings>("footer", all.footer);
}

export async function getCheckoutSettings(): Promise<CheckoutSettings> {
  const all = await getAllSettings();
  return merge<CheckoutSettings>("checkout", all.checkout);
}

export async function getFaqItems(): Promise<FaqItem[]> {
  const all = await getAllSettings();
  const raw = all.faq as { items?: FaqItem[] } | undefined;
  const items = Array.isArray(raw?.items) && raw.items.length > 0
    ? raw.items
    : (DEFAULTS.faq as { items: FaqItem[] }).items;
  return items;
}

export async function getTestimonials(): Promise<Testimonial[]> {
  const all = await getAllSettings();
  const raw = all.social_proof as { testimonials?: Testimonial[] } | undefined;
  const items = Array.isArray(raw?.testimonials) && raw.testimonials.length > 0
    ? raw.testimonials
    : (DEFAULTS.social_proof as { testimonials: Testimonial[] }).testimonials;
  return items;
}

export async function getWhatsappSettings(): Promise<{ number: string; businessName: string; orderGreeting: string }> {
  const all = await getAllSettings();
  return merge("whatsapp", all.whatsapp);
}

export async function getHomepageSettings(): Promise<HomepageSectionsSettings> {
  const all = await getAllSettings();
  return merge<HomepageSectionsSettings>("homepage", all.homepage);
}