# Taste (Continuously Learned by [CommandCode][cmd])

[cmd]: https://commandcode.ai/

# code-style
- Use /* */ block comments for multi-line comments instead of repeated // lines. Confidence: 0.65

# layout
- The preview/canvas pane should receive flex-1 (primary growing area), not the input pane — users interact with the preview most. Confidence: 0.65

# routing
- The landing page lives at `/` route and the main app editor lives at `/app` route. Confidence: 0.70

# css
- Prefer Tailwind utility classes in JSX over custom CSS rules. Only use custom CSS when Tailwind can't express it (pseudo-elements with gradients, keyframe animations, backdrop-filter, mask-image, clip-path, multi-layer box-shadows, gradient text, perspective). Confidence: 0.75
- Use the project's own color/design tokens instead of copying tokens from inspiration/vendor sources. Confidence: 0.70
- The landing page is always dark mode — do not apply light mode styles to it. Confidence: 0.85

# ui
- Detect device/platform (Mac vs Windows) and show appropriate keyboard shortcut keys dynamically instead of hardcoding both variants. Confidence: 0.65

# landing
- Skeleton bar elements inside card previews (starter cards, bento starters, mini canvas, animation tiles, hero mockup inspector tiles) should have shimmer animation via ::after pseudo-element, matching the inspiration design. Apply shimmer to specific selectors (`.sk::after`, `.starter-card__bar::after`, `.mini-canvas .b::after`, `.bento-starter__bar::after`, `.bento-anim__preview::after`, `.mockup__anim-tile .preview::after`) — not as a blanket `.sk-block::after` rule. Confidence: 0.80
- The landing page is always dark mode — do not apply light mode styles to it. Confidence: 0.85
- SEO optimize the landing page to rank for skeleton generator keywords: "skeleton generator", "skeleton generator tailwind css", "tailwind loading skeleton generator", "loading skeleton generator", "React tailwind skeleton generator", "code to loading skeleton". Confidence: 0.70
