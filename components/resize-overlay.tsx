"use client";
import { findNode } from "@/lib/ir/helpers";
import { useElementRect } from "@/hooks/use-element-rect";
import { useSkeletonStore } from "@/store/use-skeleton-store";
import { useCallback, useRef, type PointerEvent, type RefObject } from "react";

/**
 * Absolutely-positioned resize handles drawn over the currently selected
 * skeleton node. Right handle controls width; bottom handle controls height.
 * Mounted inside the scrollable preview container so handles scroll with
 * content automatically.
 */
export function ResizeOverlay({
  containerRef,
}: {
  containerRef: RefObject<HTMLDivElement | null>;
}) {
  const selectedId = useSkeletonStore((s) => s.selectedId);
  const tree = useSkeletonStore((s) => s.tree);

  const selector = selectedId
    ? `[data-skeleton-id="${selectedId}"]`
    : null;
  const rect = useElementRect(containerRef, selector);

  const node = tree && selectedId ? findNode(tree, selectedId) : null;

  if (!rect || !node) return null;

  const isParagraph = node.kind === "paragraph";

  return (
    <div
      style={{
        position: "absolute",
        left: rect.x,
        top: rect.y,
        width: rect.width,
        height: rect.height,
        pointerEvents: "none",
      }}
    >
      <Handle
        axis="x"
        nodeId={selectedId!}
        nodeValue={node.width}
        containerRef={containerRef}
      />
      {!isParagraph && (
        <Handle
          axis="y"
          nodeId={selectedId!}
          nodeValue={node.height}
          containerRef={containerRef}
        />
      )}
    </div>
  );
}

const MIN_WIDTH = 8;
const MIN_HEIGHT = 4;

/**
 * One drag handle — a thin strip on the right edge (axis=x, controls width)
 * or bottom edge (axis=y, controls height). Uses pointer capture for smooth
 * drag tracking even when the cursor leaves the handle element.
 */
function Handle({
  axis,
  nodeId,
  nodeValue,
  containerRef,
}: {
  axis: "x" | "y";
  nodeId: string;
  nodeValue: number | "full" | undefined;
  containerRef: RefObject<HTMLDivElement | null>;
}) {
  const pushSnapshot = useSkeletonStore((s) => s.pushSnapshot);
  const patchNodeQuiet = useSkeletonStore((s) => s.patchNodeQuiet);

  const dragRef = useRef<{
    startPos: number;
    startValue: number;
  } | null>(null);

  const onPointerDown = useCallback(
    (e: PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);

      let startValue: number;
      if (typeof nodeValue === "number") {
        startValue = nodeValue;
      } else {
        const el = containerRef.current?.querySelector(
          `[data-skeleton-id="${nodeId}"]`,
        );
        startValue = el
          ? axis === "x"
            ? el.getBoundingClientRect().width
            : el.getBoundingClientRect().height
          : 100;
        patchNodeQuiet(nodeId, {
          [axis === "x" ? "width" : "height"]: Math.round(startValue),
        });
      }

      pushSnapshot();
      dragRef.current = {
        startPos: axis === "x" ? e.clientX : e.clientY,
        startValue,
      };
    },
    [axis, nodeId, nodeValue, pushSnapshot, patchNodeQuiet, containerRef],
  );

  const onPointerMove = useCallback(
    (e: PointerEvent) => {
      if (!dragRef.current) return;
      const delta =
        (axis === "x" ? e.clientX : e.clientY) - dragRef.current.startPos;
      const min = axis === "x" ? MIN_WIDTH : MIN_HEIGHT;
      const newValue = Math.max(min, Math.round(dragRef.current.startValue + delta));
      patchNodeQuiet(nodeId, {
        [axis === "x" ? "width" : "height"]: newValue,
      });
    },
    [axis, nodeId, patchNodeQuiet],
  );

  const onPointerUp = useCallback(
    (e: PointerEvent) => {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      dragRef.current = null;
    },
    [],
  );

  const isX = axis === "x";
  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      style={{
        position: "absolute",
        ...(isX
          ? { right: -3, top: 0, width: 6, height: "100%", cursor: "ew-resize" }
          : { bottom: -3, left: 0, height: 6, width: "100%", cursor: "ns-resize" }),
        pointerEvents: "auto",
        borderRadius: 3,
      }}
      className="opacity-0 hover:opacity-100 bg-primary/40 transition-opacity"
    />
  );
}
