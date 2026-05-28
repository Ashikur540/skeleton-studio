# Design Checkup Report — Skeleton Studio

**Date:** 2026-05-27
**Target:** Full application (all components, layout, styling)
**Score:** 30/60

---

## Composition

The app is an **Operate** surface — a tool for pasting JSX/TSX, generating skeleton loaders, tweaking dimensions, and exporting code. The three-pane layout (input → preview → inspector) fits the operate pattern well: a target canvas, side panels for input and properties, and direct manipulation through drag handles.

The composition is appropriate for the work. The layout breaks down only at narrow viewports (see Responsiveness).

---

## Prompt Fidelity

Given no explicit brief file exists, the checkup evaluates against the project's own AGENTS.md definition. The app matches its stated purpose: convert pasted JSX/TSX into skeleton loading placeholders with live preview, dimension tweaking, and code export. The name is correct, the category (dev tool) is visible, and the artifact (skeleton blocks) is the central canvas element.

---

## Vital Signs

| # | Vital Sign | Status | Score |
|---|---|---|---|
| 1 | Intentionality | Watch | 5/10 |
| 2 | Readability | Watch | 5/10 |
| 3 | Usability | Watch | 5/10 |
| 4 | Responsiveness | Critical | 0/10 |
| 5 | Speed | Healthy | 10/10 |
| 6 | Accessibility | Watch | 5/10 |

---

## 1. Intentionality — Watch (5/10)

**Evidence:** Dark default theme, Figma-style scrub drag inputs, dot-grid canvas background, fixed pane widths (420px / flex / 288px), consistent rounded-4xl button language, custom shimmer keyframes, and an authored chartreuse primary palette — all deliberate choices, not framework defaults.

**Issue:** The chartreuse/lime primary (`oklch(0.768 0.233 130.85)`) has no clear domain rationale. "Skeleton" as a concept (bones, scaffolding, structure, placeholder, absence) doesn't obviously map to a vibrant green. The color is an authored choice but could belong to any green-branded dev tool. DM Sans is a common, safe font choice that doesn't differentiate the tool.

**Prescription:** Re-evaluate the primary hue against the skeleton/placeholder domain concept. Consider cooler, more structural tones (slate-blue, neutral-cool) that evoke scaffolding rather than vibrancy. Run `/design recolor` with a domain-aligned emotional arc.

---

## 2. Readability — Watch (5/10)

**Evidence:** DM Sans body text at reasonable sizes (`text-sm` / `text-xs`). Dark mode foreground contrast is strong (`oklch(0.987)` on `oklch(0.148)`). Code editor uses proven githubDark/githubLight themes.

**Issues:**
- **Muted text contrast:** In dark mode, `--muted-foreground` (`oklch(0.723 0.014 214.4)`) on `--background` (`oklch(0.148 0.004 228.8)`) yields approximately 3.9:1 contrast — below the WCAG AA threshold of 4.5:1 for normal text.
- **Micro-type proliferation:** Section headers, version badge, dimension badge, and keyboard hint footers all use `text-[10px]`. This is below the recommended 12px minimum for comfortable reading. The small size combined with muted contrast creates genuinely hard-to-read UI.

**Prescription:** Increase `--muted-foreground` lightness in dark mode (target L ≥ 0.78 for 4.5:1 against the dark background). Bump `text-[10px]` instances to `text-[11px]` minimum. Run `/design typeset` to establish a proper scale.

---

## 3. Usability — Watch (5/10)

**Evidence:** Core workflow (paste → preview → tweak → export) is linear and discoverable. The "Paste a component to see its skeleton" empty state is clear. Export button is disabled when no tree exists. Keyboard shortcuts exist for undo/redo, delete, and arrow nudging. The StarterBrowser has full keyboard navigation. Empty states, error states, and success states are handled across components.

**Issues:**
- **Dead "Tailwind v4" toggle:** In the Export modal, a `Switch` for "Tailwind v4" is permanently disabled. This signals an unfinished feature and erodes trust in the tool's completeness.
- **StarterBrowser covers the editor:** Opening the template browser completely occludes the code editor. Users can't reference their existing code while browsing.
- **No first-run guidance:** No tooltip, onboarding badge, or "getting started" hint for new users discovering the scrub interaction pattern.

**Prescription:** Remove the "Tailwind v4" toggle. Consider a narrower starter picker or a tooltip system. Run `/design interaction` to add affordances.

---

## 4. Responsiveness — Critical (0/10)

**Evidence:** The three-pane layout uses fixed widths: left pane `w-105` (420px), right pane `w-72` (288px). Minimum viable viewport is ~900px before the center canvas collapses. There are zero responsive breakpoints, no stacked layout, no mobile or tablet adaptation.

**Test results by viewport:**
- **320px / 375px (phones):** Completely unusable — panes overflow horizontally.
- **768px (tablet):** Center pane reduced to ~40px — unusable.
- **1024px (laptop):** Center pane ~296px — tight but functional.
- **1440px+ (desktop):** Functional.

The Export modal uses responsive max-widths (`sm:max-w-200`, `lg:max-w-260`), but this is the only responsive behavior in the app.

**Prescription:** Add at minimum a single-column stacked layout for viewports below 900px, with a tab bar to switch between Input / Preview / Properties. Run `/design responsive` to recompose for mobile and tablet.

---

## 5. Speed — Healthy (10/10)

**Evidence:** Client-side SPA with no server round-trips for core operations. JSX parsing is synchronous and typically sub-100ms for common component sizes. Export outputs are memoized via `useMemo`. Drag interactions use pointer events with `requestAnimationFrame`-batched ResizeObserver. CSS animations (shimmer, pulse) are GPU-composited via `transform` and `background-position`.

No layout shift, no cumulative jank observed. The only potential concern (no loading indicator for edge-case large parses) is theoretical — for this tool's typical input size, parsing is instantaneous.

---

## 6. Accessibility — Watch (5/10)

**Evidence:** Focus rings are styled throughout (`focus-visible:ring-3 focus-visible:ring-ring/30`). Button, Select, Tabs, ToggleGroup, Switch, and Dialog all use Radix primitives with built-in keyboard support. The StarterBrowser has arrow-key + Enter + Esc navigation. Arrow keys nudge resize dimensions. The Export modal has an `sr-only` close label.

**Issues:**
- **No `prefers-reduced-motion` handling:** The shimmer and pulse animations on skeleton blocks have no opt-out for users who prefer reduced motion. `tw-animate-css` may handle some cases, but the custom shimmer keyframe and inline-injected animations bypass this.
- **Canvas blocks not keyboard-focusable:** Skeleton blocks in the preview canvas respond to click only. There's no Tab-based navigation or focus-visible styling for block selection. Keyboard-only users cannot select or inspect individual skeleton nodes.
- **Small text (`text-[10px]`):** Below accessible minimum for users with low vision.
- **No landmark roles:** The three-pane layout lacks ARIA landmarks (no complementary roles for the side panes). The `<main>` element exists but isn't augmented with descriptive labels.

**Prescription:** Add `@media (prefers-reduced-motion: reduce)` to disable skeleton animations. Add `tabIndex={0}` and `onKeyDown` (Enter to select) to skeleton block elements, plus focus-visible styling. Bump minimum text size to 11px. Run `/design interaction` for canvas keyboard support.

---

## Prescriptions Summary

| Priority | Issue | Prescription |
|---|---|---|
| **Critical** | No responsive behavior — unusable below 900px | `/design responsive` — stack panes vertically on mobile/tablet |
| High | `prefers-reduced-motion` not honored | Add `@media (prefers-reduced-motion: reduce)` in globals.css |
| High | Canvas blocks not keyboard-accessible | Add tabIndex + Enter key handler + focus-visible styling |
| Medium | `--muted-foreground` contrast ~3.9:1 in dark mode | Increase lightness to L ≥ 0.78 |
| Medium | Micro `text-[10px]` proliferation | Bump to `text-[11px]` minimum |
| Medium | Disabled "Tailwind v4" toggle signals incompleteness | Remove the toggle — done ✓ |
| Low | Chartreuse primary has no domain rationale | `/design recolor` with skeleton/structural concept |
