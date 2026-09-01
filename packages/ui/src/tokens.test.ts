import { describe, expect, it } from "vitest";
import { colors, containers, durations, zIndex, breakpoints } from "./tokens";

describe("atlase design tokens", () => {
  it("exposes core color values", () => {
    expect(colors.black).toBe("#0A0A0A");
    expect(colors["deep-green"]).toBe("#0D6B4D");
    expect(colors.emerald).toBe("#19A974");
    expect(colors.ivory).toBe("#F5F2EA");
    expect(colors["muted-gray"]).toBe("#9A9A93");
    expect(colors.success).toBe("#1E8E5A");
    expect(colors.error).toBe("#C0392B");
    expect(colors.warning).toBe("#B7791F");
  });

  it("exposes durations", () => {
    expect(durations.fast).toBe(150);
    expect(durations.base).toBe(300);
    expect(durations.slow).toBe(500);
    expect(durations.hero).toBe(1200);
  });

  it("exposes z-index scale", () => {
    expect(zIndex.modal).toBe(500);
    expect(zIndex.toast).toBe(600);
    expect(zIndex.base).toBe(0);
  });

  it("exposes container widths", () => {
    expect(containers.xl).toBe(1280);
    expect(containers.md).toBe(720);
  });

  it("exposes breakpoints", () => {
    expect(breakpoints.lg).toBe(1024);
    expect(breakpoints["2xl"]).toBe(1536);
  });
});
