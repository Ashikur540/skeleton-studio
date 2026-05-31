"use client";
import type { CSSProperties } from "react";
import type {
  Alignment,
  GlobalSettings,
  Justify,
  Padding,
  SkeletonNode,
} from "@/lib/ir/types";
import { CARD_BACKGROUND_CLASS } from "@/lib/exporters/card-background";

/** Map IR alignment tokens to CSS `align-items` values. */
const ALIGN_CSS: Record<Alignment, CSSProperties["alignItems"]> = {
  start: "flex-start",
  end: "flex-end",
  center: "center",
  stretch: "stretch",
  baseline: "baseline",
};

/** Map IR justify tokens to CSS `justify-content` values. */
const JUSTIFY_CSS: Record<Justify, CSSProperties["justifyContent"]> = {
  start: "flex-start",
  end: "flex-end",
  center: "center",
  between: "space-between",
  around: "space-around",
  evenly: "space-evenly",
};

/**
 * Copy layout hints (alignment, justify, wrap) from the IR onto an inline
 * style object. Centralised so containerStyles and surfaceWrapperStyles share
 * the same flex-property write-out without drifting.
 */
function applyFlexLayout(
  style: CSSProperties,
  layout: SkeletonNode["layout"],
): void {
  if (!layout) return;
  if (layout.alignItems) style.alignItems = ALIGN_CSS[layout.alignItems];
  if (layout.justifyContent) {
    style.justifyContent = JUSTIFY_CSS[layout.justifyContent];
  }
  if (layout.wrap !== undefined) {
    style.flexWrap = layout.wrap ? "wrap" : "nowrap";
  }
}

/**
 * Apply a Padding hint to an inline style object as four discrete side values
 * so explicit zeros (e.g. `pt-0`) actually override the wrapper-default that
 * sits below in the cascade. Returns `style` for fluent chaining.
 */
function applyPadding(
  style: CSSProperties,
  padding: Padding | undefined,
): CSSProperties {
  if (!padding) return style;
  if (padding.top !== undefined) style.paddingTop = padding.top;
  if (padding.right !== undefined) style.paddingRight = padding.right;
  if (padding.bottom !== undefined) style.paddingBottom = padding.bottom;
  if (padding.left !== undefined) style.paddingLeft = padding.left;
  return style;
}

/**
 * Default vertical gap between siblings when a container has children but the
 * source JSX gave no explicit flex/gap class. Matches the visual rhythm of the
 * card padding.
 */
const DEFAULT_CONTAINER_GAP = 8;

/**
 * Padding + sibling gap applied to a card that wraps children. Slightly larger
 * than the bare container gap so the wrapper feels distinct.
 */
const CARD_WRAPPER_PADDING = 16;
const CARD_WRAPPER_GAP = 12;

/**
 * Runtime styling for the live preview. Returns Tailwind utility classes for
 * STATIC concerns (animation, base colour, layout direction) plus an inline
 * `style` object for DYNAMIC dimensions. Tailwind v4 cannot generate CSS for
 * class names assembled at runtime (`w-[42px]`), so dynamic values must bypass
 * it via inline styles. The exporters keep using class strings because those
 * strings land in the user's codebase, where their Tailwind scanner sees them.
 */
export function blockStyles(
  node: SkeletonNode,
  settings: GlobalSettings,
): { className: string; style: CSSProperties } {
  if (isSurfaceWrapper(node)) {
    return surfaceWrapperStyles(node, settings);
  }
  if (node.kind === "container") {
    return containerStyles(node);
  }
  return fillStyles(node, settings);
}

/**
 * A node renders with card chrome (outline + default padding + radius) when
 * either (a) it is a `card` kind that wraps children, or (b) it is a
 * `container` that the parser tagged with `appearance: "card"` because the
 * source JSX carried bg-/border- utilities.
 */
function isSurfaceWrapper(node: SkeletonNode): boolean {
  if (node.kind === "card" && node.children && node.children.length > 0) {
    return true;
  }
  if (node.kind === "container" && node.appearance === "card") {
    return true;
  }
  return false;
}

/**
 * Style a structural container. Prefers CSS grid when the table-grid detector
 * stamped a `gridCols` template on the layout; otherwise uses flex with
 * explicit or default gap. Falls back to a vertical stack with a comfortable
 * gap when children exist without any flex/gap directive.
 */
function containerStyles(
  node: SkeletonNode,
): { className: string; style: CSSProperties } {
  const classes: string[] = [];
  const style: CSSProperties = {};

  if (node.layout?.gridCols) {
    classes.push("grid");
    style.gridTemplateColumns = node.layout.gridCols;
    if (node.layout.gap !== undefined) style.gap = node.layout.gap;
    applyFlexLayout(style, node.layout);
  } else if (node.layout) {
    classes.push("flex");
    classes.push(node.layout.direction === "row" ? "flex-row" : "flex-col");
    if (node.layout.gap !== undefined) style.gap = node.layout.gap;
    applyFlexLayout(style, node.layout);
  } else if (node.children && node.children.length > 0) {
    classes.push("flex", "flex-col");
    style.gap = DEFAULT_CONTAINER_GAP;
  }

  /* Dynamic dimension — bypasses Tailwind and lands as inline style.
     This is the path drag-to-resize writes through: patchNodeQuiet sets
     a numeric width, which blockStyles emits here. */
  if (node.width === "full") style.width = "100%";
  else if (typeof node.width === "number") style.width = node.width;
  if (typeof node.height === "number") style.height = node.height;
  applyPadding(style, node.padding);
  return { className: classes.join(" "), style };
}

/**
 * Style any node rendered as a card-like surface: a `card` kind wrapping
 * children, or a `container` flagged `appearance: "card"` by the visual-card
 * heuristic. Subtle outline + padding + radius so child skeletons remain
 * legible without fighting the wrapper. Class-hint padding overrides defaults
 * on a per-side basis; class-hint radius overrides the surface default.
 */
function surfaceWrapperStyles(
  node: SkeletonNode,
  settings: GlobalSettings,
): { className: string; style: CSSProperties } {
  const direction =
    node.layout?.direction === "row" ? "flex-row" : "flex-col";
  const classes = ["flex", direction, "ring-1", "ring-foreground/10"];
  const cardBg = CARD_BACKGROUND_CLASS[settings.cardBackground];
  if (cardBg) classes.push(cardBg);
  const style: CSSProperties = {
    paddingTop: CARD_WRAPPER_PADDING,
    paddingRight: CARD_WRAPPER_PADDING,
    paddingBottom: CARD_WRAPPER_PADDING,
    paddingLeft: CARD_WRAPPER_PADDING,
    gap: node.layout?.gap ?? CARD_WRAPPER_GAP,
  };
  if (node.width === "full") style.width = "100%";
  else if (typeof node.width === "number") style.width = node.width;
  if (typeof node.height === "number") style.height = node.height;
  if (typeof node.radius === "number") {
    style.borderRadius = node.radius >= 9999 ? 9999 : node.radius;
  }
  applyPadding(style, node.padding);
  applyFlexLayout(style, node.layout);
  return { className: classes.join(" "), style };
}

/**
 * Style an animated fill block (card without children, image, button, text,
 * input, avatar). Static animation classes plus inline dynamic dimensions —
 * the split avoids Tailwind v4's inability to scan runtime-built class names.
 */
function fillStyles(
  node: SkeletonNode,
  settings: GlobalSettings,
): { className: string; style: CSSProperties } {
  const classes: string[] = [settings.baseColor];
  const style: CSSProperties = {};

  const speedSeconds =
    settings.speed === "slow" ? 2 : settings.speed === "fast" ? 1 : 1.5;

  if (settings.animation === "pulse") {
    classes.push("animate-pulse");
    style.animationDuration = `${speedSeconds}s`;
  } else {
    // Shimmer keyframes live in app/globals.css; assign the full animation
    // shorthand inline so the runtime-built name resolves without depending
    // on a Tailwind class Tailwind never scanned.
    classes.push(
      "bg-gradient-to-r",
      "from-transparent",
      "via-white/40",
      "to-transparent",
    );
    style.backgroundSize = "200% 100%";
    style.animation = `shimmer ${speedSeconds}s linear infinite`;
  }

  if (node.width === "full") style.width = "100%";
  else if (typeof node.width === "number") style.width = node.width;
  if (typeof node.height === "number") style.height = node.height;
  if (typeof node.radius === "number") {
    style.borderRadius = node.radius >= 9999 ? 9999 : node.radius;
  }
  applyPadding(style, node.padding);

  return { className: classes.join(" "), style };
}
