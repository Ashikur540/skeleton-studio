"use client";
import type { GlobalSettings, SkeletonNode } from "@/lib/ir/types";
import { blockClasses } from "@/lib/exporters/format-classes";

/**
 * The data a parent component must supply to drive the renderer: the IR node
 * to render, the current global settings, the currently-selected node id (or
 * null), and a callback invoked when the user clicks a block.
 */
type Props = {
  node: SkeletonNode;
  settings: GlobalSettings;
  selectedId: string | null;
  onSelect: (id: string) => void;
};

/**
 * Public entry point that renders the root IR node. Acts as a thin adapter
 * between the parent's prop API and the recursive Node helper so callers
 * never need to import or know about the internal Node component.
 */
export function SkeletonRenderer({ node, settings, selectedId, onSelect }: Props) {
  return <Node node={node} settings={settings} selectedId={selectedId} onSelect={onSelect} />;
}

/**
 * Internal recursive renderer for a single SkeletonNode. Hidden nodes are
 * skipped; paragraph nodes expand into N stacked text lines to match the
 * exporter output; low-confidence leaf nodes receive a subtle amber outline
 * so users can spot blocks whose dimensions were guessed by the parser.
 */
function Node({ node, settings, selectedId, onSelect }: Props) {
  if (!node.visible) return null;
  const cls = blockClasses(node, settings);
  const isSelected = selectedId === node.id;
  const ring = isSelected ? " ring-2 ring-blue-500" : "";
  const lowConfidence =
    node.confidence === "fallback" && node.kind !== "container"
      ? " outline outline-1 outline-amber-400/50"
      : "";

  const handleClick: React.MouseEventHandler = (e) => {
    e.stopPropagation();
    onSelect(node.id);
  };

  if (node.kind === "paragraph") {
    const lines = node.lineCount ?? 1;
    return (
      <div className={`flex flex-col gap-2${ring}`} onClick={handleClick}>
        {Array.from({ length: lines }, (_, i) => (
          <div key={i} className={blockClasses({ ...node, kind: "text" }, settings) + lowConfidence} />
        ))}
      </div>
    );
  }

  if (!node.children || node.children.length === 0) {
    return <div className={cls + ring + lowConfidence} onClick={handleClick} />;
  }
  return (
    <div className={cls + ring} onClick={handleClick}>
      {node.children.map((c) => (
        <Node key={c.id} node={c} settings={settings} selectedId={selectedId} onSelect={onSelect} />
      ))}
    </div>
  );
}
