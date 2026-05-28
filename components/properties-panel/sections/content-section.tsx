"use client";
import { ScrubInputGroup } from "@/components/scrub-input-group";
import { SectionWrapper } from "@/components/properties-panel/section-wrapper";
import { Label } from "@/components/ui/label";
import type { SkeletonNode } from "@/lib/ir/types";

/**
 * Content mocking section: line count for paragraph nodes. Controls how many
 * stacked text bars the renderer draws for multi-line skeleton text.
 */
export function ContentSection({
  node,
  update,
  onScrubStart,
  onScrubEnd,
}: {
  node: SkeletonNode;
  update: (patch: Partial<SkeletonNode>) => void;
  onScrubStart: () => void;
  onScrubEnd: () => void;
}) {
  return (
    <SectionWrapper title="Content Mocking">
      <div className="flex items-center gap-2">
        <Label className="text-xs text-muted-foreground w-16 shrink-0">Line count</Label>
        <ScrubInputGroup
          prefix="#"
          value={node.lineCount}
          onChange={(v) => update({ lineCount: v ?? 1 })}
          onScrubStart={onScrubStart}
          onScrubEnd={onScrubEnd}
          min={1}
          className="flex-1"
        />
      </div>
    </SectionWrapper>
  );
}
