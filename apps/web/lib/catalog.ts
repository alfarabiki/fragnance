import { createClient } from "@supabase/supabase-js";
import { calculate, PricingError } from "@atlase/pricing";
import { DEFAULT_STRENGTH_PRESET_PERCENTS } from "./strength";

// Live catalog data for the storefront. Fragrances/bottles/packaging/
// inventory_items are all anon-readable (database/migrations §0002, §0005),
// so a plain anon-key client works everywhere — request handlers, Server
// Components, and generateStaticParams (no cookies/request context needed).

/**
 * Return a resized Supabase Storage URL for a product image. Supabase's image
 * transform endpoint renders AVIF/WebP downscaled versions on the fly, which
 * is dramatically cheaper than shipping the original (often multi-MB) photo
 * for every card in the builder/grid. Falls back to the raw URL untouched
 * when the URL isn't a Supabase storage path.
 */
export function thumbUrl(url: string | null, width = 320): string | null {
  if (!url) return null;
  if (url.startsWith("https://") && url.includes("/storage/v1/object/public/")) {
    const base = url.split("?")[0];
    return `${base}?width=${width}&quality=70&format=webp`;
  }
  return url;
}
function db() {
  return createClient(getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"), getRequiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"));
}

function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
}

export interface LiveFragrance {
  id: string;
  slug: string;
  name: string;
  referenceLabel: string | null;
  description: string;
  detail: string;
  category: string;
  pricePerMl: number;
  costPerMl: number;
  discountPercent: number;
  effectivePricePerMl: number;
  minMl: number;
  maxMl: number;
  isActive: boolean;
  isFeatured: boolean;
  badge: "POPULAR" | "NEW" | "PREMIUM" | "BEST SELLER" | null;
  imageUrl: string | null;
  videoUrl: string | null;
  inStock: boolean;
  stockQty: number;
}

export interface LiveBottle {
  id: string;
  slug: string;
  name: string;
  volumeMl: number;
  costPrice: number;
  sellPrice: number;
  isActive: boolean;
  inStock: boolean;
  stockQty: number;
}

export interface LivePackaging {
  id: string;
  slug: string;
  name: string;
  description: string;
  costPrice: number;
  sellPrice: number;
  isMandatory: boolean;
  isActive: boolean;
  inStock: boolean;
  stockQty: number;
}

interface StockMap {
  get(itemType: string, itemId: string): { qty: number; inStock: boolean; hasRecord: boolean };
}

async function loadStock(client: ReturnType<typeof db>): Promise<StockMap> {
  const { data } = await client.from("inventory_items").select("item_type, item_id, current_stock, reserved_stock");
  const map = new Map<string, number>();
  for (const row of data ?? []) {
    const available = Number(row.current_stock) - Number(row.reserved_stock);
    map.set(`${row.item_type}:${row.item_id}`, available);
  }
  return {
    get(itemType, itemId) {
      const key = `${itemType}:${itemId}`;
      const hasRecord = map.has(key);
      const qty = map.get(key) ?? 0;
      return { qty, inStock: qty > 0, hasRecord };
    },
  };
}

export async function getFragrances(): Promise<LiveFragrance[]> {
  const client = db();
  const [{ data: fragranceRows, error: fErr }, { data: pricingRows }, stock] = await Promise.all([
    client.from("fragrances").select("*").eq("is_active", true).order("popularity_score", { ascending: false }),
    client.from("fragrance_pricing").select("fragrance_id, cost_per_ml, price_per_ml").eq("active", true),
    loadStock(client),
  ]);
  if (fErr || !fragranceRows) return [];

  const priceByFragrance = new Map((pricingRows ?? []).map((p) => [p.fragrance_id as string, p]));

  return fragranceRows.map((f): LiveFragrance => {
    const pricing = priceByFragrance.get(f.id as string);
    const pricePerMl = Number(pricing?.price_per_ml ?? 0);
    const discountPercent = Number(f.discount_percent ?? 0);
    // Unlike bottles/packaging (physical SKUs, always given an inventory_items
    // row on creation — see admin's bottles/packaging POST routes), fragrance
    // concentrate has no admin UI to set stock at all (§55 "where applicable").
    // No record must mean "not tracked", not "out of stock", or every
    // fragrance the admin creates is born unpurchasable.
    const fragranceStock = stock.get("FRAGRANCE", f.id as string);
    const inStock = fragranceStock.hasRecord ? fragranceStock.inStock : true;
    return {
      id: f.id as string,
      slug: f.slug as string,
      name: f.name as string,
      referenceLabel: (f.reference_label as string) ?? null,
      description: (f.description as string) ?? "",
      detail: (f.detail as string) ?? "",
      category: (f.category as string) ?? "",
      pricePerMl,
      costPerMl: Number(pricing?.cost_per_ml ?? 0),
      discountPercent,
      effectivePricePerMl: Math.round(pricePerMl * (1 - discountPercent / 100)),
      minMl: Number(f.min_ml),
      maxMl: Number(f.max_ml),
      isActive: Boolean(f.is_active),
      isFeatured: Boolean(f.is_featured),
      badge: (f.badge as LiveFragrance["badge"]) ?? null,
      imageUrl: (f.image_url as string) ?? null,
      videoUrl: (f.video_url as string) ?? null,
      inStock,
      stockQty: fragranceStock.qty,
    };
  });
}

export async function getFragranceBySlug(slug: string): Promise<LiveFragrance | undefined> {
  const all = await getFragrances();
  return all.find((f) => f.slug === slug);
}

export async function getFragranceById(id: string): Promise<LiveFragrance | undefined> {
  const all = await getFragrances();
  return all.find((f) => f.id === id);
}

export async function getFeaturedFragrances(): Promise<LiveFragrance[]> {
  const all = await getFragrances();
  return all.filter((f) => f.isFeatured).slice(0, 6);
}

export async function getBottles(): Promise<LiveBottle[]> {
  const client = db();
  const [{ data, error }, stock] = await Promise.all([
    client.from("bottles").select("*").eq("is_active", true).order("volume_ml"),
    loadStock(client),
  ]);
  if (error || !data) return [];
  return data.map((b): LiveBottle => {
    const { qty, inStock } = stock.get("BOTTLE", b.id as string);
    return {
      id: b.id as string,
      slug: b.slug as string,
      name: b.name as string,
      volumeMl: Number(b.volume_ml),
      costPrice: Number(b.cost_price),
      sellPrice: Number(b.sell_price),
      isActive: Boolean(b.is_active),
      inStock,
      stockQty: qty,
    };
  });
}

export async function getBottlesByVolume(volumeMl: number): Promise<LiveBottle[]> {
  const all = await getBottles();
  return all.filter((b) => b.volumeMl === volumeMl);
}

export async function getBottleById(id: string): Promise<LiveBottle | undefined> {
  const all = await getBottles();
  return all.find((b) => b.id === id);
}

export async function getPackaging(): Promise<LivePackaging[]> {
  const client = db();
  const [{ data, error }, stock] = await Promise.all([
    client.from("packaging").select("*").eq("is_active", true),
    loadStock(client),
  ]);
  if (error || !data) return [];
  return data.map((p): LivePackaging => {
    const { qty, inStock } = stock.get("PACKAGING", p.id as string);
    return {
      id: p.id as string,
      slug: p.slug as string,
      name: p.name as string,
      description: (p.description as string) ?? "",
      costPrice: Number(p.cost_price),
      sellPrice: Number(p.sell_price),
      isMandatory: Boolean(p.is_mandatory),
      isActive: Boolean(p.is_active),
      inStock,
      stockQty: qty,
    };
  });
}

export async function getPackagingById(id: string): Promise<LivePackaging | undefined> {
  const all = await getPackaging();
  return all.find((p) => p.id === id);
}

export const volumePresets = [30, 50, 70, 100] as const;
export const alcoholSellPerMl = 300;

// Admin-editable via system_settings (admin.mizparfume.com → Settings).
// Fall back to the constants above when the DB is unreachable or unseeded.
type NumericSetting = { value?: unknown };
async function readNumber(key: string, fallback: number): Promise<number> {
  const client = db();
  if (!client) return fallback;
  try {
    const { data } = await client.from("system_settings").select("value").eq("key", key).maybeSingle();
    const v = Number((data?.value as NumericSetting)?.value ?? data?.value);
    return Number.isFinite(v) && v > 0 ? v : fallback;
  } catch {
    return fallback;
  }
}

type ArraySetting = { value?: unknown };
async function readNumberArray(key: string, fallback: readonly number[]): Promise<number[]> {
  const client = db();
  if (!client) return [...fallback];
  try {
    const { data } = await client.from("system_settings").select("value").eq("key", key).maybeSingle();
    const raw = (data?.value as ArraySetting)?.value ?? data?.value;
    if (Array.isArray(raw)) {
      const nums = raw.map(Number).filter((n) => Number.isFinite(n) && n > 0);
      if (nums.length > 0) return [...new Set(nums)].sort((a, b) => a - b);
    }
    return [...fallback];
  } catch {
    return [...fallback];
  }
}

export async function getAlcoholSellPerMl(): Promise<number> {
  // Supports both `{"value": 500}` and plain `500` jsonb shapes.
  return readNumber("alcohol_price_per_ml", alcoholSellPerMl);
}

export async function getVolumePresets(): Promise<number[]> {
  return readNumberArray("volume_presets", volumePresets);
}

// Percent-of-range presets (0-100), NOT sorted/deduped like readNumberArray —
// order is Lembut/Sedang/Kuat and 0 is a valid percent (see lib/strength.ts).
export async function getStrengthPresetPercents(): Promise<number[]> {
  const client = db();
  if (!client) return [...DEFAULT_STRENGTH_PRESET_PERCENTS];
  try {
    const { data } = await client.from("system_settings").select("value").eq("key", "strength_presets").maybeSingle();
    const raw = (data?.value as { value?: unknown })?.value ?? data?.value;
    if (Array.isArray(raw)) {
      const nums = raw.map(Number).filter((n) => Number.isFinite(n) && n >= 0 && n <= 100);
      if (nums.length === 3) return nums;
    }
    return [...DEFAULT_STRENGTH_PRESET_PERCENTS];
  } catch {
    return [...DEFAULT_STRENGTH_PRESET_PERCENTS];
  }
}

export const DEFAULT_QUOTE_VOLUME_ML = 50;
export const DEFAULT_QUOTE_STRENGTH_ML = 25;

export interface DefaultQuote {
  bottle: LiveBottle;
  packaging: LivePackaging;
  unitPrice: number;
  originalUnitPrice: number | null;
}

// The "quick add to cart" default used by product cards and starting-price
// display: 50ml, sedang (25ml), standard bottle + packaging. Centralized
// here so the homepage grid and any other quick-add surface compute the
// exact same price the pricing engine will re-validate at checkout.
export function computeDefaultQuote(
  fragrance: LiveFragrance,
  bottles: LiveBottle[],
  packaging: LivePackaging[],
  alcoholPrice = alcoholSellPerMl,
): DefaultQuote | null {
  const bottle =
    bottles.find((b) => b.volumeMl === DEFAULT_QUOTE_VOLUME_ML && b.name.toLowerCase().includes("standard")) ??
    bottles.find((b) => b.volumeMl === DEFAULT_QUOTE_VOLUME_ML);
  const pack = packaging.find((p) => p.slug === "standard") ?? packaging[0];
  if (!bottle || !pack) return null;

  const fragranceMl = Math.min(Math.max(DEFAULT_QUOTE_STRENGTH_ML, fragrance.minMl), fragrance.maxMl);

  try {
    const quote = calculate({
      fragrance: { id: fragrance.id, name: fragrance.name, pricePerMl: fragrance.effectivePricePerMl, minMl: fragrance.minMl, maxMl: fragrance.maxMl },
      bottle: { id: bottle.id, name: bottle.name, volumeMl: bottle.volumeMl, price: bottle.sellPrice, active: bottle.isActive },
      packaging: { id: pack.id, name: pack.name, price: pack.sellPrice, mandatory: pack.isMandatory, active: pack.isActive },
      alcohol: { pricePerMl: alcoholPrice },
      volumeMl: DEFAULT_QUOTE_VOLUME_ML,
      fragranceMl,
    });

    let originalUnitPrice: number | null = null;
    if (fragrance.discountPercent > 0) {
      const original = calculate({
        fragrance: { id: fragrance.id, name: fragrance.name, pricePerMl: fragrance.pricePerMl, minMl: fragrance.minMl, maxMl: fragrance.maxMl },
        bottle: { id: bottle.id, name: bottle.name, volumeMl: bottle.volumeMl, price: bottle.sellPrice, active: bottle.isActive },
        packaging: { id: pack.id, name: pack.name, price: pack.sellPrice, mandatory: pack.isMandatory, active: pack.isActive },
        alcohol: { pricePerMl: alcoholPrice },
        volumeMl: DEFAULT_QUOTE_VOLUME_ML,
        fragranceMl,
      });
      originalUnitPrice = original.total;
    }

    return { bottle, packaging: pack, unitPrice: quote.total, originalUnitPrice };
  } catch (e) {
    if (e instanceof PricingError) return null;
    throw e;
  }
}
