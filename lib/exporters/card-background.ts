import type { CardBackground } from "@/lib/ir/types";

/**
 * Single source of truth mapping the semantic CardBackground enum to a
 * Tailwind class string. Values use theme-aware shadcn tokens so the same
 * setting renders correctly in both light and dark mode. The empty string
 * for "transparent" lets callers append unconditionally without producing
 * stray whitespace in the output.
 */
export const CARD_BACKGROUND_CLASS: Record<CardBackground, string> = {
  transparent: "",
  subtle: "bg-muted/20",
  soft: "bg-muted/40",
  elevated: "bg-card",
};

/**
 * Display labels paired with each enum value for the properties-panel select.
 * Kept colocated with the class map so adding a new option requires only one
 * edit site.
 */
export const CARD_BACKGROUND_LABEL: Record<CardBackground, string> = {
  transparent: "Transparent",
  subtle: "Subtle",
  soft: "Soft",
  elevated: "Elevated",
};

/**
 * Ordered list of all CardBackground values, used to populate the select in
 * presentation order. Mirrors the visual progression from no fill to most
 * pronounced surface.
 */
export const CARD_BACKGROUND_VALUES: CardBackground[] = [
  "transparent",
  "subtle",
  "soft",
  "elevated",
];
