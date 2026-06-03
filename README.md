<div align="center">
  <img src="./public/skelton-studio-logo-full-light.svg#gh-light-mode-only" alt="Skeleton Studio" width="320" />
  <img src="./public/skelton-studio-logo-full-dark.svg#gh-dark-mode-only" alt="Skeleton Studio" width="320" />

  <p><strong>Paste a component → get a tweakable skeleton loader → copy production-ready code.</strong></p>

  <p>
    <a href="https://skeletons-studio.vercel.app">Live Demo</a> ·
    <a href="#getting-started">Getting Started</a> ·
    <a href="./CONTRIBUTING.md">Contributing</a>
  </p>

  <p>
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" />
    <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" />
    <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" />
    <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" />
    <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind-v4-38BDF8?logo=tailwindcss&logoColor=white" />
  </p>
</div>

---

## What is this?

**Skeleton Studio** turns a pasted React/JSX component into a matching skeleton
loading placeholder — no hand-drawing grey boxes. Paste your component, watch a
live skeleton render, drag to fine-tune dimensions and layout, then copy clean
**React + Tailwind** or **HTML + Tailwind** code.

It runs entirely in the browser. There is no backend — parsing, formatting, and
code export all happen client-side.

## Features

- **JSX → skeleton in one paste** — `@babel/parser` reads your component and
  infers structure.
- **Live, editable preview** — drag handles resize nodes; a properties panel
  edits any block.
- **Smart classification** — detects avatars, text, images, buttons, cards,
  inputs, and containers from tags + Tailwind classes.
- **Archetype detection** — recognizes media objects, forms, nav bars, heroes,
  card grids, stat tiles, and pricing cards to tune spacing automatically.
- **Repeat + variance** — `.map()` rows collapse into `repeat: N` with
  deterministic width variation so lists look natural.
- **Two export targets** — React+Tailwind JSX or plain HTML+Tailwind, formatted
  with Prettier.
- **Presets, animation, theming** — curated starters, shimmer/pulse animation
  controls, light/dark mode.
- **Undo/redo + keyboard shortcuts** — full history stack, arrow-nudge, delete.

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Install & run

```bash
git clone https://github.com/Ashikur540/skeleton-studio.git
cd skeleton-studio
npm install
cp .env.example .env   # adjust values if needed
npm run dev
```

Open <http://localhost:3000>.

### Environment variables

All vars are `NEXT_PUBLIC_*` (client-exposed). There are no server secrets.
See [`.env.example`](./.env.example).

| Variable                         | Required | Description                               |
| -------------------------------- | -------- | ----------------------------------------- |
| `NEXT_PUBLIC_PROJECT_VERSION`    | no       | Version shown in the UI footer.           |
| `NEXT_PUBLIC_SITE_URL`           | no       | Canonical site URL for absolute/OG links. |
| `NEXT_PUBLIC_CLARITY_PROJECT_ID` | no       | Microsoft Clarity ID. Blank disables it.  |

## Scripts

| Command              | Action                        |
| -------------------- | ----------------------------- |
| `npm run dev`        | Start the Next.js dev server. |
| `npm run build`      | Production build.             |
| `npm run start`      | Serve the production build.   |
| `npm run lint`       | ESLint (flat config).         |
| `npm test`           | Vitest (run once).            |
| `npm run test:watch` | Vitest (watch mode).          |

## Architecture

Everything flows through a single **Intermediate Representation (IR)** —
`SkeletonNode`. Renderers, exporters, and the properties panel all consume the
same tree, so there's one source of truth.

```
JSX String
  → @babel/parser            → AST
  → lib/parser/raw-node      → RawNode (structural snapshot)
  → semantic-classifier      → SkeletonNode (Tailwind hints + tag defaults)
  → table-grid + sibling-repeat → refined IR tree
  → [Preview] skeleton-renderer + runtime-styles → DOM
  → [Export]  react-tailwind / html-tailwind      → code string
```

| Layer       | Tech                                                      |
| ----------- | -------------------------------------------------------- |
| Framework   | Next.js 16 (App Router)                                  |
| UI          | React 19, TypeScript 5 (strict), shadcn/ui (Radix)       |
| Styling     | Tailwind CSS v4 (CSS-first config)                       |
| State       | Zustand v5 + `persist` (only source + settings persisted) |
| JSX parsing | `@babel/parser` + `@babel/types`                        |
| Editor      | CodeMirror 6                                             |
| Formatting  | Prettier standalone (browser build)                      |
| Testing     | Vitest v4 (`environment: "node"`)                        |

Pure logic lives in `lib/**` (framework-agnostic, fully unit-tested). UI
components are all `"use client"`; the only server component is
`app/layout.tsx`. See [`CLAUDE.md`](./CLAUDE.md) / [`AGENTS.md`](./AGENTS.md)
for the full architecture reference.

## Testing

```bash
npm test
```

Deep unit tests cover the parser pipeline, exporters, presets, and store
behavior. Tests are co-located (`*.test.ts` next to source).

## Deployment

Optimized for [Vercel](https://vercel.com). Push to your repo, import it, set
the `NEXT_PUBLIC_*` env vars, and deploy. Any Node host that runs
`npm run build && npm run start` works too.

## Contributing

Contributions welcome. Read [CONTRIBUTING.md](./CONTRIBUTING.md) and our
[Code of Conduct](./CODE_OF_CONDUCT.md) first.

## Security

To report a vulnerability, see [SECURITY.md](./SECURITY.md).

## License

[MIT](./LICENSE) © Ashikur Rahman
