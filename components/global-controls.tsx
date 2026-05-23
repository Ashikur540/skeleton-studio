"use client";
import { useSkeletonStore } from "@/store/use-skeleton-store";

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
 * Top control bar exposing the four global render settings: animation style,
 * animation speed, base fill color, and preview theme. All changes flow through
 * setSettings into the Zustand store and automatically propagate to the preview
 * renderer and both exporters without additional wiring.
 */
export function GlobalControls() {
  const settings = useSkeletonStore((s) => s.settings);
  const setSettings = useSkeletonStore((s) => s.setSettings);

  return (
    <div className="flex flex-wrap items-center gap-4 px-4 py-3 border-b border-border text-sm">
      <Select
        label="Animation"
        value={settings.animation}
        options={[
          { value: "pulse", label: "Pulse" },
          { value: "shimmer", label: "Shimmer" },
        ]}
        onChange={(v) => setSettings({ animation: v as "pulse" | "shimmer" })}
      />
      <Select
        label="Speed"
        value={settings.speed}
        options={[
          { value: "slow", label: "Slow" },
          { value: "normal", label: "Normal" },
          { value: "fast", label: "Fast" },
        ]}
        onChange={(v) => setSettings({ speed: v as "slow" | "normal" | "fast" })}
      />
      <Select
        label="Base color"
        value={settings.baseColor}
        options={BASE_COLORS}
        onChange={(v) => setSettings({ baseColor: v })}
      />
      <Select
        label="Theme"
        value={settings.theme}
        options={[
          { value: "light", label: "Light" },
          { value: "dark", label: "Dark" },
        ]}
        onChange={(v) => setSettings({ theme: v as "light" | "dark" })}
      />
    </div>
  );
}

/**
 * Small labeled native select used across the control bar. Kept component-local
 * because no other file needs a labeled select yet; extract to a shared UI file
 * if a second use site appears.
 */
function Select({
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
    <label className="flex items-center gap-2 text-muted-foreground">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-2 py-1 rounded bg-card border border-border text-foreground"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
