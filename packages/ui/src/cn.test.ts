import { describe, expect, it } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
  it("joins class names", () => {
    expect(cn("px-2", "py-1", "text-sm")).toBe("px-2 py-1 text-sm");
  });

  it("merges conflicting tailwind classes keeping the last", () => {
    expect(cn("px-2 px-4")).toBe("px-4");
  });

  it("drops falsy values", () => {
    expect(cn("px-2", undefined, null, false, "text-sm")).toBe("px-2 text-sm");
  });
});
