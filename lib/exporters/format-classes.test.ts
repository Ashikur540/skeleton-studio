import { describe, expect, it } from "vitest";
import type { GlobalSettings, SkeletonNode } from "@/lib/ir/types";
import { blockClasses, SHIMMER_KEYFRAMES } from "./format-classes";

const settings: GlobalSettings = {
  animation: "pulse",
  speed: "normal",
  baseColor: "bg-zinc-200",
  theme: "light",
};

function node(partial: Partial<SkeletonNode> = {}): SkeletonNode {
  return {
    id: "x",
    kind: "text",
    confidence: "high",
    visible: true,
    ...partial,
  };
}

describe("blockClasses", () => {
  it("emits base color + animate-pulse for pulse skeleton", () => {
    const cls = blockClasses(node({ width: 100, height: 20 }), settings);
    expect(cls).toContain("bg-zinc-200");
    expect(cls).toContain("animate-pulse");
    expect(cls).toContain("w-[100px]");
    expect(cls).toContain("h-[20px]");
  });

  it("uses w-full when width === 'full'", () => {
    const cls = blockClasses(node({ width: "full", height: 20 }), settings);
    expect(cls).toContain("w-full");
    expect(cls).not.toContain("w-[");
  });

  it("emits rounded-full when radius >= 9999", () => {
    const cls = blockClasses(node({ width: 40, height: 40, radius: 9999 }), settings);
    expect(cls).toContain("rounded-full");
  });

  it("emits arbitrary radius otherwise", () => {
    const cls = blockClasses(node({ width: 40, height: 40, radius: 12 }), settings);
    expect(cls).toContain("rounded-[12px]");
  });

  it("emits shimmer classes when animation is shimmer", () => {
    const cls = blockClasses(
      node({ width: 100, height: 20 }),
      { ...settings, animation: "shimmer" },
    );
    expect(cls).toContain("animate-[shimmer_1.5s_linear_infinite]");
    expect(cls).toContain("bg-gradient-to-r");
  });

  it("emits container flex classes (and no animation/color)", () => {
    const cls = blockClasses(
      node({ kind: "container", layout: { direction: "row", gap: 12 } }),
      settings,
    );
    expect(cls).toContain("flex");
    expect(cls).toContain("flex-row");
    expect(cls).toContain("gap-[12px]");
    expect(cls).not.toContain("animate-pulse");
    expect(cls).not.toContain("bg-zinc-200");
  });

  it("respects speed setting via animation-duration arbitrary class", () => {
    const slow = blockClasses(node({ width: 10, height: 10 }), { ...settings, speed: "slow" });
    const fast = blockClasses(node({ width: 10, height: 10 }), { ...settings, speed: "fast" });
    expect(slow).toContain("[animation-duration:2s]");
    expect(fast).toContain("[animation-duration:1s]");
  });

  it("exposes shimmer keyframes for exporters to inline", () => {
    expect(SHIMMER_KEYFRAMES).toContain("@keyframes shimmer");
  });
});
