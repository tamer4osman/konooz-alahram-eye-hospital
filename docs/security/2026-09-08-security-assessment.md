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
| F4 | **LOW** | Weak password policy | Registration accepted `alllowercase1!` (min-8 only). Argon2id + rate limiting compensate; no composition rule. | Marginally easier credential guessing for patient accounts. | **FIXED** — `isPasswordAcceptable` in `lib/usecases/auth/rules.ts` (min 8, letter + digit, max 128); bilingual `WEAK_PASSWORD_MESSAGES` wired through the register handler and portal UI; 5 unit tests. Login is unchanged by design — policy is a registration-time concern. |
| F5 | **LOW** | Stale SECURITY.md contradicted the data model | Policy page claimed "no server-side patient data" and "no authenticated API routes" — false since the 2026-09-05 desegregation. A security policy that misstates reality misdirects reporters. | Broken disclosure guidance; honesty violation. | **FIXED** — SECURITY.md rewritten to describe patient accounts, session model, and hard rules (XFF parsing, `safeJsonLd`). |
| F6 | **INFO** | 6 high-severity vulnerabilities in transitive dependencies | `npm audit`: prisma→deepmerge-ts (GHSA-ggr8-5vv4-36mx), next→postcss (3 advisories), next→sharp (libvips CVEs). | Build-time toolchain risk; postcss/sharp advisories are largely not reachable from this app's runtime paths. **FIXED (commit `1a48e0e`):** next 15.4.9→16.3.4 (middleware→proxy rename, Turbopack default build verified) and deepmerge-ts overridden to ^8.0.2 scoped to `@prisma/config` (Prisma pins the vulnerable 7.1.5 in every stable release; Prisma 8 is not yet stable — npm latest is 8.0.0-rc.13, fix only on 8.1.0-dev — so an RC/dev build was ruled out). `npm audit`: **0 vulnerabilities**. Prisma CLI verified: validate/generate/migrate-status pass against the live DB. | Resolved in code; open follow-up: when Prisma 8 goes stable, remove the override and upgrade for real. |
| F7 | **INFO** | In-memory rate limiting | Buckets live in process memory: reset on restart, not shared across replicas. | Acceptable for the planned single-container VPS; would silently weaken if horizontally scaled. | Open — document; revisit if multi-instance. |
| F8 | **INFO** | 30-day session TTL, no rotation | Long-lived patient/staff sessions; tokens are hashed and revocable at logout. | Extends window of a stolen cookie. | Open — consider 7-day sliding renewal for staff. |
| F9 | **INFO** | `AUTH_SECRET` defined but unused | Sessions use random-token+hash, not HMAC signing. The env var suggests a signing mechanism that does not exist. | Operator confusion; no runtime impact. | **FIXED** — removed from `.env.example` with a comment explaining sessions are not signed, so nobody re-adds it under a false assumption. |
| F10 | **LOW** | Rate-limiter bucket map grew unboundedly | Keys are client-influenced (IPv6 rotation, direct-connection spoofing in dev); the in-memory `Map` never evicted, so a distributed flood could grow process memory without limit. Found during the post-audit honesty pass, not by an attacker. | Memory-DoS of the Node process over long horizons; single-container deployment makes this the whole app. | **FIXED** — 10,000-key cap with oldest-first eviction (`RATE_LIMIT_MAX_TRACKED_KEYS`); 3 new unit tests prove the cap holds and per-key limits stay honest after eviction pressure. |

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
| R14 | **Re-run (2026-09-08, post-hardening, commit `e5571be`): CSP nonce enforcement live attack** | ✅ Parser-inserted nonceless `<script>` (the real stored-XSS shape, via srcdoc iframe inheriting page CSP) **blocked**; external `img-src` exfil attempt **blocked** with console violation; legit nonced JSON-LD and hydration unaffected |

### G5 Re-Run Notes (2026-09-08, against final local build on `:3100`)

Fresh production build after all hardening (Next 16, CSP nonce, audit trail, F8). All 13 original tests re-executed live plus one new CSP-attack test:

| # | Re-run result | Notes |
|---|---|---|
| R1 | ✅ 403 on all 14 real staff routes | `/api/staff/staff` + `/api/staff/audit` in the original sweep were wrong route names (404s) — real paths are `/api/staff/staff-members`, `/api/staff/patient-accounts/search`; audit rows are write-only by design (no read API) |
| R2 | ✅ 403×3 | Patient token vs billing / patient-accounts/search / clinical-records — isolation holds |
| R3 | ✅ 403 / 401 | Garbage token, forged-tail token vs staff API, forged token vs its own origin — no crash, no oracle |
| R4 | ✅ 404 / 404 / 405 | Fake-id PATCH on consumables + invoices, wrong method on `[id]` — graceful, no existence oracle |
| R5 | ✅ 401×4 → 429 | Same-client threshold intact (also incidentally reproduced when the auditor's own repeated logins tripped it mid-suite) |
| R6 | ✅ **Bypass closed under production topology** | Direct-to-Next requests with single-IP rotating XFF each get fresh buckets (expected — no proxy hop locally); with Caddy-shaped headers (rotating spoof first, real socket IP appended last) rotation is defeated: 401×5 → 429. This is the deployed shape on the VPS |
| R7 | ✅ 422 | 10 KB name + 60×2 KB intakeData rejected by bounded schema |
| R8 | ✅ 201, no raw echo | XSS payload stored without echo in response; React escapes on render; JSON-LD sinks escaped + nonced |
| R9 | ✅ | CSP with per-request nonce + strict-dynamic, **no `unsafe-inline` in prod script-src**; XFO DENY, XCTO nosniff, HSTS, Permissions-Policy |
| R10 | ✅ | Both staff and patient Set-Cookie: HttpOnly + SameSite=Lax + Secure |
| R11 | ✅ | robots.txt disallows `/ops`; `/ar/ops` unauthenticated renders login only |
| R12 | ✅ 200×2 | `/api/patient/auth/me` + notifications correctly scoped |
| R13 | ✅ 400 | Short password rejected at registration |
| R14 | ✅ **new** | Live CSP attack (see table above) |

**G5 status: COMPLETE.** `npm audit`: 0 vulnerabilities (achieved at commit `1a48e0e`); R1–R14 re-run notes recorded above against the final hardened build. Test-harness note: the in-memory limiter resets on process restart (F7 accepted tradeoff) — the suite restarted the server once to clear a bucket tripped by the auditor's own attempts mid-run; this also incidentally re-demonstrated that the limiter works.

**Code-review verdict on the auth core:** argon2id hashing, sha256-hashed session tokens, 32-byte CSPRNG tokens, disjoint identity stores, identical error codes for unknown-email vs wrong-password, consent-gated writes, fill-if-empty import semantics, Prisma (no raw SQL). No weaknesses found in this layer beyond F1/F4.

## 5. Remediations Applied (this audit)

| Fix | Files | Tests |
|-----|-------|-------|
| F1 XFF last-entry trust | `lib/api/rate-limit.ts` | `tests/rate-limit.test.ts` (2 rewritten/new cases incl. spoof-rotation scenario) |
| F2 bounded booking schema | `lib/validation/appointments.ts` | `tests/validation.test.ts` (+4 cases: name cap, phone cap, intakeData key/value/type caps) |
| F3 `safeJsonLd` sink hardening | new `lib/security/jsonld.ts`; `components/SEOStructuredData.tsx`, `app/[locale]/blog/page.tsx`, `app/[locale]/blog/[slug]/page.tsx` (7 sinks) | new `tests/jsonld.test.ts` (5 cases) |
| F5 SECURITY.md honesty rewrite | `SECURITY.md` | — |
| F10 rate-limiter memory cap | `lib/api/rate-limit.ts` | `tests/rate-limit.test.ts` (+3 cases: cap enforcement, post-eviction per-key honesty, small-traffic integrity) |
| F4 password policy | `lib/usecases/auth/rules.ts`, `lib/api/patient-auth-handlers.ts`, `components/portal/AuthTab.tsx`, `.env.example` (F9 removal) | `tests/auth-rules.test.ts` (+5 cases), 435/435 suite green |

**Verification gate after fixes:** `npx eslint .` 0 errors/0 warnings · `npx tsc --noEmit` 0 errors · `npm test` 430/430 green · `fallow dead-code --changed-since main` 0 issues.

### Delivery gate — must pass before go-live (application layer is NOT the whole system)

The audit above covers the application. These gates cover what the application runs *on*; none of them were verified in this assessment and all are cheap to check:

| Gate | Check | Evidence to capture |
|------|-------|--------------------|
| G1 | VPS host: SSH key-only auth, password login disabled, ufw/firewall allows only 22/80/443, Docker daemon not exposed on TCP, PostgreSQL **not** reachable from the internet (5432 closed externally) | `ss -tlnp` output, ufw status |
| G2 | Backup restore drill: take a fresh `pg_dump`, restore it into a scratch container, run a query against restored data, time the whole thing | Drill log + elapsed time; if restore has never been exercised, there is no backup, only hope |
| G3 | Secrets path: DATABASE_URL and seed credentials reach the VPS via Docker secrets or a root-readable env file — never baked into the image, never in git | `docker exec env` spot-check; grep image layers for the string |
| G4 | Caddy serving real TLS (A grade at ssllabs) and HSTS honored end-to-end | ssllabs report URL |
| G5 | Dependency upgrades from F6 executed (next 16 done in commit `1a48e0e`; when Prisma 8 goes stable, remove the deepmerge-ts override and upgrade) and R1–R13 red-team suite re-run | **DONE** — `npm audit` 0 + R1–R14 re-run notes recorded in §4 (2026-09-08, commit `e5571be` build) |
| G6 | Post-deploy smoke: `/api/health` 200, staff login works, booking 201, staff APIs 403 without cookie | curl transcript |

## 6. Open Items (recommended before/after delivery)

1. **Prisma 8 (when stable):** remove the `deepmerge-ts` override from `package.json`, upgrade `prisma`/`@prisma/client` to 8.x stable, rerun this audit's R1–R14 suite afterwards.
2. **Staff audit trail:** **DONE (`88d0bf8`)** — append-only `staff_audit_logs` table (actorId, actorEmail snapshot, action, module, targetId, createdAt); every staff mutation across all 19 staff routes / 23 handlers records one row after commit; no update/delete path exists in the application layer. Verified live (create + update on the production build produced correct rows). Residual honesty note: the append is written after the mutation commits — best-effort by design (a failed append logs loudly but never fails the response); true hash-chained tamper-evidence against a DBA-level actor remains out of scope.
3. **CSP nonce (hardening):** **DONE** — `script-src` is now `self + per-request nonce + 'strict-dynamic'` with **no `unsafe-inline` in production**. The proxy (`proxy.ts`) generates a fresh nonce per document request, sets the CSP header on both response and forwarded request headers (Next.js propagates the nonce to its own bootstrap scripts), and forwards it to server components via `x-nonce` (`lib/security/csp.ts`: pure `buildCsp()` with 5 unit tests, `getNonce()` reader). All 7 JSON-LD sinks (SEOStructuredData ×4, blog list, blog article ×2) carry the nonce attribute. `style-src 'unsafe-inline'` deliberately retained (UI style attributes; not an execution vector). Verified live on the production build: `/ar`, `/en`, blog list + article, `/portal`, `/ops` all hydrate cleanly with zero CSP console violations; stress test (CPU 4× + Fast 3G) clean; Maps iframe unaffected. Residual: `frame-src` still allows Google Maps hosts by design.
4. **Session hardening (F8):** **DONE (`e9a4d5d`)** — staff sessions rotate on a 7-day sliding window (active staff never logged out mid-shift); patient sessions keep 30 days.
5. **Ops runbook:** document restore-from-backup drills for the PostgreSQL volume (backup/restore discipline is currently process-level, not tested).
6. **Delivery gate G1–G6:** see §5 — G5 ✅ complete; remaining VPS-side items: host hardening (G1), restore drill (G2), secrets path (G3), TLS (G4), post-deploy smoke (G6).

### Post-G5 additions (2026-09-08)

| # | Item | Status |
|---|------|--------|
| P1 | `/api/health` honest liveness endpoint (200 ok/up · 503 error/down, no detail leak) | DONE (`4e07cd8`) |
| P2 | Expired-session cleanup (`npm run cleanup:sessions`) | DONE (`e5018ee`) — script shipped, scheduling below |
| P3 | Audit-log retention (`npm run prune:audit`, default 730 d, min 30) | DONE (`e5018ee`) — script shipped, scheduling below |
| P4 | Test-seed guard (`ALLOW_TEST_SEED=1` required) | DONE (`169de7c`) |
| P5 | Dependabot (npm + docker + actions, weekly) | DONE (`6610055`) — activates on GitHub push |
| P6 | Uptime monitoring of `/api/health` | Operator (recipe below) |
| P7 | TOTP 2FA for ADMIN | Future — own brainstorm + plan |

**P2/P3 scheduling (VPS systemd timer, one file each):**

```ini
# /etc/systemd/system/konooz-maintenance.timer
[Unit]
Description=Konooz daily housekeeping (sessions + audit retention)
[Timer]
OnCalendar=*-*-* 04:00:00
Persistent=true
[Install]
WantedBy=timers.target
```

```ini
# /etc/systemd/system/konooz-maintenance.service
[Unit]
Description=Konooz housekeeping run
[Service]
Type=oneshot
WorkingDirectory=/opt/konooz
ExecStart=/usr/bin/docker compose exec -T web npm run cleanup:sessions
ExecStart=/usr/bin/docker compose exec -T web npm run prune:audit
```

Enable with `systemctl daemon-reload && systemctl enable --now konooz-maintenance.timer`.

**P6 uptime recipe:** free pinger (e.g. UptimeRobot) → HTTPS monitor on `https://<domain>/api/health`, 5-min interval, alert on non-200. For 429-spike visibility, alert on log lines matching `429` in the web container (`docker compose logs -f web | grep --line-buffered ' 429 '` shipped to the same channel) — a spike usually means an active credential-stuffing attempt.

**Go-live account checklist (extends the Delivery gate):**

1. On the VPS DB, run `npm run seed:staff` with **production** `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` values only.
2. Never run `npm run seed:test-accounts` in production (it now refuses without `ALLOW_TEST_SEED=1` — keep that variable unset).
3. Verify: `SELECT email FROM users; SELECT email FROM patient_accounts;` — zero rows containing `@test` or `@konooz.test`.

## 7. Verdict

**APPROVED — safe to deliver. All 10 findings closed or documented (F1–F6, F8–F10 fixed; F7 accepted tradeoff) and the strict-CSP hardening delivered. Local-side work complete; remaining §6 items are VPS-side (restore drill, TLS, secrets, post-deploy smoke) or a Prisma-8-stable follow-up.**

The authentication architecture, identity isolation, authorization gating, input validation discipline, and honest-data-model boundaries are strong — notably stronger than typical for this project stage, and every staff route was verified gated in source *and* at runtime. The confirmed exploitable finding (rate-limit bypass) and the storage-abuse finding were fixed, tested, and re-gated during this assessment. Remaining risk concentrates in supply-chain (dependency upgrades) and in the absence of a staff-mutation audit trail — neither blocks delivery, both belong on the go-live checklist.

*Residual disclosure:* this assessment covers the application layer end-to-end but is not a substitute for: infrastructure penetration testing of the VPS host, a load test, or an independent review of the operator's production secrets handling (DATABASE_URL, Docker secrets, Caddy TLS storage).
