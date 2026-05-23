import type { GlobalSettings, SkeletonNode } from "@/lib/ir/types";

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

/**
 * Converts a SkeletonNode + GlobalSettings into a Tailwind class string.
 * Container nodes emit layout-only classes (flex, direction, gap); leaf nodes
 * emit color, animation, dimensions, and border-radius classes.
 */
export function blockClasses(
  node: SkeletonNode,
  settings: GlobalSettings,
): string {
  const cls: string[] = [];

  if (node.kind === "container") {
    if (node.layout) {
      cls.push("flex");
      cls.push(node.layout.direction === "row" ? "flex-row" : "flex-col");
      if (node.layout.gap !== undefined) cls.push(`gap-[${node.layout.gap}px]`);
    }
    if (node.width === "full") cls.push("w-full");
    else if (typeof node.width === "number") cls.push(`w-[${node.width}px]`);
    if (typeof node.height === "number") cls.push(`h-[${node.height}px]`);
    return cls.join(" ").trim();
  }

  cls.push(settings.baseColor);

  if (settings.animation === "pulse") {
    cls.push("animate-pulse");
  } else {
    cls.push("animate-[shimmer_1.5s_linear_infinite]");
    cls.push("bg-gradient-to-r");
    cls.push("from-transparent");
    cls.push("via-white/40");
    cls.push("to-transparent");
    cls.push("bg-[length:200%_100%]");
  }
  cls.push(SPEED_MAP[settings.speed]);

  if (node.width === "full") cls.push("w-full");
  else if (typeof node.width === "number") cls.push(`w-[${node.width}px]`);

  if (typeof node.height === "number") cls.push(`h-[${node.height}px]`);

  if (typeof node.radius === "number") {
    cls.push(node.radius >= 9999 ? "rounded-full" : `rounded-[${node.radius}px]`);
  }

  return cls.join(" ").trim();
}
