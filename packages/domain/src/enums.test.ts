import { describe, it, expect } from "vitest";
import {
  canTransition,
  assertTransition,
  ORDER_TRANSITIONS,
} from "./enums";
import type { OrderStatus } from "./enums";

const VALID_EDGES: Array<[OrderStatus, OrderStatus]> = [
  ["DRAFT", "PENDING_CONFIRMATION"],
  ["DRAFT", "CANCELLED"],
  ["PENDING_CONFIRMATION", "CONFIRMED"],
  ["PENDING_CONFIRMATION", "CANCELLED"],
  ["CONFIRMED", "PENDING_PAYMENT"],
  ["CONFIRMED", "PROCESSING"],
  ["CONFIRMED", "CANCELLED"],
  ["PENDING_PAYMENT", "PAID"],
  ["PENDING_PAYMENT", "EXPIRED"],
  ["PENDING_PAYMENT", "CANCELLED"],
  ["PAID", "PROCESSING"],
  ["PROCESSING", "READY"],
  ["PROCESSING", "CANCELLED"],
  ["READY", "SHIPPED"],
  ["READY", "CANCELLED"],
  ["SHIPPED", "COMPLETED"],
  ["COMPLETED", "REFUNDED"],
  ["EXPIRED", "CANCELLED"],
  ["FAILED", "CANCELLED"],
];

const INVALID_EDGES: Array<[OrderStatus, OrderStatus]> = [
  ["DRAFT", "PAID"],
  ["COMPLETED", "SHIPPED"],
  ["SHIPPED", "PAID"],
  ["DRAFT", "COMPLETED"],
  ["CANCELLED", "DRAFT"],
];

describe("ORDER_TRANSITIONS (spec §14 state machine)", () => {
  it("accepts every documented valid edge", () => {
    for (const [from, to] of VALID_EDGES) {
      expect(canTransition(from, to), `${from} → ${to}`).toBe(true);
    }
  });

  it("rejects every documented invalid edge", () => {
    for (const [from, to] of INVALID_EDGES) {
      expect(canTransition(from, to), `${from} → ${to}`).toBe(false);
    }
  });

  it("assertTransition throws on invalid moves", () => {
    expect(() => assertTransition("DRAFT", "PAID")).toThrow();
    expect(() => assertTransition("COMPLETED", "SHIPPED")).toThrow();
  });

  it("assertTransition passes on valid moves", () => {
    for (const [from, to] of VALID_EDGES) {
      expect(() => assertTransition(from, to)).not.toThrow();
    }
  });

  it("transition table covers all 13 statuses", () => {
    const statuses: OrderStatus[] = [
      "DRAFT",
      "PENDING_CONFIRMATION",
      "CONFIRMED",
      "PENDING_PAYMENT",
      "PAID",
      "PROCESSING",
      "READY",
      "SHIPPED",
      "COMPLETED",
      "CANCELLED",
      "EXPIRED",
      "REFUNDED",
      "FAILED",
    ];
    for (const s of statuses) {
      expect(Array.isArray(ORDER_TRANSITIONS[s])).toBe(true);
    }
  });
});