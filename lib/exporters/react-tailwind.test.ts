import { describe, expect, it } from "vitest";
import type { GlobalSettings, SkeletonNode } from "@/lib/ir/types";
import { exportReact } from "./react-tailwind";

const settings: GlobalSettings = {
  animation: "pulse",
  speed: "normal",
  baseColor: "bg-zinc-200",
  cardBackground: "transparent",
};

const leaf: SkeletonNode = {
  id: "a",
  kind: "text",
  confidence: "high",
  visible: true,
  width: 100,
  height: 20,
};

describe("exportReact", () => {
  it("wraps a single leaf in a function component", () => {
    const out = exportReact(leaf, settings);
    expect(out).toContain("export function Skeleton()");
    expect(out).toContain("return (");
    expect(out).toContain("<div");
    expect(out).toContain("w-[100px]");
    expect(out).toContain("animate-pulse");
  });

  it("renders nested containers and children", () => {
    const tree: SkeletonNode = {
      id: "root",
      kind: "container",
      confidence: "high",
      visible: true,
      layout: { direction: "col", gap: 12 },
      children: [leaf, { ...leaf, id: "b" }],
    };
    const out = exportReact(tree, settings);
    expect(out).toContain("flex-col");
    expect(out).toContain("gap-3");
    // two leaves
    expect(out.match(/w-\[100px\]/g)?.length).toBe(2);
  });

  it("omits hidden blocks", () => {
    const tree: SkeletonNode = {
      id: "root",
      kind: "container",
      confidence: "high",
      visible: true,
      layout: { direction: "col" },
      children: [
        leaf,
        { ...leaf, id: "hidden", visible: false },
      ],
    };
    const out = exportReact(tree, settings);
    expect(out.match(/w-\[100px\]/g)?.length).toBe(1);
  });

  it("expands paragraph into N lines based on lineCount", () => {
    const para: SkeletonNode = {
      id: "p",
      kind: "paragraph",
      confidence: "high",
      visible: true,
      width: "full",
      height: 12,
      lineCount: 3,
    };
    const out = exportReact(para, settings);
    expect(out.match(/h-3(?=[ "])/g)?.length).toBe(3);
  });

  it("prepends shimmer keyframes when animation is shimmer", () => {
    const out = exportReact(leaf, { ...settings, animation: "shimmer" });
    expect(out).toContain("@keyframes shimmer");
    expect(out).toContain("animate-[shimmer_");
  });

  it("emits .map() expression for repeat > 1", () => {
    const tree: SkeletonNode = {
      id: "row",
      kind: "container",
      confidence: "medium",
      visible: true,
      layout: { direction: "row" },
      repeat: 5,
      children: [leaf],
    };
    const out = exportReact(tree, settings);
    expect(out).toContain("Array.from({ length: 5 }");
    expect(out).toContain("key={i}");
    // Template rendered once, not 5 inline copies
    expect(out.match(/flex-row/g)?.length).toBe(1);
    expect(out.match(/w-\[100px\]/g)?.length).toBe(1);
  });

  it("emits ring-1 and rounded chrome for a card-with-children", () => {
    const tree: SkeletonNode = {
      id: "card",
      kind: "card",
      confidence: "high",
      visible: true,
      width: 320,
      radius: 16,
      children: [leaf],
    };
    const out = exportReact(tree, settings);
    expect(out).toContain("ring-1");
    expect(out).toContain("rounded-2xl");
  });
});
