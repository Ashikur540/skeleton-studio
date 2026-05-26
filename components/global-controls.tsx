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
import { PRESETS, findPreset } from "@/lib/presets";

/**
 * Curated Tailwind background-color tokens presented in the base-color dropdown.
 * Limited to colors that look natural as skeleton placeholder fills across both
 * light and dark themes. Preset colors are included so Tailwind v4's scanner
 * can detect and generate their CSS.
 */
const BASE_COLORS: { value: string; label: string }[] = [
  { value: "bg-zinc-100", label: "Zinc 100" },
  { value: "bg-zinc-200", label: "Zinc 200" },
  { value: "bg-zinc-300", label: "Zinc 300" },
  { value: "bg-zinc-800", label: "Zinc 800" },
  { value: "bg-blue-200", label: "Blue 200" },
  { value: "bg-blue-900/40", label: "Blue 900/40" },
];

const CUSTOM_SENTINEL = "__custom__";

/**
 * Top control bar with a preset picker followed by three fine-tuning dropdowns.
 * Picking a preset sets animation + speed + baseColor in one shot; tweaking any
 * individual dropdown shifts the preset display to "Custom".
 */
export function GlobalControls() {
  const settings = useSkeletonStore((s) => s.settings);
  const setSettings = useSkeletonStore((s) => s.setSettings);

  const activePreset = findPreset(settings);
  const presetValue = activePreset?.id ?? CUSTOM_SENTINEL;

  const handlePreset = (id: string) => {
    const preset = PRESETS.find((p) => p.id === id);
    if (preset) setSettings({ ...preset.settings });
  };

  return (
    <div className="flex flex-wrap items-center gap-4 px-4 py-3 border-b border-border text-sm">
      <LabeledSelect
        label="Preset"
        value={presetValue}
        options={[
          ...PRESETS.map((p) => ({ value: p.id, label: p.name })),
          ...(activePreset ? [] : [{ value: CUSTOM_SENTINEL, label: "Custom" }]),
        ]}
        onChange={handlePreset}
      />
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
