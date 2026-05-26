import type { SkeletonNode } from "@/lib/ir/types";

/**
 * Post-classify pass that detects consecutive structurally similar siblings
 * and collapses them into a single representative with `repeat: N`. Catches
 * hand-written repeated rows/cards that weren't produced by `.map()`.
 * Skips nodes that already carry a repeat value (from `.map()` detection).
 */
export function detectSiblingRepeat(node: SkeletonNode): void {
  if (!node.children) return;
  for (const child of node.children) detectSiblingRepeat(child);
  if (node.layout?.gridCols) return;
  node.children = collapseRuns(node.children);
}

/**
 * Scan children for consecutive runs sharing the same structural fingerprint.
 * Leaf-only runs require 3+ siblings (two identical leaves is common for
 * title+subtitle). Container runs collapse at 2+.
 * Skips containers whose layout uses gridCols (table cells need individual slots).
 */
function collapseRuns(children: SkeletonNode[]): SkeletonNode[] {
  if (children.length < 2) return children;

  const prints = children.map(fingerprint);
  const result: SkeletonNode[] = [];
  let i = 0;

  while (i < children.length) {
    let runEnd = i + 1;
    while (runEnd < children.length && prints[runEnd] === prints[i]) {
      runEnd++;
    }

    const runLen = runEnd - i;
    const first = children[i];
    const isLeafRun = !first.children || first.children.length === 0;
    const minRun = isLeafRun ? 3 : 2;

    if (runLen >= minRun && !first.repeat) {
      result.push({ ...first, repeat: runLen });
    } else {
      for (let j = i; j < runEnd; j++) result.push(children[j]);
    }

    i = runEnd;
  }

  return result;
}

/**
 * Structural fingerprint for similarity comparison. Captures shape of a
 * subtree (kind, tag, appearance, repeat, child structure) so hand-written
 * siblings with different text/ids/dimensions still match.
 */
function fingerprint(node: SkeletonNode): string {
  const parts: string[] = [
    node.kind,
    node.sourceTag ?? "",
    node.appearance ?? "",
    String(node.repeat ?? 0),
    String(node.children?.length ?? 0),
  ];

  if (node.children) {
    for (const child of node.children) {
      parts.push(`(${fingerprint(child)})`);
    }
  }

  return parts.join("|");
}
