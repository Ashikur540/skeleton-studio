import type { LayoutDirection, StyleHints } from "@/lib/ir/types";

/**
 * Maps Tailwind spacing scale tokens (0, 0.5, 1, etc.) to pixel values.
 * Used to resolve w-*, h-*, and gap-* utilities into concrete dimensions.
 */
const SPACING_MAP: Record<string, number> = {
  "0": 0, "0.5": 2, "1": 4, "1.5": 6, "2": 8, "2.5": 10, "3": 12, "3.5": 14,
  "4": 16, "5": 20, "6": 24, "7": 28, "8": 32, "9": 36, "10": 40, "11": 44,
  "12": 48, "14": 56, "16": 64, "20": 80, "24": 96, "28": 112, "32": 128,
  "36": 144, "40": 160, "44": 176, "48": 192, "52": 208, "56": 224,
  "60": 240, "64": 256, "72": 288, "80": 320, "96": 384,
};

/**
 * Maps Tailwind rounded-* keywords (none, sm, lg, full, etc.) to pixel radius values.
 * Empty string maps to the default rounded radius (4px).
 */
const RADIUS_MAP: Record<string, number> = {
  none: 0,
  sm: 2,
  "": 4,
  md: 6,
  lg: 8,
  xl: 12,
  "2xl": 16,
  "3xl": 24,
  full: 9999,
};

/**
 * Parses arbitrary bracket notation values (e.g., "240px", "2rem") into pixels.
 * Returns undefined if the value cannot be parsed.
 */
function arbitraryToPx(value: string): number | undefined {
  const m = value.match(/^(\d+(?:\.\d+)?)(px|rem)?$/);
  if (!m) return undefined;
  const n = parseFloat(m[1]);
  if (m[2] === "rem") return n * 16;
  return n;
}

/**
 * Extracts layout and style hints from a Tailwind className string.
 * Reads width, height, radius, gap, and flex direction; ignores responsive
 * and state modifiers (md:, dark:) and unknown utility classes.
 */
export function readClasses(className: string): Partial<StyleHints> {
  const hints: Partial<StyleHints> = {};
  const tokens = className.split(/\s+/).filter(Boolean);

  let sawFlex = false;
  let sawDirection: LayoutDirection | null = null;

  for (const t of tokens) {
    if (t.includes(":")) continue; // skip modifiers

    if (t === "w-full") {
      hints.width = "full";
      continue;
    }
    if (t.startsWith("w-[") && t.endsWith("]")) {
      const v = arbitraryToPx(t.slice(3, -1));
      if (v !== undefined) hints.width = v;
      continue;
    }
    if (t.startsWith("w-")) {
      const v = SPACING_MAP[t.slice(2)];
      if (v !== undefined) hints.width = v;
      continue;
    }

    if (t.startsWith("h-[") && t.endsWith("]")) {
      const v = arbitraryToPx(t.slice(3, -1));
      if (v !== undefined) hints.height = v;
      continue;
    }
    if (t.startsWith("h-") && t !== "h-full") {
      const v = SPACING_MAP[t.slice(2)];
      if (v !== undefined) hints.height = v;
      continue;
    }

    if (t === "rounded") {
      hints.radius = RADIUS_MAP[""];
      continue;
    }
    if (t.startsWith("rounded-[") && t.endsWith("]")) {
      const v = arbitraryToPx(t.slice(9, -1));
      if (v !== undefined) hints.radius = v;
      continue;
    }
    if (t.startsWith("rounded-")) {
      const v = RADIUS_MAP[t.slice("rounded-".length)];
      if (v !== undefined) hints.radius = v;
      continue;
    }

    if (t.startsWith("gap-")) {
      const v = SPACING_MAP[t.slice(4)];
      if (v !== undefined) hints.gap = v;
      continue;
    }

    if (t === "flex") {
      sawFlex = true;
      continue;
    }
    if (t === "flex-row") {
      sawDirection = "row";
      continue;
    }
    if (t === "flex-col") {
      sawDirection = "col";
      continue;
    }
  }

  if (sawDirection) hints.direction = sawDirection;
  else if (sawFlex) hints.direction = "row";

  return hints;
}
