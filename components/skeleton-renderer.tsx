"use client";
import type { GlobalSettings, SkeletonNode } from "@/lib/ir/types";
import { blockStyles } from "@/lib/exporters/runtime-styles";
import { applyRepeatVariance } from "@/lib/ir/repeat-variance";
import { type KeyboardEvent, useCallback } from "react";

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
 * Render a node N times when `node.repeat > 1` (e.g. a `.map()` row). Each
 * copy gets deterministic width variance via `applyRepeatVariance` so repeated
 * rows look naturally ragged instead of identical clones. Copy 0 (the
 * prototype) renders unmodified; copies 1+ get staggered text widths and
 * unique paragraph ids for last-line variance.
 */
function Node(props: Props) {
  const repeat = props.node.repeat ?? 1;
  if (repeat <= 1) return <SingleNode {...props} />;
  const singleNode = { ...props.node, repeat: undefined };
  return (
    <>
      {Array.from({ length: repeat }, (_, i) => (
        <SingleNode
          key={i}
          {...props}
          node={applyRepeatVariance(singleNode, i)}
        />
      ))}
    </>
  );
}

/**
 * Deterministic last-line shortening factor for paragraph skeletons. Maps a
 * node id to a stable value in [0.55, 0.85] so each paragraph's tail bar
 * looks naturally ragged without flickering between renders.
 */
function lastLineFactor(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) {
    h = (h * 31 + id.charCodeAt(i)) | 0;
  }
  const slot = Math.abs(h) % 30;
  return 0.55 + slot / 100;
}

/**
 * Internal recursive renderer for one SkeletonNode. Static styling comes from
 * Tailwind classes; dynamic dimensions arrive via inline styles so Tailwind's
 * static-scan limitation never strands a runtime-built `w-[Xpx]` without CSS.
 * Hidden nodes drop out; paragraphs expand into N stacked text lines; fallback
 * leaves get a subtle amber outline so users can spot guessed dimensions.
 */
function SingleNode({ node, settings, selectedId, onSelect }: Props) {
  if (!node.visible) return null;
  const { className, style } = blockStyles(node, settings);
  // Repeat-variance mangles paragraph IDs (e.g. "n_5_abc_r2") for visual
  // diversity. Strip the suffix so selection always targets the original
  // tree node, which is the only one findNode can locate.
  const selectId = node.id.replace(/_r\d+$/, "");
  const lowConfidence =
    node.confidence === "fallback" && node.kind !== "container"
      ? " outline outline-1 outline-amber-400/50"
      : "";

  const handleClick: React.MouseEventHandler = (e) => {
    e.stopPropagation();
    onSelect(selectId);
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      e.stopPropagation();
      onSelect(selectId);
    }
  }, [selectId, onSelect]);

  /*
   * Shared set of keyboard/focus attributes applied to every interactive
   * skeleton block so keyboard users can Tab through nodes and press Enter
   * or Space to select them. Focus styling mirrors the selection ring.
   */
  const interactivity = {
    tabIndex: 0 as const,
    role: "button" as const,
    "aria-label": node.kind,
    "aria-pressed": selectedId === selectId,
    onKeyDown: handleKeyDown,
  };

  if (node.kind === "paragraph") {
    const lines = node.lineCount ?? 1;
    const base = blockStyles({ ...node, kind: "text", padding: undefined }, settings);
    const baseWidth =
      typeof node.width === "number" ? node.width : undefined;
    const wrapperStyle: React.CSSProperties = {};
    if (node.padding?.top !== undefined) wrapperStyle.paddingTop = node.padding.top;
    if (node.padding?.right !== undefined) wrapperStyle.paddingRight = node.padding.right;
    if (node.padding?.bottom !== undefined) wrapperStyle.paddingBottom = node.padding.bottom;
    if (node.padding?.left !== undefined) wrapperStyle.paddingLeft = node.padding.left;
    return (
      <div
        data-skeleton-id={selectId}
        className={`flex flex-col gap-2 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring rounded-sm`}
        style={wrapperStyle}
        onClick={handleClick}
        {...interactivity}
      >
        {Array.from({ length: lines }, (_, i) => {
          const isShortenedLast = i === lines - 1 && lines > 1;
          const lineStyle =
            isShortenedLast && baseWidth !== undefined
              ? {
                  ...base.style,
                  width: Math.round(baseWidth * lastLineFactor(node.id)),
                }
              : base.style;
          return (
            <div
              key={i}
              className={base.className + lowConfidence}
              style={lineStyle}
            />
          );
        })}
      </div>
    );
  }

  if (!node.children || node.children.length === 0) {
    return (
      <div
        data-skeleton-id={selectId}
        className={className + lowConfidence + " cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring rounded-sm"}
        style={style}
        onClick={handleClick}
        {...interactivity}
      />
    );
  }
  return (
    <div
      data-skeleton-id={selectId}
      className={className + " cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring rounded-sm"}
      style={style}
      onClick={handleClick}
      {...interactivity}
    >
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
