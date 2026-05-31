import type {
  Alignment,
  GlobalSettings,
  Justify,
  Padding,
  SkeletonNode,
} from "@/lib/ir/types";
import { CARD_BACKGROUND_CLASS } from "@/lib/exporters/card-background";

/**
 * Maps the user-facing speed setting to an arbitrary animation-duration
 * Tailwind utility class. Controls how fast the pulse/shimmer animates.
 */
const SPEED_MAP: Record<GlobalSettings["speed"], string> = {
  slow: "[animation-duration:2s]",
  normal: "[animation-duration:1.5s]",
  fast: "[animation-duration:1s]",
};

/**
 * The CSS keyframes string for shimmer animation that exporters inline
 * into their output when shimmer is selected. Stored here so both exporters
 * reference one source of truth.
 */
export const SHIMMER_KEYFRAMES = `@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position:  200% 0; }
}`;

/** Default gap between siblings when a container has children but no flex gap. */
const DEFAULT_CONTAINER_GAP = 8;
/** Default padding inside a card-like surface wrapper. */
const CARD_WRAPPER_PADDING = 16;
/** Default gap inside a card-like surface wrapper. */
const CARD_WRAPPER_GAP = 12;

/**
 * Tailwind spacing scale: px value → class suffix. Values not in this map
 * fall back to arbitrary `[Npx]` notation.
 */
const SPACING: Record<number, string> = {
  0: "0", 1: "px", 2: "0.5", 4: "1", 6: "1.5", 8: "2", 10: "2.5",
  12: "3", 14: "3.5", 16: "4", 20: "5", 24: "6", 28: "7", 32: "8",
  36: "9", 40: "10", 44: "11", 48: "12", 56: "14", 64: "16", 80: "20",
  96: "24", 112: "28", 128: "32", 144: "36", 160: "40", 176: "44",
  192: "48", 208: "52", 224: "56", 240: "60", 256: "64", 288: "72",
  320: "80", 384: "96",
};

/**
 * Tailwind border-radius scale: px value → full class.
 */
const RADIUS: Record<number, string> = {
  0: "rounded-none", 2: "rounded-sm", 4: "rounded", 6: "rounded-md",
  8: "rounded-lg", 12: "rounded-xl", 16: "rounded-2xl", 24: "rounded-3xl",
};

/** Emit a spacing utility like `gap-2` or `gap-[7px]`. */
function sp(prefix: string, px: number): string {
  const native = SPACING[px];
  return native !== undefined ? `${prefix}-${native}` : `${prefix}-[${px}px]`;
}

const ALIGN_CLS: Record<Alignment, string> = {
  start: "items-start",
  end: "items-end",
  center: "items-center",
  stretch: "items-stretch",
  baseline: "items-baseline",
};

const JUSTIFY_CLS: Record<Justify, string> = {
  start: "justify-start",
  end: "justify-end",
  center: "justify-center",
  between: "justify-between",
  around: "justify-around",
  evenly: "justify-evenly",
};

/**
 * Convert a SkeletonNode + GlobalSettings into a Tailwind class string for
 * the exported skeleton code. Routes through three paths (surface wrapper /
 * structural container / animated fill) so the exported output mirrors the
 * runtime preview without duplicating per-property logic.
 */
export function blockClasses(
  node: SkeletonNode,
  settings: GlobalSettings,
): string {
  if (isSurfaceWrapper(node)) return surfaceClasses(node, settings);
  if (node.kind === "container") return containerClasses(node);
  return fillClasses(node, settings);
}

/**
 * Predicate: should this node render as a card-like surface (outline + padding
 * + radius) rather than a transparent flex wrapper? True for card kinds that
 * wrap children and for containers the parser flagged with appearance="card".
 */
function isSurfaceWrapper(node: SkeletonNode): boolean {
  if (node.kind === "card" && node.children && node.children.length > 0) {
    return true;
  }
  if (node.kind === "container" && node.appearance === "card") return true;
  return false;
}

/**
 * Build class list for a card-like surface wrapper: outline ring, default
 * padding (overridable per side), default gap, optional explicit dims +
 * radius, plus alignment carried from layout.
 */
function surfaceClasses(node: SkeletonNode, settings: GlobalSettings): string {
  const dir = node.layout?.direction === "row" ? "flex-row" : "flex-col";
  const gap = node.layout?.gap ?? CARD_WRAPPER_GAP;
  const cls = ["flex", dir, "ring-1", "ring-foreground/10", sp("gap", gap)];
  const cardBg = CARD_BACKGROUND_CLASS[settings.cardBackground];
  if (cardBg) cls.push(cardBg);
  pushSurfacePadding(cls, node.padding);
  cls.push(...dimensionClasses(node));
  pushRadius(cls, node);
  cls.push(...alignmentClasses(node.layout));
  return cls.join(" ").trim();
}

/**
 * Build class list for a structural container. Uses CSS grid when the
 * table-grid detector stamped a `gridCols` template; otherwise flex. Default
 * vertical stack with comfortable gap when children exist without explicit
 * layout. No surface chrome.
 */
function containerClasses(node: SkeletonNode): string {
  const cls: string[] = [];
  if (node.layout?.gridCols) {
    const colsValue = node.layout.gridCols.replace(/ /g, "_");
    cls.push("grid", `grid-cols-[${colsValue}]`);
    if (node.layout.gap !== undefined) {
      cls.push(sp("gap", node.layout.gap));
    }
    cls.push(...alignmentClasses(node.layout));
  } else if (node.layout) {
    cls.push("flex");
    cls.push(node.layout.direction === "row" ? "flex-row" : "flex-col");
    if (node.layout.gap !== undefined) {
      cls.push(sp("gap", node.layout.gap));
    }
    cls.push(...alignmentClasses(node.layout));
  } else if (node.children && node.children.length > 0) {
    cls.push("flex", "flex-col", sp("gap", DEFAULT_CONTAINER_GAP));
  }
  cls.push(...dimensionClasses(node));
  cls.push(...paddingClasses(node.padding));
  return cls.join(" ").trim();
}

/**
 * Build class list for an animated fill block (text, paragraph line, button,
 * image, avatar, leaf card). baseColor + animation + dimensions + optional
 * radius and padding. The animation class uses pulse or shimmer depending on
 * the user's selection.
 */
function fillClasses(node: SkeletonNode, settings: GlobalSettings): string {
  const cls: string[] = [settings.baseColor];
  if (settings.animation === "pulse") {
    cls.push("animate-pulse");
  } else {
    cls.push(
      "animate-[shimmer_1.5s_linear_infinite]",
      "bg-gradient-to-r",
      "from-transparent",
      "via-white/40",
      "to-transparent",
      "bg-[length:200%_100%]",
    );
  }
  cls.push(SPEED_MAP[settings.speed]);
  cls.push(...dimensionClasses(node));
  pushRadius(cls, node);
  cls.push(...paddingClasses(node.padding));
  return cls.join(" ").trim();
}

/**
 * Emit Tailwind utility classes for per-side padding. Only sides that are set
 * produce classes; explicit zeros render as `pt-[0px]` so they can override
 * any wrapper default the consumer might be merging in.
 */
export function paddingClasses(p: Padding | undefined): string[] {
  if (!p) return [];
  const out: string[] = [];
  if (p.top !== undefined) out.push(sp("pt", p.top));
  if (p.right !== undefined) out.push(sp("pr", p.right));
  if (p.bottom !== undefined) out.push(sp("pb", p.bottom));
  if (p.left !== undefined) out.push(sp("pl", p.left));
  return out;
}

/**
 * Push four per-side padding classes onto the class list with the surface
 * wrapper default filling any side the node didn't pin. Separate from
 * `paddingClasses` because surfaces always render four sides (defaults
 * included), whereas plain containers/fills only emit explicitly-set sides.
 */
function pushSurfacePadding(cls: string[], p: Padding | undefined): void {
  cls.push(sp("pt", p?.top ?? CARD_WRAPPER_PADDING));
  cls.push(sp("pr", p?.right ?? CARD_WRAPPER_PADDING));
  cls.push(sp("pb", p?.bottom ?? CARD_WRAPPER_PADDING));
  cls.push(sp("pl", p?.left ?? CARD_WRAPPER_PADDING));
}

/**
 * Emit width + height utility classes. `width === "full"` becomes `w-full`
 * (kept as the readable preset rather than `w-[100%]`); numeric values use
 * the arbitrary `[Npx]` form so any pixel value survives Tailwind's scanner.
 */
function dimensionClasses(node: SkeletonNode): string[] {
  const out: string[] = [];
  if (node.width === "full") out.push("w-full");
  else if (typeof node.width === "number") out.push(sp("w", node.width));
  if (typeof node.height === "number") out.push(sp("h", node.height));
  return out;
}

/**
 * Append a radius class. Treats radius >= 9999 as `rounded-full`; any other
 * numeric value emits `rounded-[Npx]` so even unusual values land verbatim.
 */
function pushRadius(cls: string[], node: SkeletonNode): void {
  if (typeof node.radius !== "number") return;
  if (node.radius >= 9999) { cls.push("rounded-full"); return; }
  const native = RADIUS[node.radius];
  cls.push(native ?? `rounded-[${node.radius}px]`);
}

/**
 * Emit items- / justify- / flex-wrap utility classes when their layout hints
 * are present. Returns an empty array when nothing to add so callers can
 * safely spread the result into their own class list.
 */
function alignmentClasses(layout: SkeletonNode["layout"]): string[] {
  if (!layout) return [];
  const out: string[] = [];
  if (layout.alignItems) out.push(ALIGN_CLS[layout.alignItems]);
  if (layout.justifyContent) out.push(JUSTIFY_CLS[layout.justifyContent]);
  if (layout.wrap !== undefined) {
    out.push(layout.wrap ? "flex-wrap" : "flex-nowrap");
  }
  return out;
}
