"use client";
import { useSkeletonStore } from "@/store/use-skeleton-store";
import { findNode } from "@/lib/ir/helpers";
import type { SkeletonNode } from "@/lib/ir/types";

/**
 * Right-pane editor that surfaces editable properties for the currently selected
 * IR node. Renders a placeholder message when nothing is selected. When a node
 * is active, shows width/height/radius/lineCount/visibility controls and a
 * low-confidence warning banner for nodes whose dimensions were guessed.
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

  return (
    <aside className="w-72 p-4 border-l border-border flex flex-col gap-4">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">
        {node.kind}
        {node.sourceTag ? ` · <${node.sourceTag}>` : ""}
      </div>

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
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={node.visible}
          onChange={(e) => update({ visible: e.target.checked })}
        />
        Visible
      </label>
      {node.confidence === "fallback" && (
        <div className="text-xs text-amber-400">
          Low-confidence block — verify dimensions.
        </div>
      )}
    </aside>
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
    <label className="flex flex-col gap-1 text-xs text-muted-foreground">
      {label}
      <input
        type="number"
        min={min}
        value={value ?? ""}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === "") onChange(undefined);
          else {
            const n = Number(raw);
            if (!Number.isNaN(n)) onChange(n);
          }
        }}
        className="px-2 py-1 rounded bg-card border border-border text-foreground text-sm"
      />
    </label>
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
    <label className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={active}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  );
}
