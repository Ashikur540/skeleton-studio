"use client";
import { ScrubInputGroup } from "@/components/scrub-input-group";
import { SectionWrapper } from "@/components/properties-panel/section-wrapper";
import { Label } from "@/components/ui/label";
import type { SkeletonNode } from "@/lib/ir/types";

/**
 * Dimensions section: width, height, and border radius. Width/height are
 * displayed side-by-side with "W" and "H" prefix scrub handles. When width
 * is "full", the W field is disabled and shows 100%.
 */
export function DimensionsSection({
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
  const widthIsFull = node.width === "full";

  return (
    <SectionWrapper title="Dimensions">
      {/* Size row */}
      <div className="flex items-center gap-2">
        <Label className="text-xs text-muted-foreground w-12 shrink-0">Size</Label>
        <ScrubInputGroup
          prefix="W"
          suffix={widthIsFull ? "%" : "px"}
          value={widthIsFull ? 100 : (typeof node.width === "number" ? node.width : undefined)}
          onChange={(v) => update({ width: v })}
          onScrubStart={onScrubStart}
          onScrubEnd={onScrubEnd}
          disabled={widthIsFull}
          min={0}
          className="flex-1"
        />
        <ScrubInputGroup
          prefix="H"
          suffix="px"
          value={node.height}
          onChange={(v) => update({ height: v })}
          onScrubStart={onScrubStart}
          onScrubEnd={onScrubEnd}
          min={0}
          className="flex-1"
        />
      </div>

      {/* Radius row */}
      <div className="flex items-center gap-2">
        <Label className="text-xs text-muted-foreground w-12 shrink-0">Radius</Label>
        <ScrubInputGroup
          prefix="⌓"
          suffix="px"
          value={node.radius}
          onChange={(v) => update({ radius: v })}
          onScrubStart={onScrubStart}
          onScrubEnd={onScrubEnd}
          min={0}
          className="flex-1"
          iconPrefix="radius"
        />
      </div>
    </SectionWrapper>
  );
}
