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
 * Maps capitalised React component names to skeleton kinds for heuristic classification.
 * Allows the parser to infer skeleton type from component tags (e.g., <Avatar /> → "avatar") without explicit class hints.
 */
export const COMPONENT_TAG_HINTS: Record<string, SkeletonKind> = {
  Avatar: "avatar",
  Image:  "image",
  Img:    "image",
  Card:   "card",
  Button: "button",
  Input:  "input",
  TextField: "input",
  Heading:   "text",
  Paragraph: "paragraph",
};
