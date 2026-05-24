# Skeleton Generator — Progress Log

> Live status of features shipped. Generated on 2026-05-25.

---

## 🧱 UI layout (current state)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ 🎨 Skeleton Generator   [Try: Profile Card · Blog Row · Table Row]   🌗  ⤓ Export│
├─────────────────────────────────────────────────────────────────────────────────┤
│ Animation [Pulse ▾]   Speed [Normal ▾]   Base color [Zinc 200 ▾]                │
├──────────────────────────┬───────────────────────────────────┬──────────────────┤
│ PASTE JSX                │ LIVE PREVIEW                      │ container · <div>│
│ ┌──────────────────────┐ │ ┌───────────────────────────────┐ │                  │
│ │ 1  export default …  │ │ │ ╭───────────────────────╮     │ │ Kind             │
│ │ 2    return (        │ │ │ │ 🟦🟦🟦  (avatar bar)  │     │ │ [Container ▾]    │
│ │ 3      <Card …>      │ │ │ │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓     │     │ │                  │
│ │ 4        <CardHeader>│ │ │ │ ▓▓▓▓▓▓                │     │ │ Appearance       │
│ │ 5  …                 │ │ │ │ [ Read More ]         │     │ │ [Card ▾]         │
│ │ ⛳ line:col error     │ │ │ ╰───────────────────────╯     │ │                  │
│ │                      │ │ │                               │ │ Width  [ 320 ]   │
│ └──────────────────────┘ │ │  (selects highlight in green) │ │ ☐ Full width     │
│ [ ✨ Generate Skeleton ] │ │                               │ │ Height [ ___ ]   │
│                          │ └───────────────────────────────┘ │ Radius [ 12 ]    │
│                          │                                   │ ──── Layout ──── │
│                          │                                   │ Direction [Col ▾]│
│                          │                                   │ Gap   [ 12 ]     │
│                          │                                   │ Align  [Center ▾]│
│                          │                                   │ Justify [auto ▾] │
│                          │                                   │ ☐ Wrap children  │
│                          │                                   │ ──── Padding ──── │
│                          │                                   │ T [16]  R [16]   │
│                          │                                   │ B [16]  L [16]   │
│                          │                                   │ ☑ Visible        │
└──────────────────────────┴───────────────────────────────────┴──────────────────┘
```

Three‑pane editor. Top bar = title + example snippets + theme toggle + Export.
Global controls row sits below header.
Main area = paste editor (CodeMirror) | preview canvas | properties panel.

---

## 📦 Architecture pipeline

```
       ┌─────────────┐   ┌──────────────────┐   ┌─────────────────────┐
JSX ── │ @babel/parser │ → │  AST → RawNode    │ → │ SemanticClassifier  │ → SkeletonNode tree
       └─────────────┘   └──────────────────┘   └─────────────────────┘
                                                          │
                              ┌───────────────────────────┼───────────────────────────┐
                              ▼                           ▼                           ▼
                   ┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
                   │ runtime-styles   │      │ format-classes   │      │ runtime-styles   │
                   │ (live preview)   │      │ (exported code)  │      │ (live preview)   │
                   └──────────────────┘      └──────────────────┘      └──────────────────┘
                              │                           │
                              ▼                           ▼
                       SkeletonRenderer            exportReact / exportHTML
```

Pure-function classifier. Renderer + exporter share three-path dispatch
(`isSurfaceWrapper` / container / fill).

---

## ✅ Features shipped

### 🔍 Parser (`lib/parser/`)

- 🧬 **Layered pipeline**: `AST → RawNode → SemanticClassifier → SkeletonNode` (separable, individually testable).
- 🏷️ **Tag defaults** for all common HTML (`h1`–`h6`, `p`, `span`, `a`, `img`, `button`, `input`, `textarea`, `select`, `th`, `td`, `tr`, `table`, `thead`, `tbody`, `tfoot`, `caption`).
- 🎯 **Semantic patterns** (regex) for unknown PascalCase components:
  - `(.*)Button` / `IconButton` / `(.*)Btn` → button
  - `(.*)Image` / `(.*)Img` / `Picture` / `Thumbnail` → image
  - `Heading` / `Title` / `Headline\d*` → text (large)
  - `Typography` / `Text` / `Caption` / `Label` → text
  - `Paragraph` / `Description` → paragraph
  - `Input` / `TextField` / `Combobox` / `(.*)Field` → input
  - `(.*)Card` / `(.*)Header` / `(.*)Body` / `(.*)Footer` / etc → container
- 🧭 **Variant prop resolver** for Typography (`variant="h1..h6"`, `body1`, `body2`, `caption`).
- 📚 **Curated registry** in `COMPONENT_TAG_HINTS`: Avatar, Card, full shadcn Table primitives (Table, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell, TableCaption).
- 🪪 **Confidence rating**: `high` (both dims pinned), `medium` (partial / .map / name-inferred / content-sized), `fallback` (pure tag default).
- 🪄 **`.map()` representative**: extracts one representative child, sets `repeat = 3` so dynamic lists render as multi-row skeletons.

### 🎨 Tailwind class reader (`lib/parser/tailwind-class-reader.ts`)

Parsed token families:

| Family | Examples |
|---|---|
| Width / Height | `w-32`, `w-full`, `w-[240px]`, `h-12`, `h-[2rem]` |
| Radius | `rounded`, `rounded-lg`, `rounded-full`, `rounded-[12px]` |
| Flex | `flex`, `flex-row`, `flex-col`, `flex-wrap`, `flex-nowrap` |
| Gap | `gap-4`, `gap-[8px]` |
| Padding | `p-4`, `px-6`, `py-1`, `pt-`/`pr-`/`pb-`/`pl-*`, `p-[12px]` |
| Margin | `m-2`, `mx-`/`my-`/`mt-`/`mr-`/`mb-`/`ml-*` (aggregated into parent gap) |
| Alignment | `items-{start\|end\|center\|stretch\|baseline}` |
| Justify | `justify-{start\|end\|center\|between\|around\|evenly}` |
| Surface | `bg-*` (except gradients), `border`, `border-{color\|width}` (side-only excluded) |
| Position | `absolute`, `fixed`, `relative`, `sticky` |

Modifiers (`md:`, `dark:`, `hover:`) silently skipped.

### 🧠 Classifier heuristics

- 🪞 **Visual-card heuristic**: container with `bg-*` or `border` → `appearance: "card"` (ring + padding chrome).
- 🚫 **Table tags excluded**: tr/td/etc skip card promotion (their bg/border are dividers, not surfaces).
- 🔄 **Force `Table` as card**: shadcn `<Table>` always renders chrome (mirrors its real DOM wrapper).
- 🪟 **Decorative overlay drop**: `absolute|fixed` + leaf + no children + no text → returned as null. Kills empty z-stacked tints.
- 🧒 **Leaf-container promotion**:
  - sized leaf → card (`<div className="w-12 h-12 rounded-full" />`)
  - leaf with text content → text (`<th>Name</th>`, `<div>Hello</div>`)
  - custom-name leaf → card with 200×80 fallback
- 🧑‍🦱 **Avatar inference**: container with `rounded-full` + explicit dims + single image child → collapse to `avatar` kind.
- 📏 **Content-aware text width**: `<p>Kelvin John</p>` → 85px (chars × 7 + 8, capped 40–320).
- 📰 **Line-count from content**: `<p>` lineCount derived from text length (1 / 2 / 3 / 4 / 5).
- 🚪 **Fill-leaf children stripped**: `<button><svg/><p>x</p></button>` renders as opaque button, no inner ghosts.
- ➗ **Margin → parent gap**: max child `mt`/`mb` (col) or `ml`/`mr` (row) collapses to parent flex gap.
- 🔁 **`.map()` repeat**: 3 copies per dynamic list child (manual override per node).

### 🖼️ Live preview renderer (`components/skeleton-renderer.tsx`)

- 🎭 **Three rendering paths**:
  1. Surface wrapper → flex-col + ring-1 + padding + radius
  2. Container → flex layout (defaults gap 8 when no explicit hint)
  3. Fill block → baseColor + animation + dims
- 💫 **Pulse + shimmer animation**, configurable speed (slow / normal / fast).
- 📑 **Paragraph multi-line**: N lines stacked, last line shortened by deterministic 55–85% factor (hashed from node id).
- 🔁 **Repeat fragment**: any node with `repeat > 1` renders N copies sharing source id.
- ✏️ **Selection ring** (green) on click; click-through to deselect on canvas.
- 🟡 **Low-confidence outline** (amber) on fallback-confidence fill blocks.
- 🌗 **Dark/light follows next-themes** via `bg-background text-foreground`.

### ⚙️ Properties panel (`components/properties-panel.tsx`)

```
┌──────────────────────────┐
│ container · <div>        │
│                          │
│ Kind          [ Container ▾ ]
│ Appearance    [ Card ▾ ]      (containers only)
│ Width  [ 320 ]                
│ ☐ Full width                  
│ Height [ 200 ]
│ Radius [ 12 ]
│ Line count [ 3 ]             (paragraphs only)
│ Repeat [ 3 ]                 (when .map-derived)
│ ──── Layout ────             (containers / card-with-children)
│ Direction  [ Col ▾ ]
│ Gap        [ 12 ]
│ Align      [ Center ▾ ]
│ Justify    [ Auto ▾ ]
│ ☐ Wrap children
│ ──── Padding (px) ────
│  T [16]    R [16]
│  B [16]    L [16]
│ ☑ Visible
└──────────────────────────┘
```

Every IR field manually overridable. Mutations flow through `patchNode` →
`mutateNode` (immutable path-copy).

### 📝 Paste editor

- 🪟 **CodeMirror 6** with `@uiw/react-codemirror`.
- 🎨 JSX + TypeScript syntax highlight.
- 🔢 Line numbers gutter.
- 🚨 Inline syntax error decoration at exact `line:col` (red underline).
- 🌗 Theme follows next-themes (`githubLight` / `githubDark`).
- ⌨️ Bracket matching, auto-close, indent-on-input, search (Cmd+F).

### 📤 Exporters (`lib/exporters/`)

- ⚛️ **React + Tailwind** function component output.
- 🌐 **HTML + Tailwind** standalone.
- 🪡 **Three-path parity** with renderer (surface / container / fill).
- 🌀 **Shimmer keyframes** prepended as comment (React) or `<style>` block (HTML).
- 🔁 **Repeat handling**: emits N inline copies.
- 📐 **Full token coverage**: padding (per side), gap, alignment, wrap, ring chrome, radius, dimensions.
- 📋 **Copy to clipboard** + tabbed React/HTML view in responsive modal.

### 🧪 Tests

```
Test Files:  9 passed
Tests:       215 passed
```

Coverage spread across:
- Parser entry (`parse-component.test.ts`)
- AST walker (`raw-node` via integration)
- Classifier rules (`semantic-classifier.test.ts`)
- Tailwind reader (`tailwind-class-reader.test.ts`)
- Runtime styles (`runtime-styles.test.ts`)
- Format classes (`format-classes.test.ts`)
- React exporter (`react-tailwind.test.ts`)
- HTML exporter (`html-tailwind.test.ts`)
- Integration (`integration.test.ts`) — Material Tailwind sample, BlogRow table, shadcn TableDemo

---

## 🧰 Tech stack

- ⚡ **Next.js 16** (Turbopack dev)
- ⚛️ React 19
- 🎨 Tailwind v4 (CSS variables, `bg-foreground/10` opacity syntax)
- 🧰 shadcn/ui primitives (Button, Input, Textarea, Label, Select, Checkbox, Tabs, Dialog)
- 🐻 Zustand store with `persist` (localStorage, key `skeleton-store-v2`)
- 🦋 Hugeicons
- 🪀 next-themes (dark/light chrome)
- 🪂 @uiw/react-codemirror + @codemirror/lang-javascript + @codemirror/lint
- 🥼 vitest

---

## 📂 File map

```
app/
├── layout.tsx                 ← html h-full + body h-full overflow-hidden
└── page.tsx                   ← three-pane composition
components/
├── code-editor.tsx            ← CodeMirror wrapper
├── example-snippets.tsx
├── export-modal.tsx           ← Dialog + Tabs + Copy
├── global-controls.tsx        ← animation/speed/baseColor selects
├── paste-input.tsx            ← CodeEditor + Generate button
├── preview-canvas.tsx
├── properties-panel.tsx       ← Kind/Appearance/Layout/Padding controls
├── skeleton-renderer.tsx      ← Node orchestrator + SingleNode + repeat fragment
├── theme-provider.tsx
├── theme-toggle.tsx
└── ui/                        ← shadcn primitives
lib/
├── examples/snippets.ts       ← 3 curated JSX snippets
├── exporters/
│   ├── format-classes.ts      ← class string generator (3-path)
│   ├── react-tailwind.ts
│   ├── html-tailwind.ts
│   └── runtime-styles.ts      ← live preview styling
├── ir/
│   ├── helpers.ts             ← generateId / findNode / mutateNode
│   └── types.ts               ← SkeletonNode / SkeletonKind / Appearance / Padding
└── parser/
    ├── parse-component.ts     ← orchestrator
    ├── raw-node.ts            ← AST → RawNode
    ├── semantic-classifier.ts ← RawNode → SkeletonNode
    ├── tag-defaults.ts        ← TAG_DEFAULTS + COMPONENT_TAG_HINTS
    └── tailwind-class-reader.ts
store/
└── use-skeleton-store.ts      ← Zustand + persist
```

---

## 🏁 Known gaps (next candidates)

- 📍 **Position offsets** (top-*/right-*/bottom-*/left-*) — would let absolute badges render in-place instead of normal flow.
- 📦 **Library registry** — MUI / Mantine / Chakra exact-match tables for friendlier defaults.
- 🪶 **Format button** (lazy prettier) — clean up pasted code.
- 🔔 **Confidence summary banner** — "5 of 12 blocks low-confidence — click to verify".
- 🟨 **Better grid alignment for tables** — true CSS grid columns instead of flex-shrink approximation.
- 📤 **`.map()` syntax in exported React** — emit `{Array.from({ length: N }).map(...)}` instead of inline duplicates.

---

## 🚦 Workflow summary

1. User pastes JSX in CodeMirror.
2. Parser extracts AST → RawNode → SkeletonNode tree.
3. Preview canvas renders tree via runtime-styles.
4. User clicks any block → properties panel reveals all editable fields.
5. Mutations re-render preview live (Zustand store + immutable IR).
6. Export modal generates clean React or HTML code matching the preview.
7. Auto-save to localStorage; rehydrate parses on load.
