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
import {
  CARD_BACKGROUND_LABEL,
  CARD_BACKGROUND_VALUES,
} from "@/lib/exporters/card-background";
import type { CardBackground } from "@/lib/ir/types";
import { cn } from "@/lib/utils";

const BASE_COLORS: { value: string; label: string }[] = [
  { value: "bg-zinc-100", label: "Zinc 100" },
  { value: "bg-zinc-200", label: "Zinc 200" },
  { value: "bg-zinc-300", label: "Zinc 300" },
  { value: "bg-zinc-800", label: "Zinc 800" },
  { value: "bg-blue-200", label: "Blue 200" },
  { value: "bg-blue-900/40", label: "Blue 900/40" },
];

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

  /* Preset = motion bundle only. Switching presets preserves the user's
     baseColor and cardBackground so an explicit color choice survives a
     preset change. */
  const handlePreset = (id: string) => {
    const preset = PRESETS.find((p) => p.id === id);
    if (preset) {
      setSettings({
        animation: preset.settings.animation,
        speed: preset.settings.speed,
      });
    }
  };

  return (
    <div className="flex flex-col gap-1 pb-4">
      {/* PRESET section */}
      <div className="pt-3 pb-1">
        <span className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground">
          Preset
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 pt-1">
        {PRESETS.map((p) => {
          const isActive = activePreset?.id === p.id;
          const speedSec =
            p.settings.speed === "slow"
              ? 2
              : p.settings.speed === "fast"
                ? 1
                : 1.5;
          const isShimmer = p.settings.animation === "shimmer";
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => handlePreset(p.id)}
              className={cn(
                "group flex flex-col items-stretch gap-2 rounded-lg border p-2 text-left transition-colors",
                isActive
                  ? "border-primary bg-primary/5 ring-1 ring-primary/40"
                  : "border-border bg-muted/30 hover:bg-muted/50",
              )}
              title={p.description}
            >
              <div className="h-7 rounded-md bg-muted/60 flex items-center justify-center overflow-hidden">
                <div
                  className={cn(
                    "h-3 w-12 rounded-sm",
                    settings.baseColor,
                    isShimmer
                      ? "bg-gradient-to-r from-transparent via-white/40 to-transparent"
                      : "animate-pulse",
                  )}
                  style={
                    isShimmer
                      ? {
                          backgroundSize: "200% 100%",
                          animation: `shimmer ${speedSec}s linear infinite`,
                        }
                      : { animationDuration: `${speedSec}s` }
                  }
                />
              </div>
              <span
                className={cn(
                  "text-[11px] font-mono lowercase text-center",
                  isActive ? "text-primary" : "text-muted-foreground",
                )}
              >
                {p.name}
              </span>
            </button>
          );
        })}
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
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Card background</Label>
          <Select
            value={settings.cardBackground}
            onValueChange={(v) =>
              setSettings({ cardBackground: v as CardBackground })
            }
          >
            <SelectTrigger className="w-36 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CARD_BACKGROUND_VALUES.map((v) => (
                <SelectItem key={v} value={v}>
                  {CARD_BACKGROUND_LABEL[v]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
