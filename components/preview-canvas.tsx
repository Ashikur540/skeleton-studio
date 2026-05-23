"use client";
import { useSkeletonStore } from "@/store/use-skeleton-store";
import { SkeletonRenderer } from "./skeleton-renderer";

/**
 * Center pane that renders the live skeleton preview. Background color flips
 * between white and zinc-900 based on the theme setting so the preview
 * matches the target environment. Clicking the empty canvas area deselects
 * any active block; the empty-state message guides first-time users.
 */
export function PreviewCanvas() {
  const tree = useSkeletonStore((s) => s.tree);
  const settings = useSkeletonStore((s) => s.settings);
  const selectedId = useSkeletonStore((s) => s.selectedId);
  const selectNode = useSkeletonStore((s) => s.selectNode);

  const bg =
    settings.theme === "dark"
      ? "bg-zinc-900 text-zinc-100"
      : "bg-white text-zinc-900";

  return (
    <div
      className={`flex-1 h-full rounded-lg border border-border p-8 overflow-auto ${bg}`}
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
    </div>
  );
}
