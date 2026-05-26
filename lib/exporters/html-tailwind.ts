import type { GlobalSettings, SkeletonNode } from "@/lib/ir/types";
import { applyRepeatVariance } from "@/lib/ir/repeat-variance";
import { SHIMMER_KEYFRAMES, blockClasses, paddingClasses } from "./format-classes";

/**
 * Convert a skeleton IR tree + settings into a complete HTML + Tailwind string.
 * When animation is shimmer, a <style> block carrying the keyframes is prepended
 * so the output works standalone without external CSS imports.
 */
export function exportHTML(
  tree: SkeletonNode,
  settings: GlobalSettings,
): string {
  const styleBlock =
    settings.animation === "shimmer"
      ? `<style>\n${SHIMMER_KEYFRAMES}\n</style>\n`
      : "";
  return `${styleBlock}${renderNodeOrRepeat(tree, settings, 0)}\n`;
}

/**
 * Render a node N times when `repeat > 1` with per-copy width variance
 * matching the React exporter and live preview.
 */
function renderNodeOrRepeat(
  node: SkeletonNode,
  settings: GlobalSettings,
  indent: number,
): string {
  const repeat = node.repeat ?? 1;
  if (repeat <= 1) return renderNode(node, settings, indent);
  const base = { ...node, repeat: undefined };
  return Array.from({ length: repeat }, (_, i) =>
    renderNode(applyRepeatVariance(base, i), settings, indent),
  ).join("\n");
}

/**
 * Recursively emit HTML for one skeleton node. Mirrors the React exporter but
 * uses `class=` instead of `className=` and self-closing-tag conventions for
 * leaf divs. Paragraph nodes expand into stacked text lines.
 */
function renderNode(
  node: SkeletonNode,
  settings: GlobalSettings,
  indent: number,
): string {
  if (!node.visible) return "";
  const pad = " ".repeat(indent);

  if (node.kind === "paragraph") {
    const lines = node.lineCount ?? 1;
    const lineCls = blockClasses({ ...node, kind: "text", padding: undefined }, settings);
    const wrapCls = ["flex flex-col gap-2", ...paddingClasses(node.padding)].join(" ");
    const linesHtml = Array.from(
      { length: lines },
      () => `${pad}  <div class="${lineCls}"></div>`,
    ).join("\n");
    return `${pad}<div class="${wrapCls}">\n${linesHtml}\n${pad}</div>`;
  }

  const cls = blockClasses(node, settings);
  const childTags = (node.children ?? [])
    .map((c) => renderNodeOrRepeat(c, settings, indent + 2))
    .filter(Boolean);

  if (childTags.length === 0) {
    return `${pad}<div class="${cls}"></div>`;
  }
  return `${pad}<div class="${cls}">\n${childTags.join("\n")}\n${pad}</div>`;
}
