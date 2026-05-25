import type { GlobalSettings } from "@/lib/ir/types";

/**
 * Named bundle of animation + speed + baseColor that can be applied as a
 * single pick in the controls bar. Presets exist purely for convenience —
 * individual settings always override after selection.
 */
export type SkeletonPreset = {
  id: string;
  name: string;
  description: string;
  settings: GlobalSettings;
};

/**
 * Curated preset collection. Each entry produces a visually distinct skeleton
 * style; base-color strings appear literally so Tailwind v4's content scanner
 * can detect and generate the required CSS.
 */
export const PRESETS: SkeletonPreset[] = [
  {
    id: "tailwind",
    name: "Tailwind",
    description: "Standard opacity pulse",
    settings: { animation: "pulse", speed: "normal", baseColor: "bg-zinc-200" },
  },
  {
    id: "shimmer",
    name: "Shimmer",
    description: "Gradient sweep left-to-right",
    settings: { animation: "shimmer", speed: "normal", baseColor: "bg-zinc-200" },
  },
  {
    id: "linear",
    name: "Linear",
    description: "Slow subtle shimmer, lighter fill",
    settings: { animation: "shimmer", speed: "slow", baseColor: "bg-zinc-100" },
  },
  {
    id: "vercel",
    name: "Vercel",
    description: "Dark-mode optimized shimmer",
    settings: { animation: "shimmer", speed: "fast", baseColor: "bg-zinc-800" },
  },
  {
    id: "notion",
    name: "Notion",
    description: "Gentle breathe on a warm fill",
    settings: { animation: "pulse", speed: "slow", baseColor: "bg-zinc-300" },
  },
];

/**
 * Match the current settings against the preset list. Returns the matching
 * preset when all three fields (animation, speed, baseColor) agree, or
 * undefined when the user has manually diverged.
 */
export function findPreset(
  settings: GlobalSettings,
): SkeletonPreset | undefined {
  return PRESETS.find(
    (p) =>
      p.settings.animation === settings.animation &&
      p.settings.speed === settings.speed &&
      p.settings.baseColor === settings.baseColor,
  );
}
