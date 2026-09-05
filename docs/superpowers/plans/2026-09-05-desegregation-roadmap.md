# Patient Portal ⇄ Operations Hub Desegregation — Phase Roadmap

> **For agentic workers:** Each phase is (or will be) its own execution-ready plan in
> this directory. Execute phases strictly in order — each phase leaves the app
> fully working (lint 0/0, typecheck 0 errors, tests green, live check passed)
> before the next one starts.

**Goal:** Completely decouple the patient portal from the staff-facing Operations Hub — two identity stores, zero client-side data storage, token (session-cookie) based record access, dedicated routes, no shared surfaces.

**Design record:** Agreed via grilling session 2026-09-05 (11 questions, all resolved). Decisions are numbered below as **D1–D11** so any future agent can trace why each choice was made.

---

## Locked decisions

| # | Decision |
|---|----------|
| D1 | Route split, same app. Homepage stays pure marketing; portal and hub get dedicated routes. |
| D2 | Each surface hosts its own auth. Staff cannot self-register — admin provisions accounts with the existing permissions matrix. Patients self-serve signup/login. |
| D3 | Context split: `StaffAuthContext` (server session) vs. slimmed `PatientAuthContext`. No cross-imports. |
| D4 | Session-token + server-side record scoping. Hashed DB sessions in httpOnly cookies; record access enforced in the use-case layer (patient queries scoped by own `userId`). No JWTs, no JS-readable tokens. |
| D5 | Schema-first record linking: nullable `userId` FK on staff-authored records; staff pick the linked account at entry time; unmatched patients see an honest "confirm at front desk" state. |
| D6 | **Two identity stores**: public `PatientAccount` (self-serve) vs. admin-controlled staff identity. Separate session cookies (`konooz_patient_session` / `konooz_staff_session`) — isolation by mechanism, not discipline. |
| D7 | Locale-nested routes: `/[locale]/portal`, `/[locale]/ops`. Language stays path-based. `robots.txt` disallows `/ops`. |
| D8 | One-time consent-gated bridge imports old device-local profiles into the server account on first portal visit, then deletes the local copy. Dismiss flag + retirement date; bridge is dead code after sunset window. |
| D9 | Notifications are derived, read-only facts computed from existing server data on read. No notifications table, nothing implies a message was delivered. |
| D10 | Homepage = pure marketing. `PatientPortalModal` becomes the `/[locale]/portal` page. Homepage-replacement behavior for logged-in staff is deleted. |
| D11 | Staff sessions are redirected from **all** marketing routes (middleware) to `/ops`. Staff session cookie and marketing content never coexist in a tab. |

## Hard constraints (from AGENTS.md — apply to every phase)

- Bilingual: every user-facing string has AR + EN in `data/`. No hardcoded copy.
- RTL-first: logical Tailwind properties only (`ms-*`, `pe-*`, `text-start`…).
- Honest data model: nothing implies automatic delivery; every visible number comes from the DB or shows an em-dash/empty state.
- Clean Architecture: new domain logic lives in `lib/usecases/<module>/` (ports + rules + orchestration, framework-free); Prisma touches only `lib/adapters/prisma/`. `lib/auth/session.ts` is a flagged migrate-on-touch edge — Phase 1 touches it, so it migrates now.
- Modals use `components/ui/Modal.tsx` + `next/dynamic`.
- Full quality loop per phase: unit tests (Vitest, stub ports) → fallow dead-code scan (`npm run intel -- dead-code --changed-since main --format json`, `--trace` before deletes) → chrome-devtools live check in `/ar` + `/en` incl. CPU 4× + Slow 4G stress → `npx eslint .` (0/0) + `npx tsc --noEmit` (0).
- Commits: conventional format + `Co-Authored-By: tamer4osman <tamer4osman@users.noreply.github.com>`. No commit unless the operator asks.

---

## Phase 1 — Identity & session split (data layer) ✅ DONE

**Deliverable:** Two identity stores exist in the schema with a data migration; session/auth code is split into patient and staff flavors (CA-style); API namespaces mirror the split (`/api/patient/auth/*`, `/api/staff/auth/*`); legacy `/api/auth/*` routes remain as thin facades so the current UI keeps working untouched.

**Scope:**
- Prisma schema: `PatientAccount` + `PatientSession` tables; staff identity stays on a dedicated table (rename `User` → `StaffUser` semantics, keep `users` table physically to limit churn); FK migration moves existing rows by role.
- `lib/auth/session.ts` → `lib/usecases/auth/` ports + rules, adapters in `lib/adapters/prisma/` (CA migration of the flagged edge).
- New patient auth routes; staff login/me/logout routes; legacy facades.
- Unit tests for session rules and adapters (stubbed), auth route handlers.

**Plan:** `docs/superpowers/plans/2026-09-05-phase1-identity-split.md`

## Phase 2 — Operations Hub route + staff isolation ✅ DONE

**Deliverable:** `/[locale]/ops` renders the dashboard with inline staff login; `StaffAuthContext` owns the staff session; homepage swap behavior deleted; middleware bounces staff sessions off all marketing routes (D11).

**Scope:**
- Create `app/[locale]/ops/page.tsx` (+ layout) hosting `HospitalDashboard` (unmodified tab architecture).
- `context/StaffAuthContext.tsx`; `DashboardHeader` switches imports; staff login form extracted from portal `AuthTab`.
- `HomePageClient` loses the dashboard branch; `middleware.ts` gains the staff-redirect rule; `robots.txt` disallows `/ops`.
- Staff auth UI + gate tests; live check: logged-in staff visiting `/ar`, `/ar/blog` → redirected.

## Phase 3 — Record linking (schema-first, D5) ✅ DONE

**Deliverable:** Staff-authored records can reference a patient account; staff clinical form gains an account picker; patient-side reads are exact, not fuzzy.

**Scope:**
- Nullable `userId` FK on `ClinicalConsultationRecord` (+ `HospitalBillingInvoice` if trivially safe); migration is add-column-only (no backfill claims — unmatched stays unmatched honestly).
- Staff picker in clinical record creation (search by phone/email among `PatientAccount`s); unlinked flow unchanged.
- Use-case rules: link validation, patient-scoped read queries (own records only).
- Tests: link rules, scoping rules (stub ports).

## Phase 4 — Patient portal route (D1, D2, D10) ✅ DONE

**Deliverable:** `/[locale]/portal` is a real page hosting the portal tabs; `PatientAuthContext` is server-only (no localStorage); entry CTAs across `Navbar`/`Hero`/`FloatingWidgets`/`Footer` become links; `PatientPortalModal` and its homepage plumbing are deleted.

**Scope:**
- `app/[locale]/portal/page.tsx` reusing the existing tab components (AuthTab, ProfileTab, AppointmentsTab, SurveyTab, NewsletterTab; Prescriptions/Notifications ship honest empty states until their data sources land).
- Patient APIs: profile read/update, appointments read (scoped by session `userId`), linked prescriptions read (Phase 3 FKs), derived notifications (Phase 5).
- Delete `PatientPortalModal`, `openPatientPortal` plumbing, localStorage code paths.
- Live check: patient signup → portal; homepage untouched; `/en` mirrors.

## Phase 5 — Bridge, derived notifications, cleanup (D8, D9) ✅ DONE

**Deliverable:** One-time local-profile merge bridge; derived notifications tab; privacy page + portal copy updated to server-storage-with-consent language; legacy code fully removed.

**Scope:**
- `LocalProfileBridge` (consent prompt → POST validated data → delete local copy → dismiss flag with sunset date).
- Derived notifications use case (appointment status, upcoming reminders, survey invitations — all computed on read).
- Privacy page + `data/` copy sweep (AR/EN pairs): replace "device-local only" claims.
- Fallow scan: delete dead exports (old session lib, facade routes, modal plumbing); verify nothing fabricated remains; final stress test both locales.

---

## Dependency graph

```
Phase 1 (identity) ──► Phase 2 (ops hub) ──► Phase 3 (linking) ──► Phase 4 (portal) ──► Phase 5 (bridge+cleanup)
        │                    │
        └── staff redirect    └── staff picker needs StaffAuthContext
                                  └── patient reads need FKs
                                      └── bridge/notifications need portal route
```

## Risk register

| Risk | Mitigation |
|------|-----------|
| Session migration strands logged-in users | Facade routes keep old cookie valid during transition; sunset in Phase 5 with re-login notice (honest copy). |
| Middleware redirect loops (`/ops` redirect target also matched) | Matcher excludes `/ops` + `/portal` paths explicitly; live-checked per locale. |
| Prisma migration irreversibility | Migration reviewed line-by-line; run against a DB copy first; seed scripts updated in same phase. |
| Bundle leakage during transition | Both routes ship code-split (`next/dynamic`); fallow scan after each phase. |
| Copy drift (stale "device-local" claims) | Phase 5 explicit sweep + grep for `device`, `local` claims in `data/`. |
