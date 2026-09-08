# Security Follow-Ups Implementation Plan (post-G5)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the seven post-G5 recommendations that are code-side (health endpoint, session cleanup, audit retention, seed-account guard, Dependabot, operations docs), leaving only VPS-operator actions and TOTP 2FA.

**Architecture:** Pure rules live in `lib/usecases/maintenance/rules.ts` and `lib/health/rules.ts` (framework-free, unit-tested). Thin scripts in `scripts/` reuse the existing `seed-runner.ts` plumbing (client creation, teardown, exit codes) and call the rules. The health endpoint is a thin route handler over the pure rules. Documentation lands in the security report §6 and CHANGELOG.

**Tech Stack:** Next.js 16 App Router route handler, Prisma client, Vitest, `tsx --env-file=.env` script runner.

**Out of scope (deliberate):** TOTP 2FA for ADMIN — a full feature (schema migration, enrollment UI, login-flow change, recovery codes) that needs its own brainstorm + plan after the VPS deploys. Record it in report §6 as a future item; do not start it in this plan.

---

## Recommendation → Task Map

| # | Recommendation (from session) | Covered by |
|---|---|---|
| 1 | Kill seed accounts on VPS | Task 5 (guard prevents habit-runs) + Task 7 (go-live account checklist) |
| 2 | Session table cleanup | Tasks 1–2 (rules + `cleanup:sessions` script) + Task 7 (systemd timer recipe) |
| 3 | Automated backups | Task 7 (pg_dump + restore-drill recipe — operator executes) |
| 4 | Uptime + error monitoring | Task 4 (`/api/health`) + Task 7 (pinger recipe + 429 alert note) |
| 5 | TOTP 2FA for ADMIN | Out of scope — recorded as future plan in Task 7 |
| 6 | Audit log retention policy | Tasks 1–3 (cutoff rule + `prune:audit` script + schema docstring) |
| 7 | Dependabot/Renovate | Task 6 |

---

### Task 1: Pure maintenance rules + tests

**Files:**
- Create: `lib/usecases/maintenance/rules.ts`
- Test: `tests/maintenance-rules.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `tests/maintenance-rules.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  AUDIT_RETENTION_DAYS_DEFAULT,
  AUDIT_RETENTION_DAYS_MIN,
  auditRetentionCutoff,
  expiredSessionFilter,
} from '@/lib/usecases/maintenance/rules';

describe('expiredSessionFilter', () => {
  it('matches only rows whose expiry is before the given instant', () => {
    const now = new Date('2026-09-08T12:00:00.000Z');
    const filter = expiredSessionFilter(now);
    expect(filter.expiresAt.lt.getTime()).toBe(now.getTime());
  });

  it('returns a copy of the date, never the caller\'s instance', () => {
    const now = new Date('2026-09-08T12:00:00.000Z');
    const filter = expiredSessionFilter(now);
    expect(filter.expiresAt.lt).not.toBe(now);
  });
});

describe('auditRetentionCutoff', () => {
  it('subtracts the requested number of days', () => {
    const now = new Date('2026-09-08T12:00:00.000Z');
    expect(auditRetentionCutoff(now, 30).toISOString()).toBe('2026-08-09T12:00:00.000Z');
  });

  it('defaults to 2 years (730 days)', () => {
    const now = new Date('2026-09-08T12:00:00.000Z');
    expect(AUDIT_RETENTION_DAYS_DEFAULT).toBe(730);
    expect(auditRetentionCutoff(now).toISOString()).toBe('2024-09-08T12:00:00.000Z');
  });

  it('rejects retention shorter than the minimum', () => {
    expect(AUDIT_RETENTION_DAYS_MIN).toBe(30);
    expect(() => auditRetentionCutoff(new Date(), 7)).toThrow('>= 30');
    expect(() => auditRetentionCutoff(new Date(), Number.NaN)).toThrow();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/maintenance-rules.test.ts`
Expected: FAIL — cannot resolve `@/lib/usecases/maintenance/rules`.

- [ ] **Step 3: Write the rules**

Create `lib/usecases/maintenance/rules.ts`:

```ts
// Pure rules for ops housekeeping scripts. Framework-free: no prisma, no
// next/* — the deleteMany where-objects returned here are plain JSON shapes.

export const AUDIT_RETENTION_DAYS_DEFAULT = 730;
export const AUDIT_RETENTION_DAYS_MIN = 30;

export interface ExpiredSessionFilter {
  expiresAt: { lt: Date };
}

// Where-clause matching sessions/patient_sessions whose expiry has already
// passed. Live tokens (expiresAt >= now) are never matched.
export function expiredSessionFilter(now: Date): ExpiredSessionFilter {
  return { expiresAt: { lt: new Date(now.getTime()) } };
}

// Cutoff before which audit rows may be pruned. The minimum exists to stop a
// typo'd env var from silently destroying a young audit trail.
export function auditRetentionCutoff(
  now: Date,
  days: number = AUDIT_RETENTION_DAYS_DEFAULT,
): Date {
  if (!Number.isFinite(days) || days < AUDIT_RETENTION_DAYS_MIN) {
    throw new Error(`audit retention must be a finite number >= ${AUDIT_RETENTION_DAYS_MIN} days`);
  }
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/maintenance-rules.test.ts`
Expected: PASS — 5 tests green.

- [ ] **Step 5: Commit**

```bash
git add lib/usecases/maintenance/rules.ts tests/maintenance-rules.test.ts
git commit -m "feat(maintenance): pure retention and session-expiry rules"
```

Commit trailer: `Co-Authored-By: tamer4osman <tamer4osman@users.noreply.github.com>`.

---

### Task 2: Cleanup scripts + npm commands

**Files:**
- Create: `scripts/cleanup-sessions.ts`
- Create: `scripts/prune-audit-log.ts`
- Modify: `package.json` (scripts section, after `"seed:test-accounts"` line 15)
- Modify: `prisma/schema.prisma:51-55` (StaffAuditLog docstring — comment only, no migration)

- [ ] **Step 1: Create `scripts/cleanup-sessions.ts`**

```ts
import { runSeed } from './seed-runner';
import { expiredSessionFilter } from '../lib/usecases/maintenance/rules';

// Housekeeping for expired auth sessions (staff `sessions` + patient
// `patient_sessions`). Nothing here touches live tokens — only rows whose
// expiry has already passed. Intended to run daily from a VPS systemd timer;
// see docs/security/2026-09-08-security-assessment.md §6.
runSeed(async (prisma) => {
  const filter = expiredSessionFilter(new Date());
  const staff = await prisma.session.deleteMany({ where: filter });
  const patients = await prisma.patientSession.deleteMany({ where: filter });
  console.log(`expired sessions removed: staff=${staff.count} patient=${patients.count}`);
});
```

Note: `seed-runner.ts`'s `runSeed` is generic plumbing (client creation, teardown, exit code) — reuse is deliberate, keep the comment explaining it.

- [ ] **Step 2: Create `scripts/prune-audit-log.ts`**

```ts
import { runSeed } from './seed-runner';
import { auditRetentionCutoff } from '../lib/usecases/maintenance/rules';

// Retention prune for the append-only staff audit trail. The application
// layer never deletes audit rows; this script is the single sanctioned
// exception, run deliberately from ops (default: keep 730 days, override
// with AUDIT_RETENTION_DAYS, minimum 30 enforced).
runSeed(async (prisma) => {
  const daysRaw = process.env.AUDIT_RETENTION_DAYS;
  const days = daysRaw ? Number(daysRaw) : undefined;
  const cutoff = auditRetentionCutoff(new Date(), days);
  const result = await prisma.staffAuditLog.deleteMany({
    where: { createdAt: { lt: cutoff } },
  });
  console.log(`audit rows pruned (retention ${days ?? 'default(730)'} days): ${result.count}`);
});
```

- [ ] **Step 3: Add npm commands**

In `package.json`, extend the scripts block (after `"seed:test-accounts"`):

```json
    "cleanup:sessions": "tsx --env-file=.env scripts/cleanup-sessions.ts",
    "prune:audit": "tsx --env-file=.env scripts/prune-audit-log.ts"
```

- [ ] **Step 4: Update the StaffAuditLog docstring (comment only)**

In `prisma/schema.prisma`, replace in the StaffAuditLog comment block:

```prisma
/// STAFF AUDIT TRAIL (security report open item #2, 2026-09-08). Append-only
/// record of every staff mutation on clinical/operational data: who, what,
/// where. No FK to users — the row must survive staff deletion; actorEmail is
/// denormalized for the same reason. Never updated, never deleted from the
/// application layer; the only sanctioned deletion is the ops-run
/// `npm run prune:audit` retention script (default 730 days, min 30) — see
/// lib/usecases/maintenance/rules.ts.
```

(Keeps the "append-only from the app" truth intact while documenting the exception instead of contradicting the schema later.)

- [ ] **Step 5: Verify against the dev DB**

Run: `npm run cleanup:sessions` then `npm run prune:audit`
Expected: `expired sessions removed: staff=N patient=M` (N/M may be 0 on a fresh dev DB — correctness is that the command exits 0 and prints counts) and `audit rows pruned (retention default(730) days): K`.

- [ ] **Step 6: Gates + commit**

Run: `npx eslint . && npx tsc --noEmit && npm test`
Expected: 0 errors, 0 warnings, 454 tests green (449 + 5 new).

```bash
git add scripts/cleanup-sessions.ts scripts/prune-audit-log.ts package.json package-lock.json prisma/schema.prisma
git commit -m "feat(maintenance): expired-session cleanup and audit-log retention scripts"
```

---

### Task 3: Health endpoint (`/api/health`)

**Files:**
- Create: `lib/health/rules.ts`
- Create: `app/api/health/route.ts`
- Test: `tests/health-rules.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/health-rules.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { healthResponse } from '@/lib/health/rules';

describe('healthResponse', () => {
  it('reports ok/up with HTTP 200 when the database answers', () => {
    expect(healthResponse(true)).toEqual({
      httpStatus: 200,
      body: { status: 'ok', db: 'up' },
    });
  });

  it('reports error/down with HTTP 503 when the database is unreachable', () => {
    expect(healthResponse(false)).toEqual({
      httpStatus: 503,
      body: { status: 'error', db: 'down' },
    });
  });

  it('never includes exception details in the body (no data leak)', () => {
    const body = JSON.stringify(healthResponse(false).body);
    expect(body).not.toMatch(/error:|stack|connection/i);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/health-rules.test.ts`
Expected: FAIL — cannot resolve `@/lib/health/rules`.

- [ ] **Step 3: Write the rules**

Create `lib/health/rules.ts`:

```ts
// Pure mapping from a database reachability check to the honest health
// payload. Deliberately minimal: a health endpoint is a liveness signal for
// uptime pingers, not telemetry — it must never leak exception text,
// versions, or infrastructure details.

export interface HealthBody {
  status: 'ok' | 'error';
  db: 'up' | 'down';
}

export function healthResponse(dbOk: boolean): {
  httpStatus: 200 | 503;
  body: HealthBody;
} {
  return dbOk
    ? { httpStatus: 200, body: { status: 'ok', db: 'up' } }
    : { httpStatus: 503, body: { status: 'error', db: 'down' } };
}
```

- [ ] **Step 4: Write the route handler**

Create `app/api/health/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { healthResponse } from '@/lib/health/rules';

export const dynamic = 'force-dynamic';

export async function GET() {
  let dbOk = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbOk = true;
  } catch (err) {
    console.error('health check: database unreachable', err);
  }
  const { httpStatus, body } = healthResponse(dbOk);
  return NextResponse.json(body, { status: httpStatus });
}
```

Notes: public by design (uptime pingers cannot log in); unauthenticated is safe because the payload carries no information beyond "database answers". No rate limiting needed — the limiter keys on login routes only.

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run tests/health-rules.test.ts`
Expected: PASS — 3 tests green.

- [ ] **Step 6: Live smoke**

Run: `npm run build` then serve on :3100 (`$env:PORT='3100'; npm start` style boot used earlier in this session), then:

```powershell
(Invoke-WebRequest -Uri http://localhost:3100/api/health -UseBasicParsing).Content
```

Expected: `{"status":"ok","db":"up"}` with HTTP 200. Also confirm no new console errors on `/ar` via chrome-devtools (`isolatedContext` for a clean cookie context).

- [ ] **Step 7: Gates + commit**

Run: `npx eslint . && npx tsc --noEmit && npm test`
Expected: 457 tests green, 0 lint/type errors.

```bash
git add lib/health/rules.ts app/api/health/route.ts tests/health-rules.test.ts
git commit -m "feat(health): honest /api/health liveness endpoint"
```

---

### Task 4: Guard against test-seed habit-runs

**Files:**
- Modify: `scripts/seed-test-accounts.ts` (top of `main()`)
- Modify: `.env.example` (add commented line)

- [ ] **Step 1: Add the guard**

In `scripts/seed-test-accounts.ts`, insert as the first statements inside `main()` (before the `requireEnv` calls):

```ts
  // Known-credential accounts must never exist on the production database.
  // The explicit opt-in keeps this from running by habit on the VPS.
  if (process.env.ALLOW_TEST_SEED !== '1') {
    console.error(
      'Refusing to seed test accounts: set ALLOW_TEST_SEED=1 to run. ' +
        'These accounts carry known credentials and must never exist on production.',
    );
    process.exitCode = 1;
    return;
  }
```

- [ ] **Step 2: Document the flag in `.env.example`**

Add near the existing `SEED_TEST_*` block:

```text
# ALLOW_TEST_SEED=1   # required to run seed:test-accounts — NEVER set on production
```

- [ ] **Step 3: Verify both paths**

Run: `npm run seed:test-accounts`
Expected: refusal message, exit code 1.
Then: `$env:ALLOW_TEST_SEED='1'; npm run seed:test-accounts; Remove-Item Env:ALLOW_TEST_SEED`
Expected: the three `✓` lines as before.

- [ ] **Step 4: Commit**

```bash
git add scripts/seed-test-accounts.ts .env.example
git commit -m "fix(seeds): require ALLOW_TEST_SEED=1 for known-credential test accounts"
```

---

### Task 5: Dependabot

**Files:**
- Create: `.github/dependabot.yml`

- [ ] **Step 1: Create the config**

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    groups:
      minor-and-patch:
        update-types: ["minor", "patch"]
    open-pull-requests-limit: 5

  - package-ecosystem: "docker"
    directory: "/"
    schedule:
      interval: "weekly"

  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
```

(Minor/patch grouped so dependency PRs stay reviewable; majors arrive individually and deliberately.)

- [ ] **Step 2: Verify YAML parses**

Run: `Get-Content .github/dependabot.yml | Out-String` and eyeball indentation, or `npx js-yaml .github/dependabot.yml` if available. (GitHub validates on push; no local CI gate exists for this file.)

- [ ] **Step 3: Commit**

```bash
git add .github/dependabot.yml
git commit -m "chore(deps): dependabot for npm, docker, and github-actions"
```

---

### Task 6: Operations additions to the security report + CHANGELOG

**Files:**
- Modify: `docs/security/2026-09-08-security-assessment.md` (append subsection under `## 6. Open Items`)
- Modify: `CHANGELOG.md` (new `## Unreleased` heading at top)

- [ ] **Step 1: Append to report §6**

Add after the existing open-items table:

```markdown
### Post-G5 additions (2026-09-08)

| # | Item | Status |
|---|------|--------|
| P1 | `/api/health` honest liveness endpoint (200 ok/up · 503 error/down, no detail leak) | DONE |
| P2 | Expired-session cleanup (`npm run cleanup:sessions`) | DONE — script shipped, scheduling below |
| P3 | Audit-log retention (`npm run prune:audit`, default 730 d, min 30) | DONE — script shipped, scheduling below |
| P4 | Test-seed guard (`ALLOW_TEST_SEED=1` required) | DONE |
| P5 | Dependabot (npm + docker + actions, weekly) | DONE — activates on GitHub push |
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
```

- [ ] **Step 2: Add CHANGELOG entry**

At the top of `CHANGELOG.md`:

```markdown
## Unreleased

### Added

- `/api/health` liveness endpoint (database ping, honest 200/503, no detail leak).
- `npm run cleanup:sessions` — removes expired staff/patient auth sessions.
- `npm run prune:audit` — audit-trail retention prune (default 730 days, minimum 30).
- `ALLOW_TEST_SEED=1` guard on test-account seeding (refuses production habit-runs).
- Dependabot configuration (npm, Docker, GitHub Actions — weekly).

### Changed

- StaffAuditLog schema docstring documents `prune:audit` as the single sanctioned deletion path.
```

- [ ] **Step 3: Commit**

```bash
git add docs/security/2026-09-08-security-assessment.md CHANGELOG.md
git commit -m "docs(security): post-G5 operations additions and go-live account checklist"
```

---

### Task 7: Full quality loop + memory

- [ ] **Step 1: Unit tests**

Run: `npm test`
Expected: 457/457 green.

- [ ] **Step 2: Fallow dead-code scan**

Run: `npm run intel -- dead-code --changed-since main --format json`
Expected: 0 issues. (`healthResponse`, `expiredSessionFilter`, `auditRetentionCutoff`, `AUDIT_RETENTION_DAYS_*` are all wired to scripts/routes/tests — `--trace` anything unexpected before deciding.)

- [ ] **Step 3: Live + stress check**

Production build on :3100 → `/api/health` (200), `/ar` and `/en` via chrome-devtools `isolatedContext`: no hydration errors, no new console messages, no layout change expected (no UI diff at all).

- [ ] **Step 4: Verification gate**

Run: `npx eslint . && npx tsc --noEmit && npm audit`
Expected: 0/0 lint, 0 type errors, 0 vulnerabilities.

- [ ] **Step 5: MEMORY.md note**

Append one dated line to the 2026-09-08 decision entry: follow-up wave shipped (health endpoint, session/audit cleanup scripts + timers recipe, test-seed guard, Dependabot); 2FA deferred to its own plan; VPS items G1–G4/G6 remain.

Commit as `docs: record post-G5 follow-up wave in memory`.

---

## Self-Review

- **Spec coverage:** recommendations 1→Tasks 4+7(checklist), 2→Tasks 1/2/7(timer), 3→Task 7(recipe — the script itself is a one-line pg_dump, operator-side), 4→Tasks 3/7, 5→explicitly out of scope + recorded, 6→Tasks 1/2/3, 7→Task 5. No gaps.
- **Placeholder scan:** none — every code step carries complete code; every run step carries the command and expected output.
- **Type consistency:** `ExpiredSessionFilter`/`HealthBody` defined once in rules, consumed in scripts/route; `runSeed` signature matches existing `seed-runner.ts`; test counts (449 → 454 → 457) consistent.
