# Taste (Continuously Learned by [CommandCode][cmd])

[cmd]: https://commandcode.ai/

# code-style
- Use /* */ block comments for multi-line comments instead of repeated // lines. Confidence: 0.65
- Use the `cn` utility function from `lib` for combining CSS classes instead of manual string concatenation or template literals. Confidence: 0.65

# layout
- The preview/canvas pane should receive flex-1 (primary growing area), not the input pane — users interact with the preview most. Confidence: 0.65

# routing
- The landing page lives at `/` route and the main app editor lives at `/builder` route. Confidence: 0.85

# css
- Prefer Tailwind utility classes in JSX over custom CSS rules. Only use custom CSS when Tailwind can't express it (pseudo-elements with gradients, keyframe animations, backdrop-filter, mask-image, clip-path, multi-layer box-shadows, gradient text, perspective). Confidence: 0.75
- Use the project's own color/design tokens instead of copying tokens from inspiration/vendor sources. Confidence: 0.70
- The landing page is always dark mode — do not apply light mode styles to it. Confidence: 0.85

# ui
- Detect device/platform (Mac vs Windows) and show appropriate keyboard shortcut keys dynamically instead of hardcoding both variants. Confidence: 0.65

# landing
- When making changes to the landing page, check all grids and sections for mobile responsiveness — not just the specific component being edited. Confidence: 0.70
- Skeleton bar elements inside card previews (starter cards, bento starters, mini canvas, animation tiles, hero mockup inspector tiles) should have shimmer animation via ::after pseudo-element, matching the inspiration design. Apply shimmer to specific selectors (`.sk::after`, `.starter-card__bar::after`, `.mini-canvas .b::after`, `.bento-starter__bar::after`, `.bento-anim__preview::after`, `.mockup__anim-tile .preview::after`) — not as a blanket `.sk-block::after` rule. Confidence: 0.80
- The landing page is always dark mode — do not apply light mode styles to it. Confidence: 0.85
- SEO optimize the landing page to rank for skeleton generator keywords: "skeleton generator", "skeleton generator tailwind css", "tailwind loading skeleton generator", "loading skeleton generator", "React tailwind skeleton generator", "code to loading skeleton". Confidence: 0.75
- Preserve the `export const metadata: Metadata = { ... }` block in `app/page.tsx` with title, description, and openGraph fields — do not drop it when making other changes to the landing page. Confidence: 0.80

# content-accuracy
- Public-facing content (FAQ, landing page, marketing copy) must not claim features the code doesn't actually implement — verify claims against the actual codebase before publishing. Confidence: 0.75
