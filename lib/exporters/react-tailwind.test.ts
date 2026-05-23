import { describe, expect, it } from "vitest";
import type { GlobalSettings, SkeletonNode } from "@/lib/ir/types";
import { exportReact } from "./react-tailwind";

const settings: GlobalSettings = {
  animation: "pulse",
  speed: "normal",
  baseColor: "bg-zinc-200",
  theme: "light",
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
    expect(out).toContain("gap-[12px]");
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
    expect(out.match(/h-\[12px\]/g)?.length).toBe(3);
  });

  it("prepends shimmer keyframes when animation is shimmer", () => {
    const out = exportReact(leaf, { ...settings, animation: "shimmer" });
    expect(out).toContain("@keyframes shimmer");
    expect(out).toContain("animate-[shimmer_");
  });
});
