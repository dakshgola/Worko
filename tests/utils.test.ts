import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn Utility Function Tests", () => {
  it("should merge static class names together", () => {
    const result = cn("class-a", "class-b");
    expect(result).toBe("class-a class-b");
  });

  it("should filter out falsy class names dynamically", () => {
    const active = false;
    const result = cn("base-class", active && "active-class", null, undefined);
    expect(result).toBe("base-class");
  });

  it("should override conflicting Tailwind classes correctly using twMerge", () => {
    const result = cn("px-2 py-1", "p-4");
    expect(result).toBe("p-4");
  });

  it("should handle conditional overrides with dynamic states", () => {
    const active = true;
    const result = cn("text-red-500", active ? "text-green-500" : "text-blue-500");
    expect(result).toBe("text-green-500");
  });
});
