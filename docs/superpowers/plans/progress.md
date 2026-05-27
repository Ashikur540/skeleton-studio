# Skeleton Generator — Progress Log

> Live status of features shipped. Updated 2026-05-27.

---

## 🧱 UI layout (current state)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ ● Skeleton Studio [1.4]          ProfileCard            🌗  [Export]            │
├──────────────────────────┬───────────────────────────────┬──────────────────────┤
│ <> INPUT UI · JSX    ✨  │ ProfileCard · v3  320 × 400   │ [Design] [Animation] │
│ ┌──────────────────────┐ │ ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐ │ ▸ BLOCK             │
│ │ 1  export default …  │ │ │ ╭─────────────────────╮   │ │   Type [Container▾] │
│ │ 2    return (        │ │ │ │ ● ▓▓▓▓▓  (media)    │   │ │   Appearance [Card▾]│
│ │ 3      <Card …>      │ │ │ │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓     │   │ │   ☑ Visible         │
│ │ 4        <CardHeader>│ │ │ │ ▓▓▓▓▓                │   │ │ ▾ DIMENSIONS        │
│ │ 5  …                 │ │ │ │ [ Read More ]        │   │ │   Size [W|320|px]   │
│ │                      │ │ │ ╰─────────────────────╯   │ │        [H|200|px]   │
│ │ CodeMirror + JSX     │ │ │ ⊙────────────────────⊙    │ │   Radius [⌓|12|px]  │
│ │ syntax highlight     │ │ │ │   320 × 200         │    │ │ ▾ LAYOUT    [flex]  │
│ │                      │ │ │ ⊙────────────────────⊙    │ │   Dir  [Row][Col]   │
│ └──────────────────────┘ │ └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘ │   Align [S][C][E]   │
│ [Browse starters]  [⚡Generate] │  bg-muted/30 + dot grid  │   Gap [G|12|px]     │
│                          │                               │   ┌──[16]──┐         │
│                          │                               │   [24] ░░ [24]       │
│                          │                               │   └──[16]──┘         │
│                          │                               │ ▸ REPEAT      [⏻]   │
│                          │                               │ ▸ CONTENT MOCKING    │
└──────────────────────────┴───────────────────────────────┴──────────────────────┘
```

Three-pane editor. Top bar = logo + "Skeleton Studio" badge + component name + theme toggle + Export.
Main area = paste editor (CodeMirror) | preview canvas (dot grid bg + selection overlay) | tabbed properties panel (Design + Animation).

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
- 🧑‍💻 **Component name extraction**: `findComponentReturn` extracts function/variable name from AST declarations → stored as `componentName` in store → shown in header + export filename.

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

### 🖼️ Live preview renderer (`components/skeleton-renderer.tsx`)

- 🎭 **Three rendering paths**:
  1. Surface wrapper → flex-col + ring-1 + padding + radius
  2. Container → flex layout (or CSS grid when `gridCols` present)
  3. Fill block → baseColor + animation + dims
- 💫 **Pulse + shimmer animation**, configurable speed (slow / normal / fast).
- 📑 **Paragraph multi-line**: N lines stacked, last line shortened by deterministic 55–85% factor (hashed from node id).
- 🔁 **Repeat fragment with variance**: N copies, each with staggered text widths for natural raggedness.
- 🟡 **Low-confidence outline** (amber) on fallback-confidence fill blocks.
- 🌗 **Dark/light follows next-themes** via `bg-background text-foreground`.

### ⚙️ Properties panel (`components/properties-panel/`)

Tabbed panel with **Design** and **Animation** tabs. Design tab has 5 collapsible sections using `SectionWrapper`:

```
┌──────────────────────────┐
│ [Design]  [Animation]    │  ← Tabs with HugeIcons
├──────────────────────────┤
│ ▸ BLOCK                  │  ← SectionWrapper (collapsible)
│   Type      [Container▾] │    Select dropdown
│   Appearance [Card ▾]    │    Container-only
│   ☑ Visible              │    Switch toggle
│                          │
│ ▾ DIMENSIONS             │  ← Collapsible
│   Size  [W|320|px]       │    ScrubInputGroup side-by-side
│         [H|200|px]       │
│   Radius [⌓|12|px]      │    Icon prefix (SquareRoundCornerIcon)
│                          │
│ ▾ LAYOUT         [flex]  │  ← Badge shows flex/grid
│   Direction [Row][Col]   │    ToggleGroup
│   Align   [S] [C] [E]   │    ToggleGroup
│   Gap     [G|12|px]     │    ScrubInputGroup
│   ┌───────[16]───────┐  │    PaddingBox (visual CSS box model)
│   [24]  ░░content░░ [24] │    4 inline inputs + drag-to-scrub
│   └───────[16]───────┘  │
│                          │
│ ▸ REPEAT          [⏻]   │  ← Master Switch toggle in header
│   Count [⟳|3]  [×]      │    ScrubInputGroup + clear button
│                          │
│ ▸ CONTENT MOCKING        │  ← Paragraph-only
│   Line count [#|3]       │    ScrubInputGroup
└──────────────────────────┘
```

**Animation tab** (absorbs former GlobalControls):
- Preset picker (Select)
- Animation type (ToggleGroup: Pulse / Shimmer)
- Speed (ToggleGroup: Slow / Normal / Fast)
- Base color (Select)

All fields use `ScrubInputGroup` — compact `[prefix|value|suffix]` InputGroup with drag-to-scrub on prefix handle. Supports both text prefixes ("W", "H", "G") and icon prefixes (SquareRoundCornerIcon for radius, RepeatIcon for count).

### 📝 Paste editor (`components/paste-input.tsx`)

- 🪟 **CodeMirror 6** with `@uiw/react-codemirror`.
- 🎨 JSX + TypeScript syntax highlight.
- 🔢 Line numbers gutter.
- 🚨 Inline syntax error decoration at exact `line:col` (red underline).
- 🌗 Theme follows next-themes (`githubLight` / `githubDark`).
- ⌨️ Bracket matching, auto-close, indent-on-input, search (Cmd+F).
- 🏷️ Header: CodeIcon + "INPUT UI · JSX" label + AiMagicIcon format button.
- 🦶 Footer: "Browse starters" button + "Generate skeleton" button with ZapIcon.

### 🗂️ Starter browser (`components/starter-browser.tsx`)

Left side-sheet overlay with categorized starter templates:

- 🔍 Search filtering by name, category, tag, description.
- ⌨️ Keyboard nav: ↑↓ navigate, Enter insert, Esc close.
- 📂 4 categories: content, saas, dashboard, commerce (12 templates).
- 🖼️ Each item: thumbnail placeholder + name + description + tag badge.
- 🟢 Active item highlight with `bg-primary/10`.
- 📏 Footer: "↕ navigate · ↵ insert · esc close" hints.

### 🟢 Selection overlay (`components/resize-overlay.tsx`)

Enhanced Figma-style selection overlay:

- **Green border**: 1-2px solid `border-primary` outline around selected element.
- **8 dot handles**: Corner dots (NW/NE/SW/SE) + edge midpoint dots (N/E/S/W) — all `bg-primary` squares.
- **Interactive handles**: Only E (right midpoint) and S (bottom midpoint) are draggable. Others are visual-only.
- **Dimension badge**: Below selected element, centered green pill showing `"{width} × {height}"`.
- **Pointer capture**: Smooth tracking via `setPointerCapture` even when cursor leaves handle strip.
- **Drag lifecycle**: `pushSnapshot()` at start → `patchNodeQuiet()` per frame → one undo step per gesture.
- Paragraph nodes: S handle hidden (height = lineCount).

### 📤 Export modal (`components/export-modal.tsx`)

Split-pane dialog with syntax-highlighted code:

```
┌─────────────────────────────────────────────────────────┐
│ [React·Tailwind] [HTML·Tailwind]  ProfileCardSkeleton.jsx  │
├──────────────────────────────┬──────────────────────────┤
│                              │ SUMMARY                  │
│  CodeMirror (read-only)      │  Lines         33        │
│  JSX/TS syntax highlighting  │  Size       1303 B       │
│  Line numbers + fold gutters │  Animation  animate-pulse│
│  GitHub theme (dark/light)   │                          │
│                              │ OPTIONS                  │
│  [Copy] button top-right     │  Tailwind v4    [switch] │
│                              │                          │
├──────────────────────────────┴──────────────────────────┤
│ ✓ Validated · 0 errors              Cancel  [Download]  │
└─────────────────────────────────────────────────────────┘
```

- ⚛️ **React + Tailwind** and 🌐 **HTML + Tailwind** tabs.
- 🎨 **Syntax highlighting** via CodeMirror read-only (same github theme as paste editor).
- 📊 **Summary sidebar**: real line count, byte size (`Blob.size`), animation type.
- 🔘 **Options**: Tailwind v4 (always on).
- 📋 **Copy to clipboard** button with "Copied!" feedback.
- 💾 **Download button**: creates Blob + triggers browser download as `{componentName}Skeleton.{jsx|html}`.
- ✅ **Footer**: "Validated · 0 errors" status.

### 🎨 Animation presets (`lib/presets.ts`)

5 named preset bundles (now in Animation tab):

| Preset | Animation | Speed | Base Color | Vibe |
|---|---|---|---|---|
| **Tailwind** | pulse | normal | bg-zinc-200 | Standard, universal |
| **Shimmer** | shimmer | normal | bg-zinc-200 | Gradient sweep |
| **Linear** | shimmer | slow | bg-zinc-100 | Subtle, premium |
| **Vercel** | shimmer | fast | bg-zinc-800 | Dark-mode optimized |
| **Notion** | pulse | slow | bg-zinc-300 | Warm, gentle breathe |

Preset picker sets animation + speed + baseColor in one click. Individual controls still available for fine-tuning — shows "Custom" when settings diverge.

### 🔢 ScrubInputGroup + useScrubDrag (`components/scrub-input-group.tsx`, `hooks/use-scrub-drag.ts`)

Figma-style compact numeric inputs:

- **InputGroup layout**: `[prefix|value|suffix]` — prefix is drag handle, center is number input, suffix is unit.
- **Text prefixes**: "W", "H", "G", "#" for standard fields.
- **Icon prefixes**: `iconPrefix` prop maps to HugeIcons (SquareRoundCornerIcon for radius, RepeatIcon for count).
- **Drag-to-scrub**: 2px dead zone, Shift ×10 multiplier, pointer capture, body cursor override.
- **Visual feedback**: `hover:bg-primary/10`, `active:bg-primary/20` on prefix handle.
- **Number input**: Hidden spinners (`[appearance:textfield]`), compact `px-1` padding, `tabular-nums`.

### 📦 PaddingBox (`components/padding-box.tsx`)

Visual CSS box-model diagram:

```
  ┌──────[16]──────┐
  │                 │
[24]   ┌───────┐  [24]
  │    │content│    │
  │    └───────┘    │
  │                 │
  └──────[16]──────┘
```

- Outer dashed border + inner muted bg.
- 4 inline `<input>` at each edge center.
- Each input supports drag-to-scrub via `useScrubDrag`.

### ↩️ Undo/Redo (`store/use-skeleton-store.ts`)

Full undo/redo with configurable history depth (`MAX_HISTORY = 50`):

- **`pushSnapshot()`** — pushes current tree onto history stack (called at drag/scrub start).
- **`patchNodeQuiet()`** — mutates tree without touching history (called during drag/scrub movement).
- **`patchNode()`** — mutates tree AND pushes history (called for direct property panel edits like dropdown selects).
- **`undo()`** / **`redo()`** — walk the history/future stacks, swapping the current tree.
- `future` stack is cleared whenever a new mutation occurs (no branching history).
- Bound to `Cmd+Z` / `Cmd+Shift+Z` via `hooks/use-keyboard-shortcuts.ts`.

### 🧪 Tests

```
Test Files:  14 passed
Tests:       323 passed
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
- 🧰 shadcn/ui primitives (Button, Input, Label, Select, Tabs, Dialog, Switch, ToggleGroup, Collapsible)
- 🐻 Zustand store with `persist` (localStorage, key `skeleton-store-v2`)
- 🦋 HugeIcons (`@hugeicons/react` + `@hugeicons/core-free-icons`)
- 🪀 next-themes (dark/light chrome)
- 🪂 @uiw/react-codemirror + @codemirror/lang-javascript + @codemirror/lint
- 🥼 vitest

---

## 📂 File map

```
app/
├── layout.tsx                          ← html h-full + body h-full overflow-hidden
├── page.tsx                            ← three-pane composition + header chrome
└── globals.css                         ← Tailwind v4 directives, CSS vars, shimmer keyframes
components/
├── code-editor.tsx                     ← CodeMirror wrapper with JSX syntax + lint
├── export-modal.tsx                    ← Split-pane dialog + CodeMirror read-only + sidebar
├── paste-input.tsx                     ← CodeEditor + header (CodeIcon) + footer (Generate/Browse)
├── preview-canvas.tsx                  ← Dot grid bg + info bar + skeleton preview
├── resize-overlay.tsx                  ← Green border + 8 dot handles + dimension badge
├── skeleton-renderer.tsx               ← Recursive IR → DOM (3 render paths)
├── scrub-input-group.tsx               ← InputGroup-based numeric input + drag-to-scrub
├── padding-box.tsx                     ← Visual CSS box-model diagram (4 edge inputs)
├── starter-browser.tsx                 ← Left side-sheet with search + keyboard nav
├── shortcuts-modal.tsx                 ← Keyboard shortcuts reference modal
├── theme-provider.tsx                  ← next-themes wrapper
├── theme-toggle.tsx                    ← Light/dark toggle
├── properties-panel/
│   ├── index.tsx                       ← Tabbed shell (Design + Animation)
│   ├── design-tab.tsx                  ← Composes 5 sections
│   ├── animation-tab.tsx               ← Preset/animation/speed/color (from GlobalControls)
│   ├── section-wrapper.tsx             ← Collapsible section with title/badge/toggle
│   └── sections/
│       ├── block-section.tsx           ← Type + Visibility + Appearance
│       ├── dimensions-section.tsx      ← Size W/H + Radius
│       ├── layout-section.tsx          ← Direction/Align/Gap/Padding (ToggleGroup + PaddingBox)
│       ├── repeat-section.tsx          ← Toggle + Count (RepeatIcon prefix)
│       └── content-section.tsx         ← Line count (paragraph only)
└── ui/                                 ← shadcn primitives (Button, Dialog, Select, Tabs,
                                          Switch, ToggleGroup, Collapsible, InputGroup, etc.)
hooks/
├── use-element-rect.ts                 ← Tracks selected element position via ResizeObserver
├── use-keyboard-shortcuts.ts           ← Cmd+Z/Shift+Z undo/redo + arrow nudge + Delete
└── use-scrub-drag.ts                   ← Click-and-drag number scrubbing (2px dead zone, Shift ×10)
lib/
├── utils.ts                            ← cn() helper
├── format-source.ts                    ← Prettier standalone formatting
├── presets.ts                          ← 5 named animation presets
├── examples/snippets.ts                ← 12 categorized JSX starter templates
├── exporters/
│   ├── format-classes.ts               ← Tailwind class string generator (3-path + grid)
│   ├── react-tailwind.ts               ← React + Tailwind function component
│   ├── html-tailwind.ts                ← HTML + Tailwind standalone
│   └── runtime-styles.ts               ← Live preview inline styles (flex + grid)
├── ir/
│   ├── helpers.ts                      ← generateId / findNode / mutateNode
│   ├── repeat-variance.ts              ← Deterministic width stagger for repeats
│   └── types.ts                        ← SkeletonNode / ParseResult (with componentName)
├── parser/
│   ├── archetype-detector.ts           ← 7 UI pattern matchers + spacing tuner
│   ├── parse-component.ts              ← Orchestrator + component name extraction
│   ├── raw-node.ts                     ← AST → RawNode
│   ├── semantic-classifier.ts          ← RawNode → SkeletonNode
│   ├── sibling-repeat.ts              ← Collapse repeated siblings
│   ├── table-grid.ts                   ← Column width inference + gridCols stamper
│   ├── tag-defaults.ts                 ← TAG_DEFAULTS + COMPONENT_TAG_HINTS (60+)
│   └── tailwind-class-reader.ts        ← className → StyleHints
store/
└── use-skeleton-store.ts               ← Zustand + persist (componentName, parseVersion, lastEditedAt)
```

---

## 🏁 Known gaps (next candidates)

- 📍 **Position offsets** (top-_/right-_/bottom-_/left-_) — would let absolute badges render in-place instead of normal flow.
- 📦 **Library registry** — MUI / Mantine / Chakra exact-match tables for friendlier defaults.
- 🔔 **Confidence summary banner** — "5 of 12 blocks low-confidence — click to verify".
- 📤 **`.map()` syntax in exported React** — emit `{Array.from({ length: N }).map(...)}` instead of inline duplicates.
- 🧑‍🤝‍🧑 **Sibling-repeat detection** — hand-written structurally similar siblings (no `.map()`) get repeat + variance treatment.
- 🎨 **Archetype display in panel** — show detected archetype label in properties panel.
- 📝 **Add comments toggle** — section comments in exported code based on archetype detection.
- 🔤 **TypeScript export toggle** — `.tsx` output with typed props.

---

## 🚦 Workflow summary

1. User pastes JSX in CodeMirror editor (left pane).
2. Clicks "Generate skeleton" (or uses starter browser to pick a template).
3. Parser extracts AST → RawNode → SkeletonNode tree + component name.
4. Post-classify passes: archetype detection → table grid inference → repeat variance.
5. Preview canvas renders tree with dot grid bg + info bar (center pane).
6. User clicks any block → green selection overlay with 8 dot handles + dimension badge.
7. **Design tab** (right pane): Block type/visibility, Dimensions (ScrubInputGroup), Layout (ToggleGroups + PaddingBox), Repeat, Content Mocking.
8. **Animation tab**: Preset picker, animation type/speed, base color.
9. Drag handles (E for width, S for height) or scrub input prefixes for dimension adjustment.
10. Mutations re-render preview live (Zustand store + immutable IR).
11. **Undo/Redo** (Cmd+Z / Cmd+Shift+Z) — drag/scrub gestures count as one undo step.
12. Export modal: syntax-highlighted code (CodeMirror read-only) + summary stats + Download.
13. Auto-save to localStorage; rehydrate parses on load.
