import { describe, expect, it } from "vitest";
import type { SkeletonNode } from "@/lib/ir/types";
import { detectSiblingRepeat } from "./sibling-repeat";

function leaf(id: string, kind: SkeletonNode["kind"] = "text"): SkeletonNode {
  return { id, kind, confidence: "high", visible: true, width: 100, height: 20 };
}

function container(id: string, children: SkeletonNode[]): SkeletonNode {
  return {
    id,
    kind: "container",
    confidence: "high",
    visible: true,
    layout: { direction: "col" },
    children,
  };
}

function card(id: string, children: SkeletonNode[]): SkeletonNode {
  return {
    id,
    kind: "card",
    confidence: "high",
    visible: true,
    width: 320,
    radius: 12,
    children,
  };
}

describe("detectSiblingRepeat", () => {
  it("collapses 3 identical text siblings into repeat=3", () => {
    const root = container("root", [
      leaf("a", "text"),
      leaf("b", "text"),
      leaf("c", "text"),
    ]);
    detectSiblingRepeat(root);
    expect(root.children).toHaveLength(1);
    expect(root.children![0].repeat).toBe(3);
  });

  it("collapses structurally identical cards with different ids", () => {
    const root = container("root", [
      card("c1", [leaf("t1"), leaf("d1", "paragraph")]),
      card("c2", [leaf("t2"), leaf("d2", "paragraph")]),
      card("c3", [leaf("t3"), leaf("d3", "paragraph")]),
    ]);
    detectSiblingRepeat(root);
    expect(root.children).toHaveLength(1);
    expect(root.children![0].repeat).toBe(3);
    expect(root.children![0].id).toBe("c1");
  });

  it("preserves non-similar siblings between runs", () => {
    const root = container("root", [
      leaf("a", "text"),
      leaf("b", "text"),
      leaf("c", "text"),
      leaf("d", "button"),
      leaf("e", "text"),
      leaf("f", "text"),
      leaf("g", "text"),
    ]);
    detectSiblingRepeat(root);
    expect(root.children).toHaveLength(3);
    expect(root.children![0].repeat).toBe(3);
    expect(root.children![1].kind).toBe("button");
    expect(root.children![1].repeat).toBeUndefined();
    expect(root.children![2].repeat).toBe(3);
  });

  it("does not collapse leaf runs shorter than 3", () => {
    const root = container("root", [
      leaf("a", "text"),
      leaf("b", "text"),
    ]);
    detectSiblingRepeat(root);
    expect(root.children).toHaveLength(2);
    expect(root.children![0].repeat).toBeUndefined();
  });

  it("does not collapse nodes that already have repeat set", () => {
    const a = leaf("a", "text");
    a.repeat = 3;
    const b = leaf("b", "text");
    b.repeat = 3;
    const root = container("root", [a, b]);
    detectSiblingRepeat(root);
    expect(root.children).toHaveLength(2);
    expect(root.children![0].repeat).toBe(3);
    expect(root.children![1].repeat).toBe(3);
  });

  it("ignores single children", () => {
    const root = container("root", [leaf("a")]);
    detectSiblingRepeat(root);
    expect(root.children).toHaveLength(1);
    expect(root.children![0].repeat).toBeUndefined();
  });

  it("does not collapse structurally different siblings", () => {
    const root = container("root", [
      card("c1", [leaf("t1")]),
      card("c2", [leaf("t2"), leaf("d2", "paragraph")]),
    ]);
    detectSiblingRepeat(root);
    expect(root.children).toHaveLength(2);
    expect(root.children![0].repeat).toBeUndefined();
    expect(root.children![1].repeat).toBeUndefined();
  });

  it("works recursively on nested containers", () => {
    const root = container("root", [
      container("inner", [
        leaf("a", "button"),
        leaf("b", "button"),
        leaf("c", "button"),
      ]),
    ]);
    detectSiblingRepeat(root);
    expect(root.children).toHaveLength(1);
    const inner = root.children![0];
    expect(inner.children).toHaveLength(1);
    expect(inner.children![0].repeat).toBe(3);
  });

  it("distinguishes by sourceTag", () => {
    const a = { ...leaf("a"), sourceTag: "Card" };
    const b = { ...leaf("b"), sourceTag: "Badge" };
    const root = container("root", [a, b]);
    detectSiblingRepeat(root);
    expect(root.children).toHaveLength(2);
  });

  it("collapses siblings with same sourceTag", () => {
    const a = { ...leaf("a"), sourceTag: "Badge" };
    const b = { ...leaf("b"), sourceTag: "Badge" };
    const c = { ...leaf("c"), sourceTag: "Badge" };
    const root = container("root", [a, b, c]);
    detectSiblingRepeat(root);
    expect(root.children).toHaveLength(1);
    expect(root.children![0].repeat).toBe(3);
  });

  it("ignores dimension differences when collapsing", () => {
    const root = container("root", [
      { ...leaf("a"), width: 100, height: 20 },
      { ...leaf("b"), width: 150, height: 24 },
      { ...leaf("c"), width: 80, height: 18 },
    ]);
    detectSiblingRepeat(root);
    expect(root.children).toHaveLength(1);
    expect(root.children![0].repeat).toBe(3);
  });
});
