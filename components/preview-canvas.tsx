"use client";
import { useSkeletonStore } from "@/store/use-skeleton-store";
import { useRef } from "react";
import { ResizeOverlay } from "./resize-overlay";
import { SkeletonRenderer } from "./skeleton-renderer";

/**
 * Center pane: live skeleton preview with info bar and subtle dotted grid
 * background. A ResizeOverlay sits on top to provide enhanced selection
 * visuals (green border, handle dots, dimension badge) and drag handles.
 */
export function PreviewCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const tree = useSkeletonStore((s) => s.tree);
  const settings = useSkeletonStore((s) => s.settings);
  const selectedId = useSkeletonStore((s) => s.selectedId);
  const selectNode = useSkeletonStore((s) => s.selectNode);
  const componentName = useSkeletonStore((s) => s.componentName);
  const parseVersion = useSkeletonStore((s) => s.parseVersion);

  const rootWidth = tree?.width === "full" ? "100%" : tree?.width ?? "auto";
  const rootHeight = tree?.height ?? "auto";

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Info bar */}
      {tree && (
        <div className="px-4 py-1.5 text-xs text-muted-foreground shrink-0">
          {componentName ?? "Component"} · v{parseVersion}{" "}
          <span className="ml-2 tabular-nums">
            {rootWidth} × {rootHeight}
          </span>
        </div>
      )}

      {/* Canvas */}
      <div
        ref={containerRef}
        className="relative flex-1 overflow-auto bg-muted/30"
        style={{
          backgroundImage:
            "radial-gradient(circle, oklch(0.55 0 0 / 0.15) 0.75px, transparent 0.75px)",
          backgroundSize: "20px 20px",
        }}
        onClick={() => selectNode(null)}
      >
        <div className="flex items-center justify-center min-h-full p-12">
          {tree ? (
            <SkeletonRenderer
              node={tree}
              settings={settings}
              selectedId={selectedId}
              onSelect={selectNode}
            />
          ) : (
            <div className="text-muted-foreground text-sm">
              Paste a component to see its skeleton.
            </div>
          )}
        </div>
        <ResizeOverlay containerRef={containerRef} />
      </div>
    </div>
  );
}
