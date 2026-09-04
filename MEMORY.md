# Memory

Persistent notes for AI agents across sessions. Update this file when a durable decision, preference, or open question emerges — keep entries short and dated. Rules live in `AGENTS.md`, identity in `SOUL.md`; this file is the running record.

## Preferences

- Operator primarily uses **OpenCode**; occasionally Google agentic tools (Gemini CLI / Jules). Docs and wiring should prioritize these two.
- Keep responses concise; verification gate before claiming completion: `npx eslint .` (0 errors, 0 warnings) + `npx tsc --noEmit` (0 errors).
- Do not commit unless explicitly asked.
- 2026-09-03 — Full quality loop after EVERY code change: (1) unit tests (Vitest) for touched pure logic, (2) `npm run intel -- dead-code --changed-since main` with `--trace` verification before deleting any flagged export, (3) chrome-devtools live check of affected UI flows + stress test (CPU 4x + Slow 4G / Fast 3G), (4) lint + typecheck gate. Currently applied to the CA use-case extraction (invoices/appointments pilot).
- 2026-09-04 — **CA conversion complete: all 12 staff/public modules now in `lib/usecases/`** (invoices, appointments, billing, rooms, beds, attendance, surgeries, equipment, consumables, clinical, patient-flow, analytics, staff-members) with Prisma adapters in `lib/adapters/prisma/`. Route handlers are thin (gate → validate → use case → respond) everywhere. 100 new unit tests (253 total, all stub-port, zero Prisma mocks). Every module passed the full quality loop incl. chrome-devtools stress tests. Pattern proven at scale — BCK cards build directly on this. Committed as `900af48`; unrelated pre-existing `Hero.tsx` opacity tweak kept out of the refactor, committed separately as `45770c3` (worth a visual review — background 25%→95% opacity is a significant look change). Known remaining non-CA edges (migrate-on-touch): `lib/auth/session.ts` (cookies+Prisma mixed), public-site read loaders (`lib/departments/doctors/technologies.ts`).

## Decisions

- 2026-08-24 — Backend architecture locked: full-stack Next.js on VPS (Docker Compose: web/db/caddy), Prisma ORM + PostgreSQL 16, hand-rolled auth (argon2id + DB sessions + httpOnly cookies) with Google OAuth in Phase 1, Caddy auto-TLS, GHA→GHCR→SSH deploy pipeline. Board: 56 cards / 9 epics at `docs/kanban/backend-board.md`.
- 2026-08-24 — DBA expertise added to SOUL.md (Database Steward section). Normalization: 3NF baseline + 3 documented exceptions (booking-time snapshots, JSON value objects, tag-like arrays). All M:N relationships resolved through named associative entities.
- 2026-08-24 — **Fallow adopted as codebase-intelligence gate** (v3.17.0 devDep, `.fallowrc.json`, `npm run intel` script). Baseline driven to 0 dead-code issues: deleted `hooks/use-mobile.ts` + `lib/utils.ts` + dead type, de-exported 2 internal symbols, removed 8 unused deps (incl. `eslint-config-next`/`@rushstack/eslint-patch`), declared 8 previously-transitive eslint/postcss deps explicitly. Duplication ~8% = admin-gate boilerplate across staff API routes → extract shared helper when touched. Workflow codified in AGENTS.md §Codebase Intelligence. react-hooks pinned ^5.2.0 deliberately: v7's `set-state-in-effect` rule flags 2 pre-existing patterns (Reveal.tsx:27, LanguageContext.tsx:210) — v7 upgrade is a separate deliberate task.
- 2026-08-24 — DRY law enforced as board DoD: single source per fact, Prisma schemas generate frontend types, deletion completes the card. Public doctor/specialties listings migrated from static arrays to DB via ISR (BCK-095).
- 2026-08-24 — Honest-data-model boundary: approved for change — patient data moves from device-local to server storage. Privacy page + consent checkbox required before accounts go live (BCK-026). Booking requests remain labeled "reception confirms via WhatsApp."
- 2026-08-23 — `AGENTS.md` is the single canonical rules file at root; `CLAUDE.md` and `GEMINI.md` are thin `@AGENTS.md` (+`@SOUL.md`) import pointers. Never duplicate rules into other files.
- 2026-08-23 — Full AI-doc suite adopted: `.github/copilot-instructions.md`, `.cursor/rules/{core,bilingual-content}.mdc`, `public/llms.txt` (llms.txt v2 spec), `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, `CHANGELOG.md`.
- 2026-08-23 — Agent persona chosen: **Hakim**, Guardian Clinician archetype, subtle voice (`SOUL.md`). Alternates considered and set aside: Noor, Basheer.
- 2026-08-23 — Gemini CLI reads context via `.gemini/settings.json` (`context.fileName`: AGENTS.md, GEMINI.md). OpenCode loads extra context via `opencode.json` → `instructions` array.
- 2026-08-23 — No git remote exists yet; therefore no repository links in `llms.txt`, and CHANGELOG uses plain version headings without compare URLs.

## Open questions

- Add git remote when repo is published → then add repo link to `public/llms.txt` Optional section and CHANGELOG link references.
- Roadmap items pending backend work (see README): real accounts, live queue sync, test infrastructure.
- 2026-08-24 — Authorization model: ADMIN = full dashboard permission (single admin today); STAFF = DB member without dashboard access. Future: admin changes own password and assigns staff permissions (UI pending). Gate is \getStaffUser()\ requiring \ole === 'ADMIN'\; seed account staff@konooz.test promoted to ADMIN.
