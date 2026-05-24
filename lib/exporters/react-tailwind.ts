import type { GlobalSettings, SkeletonNode } from "@/lib/ir/types";
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
 * Render a node N times in sequence when `repeat > 1`. Mirrors the runtime
 * renderer behaviour so exported code matches what users saw in the preview.
 * Repeat is stripped on the inner call to avoid infinite recursion.
 */
function renderNodeOrRepeat(
  node: SkeletonNode,
  settings: GlobalSettings,
  indent: number,
): string {
  const repeat = node.repeat ?? 1;
  if (repeat <= 1) return renderNode(node, settings, indent);
  const single = renderNode(
    { ...node, repeat: undefined },
    settings,
    indent,
  );
  return Array.from({ length: repeat }, () => single).join("\n");
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
