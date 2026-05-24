"use client";
import { useSkeletonStore } from "@/store/use-skeleton-store";
import { findNode } from "@/lib/ir/helpers";
import type {
  Alignment,
  Appearance,
  Justify,
  LayoutDirection,
  Padding,
  SkeletonKind,
  SkeletonNode,
} from "@/lib/ir/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * Every available skeleton block kind, ordered for the manual-reclassify
 * dropdown. Fill kinds first (most common overrides), structural ones last.
 */
const KIND_OPTIONS: { value: SkeletonKind; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "paragraph", label: "Paragraph (multi-line)" },
  { value: "image", label: "Image" },
  { value: "avatar", label: "Avatar" },
  { value: "button", label: "Button" },
  { value: "card", label: "Card (fill block)" },
  { value: "input", label: "Input" },
  { value: "container", label: "Container (wrapper, no fill)" },
];

/** Sentinel value used by alignment/justify selects to mean "unset". */
const UNSET = "__unset__";

const ALIGN_OPTIONS: { value: Alignment | typeof UNSET; label: string }[] = [
  { value: UNSET, label: "auto" },
  { value: "start", label: "start" },
  { value: "center", label: "center" },
  { value: "end", label: "end" },
  { value: "stretch", label: "stretch" },
  { value: "baseline", label: "baseline" },
];

const JUSTIFY_OPTIONS: { value: Justify | typeof UNSET; label: string }[] = [
  { value: UNSET, label: "auto" },
  { value: "start", label: "start" },
  { value: "center", label: "center" },
  { value: "end", label: "end" },
  { value: "between", label: "space-between" },
  { value: "around", label: "space-around" },
  { value: "evenly", label: "space-evenly" },
];

/**
 * Right-pane editor that surfaces editable properties for the currently selected
 * IR node. Renders a placeholder message when nothing is selected. When a node
 * is active, shows kind / appearance / layout / dims / padding / repeat /
 * visibility controls and a low-confidence warning banner.
 */
export function PropertiesPanel() {
  const tree = useSkeletonStore((s) => s.tree);
  const selectedId = useSkeletonStore((s) => s.selectedId);
  const patchNode = useSkeletonStore((s) => s.patchNode);

  const node = tree && selectedId ? findNode(tree, selectedId) : null;

  if (!node) {
    return (
      <aside className="w-72 p-4 border-l border-border text-sm text-muted-foreground">
        Select a block to edit its properties.
      </aside>
    );
  }

  const update = (patch: Partial<SkeletonNode>) => patchNode(node.id, patch);
  const showLayout =
    node.kind === "container" ||
    (node.kind === "card" && (node.children?.length ?? 0) > 0);

  return (
    <aside className="w-72 p-4 border-l border-border flex flex-col gap-4 overflow-y-auto">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">
        {node.kind}
        {node.sourceTag ? ` · <${node.sourceTag}>` : ""}
      </div>

      <div className="flex flex-col gap-1">
        <Label className="text-xs text-muted-foreground">Kind</Label>
        <Select
          value={node.kind}
          onValueChange={(v) => update({ kind: v as SkeletonKind })}
        >
          <SelectTrigger className="h-8">
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

      {node.kind === "container" && (
        <div className="flex flex-col gap-1">
          <Label className="text-xs text-muted-foreground">Appearance</Label>
          <Select
            value={node.appearance ?? "plain"}
            onValueChange={(v) =>
              update({ appearance: v as Appearance })
            }
          >
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="plain">
                Plain (transparent wrapper)
              </SelectItem>
              <SelectItem value="card">
                Card (outlined surface)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <NumberField
        label="Width (px, blank = auto)"
        value={typeof node.width === "number" ? node.width : undefined}
        onChange={(v) => update({ width: v })}
      />
      <FullToggle
        label="Full width"
        active={node.width === "full"}
        onChange={(on) => update({ width: on ? "full" : undefined })}
      />
      <NumberField
        label="Height (px)"
        value={node.height}
        onChange={(v) => update({ height: v })}
      />
      <NumberField
        label="Radius (px)"
        value={node.radius}
        onChange={(v) => update({ radius: v })}
      />
      {node.kind === "paragraph" && (
        <NumberField
          label="Line count"
          value={node.lineCount}
          onChange={(v) => update({ lineCount: v ?? 1 })}
          min={1}
        />
      )}
      {node.repeat !== undefined && (
        <NumberField
          label="Repeat (rows from .map)"
          value={node.repeat}
          onChange={(v) => update({ repeat: v && v > 1 ? v : undefined })}
          min={1}
        />
      )}

      {showLayout && (
        <LayoutSection node={node} update={update} />
      )}

      <PaddingSection node={node} update={update} />

      <div className="flex items-center gap-2">
        <Checkbox
          id="node-visible"
          checked={node.visible}
          onCheckedChange={(v) => update({ visible: v === true })}
        />
        <Label htmlFor="node-visible">Visible</Label>
      </div>
      {node.confidence === "fallback" && (
        <div className="text-xs text-amber-400">
          Low-confidence block — verify dimensions.
        </div>
      )}
    </aside>
  );
}

/**
 * Group of layout controls (direction, gap, align, justify, wrap) shown when
 * the selected node is a structural container (or a card wrapping children).
 * All writes go through `update` which forwards a partial layout patch so the
 * caller doesn't need to know how SkeletonNode stores flex state internally.
 */
function LayoutSection({
  node,
  update,
}: {
  node: SkeletonNode;
  update: (patch: Partial<SkeletonNode>) => void;
}) {
  const layout = node.layout;
  const setLayout = (patch: Partial<NonNullable<SkeletonNode["layout"]>>) => {
    const base = layout ?? { direction: "col" as LayoutDirection };
    update({ layout: { ...base, ...patch } });
  };
  return (
    <div className="flex flex-col gap-2 border-t border-border pt-3">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">
        Layout
      </div>
      <div className="flex flex-col gap-1">
        <Label className="text-xs text-muted-foreground">Direction</Label>
        <Select
          value={layout?.direction ?? "col"}
          onValueChange={(v) => setLayout({ direction: v as LayoutDirection })}
        >
          <SelectTrigger className="h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="col">Column</SelectItem>
            <SelectItem value="row">Row</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <NumberField
        label="Gap (px)"
        value={layout?.gap}
        onChange={(v) => setLayout({ gap: v })}
      />
      <div className="flex flex-col gap-1">
        <Label className="text-xs text-muted-foreground">Align items</Label>
        <Select
          value={layout?.alignItems ?? UNSET}
          onValueChange={(v) =>
            setLayout({
              alignItems: v === UNSET ? undefined : (v as Alignment),
            })
          }
        >
          <SelectTrigger className="h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ALIGN_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1">
        <Label className="text-xs text-muted-foreground">
          Justify content
        </Label>
        <Select
          value={layout?.justifyContent ?? UNSET}
          onValueChange={(v) =>
            setLayout({
              justifyContent: v === UNSET ? undefined : (v as Justify),
            })
          }
        >
          <SelectTrigger className="h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {JUSTIFY_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          id="node-wrap"
          checked={layout?.wrap === true}
          onCheckedChange={(v) =>
            setLayout({ wrap: v === true ? true : undefined })
          }
        />
        <Label htmlFor="node-wrap">Wrap children</Label>
      </div>
    </div>
  );
}

/**
 * Four per-side padding inputs in a 2x2 grid (top/right above bottom/left).
 * Editing a side to blank clears it; setting all four to blank removes the
 * padding object entirely so the IR stays clean.
 */
function PaddingSection({
  node,
  update,
}: {
  node: SkeletonNode;
  update: (patch: Partial<SkeletonNode>) => void;
}) {
  const padding = node.padding ?? {};
  const setSide = (side: keyof Padding, v: number | undefined) => {
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
    <div className="flex flex-col gap-2 border-t border-border pt-3">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">
        Padding (px)
      </div>
      <div className="grid grid-cols-2 gap-2">
        <NumberField
          label="Top"
          value={padding.top}
          onChange={(v) => setSide("top", v)}
        />
        <NumberField
          label="Right"
          value={padding.right}
          onChange={(v) => setSide("right", v)}
        />
        <NumberField
          label="Bottom"
          value={padding.bottom}
          onChange={(v) => setSide("bottom", v)}
        />
        <NumberField
          label="Left"
          value={padding.left}
          onChange={(v) => setSide("left", v)}
        />
      </div>
    </div>
  );
}

/**
 * Reusable number input that surfaces undefined for blank values, allowing
 * callers to distinguish "not set" from zero and avoid accidentally pinning
 * dimensions to 0 when a field is cleared.
 */
function NumberField({
  label,
  value,
  onChange,
  min = 0,
}: {
  label: string;
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  min?: number;
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input
        type="number"
        min={min}
        value={value ?? ""}
        className="h-8"
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === "") onChange(undefined);
          else {
            const n = Number(raw);
            if (!Number.isNaN(n)) onChange(n);
          }
        }}
      />
    </div>
  );
}

/**
 * Checkbox specialized for toggling between a numeric width and full-width
 * (w-full), letting users switch layout modes without clearing numeric fields
 * or typing "full" manually.
 */
function FullToggle({
  label,
  active,
  onChange,
}: {
  label: string;
  active: boolean;
  onChange: (on: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox
        id="node-full-width"
        checked={active}
        onCheckedChange={(v) => onChange(v === true)}
      />
      <Label htmlFor="node-full-width">{label}</Label>
    </div>
  );
}
