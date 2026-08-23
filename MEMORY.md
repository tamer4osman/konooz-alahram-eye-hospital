# Memory

Persistent notes for AI agents across sessions. Update this file when a durable decision, preference, or open question emerges — keep entries short and dated. Rules live in `AGENTS.md`, identity in `SOUL.md`; this file is the running record.

## Preferences

- Operator primarily uses **OpenCode**; occasionally Google agentic tools (Gemini CLI / Jules). Docs and wiring should prioritize these two.
- Keep responses concise; verification gate before claiming completion: `npx eslint .` (0 errors, 0 warnings) + `npx tsc --noEmit` (0 errors).
- Do not commit unless explicitly asked.

## Decisions

- 2026-08-23 — `AGENTS.md` is the single canonical rules file at root; `CLAUDE.md` and `GEMINI.md` are thin `@AGENTS.md` (+`@SOUL.md`) import pointers. Never duplicate rules into other files.
- 2026-08-23 — Full AI-doc suite adopted: `.github/copilot-instructions.md`, `.cursor/rules/{core,bilingual-content}.mdc`, `public/llms.txt` (llms.txt v2 spec), `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, `CHANGELOG.md`.
- 2026-08-23 — Agent persona chosen: **Hakim**, Guardian Clinician archetype, subtle voice (`SOUL.md`). Alternates considered and set aside: Noor, Basheer.
- 2026-08-23 — Gemini CLI reads context via `.gemini/settings.json` (`context.fileName`: AGENTS.md, GEMINI.md). OpenCode loads extra context via `opencode.json` → `instructions` array.
- 2026-08-23 — No git remote exists yet; therefore no repository links in `llms.txt`, and CHANGELOG uses plain version headings without compare URLs.

## Open questions

- Add git remote when repo is published → then add repo link to `public/llms.txt` Optional section and CHANGELOG link references.
- Roadmap items pending backend work (see README): real accounts, live queue sync, test infrastructure.
