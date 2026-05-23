"use client";
import { useSkeletonStore } from "@/store/use-skeleton-store";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * Curated Tailwind background-color tokens presented in the base-color dropdown.
 * Limited to colors that look natural as skeleton placeholder fills across both
 * light and dark themes, avoiding visually jarring or uncommon values.
 */
const BASE_COLORS: { value: string; label: string }[] = [
  { value: "bg-zinc-200", label: "Zinc 200" },
  { value: "bg-zinc-300", label: "Zinc 300" },
  { value: "bg-zinc-800", label: "Zinc 800" },
  { value: "bg-blue-200", label: "Blue 200" },
  { value: "bg-blue-900/40", label: "Blue 900/40" },
];

/**
 * Top control bar exposing the three global render settings: animation style,
 * animation speed, and base fill color. Editor light/dark is handled by the
 * separate ThemeToggle in the header, so this bar focuses purely on skeleton
 * appearance.
 */
export function GlobalControls() {
  const settings = useSkeletonStore((s) => s.settings);
  const setSettings = useSkeletonStore((s) => s.setSettings);

  return (
    <div className="flex flex-wrap items-center gap-4 px-4 py-3 border-b border-border text-sm">
      <LabeledSelect
        label="Animation"
        value={settings.animation}
        options={[
          { value: "pulse", label: "Pulse" },
          { value: "shimmer", label: "Shimmer" },
        ]}
        onChange={(v) => setSettings({ animation: v as "pulse" | "shimmer" })}
      />
      <LabeledSelect
        label="Speed"
        value={settings.speed}
        options={[
          { value: "slow", label: "Slow" },
          { value: "normal", label: "Normal" },
          { value: "fast", label: "Fast" },
        ]}
        onChange={(v) => setSettings({ speed: v as "slow" | "normal" | "fast" })}
      />
      <LabeledSelect
        label="Base color"
        value={settings.baseColor}
        options={BASE_COLORS}
        onChange={(v) => setSettings({ baseColor: v })}
      />
    </div>
  );
}

/**
 * Small labeled shadcn Select used across the control bar. Kept component-local
 * because no other file needs a labeled select yet; extract to a shared UI file
 * if a second use site appears.
 */
function LabeledSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Label className="text-muted-foreground">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
