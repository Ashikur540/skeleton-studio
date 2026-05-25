import type { SkeletonNode } from "@/lib/ir/types";

/**
 * Deterministic hash → factor in [0.60, 0.95]. Combines the node's identity
 * with a repeat index so each copy of a repeated row / card / list-item gets
 * slightly different text widths while remaining stable across re-renders.
 */
export function varianceFactor(id: string, index: number): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) | 0;
  }
  h = (h * 37 + index * 13) | 0;
  const slot = Math.abs(h) % 35;
  return 0.6 + slot / 100;
}

/**
 * Return a shallow clone of a node subtree with text/paragraph widths
 * adjusted by a deterministic variance factor for the given repeat index.
 * Index 0 returns the node unmodified (the "prototype" copy). Paragraphs
 * also get a mangled id so the renderer's `lastLineFactor` hash produces a
 * different tail-bar width per repeat instance.
 */
export function applyRepeatVariance(
  node: SkeletonNode,
  index: number,
): SkeletonNode {
  if (index === 0) return node;

  const clone = { ...node };

  if (
    (clone.kind === "text" || clone.kind === "paragraph") &&
    typeof clone.width === "number"
  ) {
    clone.width = Math.round(clone.width * varianceFactor(clone.id, index));
  }

  if (clone.kind === "paragraph") {
    clone.id = `${clone.id}_r${index}`;
  }

  if (clone.children) {
    clone.children = clone.children.map((c) => applyRepeatVariance(c, index));
  }

  return clone;
}
