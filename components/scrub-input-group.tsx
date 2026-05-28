"use client";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { useScrubDrag } from "@/hooks/use-scrub-drag";
import { cn } from "@/lib/utils";
import { RepeatIcon, SquareRoundCornerIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback } from "react";

const ICON_MAP = {
  radius: SquareRoundCornerIcon,
  repeat: RepeatIcon,
} as const;

/**
 * Compact numeric input with an InputGroup layout: a scrubbable prefix handle
 * on the left, a number input in the center, and an optional unit suffix on the
 * right. The prefix label (e.g. "W", "H", "G") is the drag-to-scrub target,
 * matching Figma's interaction pattern. Supports icon prefixes via iconPrefix.
 */
export function ScrubInputGroup({
  prefix,
  suffix,
  value,
  onChange,
  onScrubStart,
  onScrubEnd,
  min,
  disabled,
  placeholder,
  className,
  iconPrefix,
}: {
  prefix: string;
  suffix?: string;
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  onScrubStart?: () => void;
  onScrubEnd?: () => void;
  min?: number;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  iconPrefix?: keyof typeof ICON_MAP;
}) {
  const { handlePointerDown, handlePointerMove, handlePointerUp, inputRef } =
    useScrubDrag({ value, onChange, onScrubStart, onScrubEnd, min, disabled });

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

  const icon = iconPrefix ? ICON_MAP[iconPrefix] : null;

  return (
    <InputGroup
      className={cn("h-8", className)}
      data-disabled={disabled || undefined}
    >
      <InputGroupAddon
        align="inline-start"
        className={cn(
          "select-none px-1.5 text-xs font-medium",
          disabled
            ? "opacity-50"
            : "cursor-ew-resize hover:bg-primary/10 active:bg-primary/20 transition-colors",
        )}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {icon ? (
          <HugeiconsIcon
            icon={icon}
            size={12}
            strokeWidth={2}
            className="text-muted-foreground"
          />
        ) : (
          <InputGroupText className="text-xs">{prefix}</InputGroupText>
        )}
      </InputGroupAddon>
      <InputGroupInput
        ref={inputRef}
        type="number"
        className="text-xs tabular-nums px-1 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        value={value ?? ""}
        onChange={handleInputChange}
        placeholder={placeholder}
        min={min}
        disabled={disabled}
      />
      {suffix && (
        <InputGroupAddon align="inline-end" className="px-1.5">
          <InputGroupText className="text-xs text-muted-foreground">
            {suffix}
          </InputGroupText>
        </InputGroupAddon>
      )}
    </InputGroup>
  );
}
