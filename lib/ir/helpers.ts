import type { SkeletonNode } from "./types";

let counter = 0;

/**
 * Mint a unique id for a new SkeletonNode.
 * Counter survives within a session; random suffix guards against HMR reloads
 * that reset the counter, so collisions stay impossible in practice.
 */
export function generateId(): string {
  counter += 1;
  return `n_${counter}_${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Find a node by id in the IR tree via depth-first recursion.
 * Returns `null` (not `undefined`) when no match exists, so callers must
 * handle the miss case explicitly.
 */
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

/**
 * Return a new tree with `patch` applied to the node matching `id`.
 * Path-copy semantics: only the ancestor chain is cloned; untouched siblings
 * keep their references. Missing id returns the tree unchanged (no-op).
 */
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
