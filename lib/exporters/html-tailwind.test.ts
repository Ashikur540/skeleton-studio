import { describe, expect, it } from "vitest";
import type { GlobalSettings, SkeletonNode } from "@/lib/ir/types";
import { exportHTML } from "./html-tailwind";

const settings: GlobalSettings = {
  animation: "pulse",
  speed: "normal",
  baseColor: "bg-zinc-200",
};

const leaf: SkeletonNode = {
  id: "a",
  kind: "text",
  confidence: "high",
  visible: true,
  width: 100,
  height: 20,
};

describe("exportHTML", () => {
  it("emits a div with class= (not className=)", () => {
    const out = exportHTML(leaf, settings);
    expect(out).toContain('class="');
    expect(out).not.toContain("className=");
  });

  it("nests children", () => {
    const tree: SkeletonNode = {
      id: "root",
      kind: "container",
      confidence: "high",
      visible: true,
      layout: { direction: "row", gap: 8 },
      children: [leaf, { ...leaf, id: "b" }],
    };
    const out = exportHTML(tree, settings);
    expect(out).toContain("flex-row");
    expect(out).toContain("gap-[8px]");
    expect(out.match(/w-\[100px\]/g)?.length).toBe(2);
  });

  it("omits hidden blocks", () => {
    const tree: SkeletonNode = {
      id: "root",
      kind: "container",
      confidence: "high",
      visible: true,
      layout: { direction: "col" },
      children: [leaf, { ...leaf, id: "h", visible: false }],
    };
    const out = exportHTML(tree, settings);
    expect(out.match(/w-\[100px\]/g)?.length).toBe(1);
  });

  it("expands paragraph lines", () => {
    const para: SkeletonNode = {
      id: "p", kind: "paragraph", confidence: "high", visible: true,
      width: "full", height: 12, lineCount: 4,
    };
    const out = exportHTML(para, settings);
    expect(out.match(/h-\[12px\]/g)?.length).toBe(4);
  });

  it("prepends a <style> block when animation is shimmer", () => {
    const out = exportHTML(leaf, { ...settings, animation: "shimmer" });
    expect(out).toContain("<style>");
    expect(out).toContain("@keyframes shimmer");
  });

  it("repeats a node N times when repeat > 1", () => {
    const tree: SkeletonNode = {
      id: "row",
      kind: "container",
      confidence: "medium",
      visible: true,
      layout: { direction: "row" },
      repeat: 4,
      children: [leaf],
    };
    const out = exportHTML(tree, settings);
    expect(out.match(/flex-row/g)?.length).toBe(4);
  });

  it("emits surface chrome for container with appearance=card", () => {
    const tree: SkeletonNode = {
      id: "card",
      kind: "container",
      confidence: "high",
      visible: true,
      appearance: "card",
      radius: 12,
      children: [leaf],
    };
    const out = exportHTML(tree, settings);
    expect(out).toContain("ring-1");
    expect(out).toContain("rounded-[12px]");
  });
});
