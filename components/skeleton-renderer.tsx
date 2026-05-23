"use client";
import type { GlobalSettings, SkeletonNode } from "@/lib/ir/types";
import { blockStyles } from "@/lib/exporters/runtime-styles";

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
 * Internal recursive renderer for one SkeletonNode. Static styling comes from
 * Tailwind classes; dynamic dimensions arrive via inline styles so Tailwind's
 * static-scan limitation never strands a runtime-built `w-[Xpx]` without CSS.
 * Hidden nodes drop out; paragraphs expand into N stacked text lines; fallback
 * leaves get a subtle amber outline so users can spot guessed dimensions.
 */
function Node({ node, settings, selectedId, onSelect }: Props) {
  if (!node.visible) return null;
  const { className, style } = blockStyles(node, settings);
  const isSelected = selectedId === node.id;
  const ring = isSelected ? " ring-2 ring-primary" : "";
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
    const line = blockStyles({ ...node, kind: "text" }, settings);
    return (
      <div className={`flex flex-col gap-2${ring}`} onClick={handleClick}>
        {Array.from({ length: lines }, (_, i) => (
          <div
            key={i}
            className={line.className + lowConfidence}
            style={line.style}
          />
        ))}
      </div>
    );
  }

  if (!node.children || node.children.length === 0) {
    return (
      <div
        className={className + ring + lowConfidence}
        style={style}
        onClick={handleClick}
      />
    );
  }
  return (
    <div className={className + ring} style={style} onClick={handleClick}>
      {node.children.map((c) => (
        <Node
          key={c.id}
          node={c}
          settings={settings}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
