"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import {
  loadCart,
  persistCart,
  upsertItem,
  removeItem,
  setQuantity,
  cartSubtotal,
  type CartItem,
  type CartItemConfig,
} from "@/lib/cart";

interface CartContextValue {
  items: CartItem[];
  subtotal: number;
  count: number;
  addItem: (config: CartItemConfig) => void;
  increment: (itemId: string) => void;
  decrement: (itemId: string) => void;
  remove: (itemId: string) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => loadCart());

  const value = useMemo<CartContextValue>(() => {
    const commit = (next: CartItem[]) => {
      setItems(next);
      persistCart(next);
    };

    return {
      items,
      subtotal: cartSubtotal(items),
      count: items.reduce((n, i) => n + i.quantity, 0),
      addItem: (config) => commit(upsertItem(items, config)),
      increment: (itemId) => commit(setQuantity(items, itemId, (items.find((i) => i.itemId === itemId)?.quantity ?? 1) + 1)),
      decrement: (itemId) => commit(setQuantity(items, itemId, (items.find((i) => i.itemId === itemId)?.quantity ?? 1) - 1)),
      remove: (itemId) => commit(removeItem(items, itemId)),
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}