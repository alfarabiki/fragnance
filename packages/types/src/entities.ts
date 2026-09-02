export interface Fragrance {
  id: string;
  slug: string;
  name: string;
  referenceLabel?: string | null;
  description?: string | null;
  category?: string | null;
  minMl: number;
  maxMl: number;
  isActive: boolean;
}

export interface FragrancePricing {
  id: string;
  fragranceId: string;
  costPerMl: number;
  pricePerMl: number;
  active: boolean;
}

export interface Bottle {
  id: string;
  slug: string;
  name: string;
  volumeMl: number;
  costPrice: number;
  sellPrice: number;
  isActive: boolean;
}

export interface Packaging {
  id: string;
  slug: string;
  name: string;
  costPrice: number;
  sellPrice: number;
  isMandatory: boolean;
  isActive: boolean;
}

export interface Product {
  id: string;
  slug: string;
  fragranceId: string;
  status: "DRAFT" | "PREVIEW" | "PUBLISHED" | "ARCHIVED";
  seoTitle?: string | null;
  seoDescription?: string | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  channel: "WHATSAPP" | "DIRECT_PAYMENT" | "ADMIN";
  status: string;
  currency: "IDR";
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  pricingVersionLabel: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderCustomization {
  id: string;
  orderId: string;
  fragranceId: string;
  volumeMl: number;
  fragranceMl: number;
  alcoholMl: number;
  bottleId?: string | null;
  packagingId?: string | null;
  snapshot: Record<string, unknown>;
}

export interface Customer {
  id: string;
  phone: string;
  email?: string | null;
  name?: string | null;
  isMarketingConsent: boolean;
}

export interface Payment {
  id: string;
  orderId: string;
  method: "QRIS";
  provider: "MIDTRANS";
  amountRequested: number;
  amountPaid?: number | null;
  status: "PENDING" | "PAID" | "FAILED" | "EXPIRED" | "REFUNDED";
}

export interface PaymentTransaction {
  id: string;
  paymentId: string;
  providerTransactionId?: string | null;
  idempotencyKey: string;
  status: string;
  amount: number;
}

export interface PricingVersion {
  id: string;
  label: string;
  status: "DRAFT" | "PREVIEW" | "PUBLISHED" | "ACTIVE";
  publishedAt?: string | null;
}