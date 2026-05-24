import type { Archetype, SkeletonNode } from "@/lib/ir/types";

/**
 * Recursively walk a classified IR tree and annotate every container/card
 * subtree that matches a known UI archetype. Tunes spacing/alignment defaults
 * to the archetype's convention but never overrides values already pinned by
 * Tailwind classes or earlier classification — explicit user signal wins.
 */
export function detectArchetypes(node: SkeletonNode, depth = 0): void {
  if (node.children) {
    for (const c of node.children) detectArchetypes(c, depth + 1);
  }
  if (node.kind !== "container" && node.kind !== "card") return;

  const archetype = detect(node, depth);
  if (!archetype) return;
  node.archetype = archetype;
  tune(node, archetype);
}

/**
 * Run the pattern matchers in priority order and return the first archetype
 * that fits. Order matters: media-object and form-field are strong shape
 * signals; hero/nav-bar/grid/card patterns are weaker so they trail.
 */
function detect(node: SkeletonNode, depth: number): Archetype | undefined {
  const c = node.children;
  if (!c || c.length === 0) return undefined;

  if (isMediaObject(c)) return "media-object";
  if (isFormField(c)) return "form-field";
  if (isStatTile(node, c)) return "stat-tile";
  if (isPricingCard(node, c)) return "pricing-card";
  if (isHero(node, c, depth)) return "hero";
  if (isNavBar(node, c, depth)) return "nav-bar";
  if (isCardGrid(c)) return "card-grid";
  return undefined;
}

/**
 * Match the classic "thumbnail + text stack" pattern. First child must be a
 * round avatar / image / small square card (the media); siblings must be text
 * blocks or a single content container holding text.
 */
function isMediaObject(c: SkeletonNode[]): boolean {
  if (c.length < 2) return false;
  if (!isAvatarLike(c[0])) return false;
  return c.slice(1).every((x) => isTextLike(x) || x.kind === "container");
}

/**
 * Accept a node as a media-object anchor: explicit avatar/image kind, or a
 * small square card with high radius (the leaf-promotion shape for an empty
 * `<div className="w-12 h-12 rounded-full" />`).
 */
function isAvatarLike(n: SkeletonNode): boolean {
  if (n.kind === "avatar" || n.kind === "image") return true;
  if (
    n.kind === "card" &&
    typeof n.width === "number" &&
    typeof n.height === "number" &&
    Math.abs(n.width - n.height) <= 8 &&
    (n.radius ?? 0) >= 100 &&
    n.width <= 96
  ) {
    return true;
  }
  return false;
}

/**
 * Predicate for text / paragraph / button leaves used to recognise content
 * siblings without dragging structural containers into the match.
 */
function isTextLike(n: SkeletonNode): boolean {
  return n.kind === "text" || n.kind === "paragraph";
}

/**
 * Match a single label + input pair stacked vertically. Two children only —
 * adding helper text bumps the node out of this archetype into the broader
 * form-section territory (handled by Form/FormItem default hints instead).
 */
function isFormField(c: SkeletonNode[]): boolean {
  if (c.length !== 2) return false;
  const [label, control] = c;
  return label.kind === "text" && control.kind === "input";
}

/**
 * Match a hero block: a short stack with a tall heading (height >= 24) and a
 * supporting paragraph or button. Restricted to shallow depths so deep
 * decorative h1 + p pairs inside cards don't get hero spacing applied.
 */
function isHero(node: SkeletonNode, c: SkeletonNode[], depth: number): boolean {
  if (depth > 2) return false;
  if (c.length < 2 || c.length > 5) return false;
  const hasHeading = c.some(
    (x) => x.kind === "text" && (x.height ?? 0) >= 24,
  );
  const hasSupport = c.some(
    (x) => x.kind === "paragraph" || x.kind === "button",
  );
  // Exclude card surfaces — a hero is a top-level page section, not a card.
  if (node.kind === "card" || node.appearance === "card") return false;
  return hasHeading && hasSupport;
}

/**
 * Match a navigation bar: a row container near the root with at least one
 * button and ≥ 2 children. Catches the logo + links + CTA shape without
 * requiring a specific child count, since real nav bars vary widely.
 */
function isNavBar(
  node: SkeletonNode,
  c: SkeletonNode[],
  depth: number,
): boolean {
  if (depth > 1) return false;
  if (node.layout?.direction !== "row") return false;
  if (c.length < 2) return false;
  return c.some((x) => x.kind === "button");
}

/**
 * Match a card grid: every direct child renders as a card-like surface
 * (kind=card or appearance=card) and there are at least two of them. Triggers
 * wrap + larger gap so subsequent rhythm-variance work has a clear target.
 */
function isCardGrid(c: SkeletonNode[]): boolean {
  if (c.length < 2) return false;
  return c.every((x) => x.kind === "card" || x.appearance === "card");
}

/**
 * Match a stat tile: a card surface holding a short caption + a tall display
 * number, both as text blocks. Distinct from generic two-child cards because
 * the size disparity is the giveaway (small label above big metric).
 */
function isStatTile(node: SkeletonNode, c: SkeletonNode[]): boolean {
  if (node.kind !== "card" && node.appearance !== "card") return false;
  if (c.length !== 2) return false;
  const hasSmall = c.some(
    (x) => x.kind === "text" && (x.height ?? 0) <= 16,
  );
  const hasBig = c.some(
    (x) => x.kind === "text" && (x.height ?? 0) >= 24,
  );
  return hasSmall && hasBig;
}

/**
 * Match a pricing card: a card surface containing a title, a button (the CTA),
 * and either a bullet-list-shaped container or at least four total children
 * (the bullet list expressed inline). Looser than stat-tile on purpose so the
 * common "title + price + features + cta" layouts all qualify.
 */
function isPricingCard(node: SkeletonNode, c: SkeletonNode[]): boolean {
  if (node.kind !== "card" && node.appearance !== "card") return false;
  if (c.length < 3) return false;
  const hasTitle = c.some(
    (x) => x.kind === "text" && (x.height ?? 0) >= 18,
  );
  const hasCta = c.some((x) => x.kind === "button");
  const hasList = c.some(
    (x) =>
      x.kind === "container" &&
      (x.children?.length ?? 0) >= 2 &&
      x.layout?.direction === "col",
  );
  return hasTitle && hasCta && (hasList || c.length >= 4);
}

/**
 * Apply archetype-specific spacing/alignment refinements. Only fills in fields
 * that were left unset by classification — `??=` everywhere so a user-pinned
 * `gap-4` always survives. Direction is only forced when classify produced no
 * layout at all (i.e. the source JSX had no flex hint to begin with).
 */
function tune(node: SkeletonNode, archetype: Archetype): void {
  const noLayout = !node.layout;
  if (!node.layout) node.layout = { direction: "col" };
  switch (archetype) {
    case "media-object":
      if (noLayout) node.layout.direction = "row";
      node.layout.alignItems ??= "center";
      node.layout.gap ??= 12;
      break;
    case "form-field":
      if (noLayout) node.layout.direction = "col";
      node.layout.gap ??= 6;
      break;
    case "hero":
      if (noLayout) node.layout.direction = "col";
      node.layout.gap ??= 24;
      node.layout.alignItems ??= "start";
      break;
    case "nav-bar":
      node.layout.alignItems ??= "center";
      node.layout.justifyContent ??= "between";
      node.layout.gap ??= 24;
      break;
    case "card-grid":
      if (noLayout) node.layout.direction = "row";
      node.layout.gap ??= 16;
      node.layout.wrap ??= true;
      break;
    case "stat-tile":
      if (noLayout) node.layout.direction = "col";
      node.layout.gap ??= 4;
      break;
    case "pricing-card":
      if (noLayout) node.layout.direction = "col";
      node.layout.gap ??= 16;
      break;
  }
}
