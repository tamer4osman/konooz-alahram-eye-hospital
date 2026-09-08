# Security Assessment — Konooz Al-Ahram Eye Hospital Web Application

**Date:** 2026-09-08
**Methodology:** 6-phase audit (attack-surface mapping → STRIDE threat model → technical checklist → red-team live testing → blue-team remediation → verdict)
**Scope:** Full codebase review + automated scans + live attack simulation against a locally running production build (`localhost:3000`, seeded demo data). No external/third-party systems were touched; all testing was against the operator's own local instance with their authorization.
**Tester role:** AI security audit agent, working with the project owner.

---

## 1. System Summary

Next.js 15 full-stack application (App Router, React 19, TypeScript strict) serving:

1. **Public marketing site** (`/ar`, `/en`) — departments, doctors, technologies, newsletter content, blog. Mostly static/ISR reads.
2. **Patient portal** (`/[locale]/portal`) — self-serve patient accounts, profile editing, consent-gated survey submission, derived read-only notifications.
3. **Operations dashboard** (`/[locale]/ops`) — ADMIN-only staff access to 12 operational modules (billing, invoices, clinical records, patient flow, beds, rooms, equipment, consumables, surgeries, attendance, analytics, ops-status).

**Stack:** PostgreSQL 16 + Prisma ORM, hand-rolled auth (argon2id password hashing + DB-backed sessions with hashed tokens + httpOnly cookies), Caddy reverse proxy on VPS (Docker, non-root container, standalone output).

**Attack surface:** 48 API routes (19 staff-gated, 5 patient-gated, 6 public reads, 4 unauthenticated auth endpoints, plus public booking/survey/telemetry writes), session middleware, static assets.

**Trust boundaries:**
- Internet → Caddy → Next.js server (single trusted proxy hop)
- Public/anonymous users → public + booking APIs
- Patient session → patient-scoped APIs (own rows only)
- Staff ADMIN session → all staff APIs (no finer granularity enforced for ADMIN; STAFF role exists but holds zero dashboard access today)

## 2. STRIDE Threat Model (per component)

| Component | Spoofing | Tampering | Repudiation | Info Disclosure | DoS | Privilege Escalation |
|---|---|---|---|---|---|---|
| Auth endpoints (login/register) | generic errors, no account oracle ✅ | zod-validated ✅ | — | no creds in errors ✅ | rate-limited ✅ (bypass found — F1) | n/a |
| Session validation | 32B random tokens, sha256-hashed at rest ✅ | cookie tamper → invalid hash → null ✅ | session table = trail ⚠️ partial | raw token never stored ✅ | cheap lookup ✅ | disjoint patient/staff cookie names ✅ |
| Staff APIs | ADMIN gate on every route ✅ (verified all 19+) | Prisma parameterized ✅ | no audit log for staff writes ⚠️ | DTO-shaped reads ✅ | no list-size caps on some reads ⚠️ | IDOR checked → 404 ✅ |
| Patient APIs | session-bound ✅ | field whitelist ✅ | consent records ✅ | scoped to own accountId ✅ (verified live) | bounded payloads ✅ (after F2) | cannot reach staff data ✅ (verified live) |
| Public booking | rate-limited (bypass — F1) | validated ✅ | ticket number = trace ✅ | no PII returned ✅ | unbounded fields (F2 → fixed) | n/a |
| Telemetry errors | rate-limited ⚠️ (bypass — F1) | schema-bounded ✅ | n/a | no secrets in reports ✅ | 10/min/IP (bypass — F1) | n/a |
| Static/ISR pages | n/a | immutable build output ✅ | n/a | JSON-LD sink (F3 → fixed) | ISR = cheap ✅ | n/a |
| Deployment (Docker+Caddy) | Caddy auto-TLS ✅ | non-root user ✅ | n/a | env via Docker secrets expected ⚠️ | healthcheck ✅ | single container, minimal image ✅ |

## 3. Findings

Severity ordering: CRITICAL > HIGH > MEDIUM > LOW > INFO.

| # | Severity | Finding | Vector | Impact | Status |
|---|----------|---------|--------|--------|--------|
| F1 | **HIGH** | Rate-limit bypass via spoofable `X-Forwarded-For` (first-entry trust) | Attacker sends a forged XFF header with each request; the limiter buckets by the *first* (client-controlled) entry, granting a fresh window per request. Confirmed live: 6 logins without forgery → 429 at attempt 4; 8 consecutive logins with rotated forged XFF → all 401, zero 429s. Because Caddy *appends* the real IP, the leftmost entry remains attacker-controlled **even in production**. | Unlimited password guessing against patient and staff login; unlimited spam into booking/registration/survey/telemetry limiters. | **FIXED** — `getClientIp` now trusts only the last XFF entry (lib/api/rate-limit.ts); unit tests added; SECURITY.md hard rule added. |
| F2 | **MEDIUM** | Unbounded booking fields on public endpoint | `POST /api/appointments` accepted a 10,000-char `patientName`, an unbounded-length `phone`, and 100 KB of arbitrary `intakeData` (verified live → 201, persisted). | Storage-DoS: anonymous users can bloat the appointments table; junk rows degrade dashboard reads. | **FIXED** — schema bounds every field (name ≤120, phone ≤20, intakeData ≤ 500-char scalar values, keys ≤60 chars); unit tests added. |
| F3 | **LOW/MEDIUM** | JSON-LD injection sinks via raw `JSON.stringify` | 7 `dangerouslySetInnerHTML` sinks embedded DB-sourced content (doctor names, FAQ text, blog titles) unescaped. A value containing `</script>` would break out of the JSON-LD script context. Exploitation requires an attacker to control DB content (i.e., a compromised ADMIN) — hence LOW severity, but the fix is cheap and removes the class. | Stored script-context breakout; mitigated by `script-src 'self' 'unsafe-inline'` being the only CSP allowance (attack value low) and by admin-only writes. | **FIXED** — `safeJsonLd()` helper (escapes `<`, `>`, `&`, U+2028/9) applied to all 7 sinks; 5 unit tests added. |
| F4 | **LOW** | Weak password policy | Registration accepts `alllowercase1!` (min-8 only). Argon2id + rate limiting compensate; no complexity rule. | Marginally easier credential guessing for patient accounts. | Open — recommend min 8 + letter+digit rule, or NIST-style length-first guidance. Deliberately left: changes UX copy (bilingual) + e2e seeds. |
| F5 | **LOW** | Stale SECURITY.md contradicted the data model | Policy page claimed "no server-side patient data" and "no authenticated API routes" — false since the 2026-09-05 desegregation. A security policy that misstates reality misdirects reporters. | Broken disclosure guidance; honesty violation. | **FIXED** — SECURITY.md rewritten to describe patient accounts, session model, and hard rules (XFF parsing, `safeJsonLd`). |
| F6 | **INFO** | 6 high-severity vulnerabilities in transitive dependencies | `npm audit`: prisma→deepmerge-ts (GHSA-ggr8-5vv4-36mx), next→postcss (3 advisories), next→sharp (libvips CVEs). Fixes require major-version bumps (prisma 8, next 16). | Build-time toolchain risk; postcss/sharp advisories are largely not reachable from this app's runtime paths, but they should not ride into delivery. | Open — schedule deliberate upgrades (separate task; breaking changes). |
| F7 | **INFO** | In-memory rate limiting | Buckets live in process memory: reset on restart, not shared across replicas. | Acceptable for the planned single-container VPS; would silently weaken if horizontally scaled. | Open — document; revisit if multi-instance. |
| F8 | **INFO** | 30-day session TTL, no rotation | Long-lived patient/staff sessions; tokens are hashed and revocable at logout. | Extends window of a stolen cookie. | Open — consider 7-day sliding renewal for staff. |
| F9 | **INFO** | `AUTH_SECRET` defined but unused | Sessions use random-token+hash, not HMAC signing. The env var suggests a signing mechanism that does not exist. | Operator confusion; no runtime impact. | Open — remove from `.env.example` or comment as reserved. |

## 4. Red-Team Test Log (live, localhost production build)

| # | Attack | Result |
|---|--------|--------|
| R1 | Unauthenticated sweep of 19 staff endpoints (billing, invoices, clinical records, analytics, patient search…) | ✅ Blocked — uniform 403 (`/me` → 401) |
| R2 | Patient session cookie against staff APIs (billing, patient-accounts search, clinical records) | ✅ Blocked — 403; identity isolation by mechanism (cookie name → session table) |
| R3 | Session-token tampering (garbage token; valid-shape wrong token) | ✅ Blocked — 403, no crash, no oracle |
| R4 | Existence oracle on `[id]` mutation routes with fake ids | ✅ Graceful — 404 (P2025 mapping), 422 on malformed body, 405 on wrong method |
| R5 | Login rate limiting, same client | ✅ 429 after threshold (4/15-min bucket) |
| R6 | **Login rate limiting with forged XFF rotation** | ❌ **Bypassed — F1** (fixed) |
| R7 | Oversized booking payload (10 KB name, 100 KB intake) | ❌ **Accepted — F2** (fixed) |
| R8 | XSS payload echo (`<script>`, `onerror`) through booking → staff JSON | ✅ JSON-escaped, list DTO omits name/notes; React escapes on render; no HTML-rendering sinks found |
| R9 | Security headers on pages | ✅ CSP, X-Frame-Options DENY, HSTS, nosniff, Permissions-Policy present |
| R10 | Cookie flags on session set | ✅ HttpOnly, SameSite=Lax, Secure (production build) |
| R11 | `/ar/ops` unauthenticated + robots.txt | ✅ Login page only (no data SSR); `/ops` disallowed in robots |
| R12 | Patient-scoped reads/patch (notifications, own profile) | ✅ 200, correctly scoped to own accountId |
| R13 | Registration validation (short password) | ✅ 400 rejected |

**Code-review verdict on the auth core:** argon2id hashing, sha256-hashed session tokens, 32-byte CSPRNG tokens, disjoint identity stores, identical error codes for unknown-email vs wrong-password, consent-gated writes, fill-if-empty import semantics, Prisma (no raw SQL). No weaknesses found in this layer beyond F1/F4.

## 5. Remediations Applied (this audit)

| Fix | Files | Tests |
|-----|-------|-------|
| F1 XFF last-entry trust | `lib/api/rate-limit.ts` | `tests/rate-limit.test.ts` (2 rewritten/new cases incl. spoof-rotation scenario) |
| F2 bounded booking schema | `lib/validation/appointments.ts` | `tests/validation.test.ts` (+4 cases: name cap, phone cap, intakeData key/value/type caps) |
| F3 `safeJsonLd` sink hardening | new `lib/security/jsonld.ts`; `components/SEOStructuredData.tsx`, `app/[locale]/blog/page.tsx`, `app/[locale]/blog/[slug]/page.tsx` (7 sinks) | new `tests/jsonld.test.ts` (5 cases) |
| F5 SECURITY.md honesty rewrite | `SECURITY.md` | — |

**Verification gate after fixes:** `npx eslint .` 0 errors/0 warnings · `npx tsc --noEmit` 0 errors · `npm test` 427/427 green · `fallow dead-code --changed-since main` 0 issues.

## 6. Open Items (recommended before/after delivery)

1. **Dependency upgrades (F6):** plan prisma → 8.x and next → 16.x as separate deliberate tasks; rerun this audit's R1–R13 suite afterwards.
2. **Password policy (F4):** add letter+digit minimum with bilingual error copy + seed/test updates.
3. **Staff audit trail:** staff mutations currently leave no tamper-evident log. For a clinical system, an append-only audit table for staff writes is the single most valuable next security investment (supports repudiation/non-repudiation for billing and clinical records).
4. **CSP nonce (hardening):** move `script-src` off `'unsafe-inline'` using Next.js middleware nonces; enables strict CSP.
5. **Session hardening (F8/F9):** staff sessions → 7-day sliding TTL; remove/comment `AUTH_SECRET`.
6. **Ops runbook:** document restore-from-backup drills for the PostgreSQL volume (backup/restore discipline is currently process-level, not tested).

## 7. Verdict

**APPROVED WITH RESOLVATIONS — safe to deliver after the F1–F3/F5 fixes (applied and verified in this audit), with F6 scheduled.**

The authentication architecture, identity isolation, authorization gating, input validation discipline, and honest-data-model boundaries are strong — notably stronger than typical for this project stage, and every staff route was verified gated in source *and* at runtime. The confirmed exploitable finding (rate-limit bypass) and the storage-abuse finding were fixed, tested, and re-gated during this assessment. Remaining risk concentrates in supply-chain (dependency upgrades) and in the absence of a staff-mutation audit trail — neither blocks delivery, both belong on the go-live checklist.

*Residual disclosure:* this assessment covers the application layer end-to-end but is not a substitute for: infrastructure penetration testing of the VPS host, a load test, or an independent review of the operator's production secrets handling (DATABASE_URL, Docker secrets, Caddy TLS storage).
