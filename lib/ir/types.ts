export type SkeletonKind =
  | "text"
  | "paragraph"
  | "avatar"
  | "image"
  | "button"
  | "card"
  | "input"
  | "container";

export type Confidence = "high" | "medium" | "fallback";

export type LayoutDirection = "row" | "col";

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

export type GlobalSettings = {
  animation: "pulse" | "shimmer";
  speed: "slow" | "normal" | "fast";
  baseColor: string;
  theme: "light" | "dark";
};

export type StyleHints = {
  width?: number | "full";
  height?: number;
  radius?: number;
  gap?: number;
  direction?: LayoutDirection;
};

export type ParseError = {
  kind: "no-return" | "syntax-error" | "no-component";
  message: string;
};

export type ParseResult =
  | { ok: true; tree: SkeletonNode }
  | { ok: false; error: ParseError };
