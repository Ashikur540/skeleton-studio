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

/** Cross-axis alignment (Tailwind items-*). */
export type Alignment = "start" | "end" | "center" | "stretch" | "baseline";

/** Main-axis distribution (Tailwind justify-*). */
export type Justify =
  | "start"
  | "end"
  | "center"
  | "between"
  | "around"
  | "evenly";

/**
 * Per-side padding values in pixels. Any side not specified means "no padding"
 * for that side; the renderer applies only the sides that are set.
 */
export type Padding = {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
};

/**
 * Visual treatment for structural containers. `plain` renders as a transparent
 * flex wrapper (current default); `card` adds a subtle outline + padding +
 * radius so a `<div className="bg-white border rounded-2xl">` reads as a
 * visible surface rather than disappearing.
 */
export type Appearance = "plain" | "card";

/**
 * Higher-level UI archetype a container subtree resembles, detected by a
 * pattern pass run after classification. Drives spacing/alignment refinements
 * (e.g. row + center-align for `media-object`) without overriding any explicit
 * Tailwind-derived signal. Strictly informational on fill leaves.
 */
export type Archetype =
  | "media-object"
  | "form-field"
  | "nav-bar"
  | "hero"
  | "card-grid"
  | "pricing-card"
  | "stat-tile";

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
  layout?: {
    direction: LayoutDirection;
    gap?: number;
    alignItems?: Alignment;
    justifyContent?: Justify;
    wrap?: boolean;
    /**
     * CSS `grid-template-columns` value pushed onto table rows by the
     * table-grid detector. When present, the renderer and exporter emit
     * `display: grid` instead of `flex flex-row` so column widths align
     * across every row in the table.
     */
    gridCols?: string;
  };
  padding?: Padding;
  appearance?: Appearance;
  /**
   * Per-side margin pixels, used as a transient signal during classification
   * so the parent can roll children's vertical margins into its own flex gap.
   * Stripped before the IR reaches the renderer (margins don't survive into
   * the rendered preview — they live on as parent `layout.gap`).
   */
  margin?: Padding;
  /**
   * How many copies of this node the renderer should draw in sequence.
   * Set on nodes derived from `.map()` so dynamic lists look like multi-row
   * loading skeletons rather than a single ghost row. Undefined = 1 copy.
   */
  repeat?: number;
  /**
   * Higher-level UI archetype this node matches (e.g. media-object, form-field).
   * Set by the archetype detector after classification; consumed by the
   * properties panel for display and by tuning logic for default spacing.
   */
  archetype?: Archetype;
  children?: SkeletonNode[];
};

/**
 * Global rendering settings applied to every node uniformly.
 * Stored once per session and persisted to localStorage by the Zustand store.
 * Chrome theme is owned by next-themes, not this struct, so light/dark switching
 * affects the editor surroundings rather than the skeleton output.
 */
export type GlobalSettings = {
  animation: "pulse" | "shimmer";
  speed: "slow" | "normal" | "fast";
  baseColor: string;
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
  padding?: Padding;
  margin?: Padding;
  surface?: "card";
  alignItems?: Alignment;
  justifyContent?: Justify;
  wrap?: boolean;
  position?: "absolute" | "fixed" | "relative" | "sticky";
};

/**
 * Structured parser error. `kind` lets the UI pick a friendly message; `loc`
 * carries Babel's 1-based line + 0-based column so the editor can decorate
 * the offending position with a red marker.
 */
export type ParseError = {
  kind: "no-return" | "syntax-error" | "no-component";
  message: string;
  loc?: { line: number; column: number };
};

/**
 * Tagged-union result of `parseComponent`. Discriminate via `ok`; on success
 * read `tree`, on failure read `error`. Avoids throwing from a pure function.
 */
export type ParseResult =
  | { ok: true; tree: SkeletonNode; componentName?: string }
  | { ok: false; error: ParseError };
