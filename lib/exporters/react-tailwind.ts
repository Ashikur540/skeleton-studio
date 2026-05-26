import type { GlobalSettings, SkeletonNode } from "@/lib/ir/types";
import { SHIMMER_KEYFRAMES, blockClasses, paddingClasses } from "./format-classes";

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
 * Emit `.map()` expression for repeated nodes, or a single node when
 * repeat <= 1. Produces `{Array.from({ length: N }, (_, i) => (...))}`.
 */
function renderNodeOrRepeat(
  node: SkeletonNode,
  settings: GlobalSettings,
  indent: number,
): string {
  const repeat = node.repeat ?? 1;
  if (repeat <= 1) return renderNode(node, settings, indent);

  const pad = " ".repeat(indent);
  const base = { ...node, repeat: undefined };
  const inner = renderNode(base, settings, indent + 2, "i");

  return [
    `${pad}{Array.from({ length: ${repeat} }, (_, i) => (`,
    inner,
    `${pad}))}`,
  ].join("\n");
}

/**
 * Recursively emit JSX for one skeleton node. Hidden nodes drop out. Paragraph
 * nodes expand into stacked text lines; other nodes emit as div containers
 * with Tailwind classes from blockClasses. Optional keyExpr adds key={expr}.
 */
function renderNode(
  node: SkeletonNode,
  settings: GlobalSettings,
  indent: number,
  keyExpr?: string,
): string {
  if (!node.visible) return "";
  const pad = " ".repeat(indent);
  const keyAttr = keyExpr ? ` key={${keyExpr}}` : "";

  if (node.kind === "paragraph") {
    const lines = node.lineCount ?? 1;
    const lineCls = blockClasses({ ...node, kind: "text", padding: undefined }, settings);
    const wrapCls = ["flex flex-col gap-2", ...paddingClasses(node.padding)].join(" ");
    const linesJsx = Array.from(
      { length: lines },
      () => `${pad}  <div className="${lineCls}" />`,
    ).join("\n");
    return `${pad}<div${keyAttr} className="${wrapCls}">\n${linesJsx}\n${pad}</div>`;
  }

  const cls = blockClasses(node, settings);
  const childTags = (node.children ?? [])
    .map((c) => renderNodeOrRepeat(c, settings, indent + 2))
    .filter(Boolean);

  if (childTags.length === 0) {
    return `${pad}<div${keyAttr} className="${cls}" />`;
  }
  return `${pad}<div${keyAttr} className="${cls}">\n${childTags.join("\n")}\n${pad}</div>`;
}
