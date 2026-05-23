import { describe, expect, it } from "vitest";
import { findNode, generateId, mutateNode } from "./helpers";
import type { SkeletonNode } from "./types";

const tree: SkeletonNode = {
  id: "root",
  kind: "container",
  confidence: "high",
  visible: true,
  children: [
    {
      id: "a",
      kind: "text",
      confidence: "high",
      visible: true,
    },
    {
      id: "b",
      kind: "container",
      confidence: "high",
      visible: true,
      children: [
        { id: "b1", kind: "image", confidence: "high", visible: true },
      ],
    },
  ],
};

describe("generateId", () => {
  it("returns unique ids on repeated calls", () => {
    const a = generateId();
    const b = generateId();
    expect(a).not.toEqual(b);
  });
});

describe("findNode", () => {
  it("returns the root when its id matches", () => {
    expect(findNode(tree, "root")).toBe(tree);
  });
  it("walks into children", () => {
    expect(findNode(tree, "b1")?.kind).toBe("image");
  });
  it("returns null when no id matches", () => {
    expect(findNode(tree, "missing")).toBeNull();
  });
});

describe("mutateNode", () => {
  it("patches a leaf without mutating the original tree", () => {
    const next = mutateNode(tree, "a", { width: 100 });
    expect(next.children?.[0].width).toBe(100);
    expect(tree.children?.[0].width).toBeUndefined();
  });
  it("patches a nested node", () => {
    const next = mutateNode(tree, "b1", { visible: false });
    expect(next.children?.[1].children?.[0].visible).toBe(false);
  });
  it("returns the tree unchanged when id is missing", () => {
    const next = mutateNode(tree, "nope", { width: 1 });
    expect(next).toEqual(tree);
  });
});
