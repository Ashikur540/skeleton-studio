# Skeleton Generator — Product Requirements Document (PRD)

**Product:** Skeleton Generator (MVP); Skeleton Studio (long-term)
**Date:** 2026-05-23
**Status:** Approved for implementation planning

---

## Problem Statement

Frontend developers ship UIs with generic skeleton loaders or none at all because building a realistic, per-screen skeleton by hand is repetitive and time-consuming. The result is poor perceived performance and inconsistent loading UX. Existing tools offer primitive components but no fast workflow that turns an actual component into a matching skeleton.

A React/Next.js developer using Tailwind has already encoded layout intent in their JSX (tags, structure, `w-*`/`h-*`/`rounded-*` classes). They want to point at that JSX and get a production-ready skeleton in seconds — not redraw the layout in a visual editor.

---

## Solution

A web app that accepts pasted JSX for a React function component, walks the markup, and generates a skeleton preview that mirrors the structure and (Tailwind-derived) dimensions of the original. The user can tweak individual blocks and global animation settings, then export production-ready code as React+Tailwind or HTML+Tailwind.

The pitch shifts from "another visual builder" to: **"Paste your component. Get a realistic skeleton instantly."**

Long-term, the same engine supports richer inputs (HTML, screenshots via vision, full component files with hooks/conditionals) and richer outputs (themes, design-system integration, motion presets). MVP does none of that.

---

## User Stories

1. As a React developer, I want to paste a JSX component and get a skeleton preview, so that I do not have to recreate my layout by hand.
2. As a Tailwind user, I want the generated skeleton to respect my `w-*`, `h-*`, `rounded-*`, and spacing classes, so that the skeleton's proportions match my real UI.
3. As a developer evaluating the tool, I want example JSX snippets I can click to load, so that I can see the workflow without writing any input myself.
4. As a user with a generated skeleton, I want to click any block and adjust its width, height, radius, visibility, or line count, so that I can fix imperfect output without re-pasting.
5. As a user, I want global controls for animation type (pulse or shimmer), animation speed, base color, and dark/light theme, so that I can match the skeleton to my product's look without per-block tweaking.
6. As a developer, I want to copy a React + Tailwind component, so that I can paste it directly into my codebase.
7. As a non-React developer using Tailwind, I want to copy plain HTML + Tailwind classes, so that I can use the skeleton outside React.
8. As a user, I want my work to survive a browser refresh, so that I do not lose edits to an accidental reload.
9. As a user, I want a clear empty state with a paste box and example snippets, so that I know exactly where to start.
10. As a developer, I want feedback when my paste is unsupported (no return statement found, syntax error), so that I can fix the input rather than guess why nothing happened.
11. As a developer, I want hooks, conditionals, TypeScript annotations, and server actions to be stripped quietly, so that real-world component pastes do not fail.
12. As a developer, I want `.map()` calls to be rendered as a single representative child (the first JSXElement inside the callback), so that list-based layouts stay believable instead of disappearing.
13. As a developer, I want low-confidence blocks (generated from tag defaults alone) to be visually flagged, so that I know which parts of the output to verify or tweak first.
14. As a developer, I want the preview to update live as I edit a block's properties, so that I see the effect of each change.
15. As a developer, I want to toggle the preview between dark and light backgrounds, so that I can verify how the skeleton looks in both themes.
16. As a developer, I want exported code that is clean and idiomatic (readable class lists, sensible structure), so that I am willing to commit it to a real codebase.
17. As a developer, I want to switch between React and HTML export formats and copy either to clipboard, so that I can pick whichever fits my target.

---

## Implementation Decisions

### Architecture: layered with intermediate representation (IR)

The pipeline is **parse → IR → render | export**. The IR is the single source of truth; preview, React exporter, and HTML exporter all read from it. Per-block edits are mutations on IR nodes. This isolates each stage and makes adding a new exporter a pure addition.

```
JSX string ──▶ parser ──▶ SkeletonNode tree (IR) ──┬──▶ React preview (live)
                                                   ├──▶ React+Tailwind exporter
                                                   └──▶ HTML+Tailwind exporter
                              ▲
                              │
                       store (Zustand) + global settings
                              │
                       localStorage persistence
```

### Deep modules

1. **`parser`** — Pure function: `parseComponent(source: string) → ParseResult`.
   - Uses `@babel/parser` (or `acorn` + `acorn-jsx`) with JSX/TypeScript plugins.
   - Walks the AST, finds the function component's single `return` statement, extracts its JSXElement.
   - Drops hooks, conditionals, render props, server actions, and TS annotations silently.
   - For `.map()` calls inside JSX: extracts the first JSXElement returned by the callback and emits it as a single representative child (preserves list layout without trying to render N copies). Tagged with `confidence: "medium"` because count and variation are inferred.
   - For each JSXElement, produces a `SkeletonNode`: kind derived from tag name via a tag→default-size map, dimensions/radius/gap refined by the Tailwind class reader. Each node carries a `confidence` rating and the original `sourceTag` for later debugging and heuristics.
   - Returns either the tree or a structured error (`{ kind: "no-return" | "syntax-error" | "no-component", message }`).
2. **`tailwind-class-reader`** — Pure function: `readClasses(className: string) → Partial<StyleHints>`.
   - Extracts width, height, radius, gap, padding, flex/grid direction from Tailwind utility classes.
   - Independently testable on raw className strings; the parser delegates to it.
3. **`exporters/react-tailwind`** — Pure function: `exportReact(tree: SkeletonNode, settings: GlobalSettings) → string`.
   - Emits a React function component with Tailwind classes for the chosen animation/color/theme.
4. **`exporters/html-tailwind`** — Pure function: `exportHTML(tree: SkeletonNode, settings: GlobalSettings) → string`.
   - Emits plain HTML with the same Tailwind classes. Shares formatting helpers with the React exporter where possible.

### IR shape

```ts
type SkeletonNode = {
  id: string;
  kind: "text" | "paragraph" | "avatar" | "image" | "button" | "card" | "input" | "container";
  sourceTag?: string;            // original tag from the AST: "h1", "img", "button", "Avatar", ...
  confidence?: "high" | "medium" | "fallback";
  width?: number | "full";
  height?: number;
  radius?: number;
  lineCount?: number;             // text/paragraph only
  visible: boolean;
  layout?: { direction: "row" | "col"; gap?: number };
  children?: SkeletonNode[];
};

type GlobalSettings = {
  animation: "pulse" | "shimmer";
  speed: "slow" | "normal" | "fast";
  baseColor: string;     // tailwind-friendly token
  theme: "light" | "dark";
};
```

### State management

- Zustand store holds `{ tree: SkeletonNode | null; settings: GlobalSettings; lastSource: string }`.
- Zustand `persist` middleware writes to localStorage on every change (single slot — no named projects in MVP).
- Per-block edits dispatch a node-mutation action (find by id, patch fields).
- On app load, store rehydrates from localStorage if present; otherwise empty paste state.

### UI surface

- **Paste input panel** — textarea, paste button, "load example" dropdown of 3–5 curated JSX snippets.
- **Preview canvas** — renders the IR through a React renderer, applies global animation/theme.
- **Properties panel** — appears when a block is selected; controls for width, height, radius, visibility, line count.
- **Global controls bar** — animation type, speed, base color, theme.
- **Export modal** — tabs for React+Tailwind and HTML+Tailwind; copy-to-clipboard.

### Error handling

- Parser surfaces structured errors; UI maps each kind to a human message in the paste panel ("Couldn't find a return statement", "Syntax error on line N").
- Unsupported AST nodes (hooks, conditionals, etc.) are skipped silently — they are expected, not errors.
- localStorage hydration failure (corrupt or schema mismatch) falls back to empty state with a one-line toast.

### Out-of-MVP scope reaffirmed

The original "Skeleton Studio" PRD's drag-and-drop editor, grid/snapping, canvas zoom, undo/redo, responsive breakpoint previews, pre-built skeleton templates, AI/screenshot generation, accounts, collaboration, and Figma/VSCode integrations are all deferred.

---

## Testing Decisions

### Test philosophy

Test the four deep modules through their public interfaces, not their internals. A good test for the parser asserts that `parseComponent(input)` returns the expected IR; it does not assert which Babel visitor fired. A good test for an exporter asserts the emitted string contains the right classes/structure; it does not assert which template helper was called. UI rendering and the Zustand store are not unit-tested in MVP — they are exercised manually during dev and via the example snippets acting as smoke tests.

### Modules under test

1. **`parser`**
   - Fixture-driven: input JSX → expected `SkeletonNode` tree.
   - Cases: minimal component, nested layout, Tailwind size classes, components with hooks/conditionals (must strip cleanly), `.map()` calls (must emit one representative child with `confidence: "medium"`), confidence assignment correctness (`high` when w+h known, `medium` for one dimension or map-derived, `fallback` for pure tag defaults), `sourceTag` preserved on every node, malformed input (must return structured error).
2. **`tailwind-class-reader`**
   - Pure input/output table: className string → expected `StyleHints`.
   - Cases: width/height variants (`w-32`, `w-full`, `w-[200px]`), radius variants, gap, mixed orderings, classes with modifiers (`md:w-64` — MVP ignores modifiers).
3. **`exporters/react-tailwind`** and **`exporters/html-tailwind`**
   - Fixture-driven: handcrafted IR tree + settings → expected exported string (snapshot or substring matchers).
   - Cases: single block, nested layout, each animation type, each theme, hidden blocks omitted.

### Prior art

Project is greenfield Next.js (no prior tests). The four module tests bootstrap the test suite. Use the project's installed test runner (Vitest is the natural fit for Next.js + TypeScript; if not present, add it).

---

## Out of Scope

- Drag-and-drop visual editor, canvas grid/snapping, zoom, undo/redo.
- Pre-built skeleton template gallery (replaced by example **input snippets**).
- Responsive breakpoint previews (single preview width only).
- HTML input (JSX only in MVP; HTML support is the natural v1.1 expansion).
- Full component support beyond a single return statement: multiple returns, early returns, render props, complex conditionals.
- TypeScript type-aware behavior (TS syntax is parsed and ignored).
- Iframe/DOM-measurement rendering for accurate sizes.
- AI features: screenshot → skeleton, vision models, layout detection.
- Named projects, version history, cloud sync, accounts, team collaboration.
- Figma plugin, VSCode extension, shadcn/ui integration.
- CSS export without Tailwind, vanilla-extract, CSS modules, styled-components export.

---

## Further Notes

### Confidence and sourceTag rationale

Every `SkeletonNode` carries a `confidence` rating (`"high" | "medium" | "fallback"`) and the original `sourceTag`. Confidence is `"high"` when Tailwind classes pin width and height, `"medium"` when only one dimension is known or when the node comes from a `.map()` representative child, and `"fallback"` when only the tag→default-size map fired. The UI can visually flag low-confidence blocks so users know what to tweak first; future AI passes can target those nodes; exporters can choose different defaults based on origin. `sourceTag` is kept for debugging, analytics, and to enable future heuristics without re-parsing.

### Output quality is the product

The MVP's success rides on whether the generated skeleton feels believable on first paste. Spacing, hierarchy, grouping, and proportions matter more than feature breadth. Concretely:

- The tag→default-size map needs careful tuning, not just "h1 = 32px bar".
- The Tailwind class reader must cover the common subset that real components use.
- The `.map()` representative-child rule exists specifically to keep list layouts from looking empty.
- Curated example snippets must be hand-picked so first-impression output looks good.

If users paste a real component and get ugly generic rectangles, they leave. Treat output quality as the first feature, not a polish pass.

### Differentiator clarity

The MVP's reason to exist is the paste-to-skeleton flow. If that flow does not feel magical on first try, the product fails — the rest of the surface (controls, exporters, persistence) is supporting infrastructure. Implementation effort should be weighted accordingly: a polished parser and a polished React+Tailwind exporter matter more than additional global controls.

### Tailwind assumption

The parser's accuracy depends on users writing Tailwind. Non-Tailwind input still produces output (via tag→default-size fallbacks) but the output is generic. This is acceptable: target audience uses Tailwind. Document this clearly in the empty state.

### Long-term framing

Renaming the product internally to "Skeleton Generator" for MVP keeps marketing honest. The "Studio" branding lands when the editor, templates, and AI features arrive.

### Visual language (carried from original PRD)

Dark-first UI, Geist/Inter typography, electric blue/purple/cyan accent gradients, floating panels with soft shadows, precision spacing, rounded-xl containers, subtle motion. Inspirations: Linear, Vercel, Raycast, Framer.

### Taglines for landing

- "Generate realistic skeleton loaders from your component."
- "Paste your JSX. Get a skeleton. Ship it."
- "Stop hand-coding loading states."
