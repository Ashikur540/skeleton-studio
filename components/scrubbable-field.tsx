"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCallback, useRef } from "react";

const DEAD_ZONE = 2;

/**
 * Numeric input with a draggable label for Figma-style scrubbing. Hover
 * the label → cursor becomes ew-resize. Drag left/right to adjust the
 * value by ±1 per pixel (Shift ×10). Click the label within a 2px dead
 * zone to focus the input for typing. Fires `onScrubStart` once at drag
 * begin and `onScrubEnd` once at drag end so callers can manage history
 * snapshots.
 */
export function ScrubbableField({
  label,
  value,
  onChange,
  onScrubStart,
  onScrubEnd,
  min,
  disabled,
}: {
  label: string;
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  onScrubStart?: () => void;
  onScrubEnd?: () => void;
  min?: number;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dragState = useRef<{
    startX: number;
    startValue: number;
    active: boolean;
  } | null>(null);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (disabled) return;
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      dragState.current = {
        startX: e.clientX,
        startValue: value ?? 0,
        active: false,
      };
    },
    [value, disabled],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const ds = dragState.current;
      if (!ds) return;
      const deltaX = e.clientX - ds.startX;

      if (!ds.active) {
        if (Math.abs(deltaX) < DEAD_ZONE) return;
        ds.active = true;
        onScrubStart?.();
        document.body.style.cursor = "ew-resize";
      }

      const multiplier = e.shiftKey ? 10 : 1;
      let newValue = ds.startValue + Math.round(deltaX) * multiplier;
      if (min !== undefined) newValue = Math.max(min, newValue);
      onChange(newValue);
    },
    [onChange, onScrubStart, min],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      const ds = dragState.current;
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      if (ds?.active) {
        document.body.style.cursor = "";
        onScrubEnd?.();
      } else {
        inputRef.current?.focus();
        inputRef.current?.select();
      }
      dragState.current = null;
    },
    [onScrubEnd],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      if (raw === "") {
        onChange(undefined);
        return;
      }
      const n = Number(raw);
      if (!Number.isNaN(n)) onChange(n);
    },
    [onChange],
  );

  return (
    <div className="flex flex-col gap-1">
      <Label
        className={
          "text-xs text-muted-foreground select-none " +
          (disabled ? "" : "cursor-ew-resize")
        }
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {label}
      </Label>
      <Input
        ref={inputRef}
        type="number"
        className="h-8 text-xs"
        value={value ?? ""}
        onChange={handleInputChange}
        min={min}
        disabled={disabled}
      />
    </div>
  );
}
