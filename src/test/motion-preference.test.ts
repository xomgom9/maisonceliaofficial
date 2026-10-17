import { describe, expect, it } from "vitest";
import { resolveMotionMode } from "@/lib/motion-preference";
describe("Visitor motion preference", () => {
  it("follows reduced motion on the device", () => {
    expect(resolveMotionMode("device", true)).toBe("light");
    expect(resolveMotionMode("device", false)).toBe("full");
  });
  it("allows the visitor to lighten effects", () => {
    expect(resolveMotionMode("light", false)).toBe("light");
  });
  it("turns effects off regardless of device setting", () => {
    expect(resolveMotionMode("off", true)).toBe("off");
    expect(resolveMotionMode("off", false)).toBe("off");
  });
});
