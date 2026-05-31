import { describe, expect, it } from "vitest";
import type { GlobalSettings, SkeletonNode } from "@/lib/ir/types";
import { blockClasses, SHIMMER_KEYFRAMES } from "./format-classes";

const settings: GlobalSettings = {
  animation: "pulse",
  speed: "normal",
  baseColor: "bg-zinc-200",
  cardBackground: "transparent",
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
    expect(cls).toContain("h-5");
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
    expect(cls).toContain("rounded-xl");
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
    expect(cls).toContain("gap-3");
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

  it("appends cardBackground class on surface wrappers when not transparent", () => {
    const tinted: GlobalSettings = { ...settings, cardBackground: "soft" };
    const cls = blockClasses(
      node({
        kind: "card",
        children: [node({ id: "a" })],
      }),
      tinted,
    );
    expect(cls).toContain("bg-muted/40");
  });

  it("omits cardBackground class when set to transparent", () => {
    const cls = blockClasses(
      node({
        kind: "card",
        children: [node({ id: "a" })],
      }),
      settings,
    );
    expect(cls).not.toContain("bg-muted");
    expect(cls).not.toContain("bg-card");
  });

  it("does not apply cardBackground to plain containers or fill blocks", () => {
    const tinted: GlobalSettings = { ...settings, cardBackground: "elevated" };
    const container = blockClasses(
      node({
        kind: "container",
        children: [node({ id: "a" })],
      }),
      tinted,
    );
    expect(container).not.toContain("bg-card");
    const fill = blockClasses(node({ width: 100, height: 20 }), tinted);
    expect(fill).not.toContain("bg-card");
  });

  it("emits per-side padding classes on fill nodes", () => {
    const cls = blockClasses(
      node({
        width: 100,
        height: 20,
        padding: { top: 12, left: 24, right: 24 },
      }),
      settings,
    );
    expect(cls).toContain("pt-3");
    expect(cls).toContain("pl-6");
    expect(cls).toContain("pr-6");
    expect(cls).not.toContain("pb-");
  });

  it("emits per-side padding on container nodes", () => {
    const cls = blockClasses(
      node({
        kind: "container",
        layout: { direction: "col" },
        padding: { bottom: 16 },
      }),
      settings,
    );
    expect(cls).toContain("pb-4");
  });

  it("emits alignment + wrap classes from container layout", () => {
    const cls = blockClasses(
      node({
        kind: "container",
        layout: {
          direction: "row",
          gap: 8,
          alignItems: "center",
          justifyContent: "between",
          wrap: true,
        },
      }),
      settings,
    );
    expect(cls).toContain("items-center");
    expect(cls).toContain("justify-between");
    expect(cls).toContain("flex-wrap");
  });

  it("card-with-children renders surface chrome (ring + padding + flex-col)", () => {
    const cls = blockClasses(
      node({
        kind: "card",
        width: 320,
        radius: 16,
        children: [node({ id: "x" })],
      }),
      settings,
    );
    expect(cls).toContain("ring-1");
    expect(cls).toContain("flex-col");
    expect(cls).toContain("pt-4");
    expect(cls).toContain("rounded-2xl");
    expect(cls).not.toContain("animate-pulse");
  });

  it("container with appearance=card renders surface chrome", () => {
    const cls = blockClasses(
      node({
        kind: "container",
        appearance: "card",
        radius: 12,
        children: [node({ id: "x" })],
      }),
      settings,
    );
    expect(cls).toContain("ring-1");
    expect(cls).toContain("rounded-xl");
  });

  it("surface wrapper honors explicit per-side padding over default", () => {
    const cls = blockClasses(
      node({
        kind: "card",
        children: [node({ id: "x" })],
        padding: { bottom: 0 },
      }),
      settings,
    );
    expect(cls).toContain("pb-0");
    expect(cls).toContain("pt-4");
  });
});
