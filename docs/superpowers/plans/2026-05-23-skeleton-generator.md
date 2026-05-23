# Skeleton Generator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the MVP that turns a pasted React function component (JSX) into a tweakable, exportable Tailwind-based skeleton loader.

**Architecture:** Layered with an intermediate representation. Pure parser (`@babel/parser` AST → `SkeletonNode` tree) feeds pure exporters (React+Tailwind, HTML+Tailwind) and the React preview renderer. A Zustand store with localStorage persistence wires UI to the IR. Deep modules (parser, tailwind-class-reader, both exporters) carry the test surface; UI is exercised manually.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind v4 (CSS-first), Zustand, `@babel/parser`, `@babel/types`, Vitest.

---

## Project Conventions

- **Path alias:** `@/*` maps to repo root (see `tsconfig.json`). Use `@/lib/...`, `@/store/...`, `@/components/...`.
- **No `src/` directory.** New folders (`lib/`, `store/`, `components/`) live at repo root next to the existing `app/`.
- **Next.js 16 is not the version most training data describes.** Before touching anything in `app/`, skim `node_modules/next/dist/docs/01-app/` for current App Router conventions.
- **Tailwind v4 is CSS-first.** Theme tokens live in `app/globals.css` under `@theme`. No `tailwind.config.js`.
- **Test runner:** Vitest. Tests live next to the file under test (`foo.ts` + `foo.test.ts`).
- **Commits:** small, frequent, conventional commit prefixes (`feat:`, `test:`, `chore:`, `refactor:`).

---

## File Map

**Library (deep modules — all tested):**
- `lib/ir/types.ts` — `SkeletonNode`, `GlobalSettings`, `ParseResult`, `StyleHints`, `Confidence`.
- `lib/ir/helpers.ts` — `generateId`, `findNode`, `mutateNode`.
- `lib/parser/tag-defaults.ts` — tag → kind/default-size map.
- `lib/parser/tailwind-class-reader.ts` + `.test.ts` — class string → `StyleHints`.
- `lib/parser/parse-component.ts` + `.test.ts` — JSX source → `ParseResult`.
- `lib/exporters/format-classes.ts` — shared Tailwind class string builder.
- `lib/exporters/react-tailwind.ts` + `.test.ts` — IR → React+Tailwind code string.
- `lib/exporters/html-tailwind.ts` + `.test.ts` — IR → HTML+Tailwind code string.
- `lib/examples/snippets.ts` — curated JSX example inputs.

**Store:**
- `store/use-skeleton-store.ts` — Zustand store + persist middleware.

**UI components:**
- `components/skeleton-renderer.tsx` — pure: IR → React preview.
- `components/paste-input.tsx` — paste textarea + parse button + error display.
- `components/preview-canvas.tsx` — wraps SkeletonRenderer, handles block selection.
- `components/properties-panel.tsx` — per-block edit controls.
- `components/global-controls.tsx` — animation/speed/color/theme controls.
- `components/example-snippets.tsx` — example loader dropdown.
- `components/export-modal.tsx` — export tabs + copy.

**App:**
- `app/page.tsx` — rewritten main editor page.
- `app/layout.tsx` — updated metadata.

**Config:**
- `vitest.config.ts` — Vitest config.
- `package.json` — new deps + test scripts.

---

## Task 1: Install dependencies and set up Vitest

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`

- [ ] **Step 1: Install runtime dependencies**

Run:
```bash
npm install @babel/parser @babel/types zustand
```

Expected: `package.json` `dependencies` now contains `@babel/parser`, `@babel/types`, `zustand`.

- [ ] **Step 2: Install dev dependencies**

Run:
```bash
npm install -D vitest @types/babel__parser
```

Expected: `package.json` `devDependencies` contains `vitest`, `@types/babel__parser`.

- [ ] **Step 3: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    globals: false,
    include: ["lib/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
```

- [ ] **Step 4: Add test scripts to `package.json`**

In the `scripts` block, add:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Sanity-check Vitest runs**

Run:
```bash
npm test
```

Expected: Vitest reports `No test files found`. That's the pass condition for this step.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vitest.config.ts
git commit -m "chore: add vitest, zustand, @babel/parser deps and test config"
```

---

## Task 2: Define IR types

**Files:**
- Create: `lib/ir/types.ts`

- [ ] **Step 1: Create `lib/ir/types.ts` with the full IR type surface**

```ts
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
```

- [ ] **Step 2: Verify the file type-checks**

Run:
```bash
npx tsc --noEmit
```

Expected: PASS (no output).

- [ ] **Step 3: Commit**

```bash
git add lib/ir/types.ts
git commit -m "feat(ir): define SkeletonNode, GlobalSettings, ParseResult types"
```

---

## Task 3: IR helpers (id generator, find, mutate)

**Files:**
- Create: `lib/ir/helpers.ts`
- Create: `lib/ir/helpers.test.ts`

- [ ] **Step 1: Write the failing test**

Create `lib/ir/helpers.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { findNode, generateId, mutateNode } from "./helpers";
import type { SkeletonNode } from "./types";

const tree: SkeletonNode = {
  id: "root",
  kind: "container",
  confidence: "high",
  visible: true,
  children: [
    {
      id: "a",
      kind: "text",
      confidence: "high",
      visible: true,
    },
    {
      id: "b",
      kind: "container",
      confidence: "high",
      visible: true,
      children: [
        { id: "b1", kind: "image", confidence: "high", visible: true },
      ],
    },
  ],
};

describe("generateId", () => {
  it("returns unique ids on repeated calls", () => {
    const a = generateId();
    const b = generateId();
    expect(a).not.toEqual(b);
  });
});

describe("findNode", () => {
  it("returns the root when its id matches", () => {
    expect(findNode(tree, "root")).toBe(tree);
  });
  it("walks into children", () => {
    expect(findNode(tree, "b1")?.kind).toBe("image");
  });
  it("returns null when no id matches", () => {
    expect(findNode(tree, "missing")).toBeNull();
  });
});

describe("mutateNode", () => {
  it("patches a leaf without mutating the original tree", () => {
    const next = mutateNode(tree, "a", { width: 100 });
    expect(next.children?.[0].width).toBe(100);
    expect(tree.children?.[0].width).toBeUndefined();
  });
  it("patches a nested node", () => {
    const next = mutateNode(tree, "b1", { visible: false });
    expect(next.children?.[1].children?.[0].visible).toBe(false);
  });
  it("returns the tree unchanged when id is missing", () => {
    const next = mutateNode(tree, "nope", { width: 1 });
    expect(next).toEqual(tree);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
npm test -- lib/ir/helpers.test.ts
```

Expected: FAIL (helpers module does not exist).

- [ ] **Step 3: Implement helpers**

Create `lib/ir/helpers.ts`:
```ts
import type { SkeletonNode } from "./types";

let counter = 0;

export function generateId(): string {
  counter += 1;
  return `n_${counter}_${Math.random().toString(36).slice(2, 7)}`;
}

export function findNode(
  root: SkeletonNode,
  id: string,
): SkeletonNode | null {
  if (root.id === id) return root;
  for (const child of root.children ?? []) {
    const hit = findNode(child, id);
    if (hit) return hit;
  }
  return null;
}

export function mutateNode(
  root: SkeletonNode,
  id: string,
  patch: Partial<SkeletonNode>,
): SkeletonNode {
  if (root.id === id) return { ...root, ...patch };
  if (!root.children) return root;
  const nextChildren = root.children.map((c) => mutateNode(c, id, patch));
  return { ...root, children: nextChildren };
}
```

- [ ] **Step 4: Run tests**

Run:
```bash
npm test -- lib/ir/helpers.test.ts
```

Expected: PASS (all tests green).

- [ ] **Step 5: Commit**

```bash
git add lib/ir/helpers.ts lib/ir/helpers.test.ts
git commit -m "feat(ir): add findNode, mutateNode, generateId helpers with tests"
```

---

## Task 4: Tag defaults map

**Files:**
- Create: `lib/parser/tag-defaults.ts`

This is reference data, no tests required. The parser tests in later tasks exercise it indirectly.

- [ ] **Step 1: Create the file**

```ts
import type { SkeletonKind, StyleHints } from "@/lib/ir/types";

export type TagDefault = {
  kind: SkeletonKind;
  defaults: StyleHints;
};

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

export const CONTAINER_TAGS = new Set([
  "div", "section", "article", "header", "footer", "main",
  "nav", "aside", "ul", "ol", "li", "form", "label",
]);

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
```

- [ ] **Step 2: Verify file type-checks**

Run:
```bash
npx tsc --noEmit
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add lib/parser/tag-defaults.ts
git commit -m "feat(parser): add tag-defaults map for HTML/component kinds"
```

---

## Task 5: Tailwind class reader

**Files:**
- Create: `lib/parser/tailwind-class-reader.ts`
- Create: `lib/parser/tailwind-class-reader.test.ts`

- [ ] **Step 1: Write the failing test**

Create `lib/parser/tailwind-class-reader.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { readClasses } from "./tailwind-class-reader";

describe("readClasses", () => {
  it("returns empty hints for empty string", () => {
    expect(readClasses("")).toEqual({});
  });

  it("reads spacing-scale width", () => {
    expect(readClasses("w-32")).toEqual({ width: 128 });
  });

  it("reads w-full", () => {
    expect(readClasses("w-full")).toEqual({ width: "full" });
  });

  it("reads arbitrary px width", () => {
    expect(readClasses("w-[240px]")).toEqual({ width: 240 });
  });

  it("reads arbitrary rem width", () => {
    expect(readClasses("w-[2rem]")).toEqual({ width: 32 });
  });

  it("reads spacing-scale height", () => {
    expect(readClasses("h-10")).toEqual({ height: 40 });
  });

  it("reads radius keywords", () => {
    expect(readClasses("rounded-lg")).toEqual({ radius: 8 });
    expect(readClasses("rounded")).toEqual({ radius: 4 });
    expect(readClasses("rounded-full")).toEqual({ radius: 9999 });
  });

  it("reads arbitrary radius", () => {
    expect(readClasses("rounded-[12px]")).toEqual({ radius: 12 });
  });

  it("reads gap", () => {
    expect(readClasses("gap-4")).toEqual({ gap: 16 });
  });

  it("reads flex direction", () => {
    expect(readClasses("flex flex-row")).toEqual({ direction: "row" });
    expect(readClasses("flex flex-col")).toEqual({ direction: "col" });
  });

  it("defaults flex alone to row", () => {
    expect(readClasses("flex")).toEqual({ direction: "row" });
  });

  it("combines multiple hints", () => {
    expect(readClasses("w-64 h-12 rounded-xl gap-2 flex flex-col")).toEqual({
      width: 256,
      height: 48,
      radius: 12,
      gap: 8,
      direction: "col",
    });
  });

  it("ignores responsive/state modifiers in MVP", () => {
    expect(readClasses("md:w-64 dark:bg-black")).toEqual({});
  });

  it("ignores unknown utility classes", () => {
    expect(readClasses("bg-red-500 text-center hover:underline")).toEqual({});
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
npm test -- lib/parser/tailwind-class-reader.test.ts
```

Expected: FAIL (module not found).

- [ ] **Step 3: Implement the reader**

Create `lib/parser/tailwind-class-reader.ts`:
```ts
import type { LayoutDirection, StyleHints } from "@/lib/ir/types";

const SPACING_MAP: Record<string, number> = {
  "0": 0, "0.5": 2, "1": 4, "1.5": 6, "2": 8, "2.5": 10, "3": 12, "3.5": 14,
  "4": 16, "5": 20, "6": 24, "7": 28, "8": 32, "9": 36, "10": 40, "11": 44,
  "12": 48, "14": 56, "16": 64, "20": 80, "24": 96, "28": 112, "32": 128,
  "36": 144, "40": 160, "44": 176, "48": 192, "52": 208, "56": 224,
  "60": 240, "64": 256, "72": 288, "80": 320, "96": 384,
};

const RADIUS_MAP: Record<string, number> = {
  none: 0,
  sm: 2,
  "": 4,
  md: 6,
  lg: 8,
  xl: 12,
  "2xl": 16,
  "3xl": 24,
  full: 9999,
};

function arbitraryToPx(value: string): number | undefined {
  const m = value.match(/^(\d+(?:\.\d+)?)(px|rem)?$/);
  if (!m) return undefined;
  const n = parseFloat(m[1]);
  if (m[2] === "rem") return n * 16;
  return n;
}

export function readClasses(className: string): Partial<StyleHints> {
  const hints: Partial<StyleHints> = {};
  const tokens = className.split(/\s+/).filter(Boolean);

  let sawFlex = false;
  let sawDirection: LayoutDirection | null = null;

  for (const t of tokens) {
    if (t.includes(":")) continue; // skip modifiers

    if (t === "w-full") {
      hints.width = "full";
      continue;
    }
    if (t.startsWith("w-[") && t.endsWith("]")) {
      const v = arbitraryToPx(t.slice(2, -1));
      if (v !== undefined) hints.width = v;
      continue;
    }
    if (t.startsWith("w-")) {
      const v = SPACING_MAP[t.slice(2)];
      if (v !== undefined) hints.width = v;
      continue;
    }

    if (t.startsWith("h-[") && t.endsWith("]")) {
      const v = arbitraryToPx(t.slice(2, -1));
      if (v !== undefined) hints.height = v;
      continue;
    }
    if (t.startsWith("h-") && t !== "h-full") {
      const v = SPACING_MAP[t.slice(2)];
      if (v !== undefined) hints.height = v;
      continue;
    }

    if (t === "rounded") {
      hints.radius = RADIUS_MAP[""];
      continue;
    }
    if (t.startsWith("rounded-[") && t.endsWith("]")) {
      const v = arbitraryToPx(t.slice("rounded-[".length, -1));
      if (v !== undefined) hints.radius = v;
      continue;
    }
    if (t.startsWith("rounded-")) {
      const v = RADIUS_MAP[t.slice("rounded-".length)];
      if (v !== undefined) hints.radius = v;
      continue;
    }

    if (t.startsWith("gap-")) {
      const v = SPACING_MAP[t.slice(4)];
      if (v !== undefined) hints.gap = v;
      continue;
    }

    if (t === "flex") {
      sawFlex = true;
      continue;
    }
    if (t === "flex-row") {
      sawDirection = "row";
      continue;
    }
    if (t === "flex-col") {
      sawDirection = "col";
      continue;
    }
  }

  if (sawDirection) hints.direction = sawDirection;
  else if (sawFlex) hints.direction = "row";

  return hints;
}
```

- [ ] **Step 4: Run tests**

Run:
```bash
npm test -- lib/parser/tailwind-class-reader.test.ts
```

Expected: PASS (all cases green).

- [ ] **Step 5: Commit**

```bash
git add lib/parser/tailwind-class-reader.ts lib/parser/tailwind-class-reader.test.ts
git commit -m "feat(parser): add tailwind class reader for w/h/radius/gap/direction"
```

---

## Task 6: parse-component — basic happy path

**Files:**
- Create: `lib/parser/parse-component.ts`
- Create: `lib/parser/parse-component.test.ts`

This task ships the parser skeleton plus tests for the happy path. Later tasks extend it for `.map()`, errors, and confidence cases.

- [ ] **Step 1: Write the failing test**

Create `lib/parser/parse-component.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { parseComponent } from "./parse-component";

function tree(source: string) {
  const r = parseComponent(source);
  if (!r.ok) throw new Error(`parse failed: ${r.error.kind}`);
  return r.tree;
}

describe("parseComponent (happy path)", () => {
  it("parses a minimal function component", () => {
    const t = tree(`
      export default function Hello() {
        return <div className="w-64"><h1>Hi</h1></div>;
      }
    `);
    expect(t.kind).toBe("container");
    expect(t.width).toBe(256);
    expect(t.children).toHaveLength(1);
    expect(t.children?.[0].kind).toBe("text");
    expect(t.children?.[0].sourceTag).toBe("h1");
  });

  it("parses an arrow function component with implicit return", () => {
    const t = tree(`
      export const Card = () => (
        <div className="flex flex-col gap-4">
          <img className="w-12 h-12 rounded-full" />
          <p className="w-48">text</p>
        </div>
      );
    `);
    expect(t.layout).toEqual({ direction: "col", gap: 16 });
    expect(t.children).toHaveLength(2);
    expect(t.children?.[0].kind).toBe("image");
    expect(t.children?.[0].width).toBe(48);
    expect(t.children?.[1].kind).toBe("paragraph");
    expect(t.children?.[1].lineCount).toBe(3);
  });

  it("preserves sourceTag for capitalized component identifiers", () => {
    const t = tree(`
      function Profile() {
        return <Card><Avatar /></Card>;
      }
    `);
    expect(t.kind).toBe("card");
    expect(t.sourceTag).toBe("Card");
    expect(t.children?.[0].kind).toBe("avatar");
    expect(t.children?.[0].sourceTag).toBe("Avatar");
  });

  it("ignores JSX text and whitespace children", () => {
    const t = tree(`
      function X() {
        return <div>some text<span className="w-10 h-4" /></div>;
      }
    `);
    expect(t.children).toHaveLength(1);
    expect(t.children?.[0].kind).toBe("text");
  });

  it("strips hooks and TS annotations silently", () => {
    const t = tree(`
      import { useState } from "react";
      type Props = { name: string };
      export default function Hi({ name }: Props) {
        const [x, setX] = useState(0);
        return <h1 className="w-32 h-8">{name}</h1>;
      }
    `);
    expect(t.kind).toBe("text");
    expect(t.width).toBe(128);
    expect(t.height).toBe(32);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
npm test -- lib/parser/parse-component.test.ts
```

Expected: FAIL (module not found).

- [ ] **Step 3: Implement the parser**

Create `lib/parser/parse-component.ts`:
```ts
import { parse } from "@babel/parser";
import {
  isArrowFunctionExpression,
  isCallExpression,
  isExportDefaultDeclaration,
  isExportNamedDeclaration,
  isFunctionDeclaration,
  isIdentifier,
  isJSXAttribute,
  isJSXElement,
  isJSXExpressionContainer,
  isJSXFragment,
  isJSXIdentifier,
  isJSXMemberExpression,
  isJSXText,
  isMemberExpression,
  isReturnStatement,
  isStringLiteral,
  isVariableDeclaration,
} from "@babel/types";
import type {
  ArrowFunctionExpression,
  FunctionDeclaration,
  JSXElement,
  JSXFragment,
  Node,
  ReturnStatement,
} from "@babel/types";

import { generateId } from "@/lib/ir/helpers";
import type {
  Confidence,
  ParseResult,
  SkeletonKind,
  SkeletonNode,
  StyleHints,
} from "@/lib/ir/types";
import {
  COMPONENT_TAG_HINTS,
  CONTAINER_TAGS,
  TAG_DEFAULTS,
} from "./tag-defaults";
import { readClasses } from "./tailwind-class-reader";

export function parseComponent(source: string): ParseResult {
  let ast;
  try {
    ast = parse(source, {
      sourceType: "module",
      plugins: ["jsx", "typescript"],
      errorRecovery: false,
    });
  } catch (e) {
    return {
      ok: false,
      error: {
        kind: "syntax-error",
        message: e instanceof Error ? e.message : String(e),
      },
    };
  }

  const returnJsx = findComponentReturn(ast.program.body);
  if (!returnJsx) {
    return {
      ok: false,
      error: {
        kind: "no-return",
        message:
          "Could not find a JSX return statement in any function component.",
      },
    };
  }

  const tree = convertJSX(returnJsx, false);
  if (!tree) {
    return {
      ok: false,
      error: {
        kind: "no-component",
        message: "Return statement does not contain a JSX element.",
      },
    };
  }
  return { ok: true, tree };
}

function findComponentReturn(body: Node[]): JSXElement | JSXFragment | null {
  for (const node of body) {
    if (isExportDefaultDeclaration(node)) {
      const inner = node.declaration;
      if (isFunctionDeclaration(inner)) {
        const r = findReturnInFunction(inner);
        if (r) return r;
      } else if (isArrowFunctionExpression(inner)) {
        const r = findReturnInArrow(inner);
        if (r) return r;
      }
      continue;
    }
    if (isExportNamedDeclaration(node) && node.declaration) {
      const inner = node.declaration;
      if (isFunctionDeclaration(inner)) {
        const r = findReturnInFunction(inner);
        if (r) return r;
      } else if (isVariableDeclaration(inner)) {
        for (const decl of inner.declarations) {
          if (decl.init && isArrowFunctionExpression(decl.init)) {
            const r = findReturnInArrow(decl.init);
            if (r) return r;
          }
        }
      }
      continue;
    }
    if (isFunctionDeclaration(node)) {
      const r = findReturnInFunction(node);
      if (r) return r;
    }
    if (isVariableDeclaration(node)) {
      for (const decl of node.declarations) {
        if (decl.init && isArrowFunctionExpression(decl.init)) {
          const r = findReturnInArrow(decl.init);
          if (r) return r;
        }
      }
    }
  }
  return null;
}

function findReturnInFunction(
  fn: FunctionDeclaration,
): JSXElement | JSXFragment | null {
  for (const stmt of fn.body.body) {
    if (isReturnStatement(stmt)) return extractJSXFromReturn(stmt);
  }
  return null;
}

function findReturnInArrow(
  fn: ArrowFunctionExpression,
): JSXElement | JSXFragment | null {
  const body = fn.body;
  if (isJSXElement(body) || isJSXFragment(body)) return body;
  if (body.type === "BlockStatement") {
    for (const stmt of body.body) {
      if (isReturnStatement(stmt)) return extractJSXFromReturn(stmt);
    }
  }
  return null;
}

function extractJSXFromReturn(
  stmt: ReturnStatement,
): JSXElement | JSXFragment | null {
  const arg = stmt.argument;
  if (!arg) return null;
  if (isJSXElement(arg) || isJSXFragment(arg)) return arg;
  return null;
}

function elementTagName(el: JSXElement): string | null {
  const name = el.openingElement.name;
  if (isJSXIdentifier(name)) return name.name;
  if (isJSXMemberExpression(name) && isJSXIdentifier(name.property)) {
    return name.property.name;
  }
  return null;
}

function getClassNameAttr(el: JSXElement): string {
  for (const a of el.openingElement.attributes) {
    if (!isJSXAttribute(a)) continue;
    if (!isJSXIdentifier(a.name)) continue;
    if (a.name.name !== "className" && a.name.name !== "class") continue;
    const v = a.value;
    if (v && isStringLiteral(v)) return v.value;
    if (
      v &&
      isJSXExpressionContainer(v) &&
      isStringLiteral(v.expression)
    ) {
      return v.expression.value;
    }
  }
  return "";
}

type Resolved = { kind: SkeletonKind; defaults: StyleHints };

function resolveTag(tag: string): Resolved {
  if (TAG_DEFAULTS[tag]) return TAG_DEFAULTS[tag];
  if (COMPONENT_TAG_HINTS[tag]) {
    return { kind: COMPONENT_TAG_HINTS[tag], defaults: {} };
  }
  if (CONTAINER_TAGS.has(tag)) {
    return { kind: "container", defaults: {} };
  }
  return { kind: "container", defaults: {} };
}

function computeConfidence(
  classHints: Partial<StyleHints>,
  fromMap: boolean,
): Confidence {
  if (fromMap) return "medium";
  const hasW = classHints.width !== undefined;
  const hasH = classHints.height !== undefined;
  if (hasW && hasH) return "high";
  if (hasW || hasH) return "medium";
  return "fallback";
}

function convertJSX(
  node: JSXElement | JSXFragment,
  fromMap: boolean,
): SkeletonNode | null {
  if (isJSXFragment(node)) {
    const children = collectChildren(node.children, fromMap);
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

  const tag = elementTagName(node);
  if (!tag) return null;
  const resolved = resolveTag(tag);
  const classHints = readClasses(getClassNameAttr(node));
  const hints: StyleHints = { ...resolved.defaults, ...classHints };

  const skeletonNode: SkeletonNode = {
    id: generateId(),
    kind: resolved.kind,
    sourceTag: tag,
    confidence: computeConfidence(classHints, fromMap),
    width: hints.width,
    height: hints.height,
    radius: hints.radius,
    visible: true,
  };

  if (resolved.kind === "paragraph") {
    skeletonNode.lineCount = 3;
  }

  if (hints.direction || hints.gap !== undefined) {
    skeletonNode.layout = {
      direction: hints.direction ?? "col",
      gap: hints.gap,
    };
  }

  const children = collectChildren(node.children, fromMap);
  if (children.length > 0) skeletonNode.children = children;

  return skeletonNode;
}

function collectChildren(
  children: JSXElement["children"],
  fromMap: boolean,
): SkeletonNode[] {
  const out: SkeletonNode[] = [];
  for (const c of children) {
    if (isJSXText(c)) continue;
    if (isJSXElement(c) || isJSXFragment(c)) {
      const n = convertJSX(c, fromMap);
      if (n) out.push(n);
      continue;
    }
    if (isJSXExpressionContainer(c)) {
      const mapChild = extractFromMap(c.expression, fromMap);
      if (mapChild) out.push(mapChild);
    }
  }
  return out;
}

function extractFromMap(
  expr: unknown,
  _fromMap: boolean,
): SkeletonNode | null {
  // Stub here; full implementation lands in Task 7.
  void expr;
  return null;
}
```

- [ ] **Step 4: Run tests**

Run:
```bash
npm test -- lib/parser/parse-component.test.ts
```

Expected: PASS. (`.map()` tests are not in this task.)

- [ ] **Step 5: Commit**

```bash
git add lib/parser/parse-component.ts lib/parser/parse-component.test.ts
git commit -m "feat(parser): parse JSX function components into SkeletonNode tree"
```

---

## Task 7: parse-component — `.map()` representative child

**Files:**
- Modify: `lib/parser/parse-component.ts:extractFromMap`
- Modify: `lib/parser/parse-component.test.ts`

- [ ] **Step 1: Add failing tests**

Append to `lib/parser/parse-component.test.ts`:
```ts
describe("parseComponent (.map handling)", () => {
  it("renders one representative child from .map() and tags it medium", () => {
    const r = parseComponent(`
      function List({ items }) {
        return (
          <ul className="flex flex-col gap-2">
            {items.map((item) => (
              <li key={item.id} className="w-64 h-8" />
            ))}
          </ul>
        );
      }
    `);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.tree.children).toHaveLength(1);
    const child = r.tree.children![0];
    expect(child.kind).toBe("container");
    expect(child.sourceTag).toBe("li");
    expect(child.width).toBe(256);
    expect(child.height).toBe(32);
    expect(child.confidence).toBe("medium");
  });

  it("handles .map() with block-body callback", () => {
    const r = parseComponent(`
      function List() {
        return (
          <ul>
            {arr.map((x) => {
              return <li className="w-10 h-4" />;
            })}
          </ul>
        );
      }
    `);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.tree.children).toHaveLength(1);
    expect(r.tree.children![0].confidence).toBe("medium");
  });

  it("ignores non-map expressions (variables, ternaries)", () => {
    const r = parseComponent(`
      function X({ name, isAdmin }) {
        return (
          <div className="w-32">
            {name}
            {isAdmin ? <span /> : null}
          </div>
        );
      }
    `);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.tree.children ?? []).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run tests to verify the new ones fail**

Run:
```bash
npm test -- lib/parser/parse-component.test.ts
```

Expected: the three new tests FAIL; earlier ones still PASS.

- [ ] **Step 3: Replace the `extractFromMap` stub with the real implementation**

In `lib/parser/parse-component.ts`, replace the existing `extractFromMap` function with:
```ts
function extractFromMap(
  expr: unknown,
  _fromMap: boolean,
): SkeletonNode | null {
  if (
    !expr ||
    typeof expr !== "object" ||
    !("type" in expr)
  ) {
    return null;
  }
  if (!isCallExpression(expr as never)) return null;
  const call = expr as import("@babel/types").CallExpression;
  if (!isMemberExpression(call.callee)) return null;
  if (!isIdentifier(call.callee.property) || call.callee.property.name !== "map") return null;
  const callback = call.arguments[0];
  if (!callback) return null;
  if (
    callback.type !== "ArrowFunctionExpression" &&
    callback.type !== "FunctionExpression"
  ) {
    return null;
  }
  const body = callback.body;
  let returned: JSXElement | JSXFragment | null = null;
  if (isJSXElement(body) || isJSXFragment(body)) {
    returned = body;
  } else if (body.type === "BlockStatement") {
    for (const stmt of body.body) {
      if (isReturnStatement(stmt)) {
        const arg = stmt.argument;
        if (arg && (isJSXElement(arg) || isJSXFragment(arg))) {
          returned = arg;
          break;
        }
      }
    }
  }
  if (!returned) return null;
  return convertJSX(returned, true);
}
```

- [ ] **Step 4: Run tests**

Run:
```bash
npm test -- lib/parser/parse-component.test.ts
```

Expected: ALL tests PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/parser/parse-component.ts lib/parser/parse-component.test.ts
git commit -m "feat(parser): render .map() callback as one representative child"
```

---

## Task 8: parse-component — error cases

**Files:**
- Modify: `lib/parser/parse-component.test.ts`

The parser already produces structured errors (Task 6). This task adds explicit coverage.

- [ ] **Step 1: Add failing tests**

Append to `lib/parser/parse-component.test.ts`:
```ts
describe("parseComponent (errors)", () => {
  it("returns syntax-error on broken input", () => {
    const r = parseComponent(`function X( { return <div /> }`);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error.kind).toBe("syntax-error");
  });

  it("returns no-return when component has no return", () => {
    const r = parseComponent(`
      export default function X() {
        const y = 1;
      }
    `);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error.kind).toBe("no-return");
  });

  it("returns no-return when source has no function component at all", () => {
    const r = parseComponent(`const x = 1;`);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error.kind).toBe("no-return");
  });

  it("returns no-component when return is not JSX", () => {
    const r = parseComponent(`
      export default function X() {
        return null;
      }
    `);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error.kind).toBe("no-return");
    // Note: the parser scans for the first JSX-returning function. A bare
    // `return null` is treated the same as "no JSX return found".
  });
});
```

- [ ] **Step 2: Run tests**

Run:
```bash
npm test -- lib/parser/parse-component.test.ts
```

Expected: ALL tests PASS (no implementation changes needed; error paths are already wired).

- [ ] **Step 3: Commit**

```bash
git add lib/parser/parse-component.test.ts
git commit -m "test(parser): cover syntax-error, no-return, no-component error paths"
```

---

## Task 9: parse-component — confidence assignment

**Files:**
- Modify: `lib/parser/parse-component.test.ts`

The implementation is already in place; this task locks confidence behaviour into tests.

- [ ] **Step 1: Add failing tests**

Append to `lib/parser/parse-component.test.ts`:
```ts
describe("parseComponent (confidence)", () => {
  it("assigns 'high' when both width and height come from classes", () => {
    const r = parseComponent(`
      function X() { return <div className="w-32 h-10" />; }
    `);
    if (!r.ok) throw new Error("expected ok");
    expect(r.tree.confidence).toBe("high");
  });

  it("assigns 'medium' when only one dimension is in classes", () => {
    const r = parseComponent(`
      function X() { return <div className="w-32" />; }
    `);
    if (!r.ok) throw new Error("expected ok");
    expect(r.tree.confidence).toBe("medium");
  });

  it("assigns 'fallback' when no class hints exist", () => {
    const r = parseComponent(`
      function X() { return <button />; }
    `);
    if (!r.ok) throw new Error("expected ok");
    expect(r.tree.confidence).toBe("fallback");
  });

  it("preserves sourceTag on every node", () => {
    const r = parseComponent(`
      function X() {
        return (
          <section>
            <h2 />
            <button />
          </section>
        );
      }
    `);
    if (!r.ok) throw new Error("expected ok");
    expect(r.tree.sourceTag).toBe("section");
    expect(r.tree.children?.[0].sourceTag).toBe("h2");
    expect(r.tree.children?.[1].sourceTag).toBe("button");
  });
});
```

- [ ] **Step 2: Run tests**

Run:
```bash
npm test -- lib/parser/parse-component.test.ts
```

Expected: ALL tests PASS.

- [ ] **Step 3: Commit**

```bash
git add lib/parser/parse-component.test.ts
git commit -m "test(parser): lock confidence levels and sourceTag preservation"
```

---

## Task 10: format-classes shared helper

**Files:**
- Create: `lib/exporters/format-classes.ts`
- Create: `lib/exporters/format-classes.test.ts`

- [ ] **Step 1: Write the failing test**

Create `lib/exporters/format-classes.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import type { GlobalSettings, SkeletonNode } from "@/lib/ir/types";
import { blockClasses, SHIMMER_KEYFRAMES } from "./format-classes";

const settings: GlobalSettings = {
  animation: "pulse",
  speed: "normal",
  baseColor: "bg-zinc-200",
  theme: "light",
};

function node(partial: Partial<SkeletonNode> = {}): SkeletonNode {
  return {
    id: "x",
    kind: "text",
    confidence: "high",
    visible: true,
    ...partial,
  };
}

describe("blockClasses", () => {
  it("emits base color + animate-pulse for pulse skeleton", () => {
    const cls = blockClasses(node({ width: 100, height: 20 }), settings);
    expect(cls).toContain("bg-zinc-200");
    expect(cls).toContain("animate-pulse");
    expect(cls).toContain("w-[100px]");
    expect(cls).toContain("h-[20px]");
  });

  it("uses w-full when width === 'full'", () => {
    const cls = blockClasses(node({ width: "full", height: 20 }), settings);
    expect(cls).toContain("w-full");
    expect(cls).not.toContain("w-[");
  });

  it("emits rounded-full when radius >= 9999", () => {
    const cls = blockClasses(node({ width: 40, height: 40, radius: 9999 }), settings);
    expect(cls).toContain("rounded-full");
  });

  it("emits arbitrary radius otherwise", () => {
    const cls = blockClasses(node({ width: 40, height: 40, radius: 12 }), settings);
    expect(cls).toContain("rounded-[12px]");
  });

  it("emits shimmer classes when animation is shimmer", () => {
    const cls = blockClasses(
      node({ width: 100, height: 20 }),
      { ...settings, animation: "shimmer" },
    );
    expect(cls).toContain("animate-[shimmer_1.5s_linear_infinite]");
    expect(cls).toContain("bg-gradient-to-r");
  });

  it("emits container flex classes (and no animation/color)", () => {
    const cls = blockClasses(
      node({ kind: "container", layout: { direction: "row", gap: 12 } }),
      settings,
    );
    expect(cls).toContain("flex");
    expect(cls).toContain("flex-row");
    expect(cls).toContain("gap-[12px]");
    expect(cls).not.toContain("animate-pulse");
    expect(cls).not.toContain("bg-zinc-200");
  });

  it("respects speed setting via animation-duration arbitrary class", () => {
    const slow = blockClasses(node({ width: 10, height: 10 }), { ...settings, speed: "slow" });
    const fast = blockClasses(node({ width: 10, height: 10 }), { ...settings, speed: "fast" });
    expect(slow).toContain("[animation-duration:2s]");
    expect(fast).toContain("[animation-duration:1s]");
  });

  it("exposes shimmer keyframes for exporters to inline", () => {
    expect(SHIMMER_KEYFRAMES).toContain("@keyframes shimmer");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
npm test -- lib/exporters/format-classes.test.ts
```

Expected: FAIL (module not found).

- [ ] **Step 3: Implement the helper**

Create `lib/exporters/format-classes.ts`:
```ts
import type { GlobalSettings, SkeletonNode } from "@/lib/ir/types";

const SPEED_MAP: Record<GlobalSettings["speed"], string> = {
  slow: "[animation-duration:2s]",
  normal: "[animation-duration:1.5s]",
  fast: "[animation-duration:1s]",
};

export const SHIMMER_KEYFRAMES = `@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position:  200% 0; }
}`;

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
```

- [ ] **Step 4: Run tests**

Run:
```bash
npm test -- lib/exporters/format-classes.test.ts
```

Expected: ALL tests PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/exporters/format-classes.ts lib/exporters/format-classes.test.ts
git commit -m "feat(exporters): add shared blockClasses helper + shimmer keyframes"
```

---

## Task 11: React + Tailwind exporter

**Files:**
- Create: `lib/exporters/react-tailwind.ts`
- Create: `lib/exporters/react-tailwind.test.ts`

- [ ] **Step 1: Write the failing test**

Create `lib/exporters/react-tailwind.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import type { GlobalSettings, SkeletonNode } from "@/lib/ir/types";
import { exportReact } from "./react-tailwind";

const settings: GlobalSettings = {
  animation: "pulse",
  speed: "normal",
  baseColor: "bg-zinc-200",
  theme: "light",
};

const leaf: SkeletonNode = {
  id: "a",
  kind: "text",
  confidence: "high",
  visible: true,
  width: 100,
  height: 20,
};

describe("exportReact", () => {
  it("wraps a single leaf in a function component", () => {
    const out = exportReact(leaf, settings);
    expect(out).toContain("export function Skeleton()");
    expect(out).toContain("return (");
    expect(out).toContain("<div");
    expect(out).toContain("w-[100px]");
    expect(out).toContain("animate-pulse");
  });

  it("renders nested containers and children", () => {
    const tree: SkeletonNode = {
      id: "root",
      kind: "container",
      confidence: "high",
      visible: true,
      layout: { direction: "col", gap: 12 },
      children: [leaf, { ...leaf, id: "b" }],
    };
    const out = exportReact(tree, settings);
    expect(out).toContain("flex-col");
    expect(out).toContain("gap-[12px]");
    // two leaves
    expect(out.match(/w-\[100px\]/g)?.length).toBe(2);
  });

  it("omits hidden blocks", () => {
    const tree: SkeletonNode = {
      id: "root",
      kind: "container",
      confidence: "high",
      visible: true,
      layout: { direction: "col" },
      children: [
        leaf,
        { ...leaf, id: "hidden", visible: false },
      ],
    };
    const out = exportReact(tree, settings);
    expect(out.match(/w-\[100px\]/g)?.length).toBe(1);
  });

  it("expands paragraph into N lines based on lineCount", () => {
    const para: SkeletonNode = {
      id: "p",
      kind: "paragraph",
      confidence: "high",
      visible: true,
      width: "full",
      height: 12,
      lineCount: 3,
    };
    const out = exportReact(para, settings);
    expect(out.match(/h-\[12px\]/g)?.length).toBe(3);
  });

  it("prepends shimmer keyframes when animation is shimmer", () => {
    const out = exportReact(leaf, { ...settings, animation: "shimmer" });
    expect(out).toContain("@keyframes shimmer");
    expect(out).toContain("animate-[shimmer_");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
npm test -- lib/exporters/react-tailwind.test.ts
```

Expected: FAIL (module not found).

- [ ] **Step 3: Implement the exporter**

Create `lib/exporters/react-tailwind.ts`:
```ts
import type { GlobalSettings, SkeletonNode } from "@/lib/ir/types";
import { SHIMMER_KEYFRAMES, blockClasses } from "./format-classes";

export function exportReact(tree: SkeletonNode, settings: GlobalSettings): string {
  const header =
    settings.animation === "shimmer"
      ? `// Shimmer animation requires these keyframes in your global CSS:\n/*\n${SHIMMER_KEYFRAMES}\n*/\n`
      : "";
  return `${header}export function Skeleton() {\n  return (\n${renderNode(tree, settings, 4)}\n  );\n}\n`;
}

function renderNode(node: SkeletonNode, settings: GlobalSettings, indent: number): string {
  if (!node.visible) return "";
  const pad = " ".repeat(indent);

  if (node.kind === "paragraph") {
    const lines = node.lineCount ?? 1;
    const lineCls = blockClasses({ ...node, kind: "text" }, settings);
    const linesJsx = Array.from({ length: lines }, () =>
      `${pad}  <div className="${lineCls}" />`,
    ).join("\n");
    return `${pad}<div className="flex flex-col gap-2">\n${linesJsx}\n${pad}</div>`;
  }

  const cls = blockClasses(node, settings);
  const childTags = (node.children ?? [])
    .map((c) => renderNode(c, settings, indent + 2))
    .filter(Boolean);

  if (childTags.length === 0) {
    return `${pad}<div className="${cls}" />`;
  }
  return `${pad}<div className="${cls}">\n${childTags.join("\n")}\n${pad}</div>`;
}
```

- [ ] **Step 4: Run tests**

Run:
```bash
npm test -- lib/exporters/react-tailwind.test.ts
```

Expected: ALL tests PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/exporters/react-tailwind.ts lib/exporters/react-tailwind.test.ts
git commit -m "feat(exporters): add React+Tailwind exporter with paragraph + shimmer support"
```

---

## Task 12: HTML + Tailwind exporter

**Files:**
- Create: `lib/exporters/html-tailwind.ts`
- Create: `lib/exporters/html-tailwind.test.ts`

- [ ] **Step 1: Write the failing test**

Create `lib/exporters/html-tailwind.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import type { GlobalSettings, SkeletonNode } from "@/lib/ir/types";
import { exportHTML } from "./html-tailwind";

const settings: GlobalSettings = {
  animation: "pulse",
  speed: "normal",
  baseColor: "bg-zinc-200",
  theme: "light",
};

const leaf: SkeletonNode = {
  id: "a",
  kind: "text",
  confidence: "high",
  visible: true,
  width: 100,
  height: 20,
};

describe("exportHTML", () => {
  it("emits a div with class= (not className=)", () => {
    const out = exportHTML(leaf, settings);
    expect(out).toContain('class="');
    expect(out).not.toContain("className=");
  });

  it("nests children", () => {
    const tree: SkeletonNode = {
      id: "root",
      kind: "container",
      confidence: "high",
      visible: true,
      layout: { direction: "row", gap: 8 },
      children: [leaf, { ...leaf, id: "b" }],
    };
    const out = exportHTML(tree, settings);
    expect(out).toContain("flex-row");
    expect(out).toContain("gap-[8px]");
    expect(out.match(/w-\[100px\]/g)?.length).toBe(2);
  });

  it("omits hidden blocks", () => {
    const tree: SkeletonNode = {
      id: "root",
      kind: "container",
      confidence: "high",
      visible: true,
      layout: { direction: "col" },
      children: [leaf, { ...leaf, id: "h", visible: false }],
    };
    const out = exportHTML(tree, settings);
    expect(out.match(/w-\[100px\]/g)?.length).toBe(1);
  });

  it("expands paragraph lines", () => {
    const para: SkeletonNode = {
      id: "p", kind: "paragraph", confidence: "high", visible: true,
      width: "full", height: 12, lineCount: 4,
    };
    const out = exportHTML(para, settings);
    expect(out.match(/h-\[12px\]/g)?.length).toBe(4);
  });

  it("prepends a <style> block when animation is shimmer", () => {
    const out = exportHTML(leaf, { ...settings, animation: "shimmer" });
    expect(out).toContain("<style>");
    expect(out).toContain("@keyframes shimmer");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
npm test -- lib/exporters/html-tailwind.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement the exporter**

Create `lib/exporters/html-tailwind.ts`:
```ts
import type { GlobalSettings, SkeletonNode } from "@/lib/ir/types";
import { SHIMMER_KEYFRAMES, blockClasses } from "./format-classes";

export function exportHTML(tree: SkeletonNode, settings: GlobalSettings): string {
  const styleBlock =
    settings.animation === "shimmer"
      ? `<style>\n${SHIMMER_KEYFRAMES}\n</style>\n`
      : "";
  return `${styleBlock}${renderNode(tree, settings, 0)}\n`;
}

function renderNode(node: SkeletonNode, settings: GlobalSettings, indent: number): string {
  if (!node.visible) return "";
  const pad = " ".repeat(indent);

  if (node.kind === "paragraph") {
    const lines = node.lineCount ?? 1;
    const lineCls = blockClasses({ ...node, kind: "text" }, settings);
    const linesHtml = Array.from({ length: lines }, () =>
      `${pad}  <div class="${lineCls}"></div>`,
    ).join("\n");
    return `${pad}<div class="flex flex-col gap-2">\n${linesHtml}\n${pad}</div>`;
  }

  const cls = blockClasses(node, settings);
  const childTags = (node.children ?? [])
    .map((c) => renderNode(c, settings, indent + 2))
    .filter(Boolean);

  if (childTags.length === 0) {
    return `${pad}<div class="${cls}"></div>`;
  }
  return `${pad}<div class="${cls}">\n${childTags.join("\n")}\n${pad}</div>`;
}
```

- [ ] **Step 4: Run tests**

Run:
```bash
npm test -- lib/exporters/html-tailwind.test.ts
```

Expected: ALL tests PASS.

- [ ] **Step 5: Run the entire test suite**

Run:
```bash
npm test
```

Expected: ALL test files PASS.

- [ ] **Step 6: Commit**

```bash
git add lib/exporters/html-tailwind.ts lib/exporters/html-tailwind.test.ts
git commit -m "feat(exporters): add HTML+Tailwind exporter with paragraph + shimmer support"
```

---

## Task 13: Example snippets

**Files:**
- Create: `lib/examples/snippets.ts`

- [ ] **Step 1: Create the file**

```ts
export type ExampleSnippet = {
  id: string;
  name: string;
  source: string;
};

export const EXAMPLE_SNIPPETS: ExampleSnippet[] = [
  {
    id: "profile-card",
    name: "Profile Card",
    source: `export default function ProfileCard() {
  return (
    <div className="flex flex-col gap-4 w-80">
      <div className="flex gap-3">
        <div className="w-12 h-12 rounded-full bg-zinc-200" />
        <div className="flex flex-col gap-2">
          <h2 className="w-32 h-4" />
          <p className="w-48 h-3" />
        </div>
      </div>
      <p className="w-full h-3" />
    </div>
  );
}`,
  },
  {
    id: "blog-row",
    name: "Blog Row",
    source: `export const BlogRow = () => (
  <div className="flex gap-4 w-[640px]">
    <img className="w-40 h-28 rounded-lg" />
    <div className="flex flex-col gap-2 flex-1">
      <h2 className="w-64 h-5" />
      <p className="w-full h-3" />
      <p className="w-3/4 h-3" />
    </div>
  </div>
);`,
  },
  {
    id: "table-row",
    name: "Table Row",
    source: `export default function TableRow() {
  return (
    <ul className="flex flex-col gap-2 w-[640px]">
      {rows.map((r) => (
        <li className="flex gap-4 w-full h-10">
          <span className="w-32 h-4" />
          <span className="w-24 h-4" />
          <span className="w-40 h-4" />
        </li>
      ))}
    </ul>
  );
}`,
  },
];
```

- [ ] **Step 2: Verify file type-checks**

Run:
```bash
npx tsc --noEmit
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add lib/examples/snippets.ts
git commit -m "feat(examples): add three curated JSX snippets for empty state"
```

---

## Task 14: Zustand store with localStorage persistence

**Files:**
- Create: `store/use-skeleton-store.ts`

The store is exercised through the UI in later tasks; no separate unit tests.

- [ ] **Step 1: Create the store**

```ts
"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { mutateNode } from "@/lib/ir/helpers";
import type {
  GlobalSettings,
  ParseError,
  SkeletonNode,
} from "@/lib/ir/types";
import { parseComponent } from "@/lib/parser/parse-component";

type State = {
  source: string;
  tree: SkeletonNode | null;
  error: ParseError | null;
  selectedId: string | null;
  settings: GlobalSettings;
};

type Actions = {
  setSource: (s: string) => void;
  parseNow: () => void;
  selectNode: (id: string | null) => void;
  patchNode: (id: string, patch: Partial<SkeletonNode>) => void;
  setSettings: (patch: Partial<GlobalSettings>) => void;
  reset: () => void;
};

const DEFAULT_SETTINGS: GlobalSettings = {
  animation: "pulse",
  speed: "normal",
  baseColor: "bg-zinc-200",
  theme: "light",
};

export const useSkeletonStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      source: "",
      tree: null,
      error: null,
      selectedId: null,
      settings: DEFAULT_SETTINGS,

      setSource: (s) => set({ source: s }),

      parseNow: () => {
        const { source } = get();
        if (!source.trim()) {
          set({ tree: null, error: null, selectedId: null });
          return;
        }
        const result = parseComponent(source);
        if (result.ok) {
          set({ tree: result.tree, error: null, selectedId: null });
        } else {
          set({ tree: null, error: result.error, selectedId: null });
        }
      },

      selectNode: (id) => set({ selectedId: id }),

      patchNode: (id, patch) => {
        const { tree } = get();
        if (!tree) return;
        set({ tree: mutateNode(tree, id, patch) });
      },

      setSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),

      reset: () =>
        set({
          source: "",
          tree: null,
          error: null,
          selectedId: null,
          settings: DEFAULT_SETTINGS,
        }),
    }),
    {
      name: "skeleton-generator-v1",
      partialize: (s) => ({
        source: s.source,
        tree: s.tree,
        settings: s.settings,
      }),
    },
  ),
);
```

- [ ] **Step 2: Verify type-check**

Run:
```bash
npx tsc --noEmit
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add store/use-skeleton-store.ts
git commit -m "feat(store): add Zustand store with localStorage persistence"
```

---

## Task 15: SkeletonRenderer component (IR → live preview)

**Files:**
- Create: `components/skeleton-renderer.tsx`

- [ ] **Step 1: Create the component**

```tsx
"use client";
import type { GlobalSettings, SkeletonNode } from "@/lib/ir/types";
import { blockClasses } from "@/lib/exporters/format-classes";

type Props = {
  node: SkeletonNode;
  settings: GlobalSettings;
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function SkeletonRenderer({ node, settings, selectedId, onSelect }: Props) {
  return <Node node={node} settings={settings} selectedId={selectedId} onSelect={onSelect} />;
}

function Node({ node, settings, selectedId, onSelect }: Props) {
  if (!node.visible) return null;
  const cls = blockClasses(node, settings);
  const isSelected = selectedId === node.id;
  const ring = isSelected ? " ring-2 ring-blue-500" : "";
  const lowConfidence =
    node.confidence === "fallback" && node.kind !== "container"
      ? " outline outline-1 outline-amber-400/50"
      : "";

  const handleClick: React.MouseEventHandler = (e) => {
    e.stopPropagation();
    onSelect(node.id);
  };

  if (node.kind === "paragraph") {
    const lines = node.lineCount ?? 1;
    return (
      <div className={`flex flex-col gap-2${ring}`} onClick={handleClick}>
        {Array.from({ length: lines }, (_, i) => (
          <div key={i} className={blockClasses({ ...node, kind: "text" }, settings) + lowConfidence} />
        ))}
      </div>
    );
  }

  if (!node.children || node.children.length === 0) {
    return <div className={cls + ring + lowConfidence} onClick={handleClick} />;
  }
  return (
    <div className={cls + ring} onClick={handleClick}>
      {node.children.map((c) => (
        <Node key={c.id} node={c} settings={settings} selectedId={selectedId} onSelect={onSelect} />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Verify type-check**

Run:
```bash
npx tsc --noEmit
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add components/skeleton-renderer.tsx
git commit -m "feat(ui): add SkeletonRenderer for live IR preview with selection"
```

---

## Task 16: PasteInput component

**Files:**
- Create: `components/paste-input.tsx`

- [ ] **Step 1: Create the component**

```tsx
"use client";
import { useSkeletonStore } from "@/store/use-skeleton-store";

export function PasteInput() {
  const source = useSkeletonStore((s) => s.source);
  const error = useSkeletonStore((s) => s.error);
  const setSource = useSkeletonStore((s) => s.setSource);
  const parseNow = useSkeletonStore((s) => s.parseNow);

  return (
    <div className="flex flex-col gap-2 h-full">
      <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
        Paste JSX
      </label>
      <textarea
        value={source}
        onChange={(e) => setSource(e.target.value)}
        spellCheck={false}
        className="flex-1 w-full p-3 rounded-lg bg-zinc-900 text-zinc-100 font-mono text-sm border border-zinc-800 focus:outline-none focus:border-blue-500 resize-none"
        placeholder="export default function Card() { ... }"
      />
      <div className="flex items-center gap-3">
        <button
          onClick={parseNow}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500"
        >
          Generate Skeleton
        </button>
        {error && (
          <span className="text-sm text-red-400">
            {error.kind === "syntax-error" && "Syntax error: "}
            {error.kind === "no-return" && "No JSX return found. "}
            {error.kind === "no-component" && "Return is not JSX. "}
            {error.message}
          </span>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify type-check**

Run:
```bash
npx tsc --noEmit
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add components/paste-input.tsx
git commit -m "feat(ui): add PasteInput component with error display"
```

---

## Task 17: PreviewCanvas component

**Files:**
- Create: `components/preview-canvas.tsx`

- [ ] **Step 1: Create the component**

```tsx
"use client";
import { useSkeletonStore } from "@/store/use-skeleton-store";
import { SkeletonRenderer } from "./skeleton-renderer";

export function PreviewCanvas() {
  const tree = useSkeletonStore((s) => s.tree);
  const settings = useSkeletonStore((s) => s.settings);
  const selectedId = useSkeletonStore((s) => s.selectedId);
  const selectNode = useSkeletonStore((s) => s.selectNode);

  const bg =
    settings.theme === "dark"
      ? "bg-zinc-900 text-zinc-100"
      : "bg-white text-zinc-900";

  return (
    <div
      className={`flex-1 h-full rounded-lg border border-zinc-800 p-8 overflow-auto ${bg}`}
      onClick={() => selectNode(null)}
    >
      {tree ? (
        <SkeletonRenderer
          node={tree}
          settings={settings}
          selectedId={selectedId}
          onSelect={selectNode}
        />
      ) : (
        <div className="flex h-full items-center justify-center text-zinc-500 text-sm">
          Paste a component to see its skeleton.
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify type-check**

Run:
```bash
npx tsc --noEmit
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add components/preview-canvas.tsx
git commit -m "feat(ui): add PreviewCanvas wrapper with theme background"
```

---

## Task 18: PropertiesPanel component

**Files:**
- Create: `components/properties-panel.tsx`

- [ ] **Step 1: Create the component**

```tsx
"use client";
import { useSkeletonStore } from "@/store/use-skeleton-store";
import { findNode } from "@/lib/ir/helpers";
import type { SkeletonNode } from "@/lib/ir/types";

export function PropertiesPanel() {
  const tree = useSkeletonStore((s) => s.tree);
  const selectedId = useSkeletonStore((s) => s.selectedId);
  const patchNode = useSkeletonStore((s) => s.patchNode);

  const node = tree && selectedId ? findNode(tree, selectedId) : null;

  if (!node) {
    return (
      <aside className="w-72 p-4 border-l border-zinc-800 text-sm text-zinc-500">
        Select a block to edit its properties.
      </aside>
    );
  }

  const update = (patch: Partial<SkeletonNode>) => patchNode(node.id, patch);

  return (
    <aside className="w-72 p-4 border-l border-zinc-800 flex flex-col gap-4">
      <div className="text-xs uppercase tracking-wide text-zinc-400">
        {node.kind}
        {node.sourceTag ? ` · <${node.sourceTag}>` : ""}
      </div>

      <NumberField
        label="Width (px, blank = auto)"
        value={typeof node.width === "number" ? node.width : undefined}
        onChange={(v) => update({ width: v })}
      />
      <FullToggle
        label="Full width"
        active={node.width === "full"}
        onChange={(on) => update({ width: on ? "full" : undefined })}
      />
      <NumberField
        label="Height (px)"
        value={node.height}
        onChange={(v) => update({ height: v })}
      />
      <NumberField
        label="Radius (px)"
        value={node.radius}
        onChange={(v) => update({ radius: v })}
      />
      {node.kind === "paragraph" && (
        <NumberField
          label="Line count"
          value={node.lineCount}
          onChange={(v) => update({ lineCount: v ?? 1 })}
          min={1}
        />
      )}
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={node.visible}
          onChange={(e) => update({ visible: e.target.checked })}
        />
        Visible
      </label>
      {node.confidence === "fallback" && (
        <div className="text-xs text-amber-400">
          Low-confidence block — verify dimensions.
        </div>
      )}
    </aside>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min = 0,
}: {
  label: string;
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  min?: number;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs text-zinc-400">
      {label}
      <input
        type="number"
        min={min}
        value={value ?? ""}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === "") onChange(undefined);
          else {
            const n = Number(raw);
            if (!Number.isNaN(n)) onChange(n);
          }
        }}
        className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm"
      />
    </label>
  );
}

function FullToggle({
  label,
  active,
  onChange,
}: {
  label: string;
  active: boolean;
  onChange: (on: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={active}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  );
}
```

- [ ] **Step 2: Verify type-check**

Run:
```bash
npx tsc --noEmit
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add components/properties-panel.tsx
git commit -m "feat(ui): add PropertiesPanel for per-block editing"
```

---

## Task 19: GlobalControls component

**Files:**
- Create: `components/global-controls.tsx`

- [ ] **Step 1: Create the component**

```tsx
"use client";
import { useSkeletonStore } from "@/store/use-skeleton-store";

const BASE_COLORS: { value: string; label: string }[] = [
  { value: "bg-zinc-200", label: "Zinc 200" },
  { value: "bg-zinc-300", label: "Zinc 300" },
  { value: "bg-zinc-800", label: "Zinc 800" },
  { value: "bg-blue-200", label: "Blue 200" },
  { value: "bg-blue-900/40", label: "Blue 900/40" },
];

export function GlobalControls() {
  const settings = useSkeletonStore((s) => s.settings);
  const setSettings = useSkeletonStore((s) => s.setSettings);

  return (
    <div className="flex flex-wrap items-center gap-4 px-4 py-3 border-b border-zinc-800 text-sm">
      <Select
        label="Animation"
        value={settings.animation}
        options={[
          { value: "pulse", label: "Pulse" },
          { value: "shimmer", label: "Shimmer" },
        ]}
        onChange={(v) => setSettings({ animation: v as "pulse" | "shimmer" })}
      />
      <Select
        label="Speed"
        value={settings.speed}
        options={[
          { value: "slow", label: "Slow" },
          { value: "normal", label: "Normal" },
          { value: "fast", label: "Fast" },
        ]}
        onChange={(v) => setSettings({ speed: v as "slow" | "normal" | "fast" })}
      />
      <Select
        label="Base color"
        value={settings.baseColor}
        options={BASE_COLORS}
        onChange={(v) => setSettings({ baseColor: v })}
      />
      <Select
        label="Theme"
        value={settings.theme}
        options={[
          { value: "light", label: "Light" },
          { value: "dark", label: "Dark" },
        ]}
        onChange={(v) => setSettings({ theme: v as "light" | "dark" })}
      />
    </div>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-zinc-400">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-100"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
```

- [ ] **Step 2: Verify type-check**

Run:
```bash
npx tsc --noEmit
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add components/global-controls.tsx
git commit -m "feat(ui): add GlobalControls bar (animation/speed/color/theme)"
```

---

## Task 20: ExampleSnippets component

**Files:**
- Create: `components/example-snippets.tsx`

- [ ] **Step 1: Create the component**

```tsx
"use client";
import { useSkeletonStore } from "@/store/use-skeleton-store";
import { EXAMPLE_SNIPPETS } from "@/lib/examples/snippets";

export function ExampleSnippets() {
  const setSource = useSkeletonStore((s) => s.setSource);
  const parseNow = useSkeletonStore((s) => s.parseNow);

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-zinc-500">Try:</span>
      {EXAMPLE_SNIPPETS.map((snip) => (
        <button
          key={snip.id}
          onClick={() => {
            setSource(snip.source);
            // setState is sync in Zustand; parseNow reads updated source.
            queueMicrotask(parseNow);
          }}
          className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800"
        >
          {snip.name}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Verify type-check**

Run:
```bash
npx tsc --noEmit
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add components/example-snippets.tsx
git commit -m "feat(ui): add ExampleSnippets loader for paste-input cold start"
```

---

## Task 21: ExportModal component

**Files:**
- Create: `components/export-modal.tsx`

- [ ] **Step 1: Create the component**

```tsx
"use client";
import { useMemo, useState } from "react";
import { useSkeletonStore } from "@/store/use-skeleton-store";
import { exportReact } from "@/lib/exporters/react-tailwind";
import { exportHTML } from "@/lib/exporters/html-tailwind";

type Tab = "react" | "html";

export function ExportModal({ onClose }: { onClose: () => void }) {
  const tree = useSkeletonStore((s) => s.tree);
  const settings = useSkeletonStore((s) => s.settings);
  const [tab, setTab] = useState<Tab>("react");

  const output = useMemo(() => {
    if (!tree) return "";
    return tab === "react" ? exportReact(tree, settings) : exportHTML(tree, settings);
  }, [tree, settings, tab]);

  const copy = async () => {
    await navigator.clipboard.writeText(output);
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="w-[720px] max-h-[80vh] bg-zinc-950 border border-zinc-800 rounded-xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-zinc-800">
          <div className="flex gap-2">
            <TabButton active={tab === "react"} onClick={() => setTab("react")}>
              React + Tailwind
            </TabButton>
            <TabButton active={tab === "html"} onClick={() => setTab("html")}>
              HTML + Tailwind
            </TabButton>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-100 text-sm"
          >
            Close
          </button>
        </header>
        <pre className="flex-1 overflow-auto p-4 text-xs text-zinc-200 font-mono whitespace-pre">
          {output || "Generate a skeleton first."}
        </pre>
        <footer className="p-4 border-t border-zinc-800 flex justify-end">
          <button
            onClick={copy}
            disabled={!output}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 disabled:opacity-50"
          >
            Copy
          </button>
        </footer>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-sm ${
        active
          ? "bg-zinc-800 text-zinc-100"
          : "text-zinc-400 hover:text-zinc-200"
      }`}
    >
      {children}
    </button>
  );
}
```

- [ ] **Step 2: Verify type-check**

Run:
```bash
npx tsc --noEmit
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add components/export-modal.tsx
git commit -m "feat(ui): add ExportModal with React/HTML tabs and copy-to-clipboard"
```

---

## Task 22: Wire everything into the main page

**Files:**
- Modify: `app/page.tsx` (overwrite the Next.js starter content)
- Modify: `app/layout.tsx` (update metadata)

- [ ] **Step 1: Rewrite `app/page.tsx`**

```tsx
"use client";
import { useState } from "react";
import { PasteInput } from "@/components/paste-input";
import { PreviewCanvas } from "@/components/preview-canvas";
import { PropertiesPanel } from "@/components/properties-panel";
import { GlobalControls } from "@/components/global-controls";
import { ExampleSnippets } from "@/components/example-snippets";
import { ExportModal } from "@/components/export-modal";
import { useSkeletonStore } from "@/store/use-skeleton-store";

export default function Home() {
  const [exportOpen, setExportOpen] = useState(false);
  const tree = useSkeletonStore((s) => s.tree);

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100">
      <header className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <span className="text-base font-semibold">Skeleton Generator</span>
          <ExampleSnippets />
        </div>
        <button
          onClick={() => setExportOpen(true)}
          disabled={!tree}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 disabled:opacity-50"
        >
          Export
        </button>
      </header>
      <GlobalControls />
      <main className="flex flex-1 min-h-0">
        <section className="w-[420px] p-4 border-r border-zinc-800 flex flex-col min-h-0">
          <PasteInput />
        </section>
        <section className="flex-1 p-4 min-h-0 flex">
          <PreviewCanvas />
        </section>
        <PropertiesPanel />
      </main>
      {exportOpen && <ExportModal onClose={() => setExportOpen(false)} />}
    </div>
  );
}
```

- [ ] **Step 2: Update `app/layout.tsx` metadata**

Replace the `metadata` export in `app/layout.tsx` with:
```ts
export const metadata: Metadata = {
  title: "Skeleton Generator",
  description:
    "Paste your component. Get a realistic skeleton loader instantly.",
};
```

Leave everything else in the file (fonts, layout JSX) alone.

- [ ] **Step 3: Type-check and lint**

Run:
```bash
npx tsc --noEmit && npm run lint
```

Expected: PASS for both.

- [ ] **Step 4: Run the dev server and manually verify**

Run:
```bash
npm run dev
```

Open `http://localhost:3000` and verify:
- The page renders without console errors.
- Clicking a "Try: Profile Card" snippet button auto-loads source and renders a preview.
- Typing `<div className="w-32 h-10" />` into the paste box and clicking "Generate Skeleton" renders a 128×40 block.
- Clicking a block in the preview opens the properties panel; changing width updates live.
- Switching theme between light/dark changes the preview background.
- Switching animation to "Shimmer" changes preview animation classes.
- Clicking "Export" opens the modal; switching tabs swaps content; copy works.
- Refreshing the browser restores the last source and edits.

If any of these fail, fix and re-verify before committing.

- [ ] **Step 5: Run full test suite one more time**

Run:
```bash
npm test
```

Expected: ALL tests PASS.

- [ ] **Step 6: Commit**

```bash
git add app/page.tsx app/layout.tsx
git commit -m "feat(app): wire skeleton-generator editor page and metadata"
```

---

## Task 23: Final polish and README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Replace `README.md` with a focused intro**

```markdown
# Skeleton Generator

Paste a React function component (Tailwind-friendly), get a tweakable skeleton loader, export production-ready React+Tailwind or HTML+Tailwind code.

## Develop

\`\`\`bash
npm install
npm run dev
\`\`\`

Open <http://localhost:3000>.

## Test

\`\`\`bash
npm test
\`\`\`

## Architecture

See `doc/RRD.md` for the PRD and `docs/superpowers/plans/2026-05-23-skeleton-generator.md` for the implementation plan.

Pipeline: JSX string → `lib/parser` → `SkeletonNode` IR → preview / `lib/exporters/*`.
```

(Note: the triple-backticks above are escaped in this plan for readability — write them as plain triple-backticks in the actual README.)

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: rewrite README for Skeleton Generator MVP"
```

---

## Spec Coverage Check

| Spec requirement | Covered by task |
|---|---|
| Paste JSX → skeleton preview | 6, 14, 16, 17 |
| Tailwind class reading (`w-*`, `h-*`, `rounded-*`, `gap-*`) | 5 |
| Strip hooks/conditionals/TS | 6 |
| `.map()` representative child | 7 |
| Structured parse errors + UI display | 8, 16 |
| `SkeletonNode` IR with confidence + sourceTag | 2, 9 |
| Per-block edits (w/h/radius/visibility/lineCount) | 14, 18 |
| Global controls (animation/speed/color/theme) | 14, 19 |
| Low-confidence flagging in UI | 15 (outline), 18 (label) |
| React+Tailwind exporter | 11 |
| HTML+Tailwind exporter | 12 |
| Copy to clipboard, tabbed export | 21 |
| Auto-save to localStorage, single slot | 14 |
| Example JSX snippets | 13, 20 |
| Dark/light preview toggle | 17, 19 |
| Live edits update preview | 15, 18 |
| Tests for parser, tailwind-reader, both exporters | 5, 6, 7, 8, 9, 10, 11, 12 |
