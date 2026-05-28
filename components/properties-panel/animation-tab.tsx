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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { PRESETS, findPreset } from "@/lib/presets";

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
 * Animation tab of the properties panel. Absorbs the former GlobalControls bar
 * content — preset picker, animation type, speed, and base color — arranged
 * vertically with ToggleGroups for animation and speed, consistent with the
 * Design tab's section-based layout.
 */
export function AnimationTab() {
  const settings = useSkeletonStore((s) => s.settings);
  const setSettings = useSkeletonStore((s) => s.setSettings);

  const activePreset = findPreset(settings);
  const presetValue = activePreset?.id ?? CUSTOM_SENTINEL;

  const handlePreset = (id: string) => {
    const preset = PRESETS.find((p) => p.id === id);
    if (preset) setSettings({ ...preset.settings });
  };

  return (
    <div className="flex flex-col gap-1 pb-4">
      {/* PRESET section */}
      <div className="pt-3 pb-1">
        <span className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground">
          Preset
        </span>
      </div>
      <div className="flex flex-col gap-3 pt-1">
        <Select value={presetValue} onValueChange={handlePreset}>
          <SelectTrigger className="h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PRESETS.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
            {!activePreset && (
              <SelectItem value={CUSTOM_SENTINEL}>Custom</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* ANIMATION section */}
      <div className="pt-3 pb-1 mt-1 border-t border-border">
        <span className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground">
          Animation
        </span>
      </div>
      <div className="flex flex-col gap-3 pt-1">
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground w-12 shrink-0">Type</Label>
          <ToggleGroup
            type="single"
            value={settings.animation}
            onValueChange={(v) => {
              if (v) setSettings({ animation: v as "pulse" | "shimmer" });
            }}
            variant="outline"
            size="sm"
            spacing={0}
            className="flex-1"
          >
            <ToggleGroupItem value="pulse" className="flex-1 text-xs">Pulse</ToggleGroupItem>
            <ToggleGroupItem value="shimmer" className="flex-1 text-xs">Shimmer</ToggleGroupItem>
          </ToggleGroup>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground w-12 shrink-0">Speed</Label>
          <ToggleGroup
            type="single"
            value={settings.speed}
            onValueChange={(v) => {
              if (v) setSettings({ speed: v as "slow" | "normal" | "fast" });
            }}
            variant="outline"
            size="sm"
            spacing={0}
            className="flex-1"
          >
            <ToggleGroupItem value="slow" className="flex-1 text-xs">Slow</ToggleGroupItem>
            <ToggleGroupItem value="normal" className="flex-1 text-xs">Normal</ToggleGroupItem>
            <ToggleGroupItem value="fast" className="flex-1 text-xs">Fast</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {/* APPEARANCE section */}
      <div className="pt-3 pb-1 mt-1 border-t border-border">
        <span className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground">
          Appearance
        </span>
      </div>
      <div className="flex flex-col gap-3 pt-1">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Base color</Label>
          <Select
            value={settings.baseColor}
            onValueChange={(v) => setSettings({ baseColor: v })}
          >
            <SelectTrigger className="w-36 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BASE_COLORS.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
