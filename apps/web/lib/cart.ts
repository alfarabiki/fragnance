export interface CartItemConfig {
  fragranceId: string;
  fragranceName: string;
  volumeMl: number;
  fragranceMl: number;
  bottleId: string;
  bottleName: string;
  packagingId: string;
  packagingName: string;
  unitPrice: number;
}

export interface CartItem extends CartItemConfig {
  itemId: string;
  quantity: number;
}

const SESSION_KEY = "atlase.cart.v1";

function defaultItems(): CartItem[] {
  return [];
}

function safeParse(raw: string): CartItem[] {
  try {
    const parsed = JSON.parse(raw) as CartItem[];
    if (!Array.isArray(parsed)) return defaultItems();
    return parsed;
  } catch {
    return defaultItems();
  }
}

export function loadCart(): CartItem[] {
  if (typeof window === "undefined") return defaultItems();
  const raw = window.localStorage.getItem(SESSION_KEY);
  return raw ? safeParse(raw) : defaultItems();
}

export function persistCart(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(items));
}

export function normalizeItem(item: CartItemConfig): CartItem {
  return {
    ...item,
    itemId: [
      item.fragranceId,
      item.volumeMl,
      item.fragranceMl,
      item.bottleId,
      item.packagingId,
    ].join(":"),
    quantity: 1,
  };
}

export function upsertItem(current: CartItem[], next: CartItemConfig): CartItem[] {
  const normalized = normalizeItem(next);
  const idx = current.findIndex((c) => c.itemId === normalized.itemId);
  if (idx >= 0) {
    const copy = [...current];
    copy[idx] = { ...copy[idx]!, quantity: copy[idx]!.quantity + 1 };
    return copy;
  }
  return [...current, normalized];
}

export function removeItem(current: CartItem[], itemId: string): CartItem[] {
  return current.filter((c) => c.itemId !== itemId);
}

export function setQuantity(current: CartItem[], itemId: string, quantity: number): CartItem[] {
  return current.map((c) =>
    c.itemId === itemId ? { ...c, quantity: Math.max(1, Math.min(20, quantity)) } : c,
  );
}

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
}