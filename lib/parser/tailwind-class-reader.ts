import type {
  Alignment,
  Justify,
  LayoutDirection,
  Padding,
  StyleHints,
} from "@/lib/ir/types";

/** Tailwind items-* suffix → flex `align-items` token in our IR. */
const ALIGN_TOKENS: Record<string, Alignment> = {
  start: "start",
  end: "end",
  center: "center",
  stretch: "stretch",
  baseline: "baseline",
};

/** Tailwind justify-* suffix → flex `justify-content` token in our IR. */
const JUSTIFY_TOKENS: Record<string, Justify> = {
  start: "start",
  end: "end",
  center: "center",
  between: "between",
  around: "around",
  evenly: "evenly",
};

type PaddingSide = "top" | "right" | "bottom" | "left" | "x" | "y" | "all";

/**
 * Mutate a Padding object in place by applying a pixel value to the requested
 * side(s). Encapsulates the shorthand expansion (`x` → left+right, `y` →
 * top+bottom, `all` → all four) so the token loop stays linear.
 */
function setPadding(p: Padding, side: PaddingSide, px: number): void {
  if (side === "all" || side === "y" || side === "top") p.top = px;
  if (side === "all" || side === "y" || side === "bottom") p.bottom = px;
  if (side === "all" || side === "x" || side === "left") p.left = px;
  if (side === "all" || side === "x" || side === "right") p.right = px;
}

/** Map a Tailwind padding prefix to the side(s) it controls. */
const PADDING_PREFIX: Record<string, PaddingSide> = {
  p: "all",
  px: "x",
  py: "y",
  pt: "top",
  pr: "right",
  pb: "bottom",
  pl: "left",
};

/** Map a Tailwind margin prefix to the side(s) it controls. */
const MARGIN_PREFIX: Record<string, PaddingSide> = {
  m: "all",
  mx: "x",
  my: "y",
  mt: "top",
  mr: "right",
  mb: "bottom",
  ml: "left",
};

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
 * Identify Tailwind utilities that signal a *visual surface* — a backdrop or
 * full-border that turns a plain wrapper into a card-like region. Side-only
 * borders (border-t, border-l-2, etc.) are intentionally excluded since they
 * read as dividers, not surfaces. Gradients are also excluded for now —
 * the renderer doesn't paint gradients yet, so flagging would be misleading.
 */
function isSurfaceToken(t: string): boolean {
  if (t.startsWith("bg-") && !t.startsWith("bg-gradient-")) return true;
  if (t === "border") return true;
  if (t.startsWith("border-")) {
    const after = t.slice("border-".length);
    // Side-specific borders begin with a single-letter side (t/r/b/l/x/y)
    // followed by either '-' or end of string. Treat those as dividers.
    if (/^[trblxy](?:$|-)/.test(after)) return false;
    return true;
  }
  return false;
}

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

    const paddingMatch = t.match(/^(p|px|py|pt|pr|pb|pl)-(.+)$/);
    if (paddingMatch) {
      const prefix = paddingMatch[1];
      const valueToken = paddingMatch[2];
      const side = PADDING_PREFIX[prefix];
      let px: number | undefined;
      if (valueToken.startsWith("[") && valueToken.endsWith("]")) {
        px = arbitraryToPx(valueToken.slice(1, -1));
      } else {
        px = SPACING_MAP[valueToken];
      }
      if (px !== undefined) {
        hints.padding ??= {};
        setPadding(hints.padding, side, px);
      }
      continue;
    }

    const marginMatch = t.match(/^(m|mx|my|mt|mr|mb|ml)-(.+)$/);
    if (marginMatch) {
      const prefix = marginMatch[1];
      const valueToken = marginMatch[2];
      const side = MARGIN_PREFIX[prefix];
      let px: number | undefined;
      if (valueToken.startsWith("[") && valueToken.endsWith("]")) {
        px = arbitraryToPx(valueToken.slice(1, -1));
      } else {
        px = SPACING_MAP[valueToken];
      }
      if (px !== undefined) {
        hints.margin ??= {};
        setPadding(hints.margin, side, px);
      }
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
    if (t === "flex-wrap") {
      hints.wrap = true;
      continue;
    }
    if (t === "flex-nowrap") {
      hints.wrap = false;
      continue;
    }
    if (t.startsWith("items-")) {
      const v = ALIGN_TOKENS[t.slice("items-".length)];
      if (v) hints.alignItems = v;
      continue;
    }
    if (t.startsWith("justify-")) {
      const v = JUSTIFY_TOKENS[t.slice("justify-".length)];
      if (v) hints.justifyContent = v;
      continue;
    }

    if (isSurfaceToken(t)) {
      hints.surface = "card";
      continue;
    }

    if (
      t === "absolute" ||
      t === "fixed" ||
      t === "relative" ||
      t === "sticky"
    ) {
      hints.position = t;
      continue;
    }
  }

  if (sawDirection) hints.direction = sawDirection;
  else if (sawFlex) hints.direction = "row";

  return hints;
}
