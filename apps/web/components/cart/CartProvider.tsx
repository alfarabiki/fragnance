"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import {
  loadCart,
  persistCart,
  upsertItem,
  removeItem,
  setQuantity,
  reconfigureItem,
  cartSubtotal,
  type CartItem,
  type CartItemConfig,
} from "@/lib/cart";
import type { LiveBottle, LiveFragrance, LivePackaging } from "@/lib/catalog";
import { track } from "@/lib/analytics";

export interface CartCatalog {
  fragrances: LiveFragrance[];
  bottles: LiveBottle[];
  packaging: LivePackaging[];
  volumePresets: number[];
  alcoholSellPerMl: number;
  strengthPresetPercents: number[];
}

interface CartContextValue {
  items: CartItem[];
  subtotal: number;
  count: number;
  addItem: (config: CartItemConfig) => void;
  updateItem: (itemId: string, config: CartItemConfig) => void;
  increment: (itemId: string) => void;
  decrement: (itemId: string) => void;
  remove: (itemId: string) => void;
  catalog: CartCatalog;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children, catalog }: { children: ReactNode; catalog: CartCatalog }) {
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
      addItem: (config) => {
        commit(upsertItem(items, config));
        track("add_to_cart", { fragranceId: config.fragranceId, volumeMl: config.volumeMl });
      },
      updateItem: (itemId, config) => {
        commit(reconfigureItem(items, itemId, config));
        track("cart_item_reconfigured", { fragranceId: config.fragranceId, volumeMl: config.volumeMl });
      },
      increment: (itemId) => commit(setQuantity(items, itemId, (items.find((i) => i.itemId === itemId)?.quantity ?? 1) + 1)),
      decrement: (itemId) => commit(setQuantity(items, itemId, (items.find((i) => i.itemId === itemId)?.quantity ?? 1) - 1)),
      remove: (itemId) => commit(removeItem(items, itemId)),
      catalog,
    };
  }, [items, catalog]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
