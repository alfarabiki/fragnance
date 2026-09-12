import { describe, it, expect } from "vitest";
import { nextLabel } from "./pricing-version";

describe("nextLabel", () => {
  it("starts at v1.0 when there is no prior version", () => {
    expect(nextLabel(null)).toBe("v1.0");
  });

  it("increments by 0.1", () => {
    expect(nextLabel("v1.0")).toBe("v1.1");
    expect(nextLabel("v1.9")).toBe("v2.0");
  });

  it("falls back to v1.0 for an unparseable label", () => {
    expect(nextLabel("not-a-version")).toBe("v1.0");
  });
});
