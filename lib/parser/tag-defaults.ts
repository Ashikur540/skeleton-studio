import type { SkeletonKind, StyleHints } from "@/lib/ir/types";

/**
 * Describes the shape of a tag's fallback skeleton metadata.
 * Pairs a skeleton kind with default style hints (dimensions, radius) used when no Tailwind classes are found.
 */
export type TagDefault = {
  kind: SkeletonKind;
  defaults: StyleHints;
};

/**
 * Fallback dimensions and skeleton kind for common HTML tags.
 * Consulted by the parser when a tag has no Tailwind class hints; enables reasonable skeleton generation without class analysis.
 */
export const TAG_DEFAULTS: Record<string, TagDefault> = {
  h1: { kind: "text", defaults: { height: 32, width: "full", radius: 4 } },
  h2: { kind: "text", defaults: { height: 28, width: "full", radius: 4 } },
  h3: { kind: "text", defaults: { height: 24, width: "full", radius: 4 } },
  h4: { kind: "text", defaults: { height: 20, width: "full", radius: 4 } },
  h5: { kind: "text", defaults: { height: 18, width: "full", radius: 4 } },
  h6: { kind: "text", defaults: { height: 16, width: "full", radius: 4 } },
  p:  { kind: "paragraph", defaults: { height: 16, width: "full", radius: 4 } },
  span: { kind: "text", defaults: { height: 16, width: 80, radius: 4 } },
  a:    { kind: "text", defaults: { height: 16, width: 80, radius: 4 } },
  img:      { kind: "image", defaults: { width: 200, height: 150, radius: 8 } },
  button:   { kind: "button", defaults: { width: 100, height: 40, radius: 8 } },
  input:    { kind: "input", defaults: { width: 240, height: 40, radius: 6 } },
  textarea: { kind: "input", defaults: { width: 320, height: 80, radius: 6 } },
  select:   { kind: "input", defaults: { width: 200, height: 40, radius: 6 } },
  // Table elements — th/td become text cells; tr is a row-flow container, and
  // the wrapper tags (table/thead/tbody/tfoot) stack vertically. width:"full"
  // throughout the chain so cells distribute via flex-shrink instead of
  // cascading their width demand up to an unbounded ancestor.
  th: { kind: "text", defaults: { height: 16, width: "full", radius: 4 } },
  td: { kind: "text", defaults: { height: 16, width: "full", radius: 4 } },
  tr: { kind: "container", defaults: { direction: "row", gap: 12, width: "full" } },
  table:   { kind: "container", defaults: { direction: "col", gap: 8, width: "full" } },
  thead:   { kind: "container", defaults: { direction: "col", gap: 8, width: "full" } },
  tbody:   { kind: "container", defaults: { direction: "col", gap: 8, width: "full" } },
  tfoot:   { kind: "container", defaults: { direction: "col", gap: 8, width: "full" } },
  caption: { kind: "text", defaults: { height: 14, width: 120, radius: 4 } },
};

/**
 * Set of HTML tags that represent layout containers (flex/grid wrappers).
 * The parser skips generating skeleton content for these tags, treating them as structural-only containers.
 */
export const CONTAINER_TAGS = new Set([
  "div", "section", "article", "header", "footer", "main",
  "nav", "aside", "ul", "ol", "li", "form", "label",
]);

/**
 * Curated map of well-known React component identifiers to skeleton kind + defaults.
 * Higher precedence than the regex pattern matcher; reserve for component names whose
 * intent is unambiguous (Avatar, Card) or where the defaults differ meaningfully from
 * the generic suffix-based guess. shadcn Table primitives are registered explicitly
 * so each table layer (row vs cell vs caption) lands on the right kind and direction.
 */
export const COMPONENT_TAG_HINTS: Record<string, TagDefault> = {
  Avatar: { kind: "avatar", defaults: { width: 48, height: 48, radius: 9999 } },
  Card:   { kind: "card", defaults: { width: 320, height: 200, radius: 12 } },

  // shadcn / Radix Table primitives — match the HTML equivalents in semantics.
  // width:"full" propagates so cells share a bounded row width via flex-shrink.
  Table:         { kind: "container", defaults: { direction: "col", gap: 8, width: "full" } },
  TableHeader:   { kind: "container", defaults: { direction: "col", gap: 8, width: "full" } },
  TableBody:     { kind: "container", defaults: { direction: "col", gap: 8, width: "full" } },
  TableFooter:   { kind: "container", defaults: { direction: "col", gap: 8, width: "full" } },
  TableRow:      { kind: "container", defaults: { direction: "row", gap: 12, width: "full" } },
  // Cells use width:"full" so flex shrink distributes row width equally among
  // siblings — gives roughly aligned columns without a real grid layout.
  TableHead:     { kind: "text", defaults: { height: 16, width: "full", radius: 4 } },
  TableCell:     { kind: "text", defaults: { height: 16, width: "full", radius: 4 } },
  TableCaption:  { kind: "text", defaults: { height: 14, width: 160, radius: 4 } },
};
