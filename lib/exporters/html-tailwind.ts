import type { GlobalSettings, SkeletonNode } from "@/lib/ir/types";
import { SHIMMER_KEYFRAMES, blockClasses } from "./format-classes";

/**
 * Converts a skeleton IR tree + settings into a complete HTML + Tailwind string.
 * When animation is shimmer, a <style> block carrying the keyframes is prepended
 * so the output works standalone without external CSS imports.
 */
export function exportHTML(tree: SkeletonNode, settings: GlobalSettings): string {
  const styleBlock =
    settings.animation === "shimmer"
      ? `<style>\n${SHIMMER_KEYFRAMES}\n</style>\n`
      : "";
  return `${styleBlock}${renderNode(tree, settings, 0)}\n`;
}

/**
 * Recursively emits HTML for a skeleton node. Hidden nodes are skipped entirely.
 * Mirrors the React exporter but uses `class=` instead of `className=` and
 * self-closing tags. Paragraph nodes expand into stacked text lines.
 */
function renderNode(node: SkeletonNode, settings: GlobalSettings, indent: number): string {
  if (!node.visible) return "";
  const pad = " ".repeat(indent);

  if (node.kind === "paragraph") {
    const lines = node.lineCount ?? 1;
    const lineCls = blockClasses({ ...node, kind: "text" }, settings);
    const linesHtml = Array.from({ length: lines }, () =>
      `${pad}  <div class="${lineCls}"></div>`,
    ).join("\n");
    return `${pad}<div class="flex flex-col gap-2">\n${linesHtml}\n${pad}</div>`;
  }

  const cls = blockClasses(node, settings);
  const childTags = (node.children ?? [])
    .map((c) => renderNode(c, settings, indent + 2))
    .filter(Boolean);

  if (childTags.length === 0) {
    return `${pad}<div class="${cls}"></div>`;
  }
  return `${pad}<div class="${cls}">\n${childTags.join("\n")}\n${pad}</div>`;
}
