"use client";
import { useCallback, useRef, type RefObject } from "react";

const DEAD_ZONE = 2;

/**
 * Reusable drag-to-scrub hook for Figma-style numeric adjustment. Attaches
 * to a handle element via returned pointer handlers. Supports a 2px dead zone,
 * Shift ×10 multiplier, and start/end callbacks for history management.
 */
export function useScrubDrag({
  value,
  onChange,
  onScrubStart,
  onScrubEnd,
  min,
  disabled,
}: {
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  onScrubStart?: () => void;
  onScrubEnd?: () => void;
  min?: number;
  disabled?: boolean;
}): {
  handlePointerDown: (e: React.PointerEvent) => void;
  handlePointerMove: (e: React.PointerEvent) => void;
  handlePointerUp: (e: React.PointerEvent) => void;
  inputRef: RefObject<HTMLInputElement | null>;
} {
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

  return { handlePointerDown, handlePointerMove, handlePointerUp, inputRef };
}
