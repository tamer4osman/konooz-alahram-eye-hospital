# Contributing to Konooz Al-Ahram Eye Hospital

Thank you for contributing. This project serves real patients in Benghazi — correctness, accessibility, and honest messaging matter more than speed.

## Getting started

Prerequisites: **Node.js 18.18+** (Node 20+ recommended), npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you are redirected to `/ar` or `/en`. Use the header switcher or edit the URL to change language.

## Before every pull request

All checks must pass with zero output:

```bash
npm run lint      # 0 errors, 0 warnings
npx tsc --noEmit  # 0 errors
npm test          # all tests green
```

There is a Vitest unit suite covering the pure logic layer (`tests/*.test.ts`) — run it with `npm test` and add tests for new pure functions in `lib/`.

## Project conventions

- **Bilingual content** — every user-facing string needs Arabic and English variants in `data/`. Never hardcode copy inside components.
- **RTL-first** — Arabic is the default language. Use logical Tailwind properties (`ms-*`, `me-*`, `ps-*`, `pe-*`, `text-start/end`); never physical `ml/mr/pl/pr/left/right`.
- **Modals** — all dialogs use the shared `components/ui/Modal.tsx` primitive; register new modals with conditional render plus `next/dynamic`.
- **Honest data model** — patient data stays device-local (`context/PatientAuthContext.tsx`). Never add server calls or describe anything as automatic delivery.
- **Accessibility** — jsx-a11y rules run at error severity; zero violations allowed.
- **Types** — strict mode; no `any` escapes in domain types.

See `AGENTS.md` for the full agent-facing summary of these rules.

## Commit messages

Use conventional commit format:

```text
feat: add surgical cost calculator modal
fix: preserve scroll position after language switch
docs: expand bilingual content guide
```

AI-assisted commits must include:

```text
Co-Authored-By: Claude <noreply@anthropic.com>
```

## Pull request process

1. Create a feature branch from `main`.
2. Keep changes focused; one concern per PR.
3. Verify both checks pass locally before opening the PR.
4. Describe what changed and why; note any bilingual or accessibility impact.

## Reporting issues

Open a GitHub issue with: expected behavior, actual behavior, steps to reproduce, and screenshots (note whether taken in Arabic or English mode).
