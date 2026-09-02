export interface CatalogFragrance {
  id: string;
  slug: string;
  name: string;
  referenceLabel: string | null;
  category: string;
  description: string;
  detail: string;
  pricePerMl: number;
  costPerMl: number;
  minMl: number;
  maxMl: number;
  isActive: boolean;
  badge: "POPULAR" | "NEW" | "PREMIUM" | "BEST SELLER" | null;
}

export interface CatalogBottle {
  id: string;
  slug: string;
  name: string;
  volumeMl: number;
  costPrice: number;
  sellPrice: number;
  isActive: boolean;
}

export interface CatalogPackaging {
  id: string;
  slug: string;
  name: string;
  costPrice: number;
  sellPrice: number;
  isMandatory: boolean;
  isActive: boolean;
}

export const alcoholCostPerMl = 150;
export const alcoholSellPerMl = 300;

export const volumePresets = [30, 50, 70, 100] as const;

export const fragrances: CatalogFragrance[] = [
  {
    id: "dior-sauvage",
    slug: "dior-inspired",
    name: "Dior-inspired",
    referenceLabel: "Terinspirasi aroma elegan khas malam",
    category: "Premium",
    description: "Aroma elegan · Cocok untuk malam",
    detail: "Wanginya maskulin, tegas, dan berkelas. Cocok banget buat kamu yang suka tampil percaya diri.",
    pricePerMl: 3000,
    costPerMl: 1800,
    minMl: 5,
    maxMl: 50,
    isActive: true,
    badge: "BEST SELLER",
  },
  {
    id: "woody-fresh",
    slug: "woody-fresh",
    name: "Woody Fresh",
    referenceLabel: "Terinspirasi aroma kayu segar",
    category: "Daily",
    description: "Segar setiap hari",
    detail: "Perpaduan kayu dan kesegaran yang ringan. Pas untuk aktivitas harian.",
    pricePerMl: 2000,
    costPerMl: 1100,
    minMl: 5,
    maxMl: 50,
    isActive: true,
    badge: "POPULAR",
  },
  {
    id: "sweet-vanilla",
    slug: "sweet-vanilla",
    name: "Sweet Vanilla",
    referenceLabel: "Terinspirasi aroma vanila manis",
    category: "Gourmand",
    description: "Manis dan hangat",
    detail: "Aroma vanila yang lembut dan hangat. Cocok untuk suasana cozy.",
    pricePerMl: 2500,
    costPerMl: 1400,
    minMl: 5,
    maxMl: 50,
    isActive: true,
    badge: "NEW",
  },
  {
    id: "floral-dream",
    slug: "floral-dream",
    name: "Floral Dream",
    referenceLabel: "Terinspirasi aroma bunga segar",
    category: "Floral",
    description: "Manis, lembut, feminin",
    detail: "Lembut dan feminin. Aroma bunga yang menyegarkan suasana.",
    pricePerMl: 2200,
    costPerMl: 1200,
    minMl: 5,
    maxMl: 50,
    isActive: true,
    badge: null,
  },
  {
    id: "citrus-bright",
    slug: "citrus-bright",
    name: "Citrus Bright",
    referenceLabel: "Terinspirasi aroma jeruk segar",
    category: "Fresh",
    description: "Penyegar pagi yang cerah",
    detail: "Segar dan cerah seperti pagi. Bikin mood langsung naik.",
    pricePerMl: 1800,
    costPerMl: 900,
    minMl: 5,
    maxMl: 50,
    isActive: true,
    badge: null,
  },
  {
    id: "oud-royal",
    slug: "oud-royal",
    name: "Oud Royal",
    referenceLabel: "Terinspirasi aroma oud mewah",
    category: "Premium",
    description: "Kaya, hangat, eksklusif",
    detail: "Aroma oud yang kaya dan mewah. Untuk acara istimewa.",
    pricePerMl: 5000,
    costPerMl: 3200,
    minMl: 5,
    maxMl: 50,
    isActive: true,
    badge: "PREMIUM",
  },
];

export const bottles: CatalogBottle[] = [
  { id: "b30-s", slug: "30ml-standard", name: "Standard 30 ml", volumeMl: 30, costPrice: 6000, sellPrice: 9000, isActive: true },
  { id: "b30-p", slug: "30ml-premium", name: "Premium 30 ml", volumeMl: 30, costPrice: 9000, sellPrice: 13000, isActive: true },
  { id: "b50-s", slug: "50ml-standard", name: "Standard 50 ml", volumeMl: 50, costPrice: 7000, sellPrice: 11000, isActive: true },
  { id: "b50-p", slug: "50ml-premium", name: "Premium 50 ml", volumeMl: 50, costPrice: 10000, sellPrice: 15000, isActive: true },
  { id: "b70-s", slug: "70ml-standard", name: "Standard 70 ml", volumeMl: 70, costPrice: 9000, sellPrice: 13000, isActive: true },
  { id: "b70-p", slug: "70ml-premium", name: "Premium 70 ml", volumeMl: 70, costPrice: 12000, sellPrice: 17000, isActive: true },
  { id: "b100-s", slug: "100ml-standard", name: "Standard 100 ml", volumeMl: 100, costPrice: 11000, sellPrice: 16000, isActive: true },
  { id: "b100-p", slug: "100ml-premium", name: "Premium 100 ml", volumeMl: 100, costPrice: 15000, sellPrice: 20000, isActive: true },
];

export const packaging: CatalogPackaging[] = [
  { id: "pkg-standard", slug: "standard", name: "Standard", costPrice: 2000, sellPrice: 5000, isMandatory: false, isActive: true },
  { id: "pkg-premium", slug: "premium-box", name: "Premium Box", costPrice: 6000, sellPrice: 15000, isMandatory: false, isActive: true },
  { id: "pkg-gift", slug: "gift", name: "Gift", costPrice: 9000, sellPrice: 25000, isMandatory: false, isActive: true },
];

export function getFragranceById(id: string): CatalogFragrance | undefined {
  return fragrances.find((f) => f.id === id);
}

export function getFragranceBySlug(slug: string): CatalogFragrance | undefined {
  return fragrances.find((f) => f.slug === slug);
}

export function getBottleById(id: string): CatalogBottle | undefined {
  return bottles.find((b) => b.id === id);
}

export function getBottlesByVolume(volumeMl: number): CatalogBottle[] {
  return bottles.filter((b) => b.volumeMl === volumeMl && b.isActive);
}

export function getPackagingById(id: string): CatalogPackaging | undefined {
  return packaging.find((p) => p.id === id);
}