# Skeleton Generator

Paste a React function component (Tailwind-friendly), get a tweakable skeleton loader, export production-ready React+Tailwind or HTML+Tailwind code.

## Develop

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

## Test

```bash
npm test
```

## Architecture

See `doc/RRD.md` for the PRD and `docs/superpowers/plans/2026-05-23-skeleton-generator.md` for the implementation plan.

Pipeline: JSX string → `lib/parser` → `SkeletonNode` IR → preview / `lib/exporters/*`.

## Stack

- Next.js 16 (App Router) + React 19
- Tailwind v4 + shadcn/ui (preset b3STOksuh, lime accent on dark)
- Zustand (localStorage persisted)
- @babel/parser for JSX → AST → IR
- Vitest for the deep-module test suite
