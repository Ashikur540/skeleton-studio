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
    settings: { animation: "pulse", speed: "normal", baseColor: "bg-zinc-200", cardBackground: "transparent" },
  },
  {
    id: "linear",
    name: "Linear",
    description: "Slow subtle shimmer, lighter fill",
    settings: { animation: "shimmer", speed: "slow", baseColor: "bg-zinc-100", cardBackground: "transparent" },
  },
  {
    id: "vercel",
    name: "Vercel",
    description: "Dark-mode optimized shimmer",
    settings: { animation: "shimmer", speed: "fast", baseColor: "bg-zinc-800", cardBackground: "transparent" },
  },
  {
    id: "notion",
    name: "Notion",
    description: "Gentle breathe on a warm fill",
    settings: { animation: "pulse", speed: "slow", baseColor: "bg-zinc-300", cardBackground: "transparent" },
  },
];

/**
 * Match the current motion settings against the preset list. Presets are a
 * motion bundle (animation + speed); baseColor and cardBackground are
 * independent user choices and intentionally excluded so changing color
 * doesn't drop the preset's active highlight.
 */
export function findPreset(
  settings: GlobalSettings,
): SkeletonPreset | undefined {
  return PRESETS.find(
    (p) =>
      p.settings.animation === settings.animation &&
      p.settings.speed === settings.speed,
  );
}
