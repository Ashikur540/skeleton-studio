import type { GlobalSettings, SkeletonNode } from "@/lib/ir/types";
import { applyRepeatVariance } from "@/lib/ir/repeat-variance";
import { SHIMMER_KEYFRAMES, blockClasses } from "./format-classes";

/**
 * Convert a skeleton IR tree + settings into a complete React function component
 * string. When animation is shimmer, CSS keyframes are prepended as a comment
 * block for the user to paste into their global CSS.
 */
export function exportReact(
  tree: SkeletonNode,
  settings: GlobalSettings,
): string {
  const header =
    settings.animation === "shimmer"
      ? `// Shimmer animation requires these keyframes in your global CSS:\n/*\n${SHIMMER_KEYFRAMES}\n*/\n`
      : "";
  return `${header}export function Skeleton() {\n  return (\n${renderNodeOrRepeat(tree, settings, 4)}\n  );\n}\n`;
}

/**
 * Render a node N times when `repeat > 1` with per-copy width variance so
 * exported skeletons mirror the preview's natural raggedness. Copy 0 is the
 * prototype; copies 1+ get staggered text widths.
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
 * Recursively emit JSX for one skeleton node. Hidden nodes drop out. Paragraph
 * nodes expand into stacked text lines; other nodes emit as div containers
 * with Tailwind classes from blockClasses.
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
    const lineCls = blockClasses({ ...node, kind: "text" }, settings);
    const linesJsx = Array.from(
      { length: lines },
      () => `${pad}  <div className="${lineCls}" />`,
    ).join("\n");
    return `${pad}<div className="flex flex-col gap-2">\n${linesJsx}\n${pad}</div>`;
  }

  const cls = blockClasses(node, settings);
  const childTags = (node.children ?? [])
    .map((c) => renderNodeOrRepeat(c, settings, indent + 2))
    .filter(Boolean);

  if (childTags.length === 0) {
    return `${pad}<div className="${cls}" />`;
  }
  return `${pad}<div className="${cls}">\n${childTags.join("\n")}\n${pad}</div>`;
}
