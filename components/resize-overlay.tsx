"use client";
import { findNode } from "@/lib/ir/helpers";
import { useElementRect } from "@/hooks/use-element-rect";
import { useSkeletonStore } from "@/store/use-skeleton-store";
import { useCallback, useRef, type PointerEvent, type RefObject } from "react";

const MIN_WIDTH = 8;
const MIN_HEIGHT = 4;
const DOT_SIZE = 7;
const HALF_DOT = Math.floor(DOT_SIZE / 2);

/**
 * Enhanced selection overlay drawn over the currently selected skeleton node.
 * Shows a green border, 8 handle dots (corners + edge midpoints), and a
 * dimension badge below. Only the right (E) and bottom (S) midpoint handles
 * are interactive for width/height resizing.
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

  const widthLabel =
    node.width === "full"
      ? "100%"
      : typeof node.width === "number"
        ? `${node.width}`
        : "auto";
  const heightLabel =
    typeof node.height === "number" ? `${node.height}` : "auto";

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
      {/* Selection border */}
      <div
        className="absolute inset-0 border-[1.5px] border-primary rounded-sm"
        style={{ pointerEvents: "none" }}
      />

      {/* Corner dots (visual only) */}
      <Dot x={-HALF_DOT} y={-HALF_DOT} />
      <Dot x={rect.width - HALF_DOT - 1} y={-HALF_DOT} />
      <Dot x={-HALF_DOT} y={rect.height - HALF_DOT - 1} />
      <Dot x={rect.width - HALF_DOT - 1} y={rect.height - HALF_DOT - 1} />

      {/* Top midpoint (visual only) */}
      <Dot x={rect.width / 2 - HALF_DOT} y={-HALF_DOT} />
      {/* Left midpoint (visual only) */}
      <Dot x={-HALF_DOT} y={rect.height / 2 - HALF_DOT} />

      {/* Right midpoint — interactive width handle */}
      <DragHandle
        axis="x"
        nodeId={selectedId!}
        nodeValue={node.width}
        containerRef={containerRef}
        style={{
          left: rect.width - HALF_DOT - 1,
          top: rect.height / 2 - HALF_DOT,
        }}
      />

      {/* Bottom midpoint — interactive height handle */}
      {!isParagraph && (
        <DragHandle
          axis="y"
          nodeId={selectedId!}
          nodeValue={node.height}
          containerRef={containerRef}
          style={{
            left: rect.width / 2 - HALF_DOT,
            top: rect.height - HALF_DOT - 1,
          }}
        />
      )}

      {/* Dimension badge */}
      <div
        style={{
          position: "absolute",
          bottom: -22,
          left: "50%",
          transform: "translateX(-50%)",
          pointerEvents: "none",
        }}
      >
        <span className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap font-mono tabular-nums">
          {widthLabel} × {heightLabel}
        </span>
      </div>
    </div>
  );
}

/** Visual-only dot handle at a fixed position. */
function Dot({ x, y }: { x: number; y: number }) {
  return (
    <div
      className="absolute bg-primary border border-primary-foreground/50 rounded-[2px]"
      style={{
        width: DOT_SIZE,
        height: DOT_SIZE,
        left: x,
        top: y,
        pointerEvents: "none",
      }}
    />
  );
}

/** Interactive drag handle for width (axis=x) or height (axis=y). */
function DragHandle({
  axis,
  nodeId,
  nodeValue,
  containerRef,
  style,
}: {
  axis: "x" | "y";
  nodeId: string;
  nodeValue: number | "full" | undefined;
  containerRef: RefObject<HTMLDivElement | null>;
  style: React.CSSProperties;
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

  return (
    <div
      className="absolute bg-primary border border-primary-foreground/50 rounded-[2px] hover:scale-125 transition-transform"
      style={{
        width: DOT_SIZE,
        height: DOT_SIZE,
        cursor: axis === "x" ? "ew-resize" : "ns-resize",
        pointerEvents: "auto",
        ...style,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    />
  );
}
