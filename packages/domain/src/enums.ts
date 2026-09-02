export type OrderStatus = 
  | "DRAFT" 
  | "PENDING_CONFIRMATION" 
  | "CONFIRMED" 
  | "PENDING_PAYMENT" 
  | "PAID" 
  | "PROCESSING" 
  | "READY" 
  | "SHIPPED" 
  | "COMPLETED" 
  | "CANCELLED" 
  | "EXPIRED" 
  | "REFUNDED" 
  | "FAILED";

export type PaymentStatus = 
  | "PENDING" 
  | "PAID" 
  | "FAILED" 
  | "EXPIRED" 
  | "REFUNDED";

export type Channel = 
  | "WHATSAPP" 
  | "DIRECT_PAYMENT" 
  | "ADMIN";

export type ConsentType = 
  | "MARKETING" 
  | "DATA_PROCESSING" 
  | "WHATSAPP";

export type MovementType = 
  | "PURCHASE" 
  | "RESERVATION" 
  | "SALE" 
  | "CANCELLATION" 
  | "ADJUSTMENT" 
  | "RETURN";

export type FragranceVisibility = 
  | "ACTIVE" 
  | "INACTIVE";

export type PricingVersionStatus = 
  | "DRAFT" 
  | "PREVIEW" 
  | "PUBLISHED" 
  | "ACTIVE";

export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  DRAFT: ["PENDING_CONFIRMATION", "CANCELLED"],
  PENDING_CONFIRMATION: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PENDING_PAYMENT", "PROCESSING", "CANCELLED"],
  PENDING_PAYMENT: ["PAID", "EXPIRED", "CANCELLED"],
  PAID: ["PROCESSING"],
  PROCESSING: ["READY", "CANCELLED"],
  READY: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["COMPLETED"],
  COMPLETED: ["REFUNDED"],
  CANCELLED: [],
  EXPIRED: ["CANCELLED"],
  REFUNDED: [],
  FAILED: ["CANCELLED"],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ORDER_TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertTransition(from: OrderStatus, to: OrderStatus): void {
  if (!canTransition(from, to)) {
    throw new Error(
      `Invalid order transition: ${from} → ${to}. Allowed transitions: ${ORDER_TRANSITIONS[from]?.join(", ") || "none"}`
    );
  }
}