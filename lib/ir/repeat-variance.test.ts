import { describe, expect, it } from "vitest";
import { applyRepeatVariance, varianceFactor } from "./repeat-variance";
import type { SkeletonNode } from "./types";

function n(over: Partial<SkeletonNode>): SkeletonNode {
  return {
    id: over.id ?? "node-1",
    kind: over.kind ?? "text",
    confidence: "medium",
    visible: true,
    ...over,
  };
}

describe("varianceFactor", () => {
  it("returns value in [0.60, 0.95] range", () => {
    for (let i = 0; i < 20; i++) {
      const f = varianceFactor(`id-${i}`, i);
      expect(f).toBeGreaterThanOrEqual(0.6);
      expect(f).toBeLessThanOrEqual(0.95);
    }
  });

  it("different indices produce different factors for the same id", () => {
    const factors = Array.from({ length: 5 }, (_, i) =>
      varianceFactor("cell-a", i),
    );
    const unique = new Set(factors);
    expect(unique.size).toBeGreaterThan(1);
  });

  it("is deterministic across calls", () => {
    expect(varianceFactor("abc", 2)).toBe(varianceFactor("abc", 2));
  });
});

describe("applyRepeatVariance", () => {
  it("returns the same node for index 0", () => {
    const node = n({ kind: "text", width: 100 });
    expect(applyRepeatVariance(node, 0)).toBe(node);
  });

  it("adjusts text width for index > 0", () => {
    const node = n({ kind: "text", width: 100, id: "t1" });
    const varied = applyRepeatVariance(node, 1);
    expect(typeof varied.width).toBe("number");
    expect(varied.width).not.toBe(100);
    expect(varied.width).toBeGreaterThanOrEqual(60);
    expect(varied.width).toBeLessThanOrEqual(95);
  });

  it("adjusts paragraph width and mangles id for last-line variance", () => {
    const node = n({ kind: "paragraph", width: 200, id: "p1", lineCount: 3 });
    const varied = applyRepeatVariance(node, 2);
    expect(typeof varied.width).toBe("number");
    expect(varied.width).not.toBe(200);
    expect(varied.id).toBe("p1_r2");
  });

  it("does not adjust non-text kinds", () => {
    const node = n({ kind: "button", width: 100, id: "b1" });
    const varied = applyRepeatVariance(node, 1);
    expect(varied.width).toBe(100);
  });

  it("does not adjust width:'full'", () => {
    const node = n({ kind: "text", width: "full", id: "t2" });
    const varied = applyRepeatVariance(node, 1);
    expect(varied.width).toBe("full");
  });

  it("recurses into children", () => {
    const row = n({
      kind: "container",
      id: "row",
      children: [
        n({ kind: "text", width: 120, id: "c1" }),
        n({ kind: "text", width: 200, id: "c2" }),
        n({ kind: "button", width: 100, id: "c3" }),
      ],
    });
    const varied = applyRepeatVariance(row, 2);
    expect(varied.children![0].width).not.toBe(120);
    expect(varied.children![1].width).not.toBe(200);
    expect(varied.children![2].width).toBe(100);
  });

  it("does not mutate the original node", () => {
    const node = n({ kind: "text", width: 160, id: "t3" });
    applyRepeatVariance(node, 1);
    expect(node.width).toBe(160);
  });

  it("produces different widths across repeat indices", () => {
    const node = n({ kind: "text", width: 200, id: "cell" });
    const widths = Array.from({ length: 4 }, (_, i) =>
      applyRepeatVariance(node, i).width,
    );
    expect(widths[0]).toBe(200);
    const unique = new Set(widths);
    expect(unique.size).toBeGreaterThan(1);
  });
});
