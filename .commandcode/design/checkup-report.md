# Design Checkup Report — Skeleton Studio Landing Page

**Date:** 2026-05-28
**Target:** Landing page (`/` route, all landing components)
**Focus:** Accessibility
**Score:** 35/60

---

## Composition

The landing page is a **Brand** / **Decide** surface. Its job is to pitch the product, prove value, and route users to the app. The composition follows that intent: hero with mockup proof → bento features → pipeline → interactive editing showcase → export demo → final CTA. This is a standard but functional linear pitch structure. The emerald aurora atmosphere creates a distinct visual tone.

---

## Prompt Fidelity

No explicit brief file. Evaluated against the project's own codebase and the user's `/design checkup check the page specially the landing page check accessibility` directive. The landing page serves as the marketing/route surface at `/`, with the app editor at `/app`. This matches the routing taste file requirement.

---

## Vital Signs

| # | Vital Sign | Status | Score |
|---|---|---|---|
| 1 | Intentionality | Healthy | 10/10 |
| 2 | Readability | Watch | 5/10 |
| 3 | Usability | Watch | 5/10 |
| 4 | Responsiveness | Watch | 5/10 |
| 5 | Speed | Healthy | 10/10 |
| 6 | Accessibility | **Critical** | 0/10 |

---

## 1. Intentionality — Healthy (10/10)

**Evidence:** The landing page is a coherent dark-theme Brand surface with emerald accent (`#10b981`), aurora blob backgrounds, dot-grid canvas, glossy beam cards, 3D-tilt mockup, bento grid, pipeline, and floating chips. Every visual choice is authored and intentional — no framework defaults. The aurora/beam/sheen layer system is sophisticated premium effect work. The DM Sans + JetBrains Mono font pair is deliberate. No generated-design tells detected.

---

## 2. Readability — Watch (5/10)

**Evidence:** Hero heading at gradient 56-76px, body at 15px/18px, section headings at 48px — all comfortable. Primary text uses `text-foreground` on `#060709` canvas — strong contrast.

**Issues:**
- **Pervasive micro-text:** 327 instances of `text-[10.5px]` across 11 of 14 landing components. Skeleton block labels, property panel fields, eyeline captions, version badges, keyboard hints, card descriptions, inspector fields, and action buttons all use text below the WCAG-recommended 12px minimum. Users with low vision or at distance cannot read critical label text.
- **Gray-on-dark contrast concerns:** Multiple `text-[#71717a]` instances on `#0d0d0f` background in the editing mockup — approximately 4.1:1, borderline for normal text and below the 4.5:1 AA threshold. The export modal's `text-muted-foreground` on aurora backgrounds creates similar borderline cases.
- **Mono text at tiny sizes:** `text-[10.5px] font-mono` makes JetBrains Mono barely legible at these sizes.

**Prescription:** Bump all `text-[10.5px]` instances to `text-[11px]` minimum. For inspector mockup labels, use `text-[11px]` or increase to `text-xs` (12px). Audit gray-on-dark combinations for WCAG AA 4.5:1 compliance.

---

## 3. Usability — Watch (5/10)

**Evidence:** Nav is sticky with scroll-triggered blur. Buttons route correctly (`/app`). Section anchor links (`#features`, `#starters`, `#pipeline`, `#export`) match section IDs. Primary and ghost button variants are consistent.

**Issues:**
- **No active/current section indicator:** Nav links have hover states but no visual indicator showing which section the user has scrolled to.
- **Dead links proliferate:** Footer links, "See all 20 starters", GitHub link, social icons, "Docs", "Changelog", "Sign in" all route to `#` with no behavior.
- **No scroll-to-top:** The page is long (hero + 9 sections). After scrolling to the footer, returning to the top requires manual scrolling.

**Prescription:** Add scroll-spy active state to nav links. Wire up real links or remove non-functional ones. Add a back-to-top button.

---

## 4. Responsiveness — Watch (5/10)

**Evidence:** The landing page has responsive breakpoints: `max-[1100px]` collapses nav links and adjusts grid columns, `max-md` (768px) collapses bento cards to single-column, starters grid to 2-column, compare to single-column, footer to 2-column.

**Issues:**
- **Mockup workspace collapses awkwardly:** The hero 3-column mockup collapses but the floating chips may overlap at narrow widths.
- **No 320px verification:** The smallest tested breakpoint is `max-md`. Phone-width (320-375px) overflow has not been verified.
- **Pipeline stages collapse to single column** but arrows between stages don't reorient from horizontal to vertical.

**Prescription:** Test at 320px and add phone-specific overrides. Add orientation adaption for pipeline arrows on mobile.

---

## 5. Speed — Healthy (10/10)

**Evidence:** Fully static page with no data fetching, no API calls, no hydration-heavy components. CSS keyframe animations (aurora blobs, float chips, shimmer, button shine) use `transform` and `background-position` — all GPU-composited properties. No layout shift. No render-blocking resources beyond fonts.

---

## 6. Accessibility — **Critical** (0/10)

**Evidence:** The nav uses semantic `<nav>`. Decorative background elements have `aria-hidden="true"`. The `prefers-reduced-motion` media query exists in landing.css.

**Issues (collectively critical):**

| Issue | Severity | Impact |
|---|---|---|
| **Zero focus-visible styles** | Critical | Keyboard users cannot see which element has focus. Zero focus indicators on any interactive element — nav links, buttons, mockup buttons, footer links. |
| **4 total ARIA attributes** | Critical | Only `aria-hidden` on decorative elements. No `aria-label` on sections, no role attributes on interactive mockup elements, no `aria-current` on nav. |
| **No skip-to-content link** | Critical | Keyboard users must tab through 8 nav links before reaching content. No bypass mechanism exists. |
| **327 sub-12px text instances** | High | Multiple WCAG 1.4.4 violations. Text this small is unreadable for low-vision users and cannot be zoomed above browser maximums without layout breakage. |
| **`prefers-reduced-motion` incomplete** | High | The media query exists but only targets 11 selectors — missing `aurora-rays::after`, `bento-card::after`, `anim-preview-shimmer::after`, `ls-bar`, `bento-arrow::before`, and several other animated elements. A user who prefers reduced motion still gets ~14 different animations. |
| **Interactive mockup elements have no roles** | Medium | Buttons, tabs, and toggle switches in the hero mockup, editing mockup, and export showcase use `<div>`/`<span>` with no `role` or `tabIndex`. Screen readers cannot distinguish them from decorative content. |
| **SVGs missing `<title>` / `aria-label`** | Medium | Brand SVG icons, social icons, and decorative SVG arrows have no accessible names. Screen readers announce them as "image" with no context. |
| **Gradient headings have no text fallback** | Medium | `-webkit-text-fill-color: transparent` removes the actual text from the accessibility tree in some screen reader/browser combinations. |

**Prescription:** 
1. Add `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring` to every interactive element
2. Add `role="button"` and `tabIndex={0}` to mockup interactive elements
3. Add skip-to-content link as the first focusable element
4. Bump minimum text size to 11px
5. Complete the `prefers-reduced-motion` block to cover all animated elements
6. Add `role="img"` and `aria-hidden="true"` to decorative SVGs; `<title>` to meaningful ones
7. Serve fallback solid color on gradient headings for forced-colors mode

---

## Prescriptions Summary

| Priority | Issue | Prescription |
|---|---|---|
| **P0** | Zero keyboard focus indicators | Add `focus-visible:outline-2 focus-visible:outline-ring` to all interactive elements |
| **P0** | No skip-to-content link | Add visually-hidden skip link targeting `#features` |
| **P0** | 327 sub-12px text violations | Bump `text-[10.5px]` → `text-[11px]` across all 11 components |
| **P0** | Incomplete reduced-motion support | Extend media query to cover all animated selectors |
| **P1** | No ARIA roles on mockup elements | Add `role="button"` to mockup tabs/buttons/toggles |
| **P1** | SVGs missing accessible names | Add `aria-hidden` to decorative, `aria-label` to meaningful |
| **P2** | Dead links (`href="#"`) | Wire up or remove non-functional links |
| **P2** | Nav scroll-spy missing | Add IntersectionObserver-based active section indicator |
| **P2** | Gradient headings missing forced-colors fallback | Add solid color for Windows High Contrast Mode |
