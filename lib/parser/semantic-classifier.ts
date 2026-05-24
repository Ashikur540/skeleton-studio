import { generateId } from "@/lib/ir/helpers";
import type {
  Confidence,
  SkeletonKind,
  SkeletonNode,
  StyleHints,
} from "@/lib/ir/types";
import type { LayoutDirection } from "@/lib/ir/types";
import type { RawNode } from "./raw-node";
import {
  COMPONENT_TAG_HINTS,
  CONTAINER_TAGS,
  TAG_DEFAULTS,
} from "./tag-defaults";
import { readClasses } from "./tailwind-class-reader";

type Resolved = {
  kind: SkeletonKind;
  defaults: StyleHints;
  nameInferred: boolean;
};

/**
 * Pattern-based suffix matcher for React component names. Catches the long tail
 * of design-system components by name shape (e.g. CardHeader → container,
 * SubmitButton → button) so the parser produces visible skeletons even for
 * unknown libraries. Order matters: most specific patterns first, container
 * catch-all last. Always returns medium-confidence matches.
 */
const SEMANTIC_PATTERNS: {
  match: RegExp;
  kind: SkeletonKind;
  defaults: StyleHints;
}[] = [
  {
    match: /^(Heading|Title|Headline)\d*$/,
    kind: "text",
    defaults: { height: 28, width: "full", radius: 4 },
  },
  {
    match: /^(.*Image|.*Img|Picture|Thumbnail)$/,
    kind: "image",
    defaults: { width: 200, height: 150, radius: 8 },
  },
  {
    match: /^(IconButton|.*Button|.*Btn)$/,
    kind: "button",
    defaults: { width: 100, height: 40, radius: 8 },
  },
  {
    match:
      /^(Input|TextField|TextArea|Textarea|Select|Combobox|Autocomplete|.*Field)$/,
    kind: "input",
    defaults: { width: 240, height: 40, radius: 6 },
  },
  {
    match: /^(Paragraph|Description)$/,
    kind: "paragraph",
    defaults: { height: 16, width: "full", radius: 4 },
  },
  {
    match: /^(Typography|Text|Caption|Label)$/,
    kind: "text",
    defaults: { height: 16, width: "full", radius: 4 },
  },
  {
    match:
      /^(.*Card|.*Box|.*Container|.*Wrapper|.*Stack|.*Group|.*Header|.*Body|.*Content|.*Footer|.*Section|.*Panel|.*Row|.*Column|.*Grid|.*Flex)$/,
    kind: "container",
    defaults: {},
  },
];

/**
 * Heading variant labels recognised on the `variant` prop of Typography-like
 * components. Maps each label to an equivalent HTML tag so the existing
 * TAG_DEFAULTS table supplies dimensions. Lowercased before lookup.
 */
const TYPOGRAPHY_VARIANT_TO_TAG: Record<string, string> = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  h5: "h5",
  h6: "h6",
  body1: "p",
  body2: "p",
  paragraph: "p",
  caption: "span",
  small: "span",
  subtitle1: "h5",
  subtitle2: "h6",
};

/**
 * Resolve a Typography-style component to a kind + dimensions via its `variant`
 * prop. Returns null when the tag is not Typography or the variant is unknown.
 * Always marks the match as name-inferred for confidence purposes.
 */
function resolveByVariant(
  tag: string,
  props: Record<string, string | true>,
): Resolved | null {
  if (tag !== "Typography") return null;
  const variant = props.variant;
  if (typeof variant !== "string") return null;
  const mapped = TYPOGRAPHY_VARIANT_TO_TAG[variant.toLowerCase()];
  if (!mapped) return null;
  const td = TAG_DEFAULTS[mapped];
  if (!td) return null;
  return { kind: td.kind, defaults: td.defaults, nameInferred: true };
}

/**
 * Walk the SEMANTIC_PATTERNS list looking for the first regex that matches a
 * capitalised component name. Lowercase identifiers are skipped because they
 * are handled by TAG_DEFAULTS or CONTAINER_TAGS instead.
 */
function resolveByPattern(tag: string): Resolved | null {
  if (!/^[A-Z]/.test(tag)) return null;
  for (const p of SEMANTIC_PATTERNS) {
    if (p.match.test(tag)) {
      return { kind: p.kind, defaults: p.defaults, nameInferred: true };
    }
  }
  return null;
}

/**
 * Map a tag name + static props to a skeleton kind and default style hints.
 * Lookup order: HTML tag defaults → Typography variant prop → curated component
 * hints → regex pattern match → HTML container set → bare container fallback.
 */
function resolveTag(
  tag: string,
  props: Record<string, string | true>,
): Resolved {
  if (TAG_DEFAULTS[tag]) {
    return { ...TAG_DEFAULTS[tag], nameInferred: false };
  }
  const variantResolved = resolveByVariant(tag, props);
  if (variantResolved) return variantResolved;
  if (COMPONENT_TAG_HINTS[tag]) {
    return { ...COMPONENT_TAG_HINTS[tag], nameInferred: true };
  }
  const patternResolved = resolveByPattern(tag);
  if (patternResolved) return patternResolved;
  if (CONTAINER_TAGS.has(tag)) {
    return { kind: "container", defaults: {}, nameInferred: false };
  }
  return { kind: "container", defaults: {}, nameInferred: false };
}

/**
 * Derive confidence from class hints, .map() origin, and whether the kind came
 * from a name-based guess. `high` when both dimensions pinned by classes,
 * `medium` for partial class hints / .map() children / name-inferred matches,
 * `fallback` only for pure tag-default nodes with no other signal.
 */
function computeConfidence(
  classHints: Partial<StyleHints>,
  fromMap: boolean,
  nameInferred: boolean,
): Confidence {
  if (fromMap) return "medium";
  const hasW = classHints.width !== undefined;
  const hasH = classHints.height !== undefined;
  if (hasW && hasH) return "high";
  if (hasW || hasH) return "medium";
  if (nameInferred) return "medium";
  return "fallback";
}

/**
 * Turn a RawNode tree into a SkeletonNode tree by applying tag resolution,
 * Tailwind class hints, confidence scoring, and leaf-container promotion.
 * Returns null when the input is an empty fragment with no usable children.
 */
export function classify(raw: RawNode): SkeletonNode | null {
  if (raw.kind === "fragment") {
    const children = raw.children
      .map(classify)
      .filter((c): c is SkeletonNode => c !== null);
    if (children.length === 0) return null;
    if (children.length === 1) return children[0];
    return {
      id: generateId(),
      kind: "container",
      confidence: "high",
      visible: true,
      layout: { direction: "col" },
      children,
    };
  }

  const resolved = resolveTag(raw.tag, raw.props);
  const classHints = readClasses(raw.className);
  const hints: StyleHints = { ...resolved.defaults, ...classHints };

  // Decorative overlay heuristic: a fully-positioned (absolute/fixed) element
  // with no children and no literal text is almost always a z-stacked tint or
  // backdrop, not a skeleton-worthy block. Dropping it prevents the renderer
  // from painting a phantom card surface on top of the actual content.
  if (
    (classHints.position === "absolute" || classHints.position === "fixed") &&
    raw.children.length === 0 &&
    !raw.hasTextContent
  ) {
    return null;
  }

  const node: SkeletonNode = {
    id: generateId(),
    kind: resolved.kind,
    sourceTag: raw.tag,
    confidence: computeConfidence(classHints, raw.fromMap, resolved.nameInferred),
    width: hints.width,
    height: hints.height,
    radius: hints.radius,
    visible: true,
  };

  // Dynamic-list multiplier: a `.map()` representative renders multiple times
  // so a 7-invoice table looks like a 7-row loading skeleton, not a single
  // ghost row. Default 3; list-container parents bump it below.
  if (raw.fromMap) node.repeat = DEFAULT_MAP_REPEAT;

  if (resolved.kind === "paragraph") {
    node.lineCount = lineCountForText(raw.textContent);
  }

  // Content-aware text width: size text/paragraph leaves to the literal text
  // they wrap so labels read as labels and paragraphs read as paragraph blocks
  // rather than full-bleed bars. Only fires when no explicit w-* class pinned
  // the width and we have actual text to measure against. The width is then
  // a real signal so the confidence floor bumps to "medium". Table cells are
  // excluded — they keep their "full" default so flex distributes columns evenly.
  if (
    (resolved.kind === "text" || resolved.kind === "paragraph") &&
    classHints.width === undefined &&
    raw.textContent.length > 0 &&
    !TABLE_STRUCTURAL_TAGS.has(raw.tag)
  ) {
    node.width = textWidthFromContent(raw.textContent);
    if (node.confidence === "fallback") node.confidence = "medium";
  }

  // Transient margin info so the parent classify call can roll children's
  // vertical margins into its own flex gap below.
  if (hints.margin) node.margin = hints.margin;

  const hasFlexHints =
    hints.direction !== undefined ||
    hints.gap !== undefined ||
    hints.alignItems !== undefined ||
    hints.justifyContent !== undefined ||
    hints.wrap !== undefined;

  if (hints.padding) node.padding = hints.padding;

  // Visual-card heuristic: a structural container whose source JSX carries
  // bg-* / border / border-{color|width} switches to card appearance so the
  // renderer paints chrome (subtle outline, default padding) instead of
  // a transparent wrapper. Fill-leaf kinds keep their own paint logic.
  // Table-structural tags (tr/thead/tbody/td/...) are excluded because their
  // bg/border classes encode row banding or dividers, not card surfaces.
  if (
    resolved.kind === "container" &&
    hints.surface === "card" &&
    !TABLE_STRUCTURAL_TAGS.has(raw.tag)
  ) {
    node.appearance = "card";
  }

  // shadcn Table component bakes its own wrapper chrome into the rendered
  // output but emits no bg/border class on the JSX. Give the top-level Table
  // a card surface so the skeleton mirrors the real wrapper without needing
  // the user to wrap it manually.
  if (raw.tag === "Table" && resolved.kind === "container") {
    node.appearance = "card";
  }

  // Fill-leaf kinds are opaque units: their inner JSX (icons, label text) is
  // decorative noise that would render as ghost blocks on top of the fill.
  // Suppress descent into them at classify time so the renderer sees a clean leaf.
  if (!FILL_LEAF_KINDS.has(resolved.kind)) {
    const children = raw.children
      .map(classify)
      .filter((c): c is SkeletonNode => c !== null);
    if (children.length > 0) node.children = children;
  }


  // Layout assignment: needs to know child margins so we can roll them into
  // a uniform parent gap (CSS margins on flex children are unreliable and
  // exporters look cleaner with a single gap value). Compute after children.
  const direction = hints.direction ?? "col";
  const inferredGapFromMargins = inferGapFromChildMargins(
    node.children,
    direction,
  );

  if (hasFlexHints || inferredGapFromMargins > 0) {
    node.layout = {
      direction,
      gap: hints.gap ?? (inferredGapFromMargins > 0 ? inferredGapFromMargins : undefined),
      alignItems: hints.alignItems,
      justifyContent: hints.justifyContent,
      wrap: hints.wrap,
    };
  }

  // Margins have served their purpose (aggregated to parent gap); strip them
  // from children so the IR doesn't carry redundant signals into exporters.
  if (node.children) {
    for (const c of node.children) c.margin = undefined;
  }

  maybePromoteToAvatar(node);
  promoteLeafContainer(node, classHints, raw.tag, raw.hasTextContent);
  unfixCardHeightForWrapper(node, classHints);
  return node;
}

/**
 * Compute a uniform parent gap from child margins. For column layouts, take
 * the max of all children's top/bottom margins; for rows, max of left/right.
 * Approximates CSS margin-collapse (max wins) without the per-edge complexity
 * that would force the renderer to track per-sibling spacing.
 */
function inferGapFromChildMargins(
  children: SkeletonNode[] | undefined,
  direction: LayoutDirection,
): number {
  if (!children) return 0;
  let max = 0;
  for (const c of children) {
    if (!c.margin) continue;
    if (direction === "col") {
      max = Math.max(max, c.margin.top ?? 0, c.margin.bottom ?? 0);
    } else {
      max = Math.max(max, c.margin.left ?? 0, c.margin.right ?? 0);
    }
  }
  return max;
}

/**
 * Recognise the classic avatar pattern — a sized container with rounded-full
 * (radius >= 9999) wrapping a single image child — and collapse it into a
 * single circular avatar fill. The inner img is dropped because the renderer
 * paints the avatar itself; keeping the img would overflow the circle.
 */
function maybePromoteToAvatar(node: SkeletonNode): void {
  if (node.kind !== "container") return;
  if (node.radius === undefined || node.radius < 1000) return;
  if (typeof node.width !== "number" || typeof node.height !== "number") return;
  if (!node.children || node.children.length !== 1) return;
  const only = node.children[0];
  if (only.kind !== "image" && only.kind !== "avatar") return;
  node.kind = "avatar";
  node.children = undefined;
}

/**
 * Kinds rendered as a single opaque fill block. Their inner JSX is considered
 * label/icon decoration, not independent skeleton siblings, so we never emit
 * children for them.
 */
const FILL_LEAF_KINDS: Set<SkeletonKind> = new Set([
  "text",
  "paragraph",
  "avatar",
  "image",
  "button",
  "input",
]);

/**
 * HTML tags that participate in table structure. Their bg- and border-
 * classes express row banding and dividers, not card surfaces — never promote
 * them to appearance="card" or chrome stacks on every row and cell.
 */
/** Default repeat count for a `.map()` representative child. Uniform across
 * list and non-list contexts so a long dataset doesn't blow up the preview
 * pane. Users can crank it higher per-node via the Repeat field in the panel. */
const DEFAULT_MAP_REPEAT = 3;

const TABLE_STRUCTURAL_TAGS = new Set([
  // HTML
  "table",
  "thead",
  "tbody",
  "tfoot",
  "tr",
  "th",
  "td",
  "caption",
  "colgroup",
  "col",
  // shadcn / Radix
  "Table",
  "TableHeader",
  "TableBody",
  "TableFooter",
  "TableRow",
  "TableHead",
  "TableCell",
  "TableCaption",
]);

/**
 * Card-with-children should size to its content vertically, not to whatever
 * default height the lookup tables provided. Strip the default-derived height
 * so the renderer can grow with the inner stack; explicit class heights stay.
 */
function unfixCardHeightForWrapper(
  node: SkeletonNode,
  classHints: Partial<StyleHints>,
): void {
  if (node.kind !== "card") return;
  if (!node.children || node.children.length === 0) return;
  if (classHints.height !== undefined) return;
  node.height = undefined;
}

/**
 * Default dimensions applied to an unresolved/empty custom leaf so it renders
 * as something visible rather than a 0×0 wrapper. Conservative on purpose —
 * users override per-block when the guess is wrong.
 */
const CUSTOM_LEAF_FALLBACK: Required<
  Pick<SkeletonNode, "width" | "height" | "radius">
> = { width: 200, height: 80, radius: 8 };

/**
 * Estimate how many skeleton lines a paragraph block should render based on
 * its literal text length. Short label-ish content (`<p>New</p>`) collapses
 * to one bar; longer copy expands up to a cap so the preview reads as a
 * block of body text rather than an arbitrary giant stack.
 */
/**
 * Estimate a believable skeleton width for a text/paragraph block from its
 * literal content. Roughly 7px per character for body-text font sizes, bounded
 * by a 40px floor (so single-letter labels stay readable) and a 320px ceiling
 * (so long copy never spans the full preview).
 */
function textWidthFromContent(textContent: string): number {
  if (textContent.length === 0) return 160;
  const approx = textContent.length * 7 + 8;
  return Math.min(Math.max(approx, 40), 320);
}

function lineCountForText(text: string): number {
  const length = text.length;
  if (length === 0) return 3;
  if (length < 24) return 1;
  if (length < 60) return 2;
  if (length < 120) return 3;
  if (length < 200) return 4;
  return 5;
}

/**
 * Convert an empty container into a visible fill when the JSX makes its intent
 * clear. Four cases: (1) any sized leaf is a fill block (`<div w-12 h-12 />`),
 * (2) a leaf wrapping literal text becomes a text bar (`<th>Name</th>`),
 * (3) a leaf with a capitalised tag is a custom component the user expects to
 * see (`<HeroBox />`). Lowercase HTML wrappers with no signal stay as container
 * so generic `<div />` remains a structural element.
 */
function promoteLeafContainer(
  node: SkeletonNode,
  classHints: Partial<StyleHints>,
  tag: string,
  hasTextContent: boolean,
): void {
  if (node.kind !== "container") return;
  if (node.children && node.children.length > 0) return;

  const hasDimHint =
    classHints.width !== undefined || classHints.height !== undefined;
  const isCustomComponent = /^[A-Z]/.test(tag);

  if (hasDimHint) {
    node.kind = "card";
    return;
  }
  if (hasTextContent) {
    node.kind = "text";
    node.width ??= 120;
    node.height ??= 16;
    node.radius ??= 4;
    return;
  }
  if (isCustomComponent) {
    node.kind = "card";
    node.width ??= CUSTOM_LEAF_FALLBACK.width;
    node.height ??= CUSTOM_LEAF_FALLBACK.height;
    node.radius ??= CUSTOM_LEAF_FALLBACK.radius;
  }
}
