# Contributing to Skeleton Studio

Thanks for your interest in improving Skeleton Studio! This guide covers how to
get set up, the conventions we follow, and how to land a change.

## Code of Conduct

This project follows the [Contributor Covenant](./CODE_OF_CONDUCT.md). By
participating, you agree to uphold it.

## Development setup

```bash
git clone https://github.com/Ashikur540/skeleton-studio.git
cd skeleton-studio
npm install
cp .env.example .env
npm run dev
```

Requirements: Node.js 20+ and npm.

## Project layout

The app is a client-side editor served by Next.js. Key directories:

- `app/` — Next.js App Router (only `layout.tsx` and `page.tsx` are server
  components; all other routes are `"use client"`).
- `components/` — all `"use client"` React components (UI + panes).
- `lib/` — pure, framework-agnostic logic (parser, exporters, IR). **This is
  where most logic lives and where tests are required.**
- `store/` — single Zustand store.
- `hooks/` — co-located React hooks.

See [`CLAUDE.md`](./CLAUDE.md) and [`AGENTS.md`](./AGENTS.md) for the full
architecture reference and data flow.

## Conventions

- **TypeScript strict** — no `any`. Model new shapes through the IR's typed
  system.
- **No throwing from `lib/`** — return tagged unions (`{ ok, error }`).
- **Pure functions in `lib/`** — no React imports; they must be testable
  without a DOM.
- **Client boundary** — every component declares `"use client"`; don't break the
  `app/layout.tsx` server boundary.
- **Styling** — dynamic dimensions use inline `style` (the Tailwind v4 JIT
  scanner only sees build-time strings). Exported code uses arbitrary bracket
  syntax (`w-[42px]`).
- **Docs** — add a 2–3 line doc comment to every exported function describing
  intent, params, and edge cases.

## Before you open a PR

Run the full check locally:

```bash
npm run lint
npm test
npm run build
```

- Add or update tests for any change to `lib/**` or `store/**` (tests are
  co-located as `*.test.ts`).
- Keep PRs focused — one logical change per PR.

## Commit & PR flow

1. Fork and create a branch: `git checkout -b feat/short-description`.
2. Make your change with tests.
3. Use clear commit messages (Conventional Commits encouraged:
   `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`).
4. Push and open a PR against `main`. Fill in the PR template.
5. Link any related issue and describe what you changed and why.

A maintainer will review. Be ready to iterate on feedback.

## Reporting bugs & requesting features

Use the [issue templates](https://github.com/Ashikur540/skeleton-studio/issues/new/choose).
For security issues, do **not** open a public issue — see [SECURITY.md](./SECURITY.md).
