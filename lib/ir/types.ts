/**
 * Closed set of skeleton block flavors. `container` is structural-only
 * (flex/grid wrapper, no fill). All other kinds render as filled placeholders.
 */
export type SkeletonKind =
  | "text"
  | "paragraph"
  | "avatar"
  | "image"
  | "button"
  | "card"
  | "input"
  | "container";

/**
 * How confident the parser is in a node's dimensions.
 * `high` = both width and height pinned by classes; `medium` = one dimension
 * known or node came from a `.map()`; `fallback` = pure tag-default guess.
 * Drives the UI's "verify this block" outline.
 */
export type Confidence = "high" | "medium" | "fallback";

/** Layout flow direction for container nodes (mirrors flex-row / flex-col). */
export type LayoutDirection = "row" | "col";

/**
 * The IR's single recursive node. Produced by the parser, consumed by the
 * preview renderer and exporters. Mutated immutably through `mutateNode`.
 */
export type SkeletonNode = {
  id: string;
  kind: SkeletonKind;
  sourceTag?: string;
  confidence: Confidence;
  width?: number | "full";
  height?: number;
  radius?: number;
  lineCount?: number;
  visible: boolean;
  layout?: { direction: LayoutDirection; gap?: number };
  children?: SkeletonNode[];
};

/**
 * Global rendering settings applied to every node uniformly.
 * Stored once per session and persisted to localStorage by the Zustand store.
 */
export type GlobalSettings = {
  animation: "pulse" | "shimmer";
  speed: "slow" | "normal" | "fast";
  baseColor: string;
  theme: "light" | "dark";
};

/**
 * The Tailwind-class reader's output shape. Captures only what a class string
 * could pin down — kept separate from `SkeletonNode` so the reader stays a
 * pure, easily testable function.
 */
export type StyleHints = {
  width?: number | "full";
  height?: number;
  radius?: number;
  gap?: number;
  direction?: LayoutDirection;
};

/** Structured parser error. `kind` lets the UI pick a friendly message. */
export type ParseError = {
  kind: "no-return" | "syntax-error" | "no-component";
  message: string;
};

/**
 * Tagged-union result of `parseComponent`. Discriminate via `ok`; on success
 * read `tree`, on failure read `error`. Avoids throwing from a pure function.
 */
export type ParseResult =
  | { ok: true; tree: SkeletonNode }
  | { ok: false; error: ParseError };
