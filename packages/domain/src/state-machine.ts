import type { OrderStatus } from "./enums"
import { ORDER_TRANSITIONS } from "./enums"

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ORDER_TRANSITIONS[from]?.includes(to) ?? false
}

export function assertTransition(from: OrderStatus, to: OrderStatus): void {
  if (!canTransition(from, to)) {
    throw new Error(
      `Invalid order transition: ${from} → ${to}. Allowed transitions: ${ORDER_TRANSITIONS[from]?.join(", ") || "none"}`
    )
  }
}