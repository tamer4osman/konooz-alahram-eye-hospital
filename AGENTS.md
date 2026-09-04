# Agent Instructions

## Project Overview

Bilingual (Arabic-first / RTL) marketing site and patient portal for Konooz Al-Ahram Eye Hospital, Benghazi. Next.js 15 (App Router), React 19, TypeScript strict, Tailwind CSS v4, lucide-react icons.

## Commands

Use **npm**: `npm install`, `npm run dev`, `npm run build`

| Task | Command |
| --- | --- |
| Lint whole project | `npx eslint .` |
| Lint single file | `npx eslint path/to/file.tsx` |
| Typecheck | `npx tsc --noEmit` |
| Test suite (unit) | `npm test` |
| Dead-code scan (changed files) | `npm run intel -- dead-code --changed-since main --format json` |
| Full analysis pass | `npx fallow --format json` |
| Production build (includes lint + typecheck) | `npm run build` |

Verification gate for every change: **lint (0 errors, 0 warnings) + typecheck (0 errors) + tests (all green)**. Tests live in `tests/*.test.ts` (Vitest, node env, `@/` alias); they cover the pure logic layer — DTO mappers, validation schemas, API helpers, analytics engine, password hashing. New pure functions in `lib/` should ship with tests; mock `@/lib/prisma` via `vi.mock` when needed.

## Codebase Intelligence (Fallow)

[Fallow](https://fallow.tools) (`fallow` devDependency) provides deterministic module-graph analysis: unused files/exports/dependencies, duplication, complexity hotspots, Next.js framework checks. Config: `.fallowrc.json`.

- **After any edit that adds/removes imports or files**, run `npm run intel -- dead-code --changed-since <base-ref> --format json`. Fix orphans your change created before committing.
- Always use `--format json` when an agent parses output; human format is fine interactively.
- Before deleting a flagged export, verify it first: `npx fallow dead-code --trace FILE:EXPORT --format json`.
- `scripts/*.ts` seeds are declared entry points in `.fallowrc.json` — never delete them as "unused".
- Extend `ignoreDependencies` only with a one-line reason in the commit message (build-tooling deps imported by configs are the usual case).
- Duplication baseline is ~8% (mostly admin-gate boilerplate across staff API routes); refactor opportunistically into shared helpers when touching those files anyway.

## Use-Case Layer Convention (Clean Architecture, targeted)

Domain logic lives in a 3-circle layout — adopted via the invoices + appointments pilot (2026-09). Dependencies point inward only:

```text
app/api/**/route.ts        thin handlers: auth gate → validate → use case → respond
lib/usecases/<module>/     ports.ts (ISP interfaces) + rules.ts (pure business rules) + use-cases.ts (orchestration)
lib/adapters/prisma/       implements ports; Prisma error codes → typed use-case errors here
lib/ pure code             validation schemas, permissions, DTO mappers = the entities layer
```

Rules:

- **Use cases are framework-free**: no `prisma`, no `next/*` imports in `lib/usecases/`. Ports are injected as first arguments; one minimal interface per use case (ISP), not module-level fat repositories.
- **Prisma touches only `lib/adapters/`**: P2025/P2002 → typed errors (`InvoiceNotFoundError`, etc.), row → DTO mapping (`lib/dashboard/billing.ts` mappers) happen there. Prisma types never cross the boundary.
- **Business rules are pure functions** in `rules.ts` (defaults, snapshots, fallbacks, status transitions, honest copy) — unit-testable with stub ports, no `vi.mock('@/lib/prisma')` needed.
- **New BCK features MUST live in `lib/usecases/`**; existing route handlers migrate only when touched for other reasons (mirrors the duplication-refactor rule). Do not convert all routes in one wave.
- Reference implementation: `lib/usecases/invoices/`, `lib/usecases/appointments/` + `tests/invoice-usecases.test.ts`, `tests/appointment-usecases.test.ts`.

## Full Quality Loop

After every code change — not only at the end of a task — run all four gates:

1. **Unit tests** (Vitest): new/changed pure logic gets tests with stub ports; run the full suite, all green.
2. **Fallow**: `npm run intel -- dead-code --changed-since main --format json`; any flag requires `--trace` verification before delete-or-keep, and expected-but-unwired exports (awaiting a later step) must be justified in the summary.
3. **Chrome-devtools live check**: exercise the affected UI/API flows in the browser (both `/ar` and `/en` when user-facing), check console + network, then **stress test** with CPU throttle 4x + degraded network (Slow 4G / Fast 3G): no hydration errors, no layout overflow, images intact, API round-trips sane.
4. **Verification gate**: `npx eslint .` (0 errors, 0 warnings) + `npx tsc --noEmit` (0 errors).

## Commit Attribution

AI commits MUST include:

```text
Co-Authored-By: Claude <noreply@anthropic.com>
```

Use conventional commit format (`feat: …`, `fix: …`, `docs: …`, `refactor: …`).

## Key Conventions

- **Bilingual content**: every user-facing string needs AR and EN variants in `data/`. Never hardcode copy inside components.
- **RTL-first**: Arabic is the default language. Use logical Tailwind properties (`ms-*`, `me-*`, `ps-*`, `pe-*`, `text-start/end`) — never physical `ml/mr/pl/pr/left/right`.
- **Language state** is path-based: `/ar` and `/en` are the source of truth. `middleware.ts` redirects bare paths (cookie `konooz_lang` > `Accept-Language` > `ar`) and keeps legacy `?lang=` links working. `context/LanguageContext.tsx` receives the locale as a prop and switching navigates to the sibling path — no localStorage, no competing i18n mechanisms.
- **Modals**: all dialogs use the shared `components/ui/Modal.tsx` primitive (focus trap, Escape, scroll lock, `aria-modal`). Register new modals with conditional render **and** `next/dynamic` so their JS stays out of the first load.
- **Honest data model**: patient data is device-local only (`context/PatientAuthContext.tsx`). Never add server calls or describe anything as automatic delivery — backend integration is explicitly future work and the UI must say so.
- **Accessibility**: jsx-a11y rules run at error severity; zero violations allowed.
- **Types**: strict mode, no `any` escapes in domain types.

## Structure

```text
app/        routes, layout, metadata, sitemap, robots
components/ public sections, modals, ui/ primitives, dashboard/
context/    LanguageContext, PatientAuthContext providers
data/       bilingual AR/EN content datasets (single source of copy)
hooks/ lib/ shared hooks and utilities
lib/usecases/    domain use cases (ports + rules + orchestration) — framework-free
lib/adapters/    Prisma implementations of use-case ports
```
