import type { SkeletonNode } from "./types";

let counter = 0;

export function generateId(): string {
  counter += 1;
  return `n_${counter}_${Math.random().toString(36).slice(2, 7)}`;
}

export function findNode(
  root: SkeletonNode,
  id: string,
): SkeletonNode | null {
  if (root.id === id) return root;
  for (const child of root.children ?? []) {
    const hit = findNode(child, id);
    if (hit) return hit;
  }
  return null;
}

export function mutateNode(
  root: SkeletonNode,
  id: string,
  patch: Partial<SkeletonNode>,
): SkeletonNode {
  if (root.id === id) return { ...root, ...patch };
  if (!root.children) return root;
  const nextChildren = root.children.map((c) => mutateNode(c, id, patch));
  return { ...root, children: nextChildren };
}
