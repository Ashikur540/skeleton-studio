"use client";
import { ScrubInputGroup } from "@/components/scrub-input-group";
import { PaddingBox } from "@/components/padding-box";
import { SectionWrapper } from "@/components/properties-panel/section-wrapper";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type {
  Alignment,
  LayoutDirection,
  Padding,
  SkeletonNode,
} from "@/lib/ir/types";

/**
 * Layout section: flex/grid mode, direction, alignment, gap, and padding.
 * Uses ToggleGroup for segmented button controls matching the Figma-style
 * design. Only rendered when the selected node is a container or card with
 * children.
 */
export function LayoutSection({
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
  const layout = node.layout;
  const setLayout = (patch: Partial<NonNullable<SkeletonNode["layout"]>>) => {
    const base = layout ?? { direction: "col" as LayoutDirection };
    update({ layout: { ...base, ...patch } });
  };

  const direction = layout?.direction ?? "col";
  const align = layout?.alignItems ?? "start";

  const padding = node.padding ?? {};
  const setPadding = (side: keyof Padding, v: number | undefined) => {
    const next: Padding = { ...padding };
    if (v === undefined) delete next[side];
    else next[side] = v;
    const anyValue =
      next.top !== undefined ||
      next.right !== undefined ||
      next.bottom !== undefined ||
      next.left !== undefined;
    update({ padding: anyValue ? next : undefined });
  };

  return (
    <SectionWrapper
      title="Layout"
      badge={layout?.gridCols ? "grid" : "flex"}
    >
      {/* Direction */}
      <div className="flex items-center gap-2">
        <Label className="text-xs text-muted-foreground w-16 shrink-0">Direction</Label>
        <ToggleGroup
          type="single"
          value={direction}
          onValueChange={(v) => { if (v) setLayout({ direction: v as LayoutDirection }); }}
          variant="outline"
          size="sm"
          spacing={0}
          className="flex-1"
        >
          <ToggleGroupItem value="row" className="flex-1 text-xs">↔ Row</ToggleGroupItem>
          <ToggleGroupItem value="col" className="flex-1 text-xs">↕ Col</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Align */}
      <div className="flex items-center gap-2">
        <Label className="text-xs text-muted-foreground w-16 shrink-0">Align</Label>
        <ToggleGroup
          type="single"
          value={align}
          onValueChange={(v) => {
            if (v) setLayout({ alignItems: v === "start" ? undefined : v as Alignment });
          }}
          variant="outline"
          size="sm"
          spacing={0}
          className="flex-1"
        >
          <ToggleGroupItem value="start" className="flex-1 text-xs">Start</ToggleGroupItem>
          <ToggleGroupItem value="center" className="flex-1 text-xs">Center</ToggleGroupItem>
          <ToggleGroupItem value="end" className="flex-1 text-xs">End</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Gap */}
      <div className="flex items-center gap-2">
        <Label className="text-xs text-muted-foreground w-16 shrink-0">Gap</Label>
        <ScrubInputGroup
          prefix="G"
          suffix="px"
          value={layout?.gap}
          onChange={(v) => setLayout({ gap: v })}
          onScrubStart={onScrubStart}
          onScrubEnd={onScrubEnd}
          min={0}
          className="flex-1"
        />
      </div>

      {/* Padding */}
      <div className="flex flex-col gap-2">
        <Label className="text-xs text-muted-foreground">Padding</Label>
        <PaddingBox
          padding={padding}
          onChange={setPadding}
        />
      </div>
    </SectionWrapper>
  );
}
