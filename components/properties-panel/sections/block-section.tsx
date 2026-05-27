"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { SectionWrapper } from "@/components/properties-panel/section-wrapper";
import type { Appearance, SkeletonKind, SkeletonNode } from "@/lib/ir/types";

const KIND_OPTIONS: { value: SkeletonKind; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "paragraph", label: "Paragraph" },
  { value: "image", label: "Image" },
  { value: "avatar", label: "Avatar" },
  { value: "button", label: "Button" },
  { value: "card", label: "Card" },
  { value: "input", label: "Input" },
  { value: "container", label: "Container" },
];

/**
 * Block section: node kind selector and visibility toggle. Appearance dropdown
 * shown only for container nodes to switch between plain and card surface.
 */
export function BlockSection({
  node,
  update,
}: {
  node: SkeletonNode;
  update: (patch: Partial<SkeletonNode>) => void;
}) {
  return (
    <SectionWrapper title="Block" noBorder>
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">Type</Label>
        <Select
          value={node.kind}
          onValueChange={(v) => update({ kind: v as SkeletonKind })}
        >
          <SelectTrigger className="w-36 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {KIND_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">Visibility</Label>
        <Switch
          size="sm"
          checked={node.visible}
          onCheckedChange={(v) => update({ visible: v === true })}
        />
      </div>
      {node.kind === "container" && (
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Appearance</Label>
          <Select
            value={node.appearance ?? "plain"}
            onValueChange={(v) => update({ appearance: v as Appearance })}
          >
            <SelectTrigger className="w-36 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="plain">Plain</SelectItem>
              <SelectItem value="card">Card</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </SectionWrapper>
  );
}
