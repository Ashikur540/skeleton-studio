"use client";
import type { CSSProperties } from "react";
import type { GlobalSettings, SkeletonNode } from "@/lib/ir/types";

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
  if (node.kind === "container") {
    const classes: string[] = [];
    const style: CSSProperties = {};
    if (node.layout) {
      classes.push("flex");
      classes.push(node.layout.direction === "row" ? "flex-row" : "flex-col");
      if (node.layout.gap !== undefined) style.gap = node.layout.gap;
    }
    if (node.width === "full") style.width = "100%";
    else if (typeof node.width === "number") style.width = node.width;
    if (typeof node.height === "number") style.height = node.height;
    return { className: classes.join(" "), style };
  }

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

  return { className: classes.join(" "), style };
}
