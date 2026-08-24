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
| Dead-code scan (changed files) | `npm run intel -- dead-code --changed-since main --format json` |
| Full analysis pass | `npx fallow --format json` |
| Production build (includes lint + typecheck) | `npm run build` |

No test suite exists yet — lint (0 errors, 0 warnings) + typecheck (0 errors) are the verification gate for every change.

## Codebase Intelligence (Fallow)

[Fallow](https://fallow.tools) (`fallow` devDependency) provides deterministic module-graph analysis: unused files/exports/dependencies, duplication, complexity hotspots, Next.js framework checks. Config: `.fallowrc.json`.

- **After any edit that adds/removes imports or files**, run `npm run intel -- dead-code --changed-since <base-ref> --format json`. Fix orphans your change created before committing.
- Always use `--format json` when an agent parses output; human format is fine interactively.
- Before deleting a flagged export, verify it first: `npx fallow dead-code --trace FILE:EXPORT --format json`.
- `scripts/*.ts` seeds are declared entry points in `.fallowrc.json` — never delete them as "unused".
- Extend `ignoreDependencies` only with a one-line reason in the commit message (build-tooling deps imported by configs are the usual case).
- Duplication baseline is ~8% (mostly admin-gate boilerplate across staff API routes); refactor opportunistically into shared helpers when touching those files anyway.

## Commit Attribution

AI commits MUST include:

```text
Co-Authored-By: Claude <noreply@anthropic.com>
```

Use conventional commit format (`feat: …`, `fix: …`, `docs: …`, `refactor: …`).

## Key Conventions

- **Bilingual content**: every user-facing string needs AR and EN variants in `data/`. Never hardcode copy inside components.
- **RTL-first**: Arabic is the default language. Use logical Tailwind properties (`ms-*`, `me-*`, `ps-*`, `pe-*`, `text-start/end`) — never physical `ml/mr/pl/pr/left/right`.
- **Language state** lives only in `context/LanguageContext.tsx` (localStorage persistence + `?lang=` deep link). Do not add competing i18n mechanisms.
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
```
