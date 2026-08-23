# Copilot Instructions

Konooz Al-Ahram Eye Hospital website — bilingual (Arabic-first / RTL) Next.js 15 (App Router) + React 19 + TypeScript strict + Tailwind CSS v4 site and patient portal.

## Commands

- `npm run dev` — dev server
- `npx eslint .` — must report **0 errors, 0 warnings**
- `npx tsc --noEmit` — must report 0 errors
- `npm run build` — production build; runs lint + typecheck

No test suite exists yet. Lint + typecheck are the gate for every change.

## Non-negotiable conventions

1. **Bilingual content** — every user-facing string needs Arabic AND English variants in `data/`. Never hardcode copy inside components.
2. **RTL-first** — Arabic is default. Use logical Tailwind properties (`ms-*`, `me-*`, `ps-*`, `pe-*`, `text-start/end`), never physical `ml/mr/pl/pr/left/right`.
3. **Modals** — use the shared `components/ui/Modal.tsx`; register new modals with conditional render plus `next/dynamic`.
4. **Honest data model** — patient data stays device-local (`context/PatientAuthContext.tsx`). Never add server calls or claim automatic delivery of anything.
5. **Accessibility** — jsx-a11y runs at error severity; zero violations allowed.
6. **Types** — strict mode, no `any` in domain types.
7. **Commits** — conventional format (`feat:`, `fix:`, `docs:`, …) with `Co-Authored-By: Claude <noreply@anthropic.com>` on AI-assisted commits.
