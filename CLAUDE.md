# Skeleton Studio — Skeleton Loader Generator

Convert pasted JSX/TSX components into production-ready skeleton loading placeholders. Paste a component → get a live preview → tweak dimensions/layout/animation → copy React+Tailwind or HTML+Tailwind code.

---

## Stack

| Layer       | Technology                                                                                     |
| ----------- | ---------------------------------------------------------------------------------------------- |
| Framework   | Next.js 16 (App Router) — **read `node_modules/next/dist/docs/` before touching Next.js APIs** |
| React       | 19                                                                                             |
| Language    | TypeScript 5, strict mode                                                                      |
| Styling     | Tailwind CSS v4 (CSS-first config, `@tailwindcss/postcss`)                                     |
| UI Kit      | shadcn/ui (Radix primitives, radix-luma style, mist base)                                      |
| State       | Zustand v5 + `persist` middleware                                                              |
| JSX Parsing | `@babel/parser` + `@babel/types`                                                               |
| Code Editor | CodeMirror 6 via `@uiw/react-codemirror`                                                       |
| Formatting  | Prettier standalone (browser build)                                                            |
| Testing     | Vitest v4, `environment: "node"`                                                               |

---

## Commands

```
npm dev         # Next.js dev server
npm build       # Production build
npm lint        # ESLint (flat config)
npm test        # Vitest (run once)
npm test:watch  # Vitest (watch mode)
```

---

## File Structure

```
├── app/                     # Next.js App Router
│   ├── layout.tsx           # Root layout (server component — only server file)
│   ├── page.tsx             # "use client" entry — composes the 3-pane editor
│   └── globals.css          # Tailwind v4 directives, CSS variables, shimmer keyframes
│
├── components/              # All "use client" React components
│   ├── ui/                  # shadcn/ui primitives (Button, Dialog, Select, Tabs, etc.)
│   ├── paste-input.tsx      # Left pane: CodeMirror editor + Generate/Format buttons
│   ├── preview-canvas.tsx   # Center pane: live skeleton preview + ResizeOverlay
│   ├── properties-panel.tsx # Right pane: per-node property editor
│   ├── skeleton-renderer.tsx# Recursive IR → DOM renderer
│   ├── code-editor.tsx      # CodeMirror wrapper with JSX/TSX syntax highlighting
│   ├── export-modal.tsx     # Fullscreen export dialog (React/HTML tabs)
│   ├── global-controls.tsx  # Top bar: preset picker + animation/speed/color
│   ├── resize-overlay.tsx   # Drag handles for width/height on selected nodes
│   ├── scrubbable-field.tsx # Figma-style drag-to-adjust numeric input
│   ├── theme-provider.tsx   # next-themes wrapper
│   └── theme-toggle.tsx     # Light/dark toggle
│
├── hooks/
│   ├── use-element-rect.ts  # Tracks DOM element position via ResizeObserver
│   └── use-keyboard-shortcuts.ts # Global undo/redo/delete/arrow-nudge hotkeys
│
├── store/
│   └── use-skeleton-store.ts # Single Zustand store: source, IR tree, selection, undo/redo
│
├── lib/                     # Pure logic (framework-agnostic, tested with Vitest)
│   ├── utils.ts             # cn() helper (clsx + tailwind-merge)
│   ├── format-source.ts     # Prettier standalone formatting
│   ├── presets.ts           # Curated preset definitions
│   │
│   ├── ir/                  # Intermediate Representation
│   │   ├── types.ts         # SkeletonNode, GlobalSettings, ParseError, StyleHints
│   │   ├── helpers.ts       # generateId, findNode, mutateNode (immutable path-copy)
│   │   └── repeat-variance.ts # Deterministic width variation for .map() rows
│   │
│   ├── parser/              # JSX → IR pipeline
│   │   ├── parse-component.ts     # Entry: Babel parse → AST walk → classify → IR
│   │   ├── raw-node.ts            # AST → RawNode
│   │   ├── semantic-classifier.ts # RawNode → SkeletonNode (tag/class resolution)
│   │   ├── tailwind-class-reader.ts # className → StyleHints
│   │   ├── tag-defaults.ts        # HTML tag / React component → kind defaults
│   │   ├── archetype-detector.ts  # Post-classify pattern matching
│   │   ├── sibling-repeat.ts      # Collapse repeated siblings into repeat:N
│   │   └── table-grid.ts          # Table rows → CSS grid
│   │
│   ├── exporters/           # IR → code string
│   │   ├── react-tailwind.ts      # → React+Tailwind JSX
│   │   ├── html-tailwind.ts       # → HTML+Tailwind
│   │   ├── runtime-styles.ts      # → inline styles (live preview)
│   │   └── format-classes.ts      # → Tailwind class strings
│   │
│   └── examples/
│       └── snippets.ts      # Cold-start demo JSX snippets
│
├── vitest.config.ts         # Tests in lib/** and store/**
├── eslint.config.mjs        # Flat config: next/core-web-vitals + next/typescript
├── tsconfig.json            # Strict, bundler resolution, @/* alias → ./*
└── postcss.config.mjs       # @tailwindcss/postcss plugin
```

---

## Data Flow

```
JSX String
  → @babel/parser → AST
  → raw-node.ts → RawNode (structural snapshot)
  → semantic-classifier.ts → SkeletonNode (with Tailwind hints + tag defaults)
  → table-grid.ts + sibling-repeat.ts → refined IR tree
  → [Preview] skeleton-renderer.tsx + runtime-styles.ts → DOM
  → [Export] react-tailwind.ts + format-classes.ts → code string
  → [Export] html-tailwind.ts + format-classes.ts → code string
```

### IR types (`lib/ir/types.ts`)

- **`SkeletonNode`** — recursive tree node. `kind` is drawn from a closed set: `text`, `paragraph`, `avatar`, `image`, `button`, `card`, `input`, `container`.
- **`SkeletonKind`** — `container` is structural-only (flex/grid, no fill). All others render as filled placeholders.
- **`Confidence`** — `high` (both dims known), `medium` (one dim or from `.map()`), `fallback` (tag-default guess). Drives "verify this block" outline in the UI.
- **`StyleHints`** — output of the Tailwind class reader, kept separate from `SkeletonNode` for pure-function testability.
- **`ParseResult`** — tagged union: `{ ok: true, tree } | { ok: false, error }`. No throwing from pure functions.
- **`Appearance`** — `plain` (transparent flex wrapper) or `card` (outline + padding for surfaces with `bg-*` / `border`).

---

## Coding Conventions

### TypeScript

- **Strict mode** — no implicit `any`, full type coverage on the IR.
- **Tagged unions** for results — `ParseResult`, no throwing from `lib/`.
- **Path alias** `@/*` maps to `./*` (root-relative imports).
- **Block comments** (`/* */`) for multi-line JSDoc, not repeated `//`.

### React

- **All client components** explicitly declare `"use client"`.
- **Server/client boundary** at `app/layout.tsx` (server) → everything else is client.
- **Functional components only** — no class components.
- **Hooks are co-located** in `hooks/`.

### State Management (Zustand)

- **Single store** — `use-skeleton-store.ts`. Domain is small enough that one store is clearer than slices.
- **Selective persistence** — only `source` + `settings` are persisted to localStorage. The `tree` is recomputed from source on rehydrate so parser/schema changes never strand stale IR.
- **Undo/redo** — manual history stack (max 50). `pushSnapshot()` at drag start, `patchNodeQuiet()` per frame during drag, so one undo step covers the entire gesture.
- **Immutability** — tree mutations use `mutateNode` (path-copy: clones ancestor chain, siblings keep references).

### Testing

- **Vitest v4**, `environment: "node"`.
- **Tests co-located** with source: `*.test.ts` next to the module.
- **Test targets:** `lib/**/*.test.ts`, `store/**/*.test.ts`.
- **Test philosophy:** Deep unit tests on the parser pipeline, exporters, presets, and store behavior. No component-level tests currently.

### Styling

- **Tailwind v4** — CSS-first config (`@import "tailwindcss"`, `@theme inline`).
- **No `tailwind.config.ts`** — theme defined via CSS custom properties in `globals.css`.
- **Dynamic dimensions** use inline `style` props (Tailwind v4 JIT scanner only sees build-time strings).
- **Exported code** uses arbitrary bracket syntax (`w-[42px]`) for compatibility with the user's own Tailwind setup.
- **shadcn/ui** components use radix-luma style, mist base, lime accent.
- **Dark mode** via `next-themes` with `class` strategy and `.dark` CSS variable overrides.

---

## Key Architectural Patterns

1. **IR-first** — Everything flows through `SkeletonNode`. Renderers, exporters, and the properties panel all consume the same tree. Single source of truth.
2. **Split render/export styling** — `runtime-styles.ts` produces inline styles for the live preview; `format-classes.ts` produces Tailwind class strings for exporters. Same logic, two output formats.
3. **Repeat + variance** — Nodes from `.map()` get `repeat: N`; `applyRepeatVariance` adds deterministic width variation per copy using a hash-based factor.
4. **Archetype detection** — Post-classify pattern matching (`media-object`, `form-field`, `nav-bar`, `hero`, `card-grid`, `stat-tile`, `pricing-card`) tunes default spacing without overriding explicit user classes.
5. **Card surface heuristic** — Containers with `bg-*` or `border` automatically get `appearance: "card"` (outline + padding) instead of being invisible.
6. **Pure functions in `lib/`** — Framework-agnostic, no React imports, fully testable without jsdom.
7. **JSDoc on every exported function** — describes intent, parameters, and edge cases.

---

## Things to Avoid

- **Don't add Tailwind classes dynamically at runtime** — use inline styles. The JIT scanner won't see them.
- **Don't throw from `lib/` functions** — return tagged unions (`{ ok, error }`).
- **Don't serialize the IR tree** to localStorage — it's transient; re-parse from source on rehydrate.
- **Don't break the server/client boundary** — `app/layout.tsx` is the only server component. Everything else is `"use client"`.
- **Don't use `any`** — TypeScript is strict. Unknown types go through the IR's closed type system.
- **Don't add new dependencies without checking for browser compatibility** — this runs entirely client-side (parsing, formatting, export).
