"use client";
import { useSkeletonStore } from "@/store/use-skeleton-store";
import { findNode } from "@/lib/ir/helpers";
import type { SkeletonNode } from "@/lib/ir/types";
import { useCallback, useRef } from "react";
import { BlockSection } from "./sections/block-section";
import { ContentSection } from "./sections/content-section";
import { DimensionsSection } from "./sections/dimensions-section";
import { LayoutSection } from "./sections/layout-section";
import { RepeatSection } from "./sections/repeat-section";

/**
 * Design tab of the properties panel. Composes the 5 collapsible sections:
 * Block, Dimensions, Layout, Repeat, and Content Mocking. Sections visibility
 * is conditional on the selected node's kind and structure.
 */
export function DesignTab() {
  const tree = useSkeletonStore((s) => s.tree);
  const selectedId = useSkeletonStore((s) => s.selectedId);
  const patchNode = useSkeletonStore((s) => s.patchNode);
  const patchNodeQuiet = useSkeletonStore((s) => s.patchNodeQuiet);
  const pushSnapshot = useSkeletonStore((s) => s.pushSnapshot);

  const isScrubbing = useRef(false);
  const node = tree && selectedId ? findNode(tree, selectedId) : null;

  const update = useCallback(
    (patch: Partial<SkeletonNode>) => {
      if (!node) return;
      if (isScrubbing.current) {
        patchNodeQuiet(node.id, patch);
      } else {
        patchNode(node.id, patch);
      }
    },
    [node, patchNode, patchNodeQuiet],
  );

  const onScrubStart = useCallback(() => {
    pushSnapshot();
    isScrubbing.current = true;
  }, [pushSnapshot]);

  const onScrubEnd = useCallback(() => {
    isScrubbing.current = false;
  }, []);

  if (!node) {
    return (
      <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
        Select a block to edit its properties.
      </div>
    );
  }

  const showLayout =
    node.kind === "container" ||
    (node.kind === "card" && (node.children?.length ?? 0) > 0);

  return (
    <div className="flex flex-col gap-1 pb-4">
      <BlockSection node={node} update={update} />
      <DimensionsSection
        node={node}
        update={update}
        onScrubStart={onScrubStart}
        onScrubEnd={onScrubEnd}
      />
      {showLayout && (
        <LayoutSection
          node={node}
          update={update}
          onScrubStart={onScrubStart}
          onScrubEnd={onScrubEnd}
        />
      )}
      <RepeatSection
        node={node}
        update={update}
        onScrubStart={onScrubStart}
        onScrubEnd={onScrubEnd}
      />
      {node.kind === "paragraph" && (
        <ContentSection
          node={node}
          update={update}
          onScrubStart={onScrubStart}
          onScrubEnd={onScrubEnd}
        />
      )}
    </div>
  );
}
