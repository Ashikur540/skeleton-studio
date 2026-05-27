"use client";
import { ScrubInputGroup } from "@/components/scrub-input-group";
import { SectionWrapper } from "@/components/properties-panel/section-wrapper";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { SkeletonNode } from "@/lib/ir/types";

/**
 * Repeat section: controls the `.map()` repeat count. Master toggle in the
 * section header enables/disables repetition. Count row has a clear button.
 */
export function RepeatSection({
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
  const hasRepeat = node.repeat !== undefined && node.repeat > 1;

  return (
    <SectionWrapper
      title="Repeat"
      toggle={{
        checked: hasRepeat,
        onChange: (on) => update({ repeat: on ? (node.repeat ?? 3) : undefined }),
      }}
    >
      {hasRepeat && (
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground w-12 shrink-0">Count</Label>
          <ScrubInputGroup
            prefix="⟳"
            iconPrefix="repeat"
            value={node.repeat}
            onChange={(v) => update({ repeat: v && v > 1 ? v : undefined })}
            onScrubStart={onScrubStart}
            onScrubEnd={onScrubEnd}
            min={2}
            className="flex-1"
          />
          <Button
            variant="ghost"
            size="icon-xs"
            className="text-muted-foreground hover:text-foreground shrink-0"
            onClick={() => update({ repeat: undefined })}
            title="Clear repeat"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" stroke="currentColor" strokeWidth="1.5" fill="none">
              <path d="M2 2l6 6M8 2l-6 6" />
            </svg>
          </Button>
        </div>
      )}
    </SectionWrapper>
  );
}
