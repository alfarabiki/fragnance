import { describe, it, expect } from "vitest";
import { rateLimit, isCrossOrigin } from "./security";

describe("rateLimit", () => {
  it("allows requests under the limit and blocks over it", () => {
    const key = `test:${Math.random()}`;
    for (let i = 0; i < 3; i++) {
      expect(rateLimit(key, { max: 3, windowMs: 60_000 })).toBe(true);
    }
    expect(rateLimit(key, { max: 3, windowMs: 60_000 })).toBe(false);
  });

  it("resets after the window passes", async () => {
    const key = `test:${Math.random()}`;
    expect(rateLimit(key, { max: 1, windowMs: 10 })).toBe(true);
    expect(rateLimit(key, { max: 1, windowMs: 10 })).toBe(false);
    await new Promise((r) => setTimeout(r, 20));
    expect(rateLimit(key, { max: 1, windowMs: 10 })).toBe(true);
  });
});

describe("isCrossOrigin", () => {
  it("passes same-origin requests", () => {
    const req = new Request("https://atlase.id/api/orders", {
      method: "POST",
      headers: { origin: "https://atlase.id", host: "atlase.id" },
    });
    expect(isCrossOrigin(req)).toBe(false);
  });

  it("flags mismatched origin", () => {
    const req = new Request("https://atlase.id/api/orders", {
      method: "POST",
      headers: { origin: "https://evil.example", host: "atlase.id" },
    });
    expect(isCrossOrigin(req)).toBe(true);
  });

  it("passes through when Origin header is absent (non-browser callers)", () => {
    const req = new Request("https://atlase.id/api/orders", { method: "POST" });
    expect(isCrossOrigin(req)).toBe(false);
  });
});
