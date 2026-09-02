// Short-lived relay for order data between /checkout (where the order is
// created server-side) and /payment (which needs the real customer/address
// to build the WhatsApp message and the real order id for the QRIS
// transaction). The database is still the system of record — this is just
// same-tab handoff between two pages, not persistence.

export interface OrderSession {
  orderId: string | null;
  orderNumber: string;
  persisted: boolean;
  customer: { name: string; phone: string };
  address: {
    recipientName: string;
    phone: string;
    fullAddress: string;
    district: string;
    city: string;
    province: string;
    postalCode: string;
    note?: string;
  };
  total: number;
}

const KEY = "atlase.order-session.v1";

export function saveOrderSession(session: OrderSession): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(KEY, JSON.stringify(session));
}

export function loadOrderSession(orderNumber: string): OrderSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as OrderSession;
    return parsed.orderNumber === orderNumber ? parsed : null;
  } catch {
    return null;
  }
}
