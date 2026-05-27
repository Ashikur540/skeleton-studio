"use client";
import type { Padding } from "@/lib/ir/types";
import { useCallback } from "react";

/**
 * Visual CSS box-model diagram for editing four-sided padding. Renders nested
 * rectangles with editable numeric inputs at each edge center. Values are
 * displayed inside the padding area between the outer border and inner content
 * box, matching the Figma-style spacing visualization.
 */
export function PaddingBox({
  padding,
  onChange,
}: {
  padding: Padding;
  onChange: (side: keyof Padding, value: number | undefined) => void;
}) {
  return (
    <div className="relative flex flex-col items-center border border-dashed border-border rounded-md w-full">
      {/* Top value */}
      <PaddingInput
        value={padding.top}
        onChange={(v) => onChange("top", v)}
        className="my-1"
      />

      {/* Middle row: left + content + right */}
      <div className="flex items-center w-full px-1">
        <PaddingInput
          value={padding.left}
          onChange={(v) => onChange("left", v)}
        />
        <div className="flex-1 mx-2 h-10 rounded-sm bg-muted/40 flex items-center justify-center">
          <span className="text-[10px] text-muted-foreground/60 select-none">
            content
          </span>
        </div>
        <PaddingInput
          value={padding.right}
          onChange={(v) => onChange("right", v)}
        />
      </div>

      {/* Bottom value */}
      <PaddingInput
        value={padding.bottom}
        onChange={(v) => onChange("bottom", v)}
        className="my-1"
      />
    </div>
  );
}

/** Compact inline number input for a single padding side. */
function PaddingInput({
  value,
  onChange,
  className,
}: {
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  className?: string;
}) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      if (raw === "") {
        onChange(undefined);
        return;
      }
      const n = Number(raw);
      if (!Number.isNaN(n)) onChange(Math.max(0, n));
    },
    [onChange],
  );

  return (
    <input
      type="number"
      className={
        "w-10 bg-transparent text-center text-xs tabular-nums text-muted-foreground " +
        "outline-none focus:text-foreground [appearance:textfield] " +
        "[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none " +
        (className ?? "")
      }
      value={value ?? ""}
      onChange={handleChange}
      placeholder="0"
      min={0}
    />
  );
}
