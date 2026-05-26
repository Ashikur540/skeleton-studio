"use client";
import { useSkeletonStore } from "@/store/use-skeleton-store";
import { useRef } from "react";
import { ResizeOverlay } from "./resize-overlay";
import { SkeletonRenderer } from "./skeleton-renderer";

/**
 * Center pane that renders the live skeleton preview. Background follows the
 * editor's light/dark mode via shadcn tokens, so the chrome theme toggle
 * flips the preview at the same time. Clicking the empty area deselects any
 * active block; the empty-state message guides first-time users. A
 * ResizeOverlay sits on top of the content to provide drag handles for the
 * currently selected node.
 */
export function PreviewCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const tree = useSkeletonStore((s) => s.tree);
  const settings = useSkeletonStore((s) => s.settings);
  const selectedId = useSkeletonStore((s) => s.selectedId);
  const selectNode = useSkeletonStore((s) => s.selectNode);

  return (
    <div
      ref={containerRef}
      className="relative flex-1 h-full rounded-lg border border-border p-8 overflow-auto bg-background text-foreground"
      onClick={() => selectNode(null)}
    >
      {tree ? (
        <SkeletonRenderer
          node={tree}
          settings={settings}
          selectedId={selectedId}
          onSelect={selectNode}
        />
      ) : (
        <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
          Paste a component to see its skeleton.
        </div>
      )}
      <ResizeOverlay containerRef={containerRef} />
    </div>
  );
}
