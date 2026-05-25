# Skeleton Generator — Progress Log

> Live status of features shipped. Updated 2026-05-25.

---

## 🧱 UI layout (current state)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ 🎨 Skeleton Generator   [Try: Profile Card · Blog Row · Table Row]   🌗  ⤓ Export│
├─────────────────────────────────────────────────────────────────────────────────┤
│ Preset [Tailwind ▾]  Animation [Pulse ▾]  Speed [Normal ▾]  Base [Zinc 200 ▾]   │
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
│                          │                                   │ Archetype        │
│                          │                                   │ media-object     │
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

Three-pane editor. Top bar = title + example snippets + theme toggle + Export.
Global controls row = preset picker + animation/speed/baseColor fine-tuning.
Main area = paste editor (CodeMirror) | preview canvas | properties panel.

---

## 📦 Architecture pipeline

```
       ┌─────────────┐   ┌──────────────────┐   ┌─────────────────────┐
JSX ── │ @babel/parser │ → │  AST → RawNode    │ → │ SemanticClassifier  │ → SkeletonNode tree
       └─────────────┘   └──────────────────┘   └─────────────────────┘
                                                          │
                                        ┌─────────────────┼──────────────────┐
                                        ▼                 ▼                  ▼
                              ┌──────────────────┐ ┌────────────────┐ ┌────────────────┐
                              │ArchetypeDetector │ │ TableGrid      │ │ RepeatVariance │
                              │(7 UI patterns)   │ │ (grid-cols)    │ │ (staggered w)  │
                              └──────────────────┘ └────────────────┘ └────────────────┘
                                        │                 │                  │
                                        └─────────────────┼──────────────────┘
                                                          ▼
                              ┌───────────────────────────┼───────────────────────────┐
                              ▼                           ▼                           ▼
                   ┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
                   │ runtime-styles   │      │ format-classes   │      │ Preset system    │
                   │ (live preview)   │      │ (exported code)  │      │ (5 named themes) │
                   └──────────────────┘      └──────────────────┘      └──────────────────┘
                              │                           │
                              ▼                           ▼
                       SkeletonRenderer            exportReact / exportHTML
```

Pure-function pipeline. Three post-classify passes (archetype, table-grid, repeat-variance).
Renderer + exporter share three-path dispatch (`isSurfaceWrapper` / container / fill).

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
- 🪪 **Confidence rating**: `high` (both dims pinned), `medium` (partial / .map / name-inferred / content-sized), `fallback` (pure tag default).
- 🪄 **`.map()` representative**: extracts one representative child, sets `repeat = 3` so dynamic lists render as multi-row skeletons.

### 📚 shadcn/ui registry (`lib/parser/tag-defaults.ts` — `COMPONENT_TAG_HINTS`)

60+ shadcn primitives with shape-correct defaults:

| Family | Components |
|---|---|
| **Table** | `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead`, `TableCell`, `TableCaption` |
| **Card** | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`, `CardAction` |
| **Tabs** | `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` |
| **Accordion** | `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent` |
| **Dialog** | `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter` |
| **Sheet** | `Sheet`, `SheetContent`, `SheetHeader`, `SheetTitle`, `SheetDescription`, `SheetFooter` |
| **Form** | `Form`, `FormItem`, `FormLabel`, `FormControl`, `FormDescription`, `FormMessage` |
| **Select** | `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`, `SelectLabel`, `SelectSeparator` |
| **Alert** | `Alert`, `AlertTitle`, `AlertDescription` |
| **Popover/Tooltip** | `Popover`, `PopoverTrigger`, `PopoverContent`, `Tooltip`, `TooltipTrigger`, `TooltipContent` |
| **DropdownMenu** | `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuLabel`, `DropdownMenuSeparator` |
| **Standalone** | `Avatar`, `Badge`, `Skeleton`, `Separator`, `Progress`, `Slider`, `Switch`, `Toggle`, `ToggleGroup`, `ToggleGroupItem`, `Checkbox`, `RadioGroup`, `RadioGroupItem` |

Each primitive resolves to the correct kind (text / paragraph / button / input / container / card) with appropriate default dimensions so `<Badge />` renders as a 60×22 pill, `<Switch />` as a 44×24 toggle, etc.

### 🎨 Tailwind class reader (`lib/parser/tailwind-class-reader.ts`)

Parsed token families:

| Family         | Examples                                                                          |
| -------------- | --------------------------------------------------------------------------------- |
| Width / Height | `w-32`, `w-full`, `w-[240px]`, `h-12`, `h-[2rem]`                                 |
| Radius         | `rounded`, `rounded-lg`, `rounded-full`, `rounded-[12px]`                         |
| Flex           | `flex`, `flex-row`, `flex-col`, `flex-wrap`, `flex-nowrap`                        |
| Gap            | `gap-4`, `gap-[8px]`                                                              |
| Padding        | `p-4`, `px-6`, `py-1`, `pt-`/`pr-`/`pb-`/`pl-*`, `p-[12px]`                       |
| Margin         | `m-2`, `mx-`/`my-`/`mt-`/`mr-`/`mb-`/`ml-*` (aggregated into parent gap)          |
| Alignment      | `items-{start\|end\|center\|stretch\|baseline}`                                   |
| Justify        | `justify-{start\|end\|center\|between\|around\|evenly}`                           |
| Surface        | `bg-*` (except gradients), `border`, `border-{color\|width}` (side-only excluded) |
| Position       | `absolute`, `fixed`, `relative`, `sticky`                                         |

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

### 🧩 Archetype detector (`lib/parser/archetype-detector.ts`)

Post-classify pass that recognises 7 UI archetypes and tunes spacing/alignment defaults. Never overrides explicit Tailwind signals (`??=` everywhere).

| Archetype | Pattern | Tuning |
|---|---|---|
| **media-object** | avatar/image + text siblings | `row`, `align: center`, `gap: 12` |
| **form-field** | text label + input (exactly 2 children) | `col`, `gap: 6` |
| **hero** | heading (h ≥ 24) + paragraph/button, depth ≤ 2, non-card | `col`, `gap: 24` |
| **nav-bar** | row container at depth ≤ 1 with button child | `justify: between`, `align: center`, `gap: 24` |
| **card-grid** | all children are card-like surfaces (≥ 2) | `row`, `wrap: true`, `gap: 16` |
| **stat-tile** | card with small label (h ≤ 16) + big metric (h ≥ 24) | `col`, `gap: 4` |
| **pricing-card** | card with title + CTA button + bullet list or 4+ children | `col`, `gap: 16` |

### 🔲 CSS grid table engine (`lib/parser/table-grid.ts`)

Post-classify pass that upgrades table rows from `flex flex-row` to `display: grid`:

- Scans first row (header preferred) for column count + per-cell width.
- Cells with explicit px width (e.g. `w-[100px]`) → fixed `100px` track.
- Cells with `width: "full"` (default) → `1fr` flexible track.
- Stamps `layout.gridCols` on every row in the table.
- Renderer emits `grid-template-columns`; exporter emits `grid grid-cols-[100px_1fr_1fr_80px]`.
- Columns align table-wide (header/body/footer share same template).

### 🎲 Rhythm variance (`lib/ir/repeat-variance.ts`)

Deterministic per-copy width stagger for `.map()` repeat instances:

- Copy 0 (prototype) renders unmodified.
- Copies 1+ get text/paragraph widths scaled by `varianceFactor(id, index)` → [0.60, 0.95].
- Paragraph nodes also get mangled id (`${id}_r${index}`) so `lastLineFactor` produces different tail-bar widths.
- Button/input/avatar/image widths stay consistent (structural shapes unchanged).
- Applied in renderer, React exporter, and HTML exporter — preview matches export.

**Before**: 3 repeated table rows = 3 identical ghost clones.
**After**: each copy has naturally ragged text widths + unique paragraph line breaks.

### 🖼️ Live preview renderer (`components/skeleton-renderer.tsx`)

- 🎭 **Three rendering paths**:
  1. Surface wrapper → flex-col + ring-1 + padding + radius
  2. Container → flex layout (or CSS grid when `gridCols` present)
  3. Fill block → baseColor + animation + dims
- 💫 **Pulse + shimmer animation**, configurable speed (slow / normal / fast).
- 📑 **Paragraph multi-line**: N lines stacked, last line shortened by deterministic 55–85% factor (hashed from node id).
- 🔁 **Repeat fragment with variance**: N copies, each with staggered text widths for natural raggedness.
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
- 🔲 **CSS grid support**: rows with `gridCols` emit `grid grid-cols-[...]` instead of `flex flex-row`.
- 🌀 **Shimmer keyframes** prepended as comment (React) or `<style>` block (HTML).
- 🔁 **Repeat handling with variance**: N copies, each with staggered text widths matching the preview.
- 📐 **Full token coverage**: padding (per side), gap, alignment, wrap, ring chrome, radius, dimensions.
- 📋 **Copy to clipboard** + tabbed React/HTML view in responsive modal.

### 🎨 Animation presets (`lib/presets.ts`)

5 named preset bundles in the controls bar:

| Preset | Animation | Speed | Base Color | Vibe |
|---|---|---|---|---|
| **Tailwind** | pulse | normal | bg-zinc-200 | Standard, universal |
| **Shimmer** | shimmer | normal | bg-zinc-200 | Gradient sweep |
| **Linear** | shimmer | slow | bg-zinc-100 | Subtle, premium |
| **Vercel** | shimmer | fast | bg-zinc-800 | Dark-mode optimized |
| **Notion** | pulse | slow | bg-zinc-300 | Warm, gentle breathe |

Preset picker sets animation + speed + baseColor in one click. Individual dropdowns still available for fine-tuning — shows "Custom" when settings diverge.

### 🧪 Tests

```
Test Files:  13 passed
Tests:       283 passed
```

Coverage spread across:

- Parser entry (`parse-component.test.ts`)
- AST walker (`raw-node` via integration)
- Classifier rules (`semantic-classifier.test.ts`) — 123 tests including all shadcn primitives
- Tailwind reader (`tailwind-class-reader.test.ts`)
- Archetype detector (`archetype-detector.test.ts`) — 16 tests across 7 archetypes
- Table grid detector (`table-grid.test.ts`) — 6 tests
- Repeat variance (`repeat-variance.test.ts`) — 8 tests
- Runtime styles (`runtime-styles.test.ts`)
- Format classes (`format-classes.test.ts`)
- React exporter (`react-tailwind.test.ts`)
- HTML exporter (`html-tailwind.test.ts`)
- Presets (`presets.test.ts`) — 8 tests
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
├── global-controls.tsx        ← preset picker + animation/speed/baseColor selects
├── paste-input.tsx            ← CodeEditor + Generate button
├── preview-canvas.tsx
├── properties-panel.tsx       ← Kind/Appearance/Layout/Padding controls
├── skeleton-renderer.tsx      ← Node orchestrator + SingleNode + repeat variance
├── theme-provider.tsx
├── theme-toggle.tsx
└── ui/                        ← shadcn primitives
lib/
├── examples/snippets.ts       ← 3 curated JSX snippets
├── exporters/
│   ├── format-classes.ts      ← class string generator (3-path + grid)
│   ├── react-tailwind.ts
│   ├── html-tailwind.ts
│   └── runtime-styles.ts      ← live preview styling (flex + grid)
├── ir/
│   ├── helpers.ts             ← generateId / findNode / mutateNode
│   ├── repeat-variance.ts     ← deterministic width stagger for repeats
│   └── types.ts               ← SkeletonNode / Archetype / gridCols / etc
├── parser/
│   ├── archetype-detector.ts  ← 7 UI pattern matchers + spacing tuner
│   ├── parse-component.ts     ← orchestrator (classify → archetype → grid)
│   ├── raw-node.ts            ← AST → RawNode
│   ├── semantic-classifier.ts ← RawNode → SkeletonNode
│   ├── table-grid.ts          ← column width inference + gridCols stamper
│   ├── tag-defaults.ts        ← TAG_DEFAULTS + COMPONENT_TAG_HINTS (60+)
│   └── tailwind-class-reader.ts
├── presets.ts                 ← 5 named animation presets + finder
store/
└── use-skeleton-store.ts      ← Zustand + persist
```

---

## 🏁 Known gaps (next candidates)

- 📍 **Position offsets** (top-_/right-_/bottom-_/left-_) — would let absolute badges render in-place instead of normal flow.
- 📦 **Library registry** — MUI / Mantine / Chakra exact-match tables for friendlier defaults.
- 🪶 **Format button** (lazy prettier) — clean up pasted code.
- 🔔 **Confidence summary banner** — "5 of 12 blocks low-confidence — click to verify".
- 📤 **`.map()` syntax in exported React** — emit `{Array.from({ length: N }).map(...)}` instead of inline duplicates.
- 🧑‍🤝‍🧑 **Sibling-repeat detection** — hand-written structurally similar siblings (no `.map()`) get repeat + variance treatment.
- 🎨 **Archetype display in panel** — show detected archetype label in properties panel.

---

## 🚦 Workflow summary

1. User pastes JSX in CodeMirror.
2. Parser extracts AST → RawNode → SkeletonNode tree.
3. Post-classify passes: archetype detection → table grid inference → repeat variance.
4. Preview canvas renders tree via runtime-styles (flex or grid).
5. User clicks any block → properties panel reveals all editable fields.
6. Mutations re-render preview live (Zustand store + immutable IR).
7. Export modal generates clean React or HTML code matching the preview (with variance).
8. Preset picker applies named animation/speed/color bundles in one click.
9. Auto-save to localStorage; rehydrate parses on load.
