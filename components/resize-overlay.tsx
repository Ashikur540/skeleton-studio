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

  // Paragraphs can only be resized horizontally — height is driven by line count.
  const isParagraph = node.kind === "paragraph";

  return (
    /* Outer div sits exactly over the selected element but passes clicks through.
       Only the child Handle components intercept pointer events. */
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

  /* Local drag state: snapshot of the pointer position and node dimension
     at the moment the user pressed down. Null means no active drag. */
  const dragRef = useRef<{
    startPos: number;
    startValue: number;
  } | null>(null);

  /* ── DRAG START ──────────────────────────────────────────────────────
     Captures the pointer, resolves the starting dimension (measuring the
     DOM if the IR value is "full"/undefined), and pushes one undo snapshot. */
  const onPointerDown = useCallback(
    (e: PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);

      let startValue: number;
      if (typeof nodeValue === "number") {
        // Already a concrete pixel value in the IR — use it directly.
        startValue = nodeValue;
      } else {
        /* "full" or undefined — measure the actual rendered DOM element,
           then anchor the value into the IR so future drags start from here. */
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

      // One history entry for the entire drag gesture — undo reverts to pre-drag.
      pushSnapshot();
      dragRef.current = {
        startPos: axis === "x" ? e.clientX : e.clientY,
        startValue,
      };
    },
    [axis, nodeId, nodeValue, pushSnapshot, patchNodeQuiet, containerRef],
  );

  /* ── DRAG MOVE ───────────────────────────────────────────────────────
     Computes the pixel delta from drag start, clamps to minimum, then
     silently patches the IR — no history push so intermediate values don't
     clutter the undo stack. */
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

  /* ── DRAG END ────────────────────────────────────────────────────────
     Releases pointer capture and clears the drag ref. No snapshot needed
     here — it was already pushed at drag start. */
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
