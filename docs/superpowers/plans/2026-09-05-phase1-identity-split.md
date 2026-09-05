# Phase 1: Identity & Session Split — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the single `User` identity table into two isolated identity stores (public `PatientAccount` vs. admin-controlled staff identity) with separate session cookies and split API namespaces — while the existing UI keeps working through thin facade routes.

**Architecture:** New CA-style auth module (`lib/usecases/auth/` ports + rules, `lib/adapters/prisma/` adapters) replaces the flagged `lib/auth/session.ts` edge. Patient identity moves to new `patient_accounts` + `patient_sessions` tables; staff identity stays on the renamed-in-code `users` table. Old `/api/auth/*` routes become facades that internally call the new split flows so `PatientAuthContext` continues to work until Phase 2/4 replace it.

**Tech Stack:** Next.js 15 App Router, Prisma + PostgreSQL 16, Zod, argon2id (existing `lib/auth/password`), Vitest.

**Design decisions implemented here:** D4 (session-token scoping), D6 (two identity stores, two cookie names).

**Prerequisite reading:** `docs/superpowers/plans/2026-09-05-desegregation-roadmap.md` (decisions D1–D11, constraints).

---

## File Structure

```
prisma/schema.prisma                          — add PatientAccount, PatientSession; repoint PatientProfile
prisma/migrations/<ts>_identity_split/        — generated migration (hand-reviewed SQL)
lib/usecases/auth/ports.ts                    — ISP interfaces for identity + session stores
lib/usecases/auth/rules.ts                    — pure rules: cookie names, session TTL, token hashing
lib/usecases/auth/patient-auth.ts             — patient register/login/logout/current use cases
lib/usecases/auth/staff-auth.ts               — staff login/logout/current use cases (no register)
lib/adapters/prisma/patient-auth-adapter.ts   — PatientAccount/PatientSession store implementations
lib/adapters/prisma/staff-auth-adapter.ts     — staff store implementations (users table)
lib/adapters/prisma/auth-adapter.test-helpers — (in tests/) stub stores
lib/api/patient-route.ts                      — getPatientAccount() guard (mirrors admin-route.ts pattern)
lib/validation/auth.ts                        — add patient/staff login split schemas
app/api/patient/auth/register/route.ts        — patient registration (consent logged)
app/api/patient/auth/login/route.ts           — patient login (patient cookie)
app/api/patient/auth/logout/route.ts          — patient logout
app/api/patient/auth/me/route.ts              — patient session → PatientProfile
app/api/staff/auth/login/route.ts             — staff login (staff cookie) — no register route
app/api/staff/auth/logout/route.ts            — staff logout
app/api/staff/auth/me/route.ts                — staff session → identity + role
app/api/auth/login/route.ts                   — FACADE: patient login shim (temporary)
app/api/auth/logout/route.ts                  — FACADE: clears patient cookie
app/api/auth/me/route.ts                      — FACADE: patient session shim
app/api/auth/register/route.ts                — DELETED (moved to /api/patient/auth/register)
tests/auth-rules.test.ts                      — pure rule tests
tests/auth-usecases.test.ts                   — use-case tests with stub stores
tests/patient-route.test.ts                   — guard tests
scripts/seed-patient-flow.ts or seed-ops.ts   — update staff seed to new tables
```

Physical table mapping (decided D6): staff keeps the existing `users` + `sessions` tables (minimal churn, admin-only writes); patients get new `patient_accounts` + `patient_sessions` tables. The `UserRole.PATIENT` variant becomes unused and is removed from the enum in the same migration — staff table can never contain a patient row after this migration.

**Out of scope (later phases):** `/[locale]/ops` route, `StaffAuthContext`, portal page, middleware redirect, localStorage removal, facade deletion.

---

### Task 1: Schema — add patient identity tables, migrate rows

**Files:**
- Modify: `prisma/schema.prisma:14-48` (enum, User, Session), `prisma/schema.prisma:60-63` (PatientProfile relation)

- [ ] **Step 1: Edit schema — add models, repoint relations**

In `prisma/schema.prisma`, make these changes:

1. Change `UserRole` enum to staff-only values:

```prisma
enum UserRole {
  STAFF
  ADMIN
}
```

2. Update the `User` model doc comment (keep fields as-is — this is the staff identity store):

```prisma
/// STAFF IDENTITY STORE (D6). Admin-controlled; rows are created only by an
/// ADMIN via the staff-members flow — never by public registration.
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String?
  googleId     String?  @unique
  role         UserRole @default(STAFF)
  /// Granular module permissions for STAFF users. Shape: { [moduleId]: 'read' | 'write' }
  /// ADMIN role bypasses this — always has full access.
  permissions  Json?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  sessions Session[]

  @@map("users")
}
```

(Delete the `patientProfile PatientProfile?` line — the relation moves.)

3. Add patient identity models after the `Session` model:

```prisma
/// PATIENT IDENTITY STORE (D6). Public, self-serve registration. Physically
/// separate from staff identity so a registration bug can never mint a
/// staff credential; cookies and sessions are disjoint (konooz_patient_session).
model PatientAccount {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  profile  PatientProfile?
  sessions PatientSession[]

  @@map("patient_accounts")
}

model PatientSession {
  id            String         @id @default(cuid())
  tokenHash     String         @unique
  accountId     String
  account       PatientAccount @relation(fields: [accountId], references: [id], onDelete: Cascade)
  expiresAt     DateTime
  createdAt     DateTime       @default(now())

  @@index([accountId])
  @@map("patient_sessions")
}
```

4. Repoint `PatientProfile` (lines 62-63):

```prisma
model PatientProfile {
  id        String          @id @default(cuid())
  accountId String          @unique
  account   PatientAccount  @relation(fields: [accountId], references: [id], onDelete: Cascade)
  // …rest of the model unchanged…
```

- [ ] **Step 2: Generate the migration**

```bash
npx prisma migrate dev --name identity_split --create-only
```

- [ ] **Step 3: Hand-review the generated SQL before applying**

Open the generated `migration.sql` and verify it contains (in order): the enum change, `CREATE TABLE "patient_accounts"` / `patient_sessions`, a `patient_accounts` INSERT-per-patient data move with the pattern below, `ALTER TABLE "patient_profiles"` add `accountId` + backfill + drop `userId`, and `DELETE FROM users WHERE role = 'PATIENT'` **after** profiles are repointed. Expected data-move pattern (generated by Prisma for the FK change; if it only generates a schema diff, hand-edit the migration to add):

```sql
-- Backfill: create a patient_accounts row per PATIENT user and repoint profiles
INSERT INTO "patient_accounts" ("id", "email", "passwordHash", "createdAt", "updatedAt")
SELECT "id", "email", "passwordHash", "createdAt", "updatedAt"
FROM "users" WHERE "role" = 'PATIENT';

DELETE FROM "sessions" WHERE "userId" IN (SELECT "id" FROM "users" WHERE "role" = 'PATIENT');

UPDATE "patient_profiles" SET "accountId" = "userId";

DELETE FROM "users" WHERE "role" = 'PATIENT';
```

Also verify: session rows for patient users are deleted (sessions are not portable — patients re-login; this is the Phase-5 "re-login notice" risk item).

- [ ] **Step 4: Apply and verify**

```bash
npx prisma migrate dev
npx prisma generate
npx prisma studio   # manual check: patient_accounts rows == former PATIENT users; users table has none
```

Expected: migration applies clean against a copy of the current DB (run against a `pg_dump` copy first if in doubt).

- [ ] **Step 5: Fix compile fallout (typecheck, no logic yet)**

```bash
npx tsc --noEmit 2>&1 | head -40
```

Expected: errors wherever `user.role === 'PATIENT'` or `patientProfile` relation is referenced (`app/api/auth/*`, `app/api/auth/me/route.ts`, `lib/auth/guards.ts`, `context/PatientAuthContext.tsx` type usage). **Do not fix the routes yet** — Tasks 2–4 replace them. Record the failing file list to confirm Task 5's facade scope.

- [ ] **Step 6: Commit**

```bash
git add prisma/schema.prisma prisma/migrations
git commit -m "feat: split patient identity into patient_accounts store (D6)"
```

---

### Task 2: Pure rules + ports (TDD)

**Files:**
- Create: `lib/usecases/auth/rules.ts`
- Create: `lib/usecases/auth/ports.ts`
- Test: `tests/auth-rules.test.ts`

- [ ] **Step 1: Write the failing tests**

`tests/auth-rules.test.ts`:

```typescript
import { describe, expect, it } from 'vitest'
import {
  PATIENT_COOKIE,
  STAFF_COOKIE,
  SESSION_TTL_MS,
  hashToken,
} from '@/lib/usecases/auth/rules'
import { tokenLooksValid } from '@/lib/usecases/auth/rules'

describe('auth rules', () => {
  it('uses disjoint cookie names (D6)', () => {
    expect(PATIENT_COOKIE).toBe('konooz_patient_session')
    expect(STAFF_COOKIE).toBe('konooz_staff_session')
    expect(PATIENT_COOKIE).not.toBe(STAFF_COOKIE)
  })

  it('session TTL is 30 days in ms', () => {
    expect(SESSION_TTL_MS).toBe(60 * 60 * 24 * 30 * 1000)
  })

  it('hashToken is sha256 hex of the input', () => {
    // sha256('abc') = ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad
    expect(hashToken('abc')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    )
  })

  it('tokenLooksValid rejects obvious garbage before a DB hit', () => {
    expect(tokenLooksValid('')).toBe(false)
    expect(tokenLooksValid('not-base64url!!')).toBe(false)
    expect(tokenLooksValid('dGVzdC10b2tlbg')).toBe(true)
  })
})
```

- [ ] **Step 2: Run to verify failure**

```bash
npm test -- tests/auth-rules.test.ts
```

Expected: FAIL — module `@/lib/usecases/auth/rules` not found.

- [ ] **Step 3: Implement rules and ports**

`lib/usecases/auth/rules.ts` (framework-free — no `next/*`, no `prisma`):

```typescript
const SESSION_TTL_DAYS = 30

export const PATIENT_COOKIE = 'konooz_patient_session'
export const STAFF_COOKIE = 'konooz_staff_session'
export const SESSION_TTL_MS = SESSION_TTL_DAYS * 24 * 60 * 60 * 1000

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

const BASE64URL_RE = /^[A-Za-z0-9_-]{20,}$/
export function tokenLooksValid(token: string): boolean {
  return BASE64URL_RE.test(token)
}

function createHash(algo: string) {
  return nodeCreateHash(algo)
}

import { createHash as nodeCreateHash } from 'crypto'
```

(Note: keep the import at the top of the file in the real implementation — the sketch above is shown split only to keep the pure functions visible. Final file: single `import { createHash } from 'crypto'` at top, and `hashToken` calls it directly.)

`lib/usecases/auth/ports.ts` (ISP — one interface per use case):

```typescript
export interface PatientIdentityStore {
  findByEmail(email: string): Promise<{ id: string; email: string; passwordHash: string } | null>
  createWithProfile(input: {
    email: string
    passwordHash: string
    fullNameAr: string
    phone: string
    gender: 'MALE' | 'FEMALE'
    cityAr: string
  }): Promise<{ id: string; email: string }>
}

export interface PatientSessionStore {
  create(accountId: string, tokenHash: string, expiresAt: Date): Promise<void>
  findValidAccount(tokenHash: string, now: Date): Promise<
    | { sessionId: string; accountId: string; email: string; expiresAt: Date }
    | null
  >
  deleteByTokenHash(tokenHash: string): Promise<void>
}

export interface StaffIdentityStore {
  findByEmail(email: string): Promise<
    | { id: string; email: string; passwordHash: string | null; role: 'STAFF' | 'ADMIN' }
    | null
  >
}

export interface StaffSessionStore {
  create(userId: string, tokenHash: string, expiresAt: Date): Promise<void>
  findValidUser(tokenHash: string, now: Date): Promise<
    | { sessionId: string; userId: string; email: string; role: 'STAFF' | 'ADMIN'; expiresAt: Date }
    | null
  >
  deleteByTokenHash(tokenHash: string): Promise<void>
}
```

- [ ] **Step 4: Run tests to green**

```bash
npm test -- tests/auth-rules.test.ts
```

Expected: 4 passing.

- [ ] **Step 5: Commit**

```bash
git add lib/usecases/auth tests/auth-rules.test.ts
git commit -m "feat: auth rules + store ports for identity split"
```

---

### Task 3: Patient auth use cases (TDD, stub stores)

**Files:**
- Create: `lib/usecases/auth/patient-auth.ts`
- Test: `tests/auth-usecases.test.ts`

- [ ] **Step 1: Write the failing tests**

Append to `tests/auth-usecases.test.ts` (new file):

```typescript
import { describe, expect, it, vi } from 'vitest'
import { registerPatient, loginPatient, logoutPatient, currentPatient } from '@/lib/usecases/auth/patient-auth'
import type { PatientIdentityStore, PatientSessionStore } from '@/lib/usecases/auth/ports'

function stubStores() {
  const identity: PatientIdentityStore = {
    findByEmail: vi.fn().mockResolvedValue(null),
    createWithProfile: vi.fn().mockResolvedValue({ id: 'acc-1', email: 'a@b.c' }),
  }
  const sessions: PatientSessionStore = {
    create: vi.fn().mockResolvedValue(undefined),
    findValidAccount: vi.fn().mockResolvedValue(null),
    deleteByTokenHash: vi.fn().mockResolvedValue(undefined),
  }
  return { identity, sessions }
}

describe('registerPatient', () => {
  it('creates the account, starts a session, and logs consent (BCK-026)', async () => {
    const { identity, sessions } = stubStores()
    const auditLog = vi.fn()
    const result = await registerPatient(
      identity,
      sessions,
      auditLog,
      { email: 'A@B.C', password: 'longenough8', fullNameAr: 'سالم', phone: '0912345678', gender: 'male' as const },
      { hash: async () => 'hashed', newToken: () => 'raw-token' },
    )
    expect(result.ok).toBe(true)
    expect(identity.createWithProfile).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'a@b.c' }),
    )
    expect(sessions.create).toHaveBeenCalledWith('acc-1', expect.any(String), expect.any(Date))
    expect(auditLog).toHaveBeenCalledWith('acc-1', 'privacy_policy')
  })

  it('refuses a taken email without leaking which field failed', async () => {
    const { identity, sessions } = stubStores()
    identity.findByEmail = vi.fn().mockResolvedValue({ id: 'x', email: 'a@b.c', passwordHash: 'h' })
    const result = await registerPatient(
      identity, sessions, vi.fn(),
      { email: 'a@b.c', password: 'longenough8', fullNameAr: 'سالم', phone: '0912345678', gender: 'male' as const },
      { hash: async () => 'h', newToken: () => 't' },
    )
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.code).toBe('EMAIL_TAKEN')
    expect(identity.createWithProfile).not.toHaveBeenCalled()
  })
})

describe('loginPatient', () => {
  it('starts a session on valid credentials', async () => {
    const { identity, sessions } = stubStores()
    identity.findByEmail = vi.fn().mockResolvedValue({ id: 'acc-1', email: 'a@b.c', passwordHash: 'hashed' })
    const result = await loginPatient(
      identity, sessions,
      { email: 'a@b.c', password: 'pw' },
      { hash: async () => 'hashed', verify: async () => true, newToken: () => 't' },
    )
    expect(result.ok).toBe(true)
    expect(sessions.create).toHaveBeenCalledWith('acc-1', expect.any(String), expect.any(Date))
  })

  it('returns the same INVALID_CREDENTIALS code for unknown email and wrong password', async () => {
    const { identity, sessions } = stubStores()
    const noUser = await loginPatient(identity, sessions, { email: 'x@y.z', password: 'pw' }, { hash: async () => 'h', verify: async () => true, newToken: () => 't' })
    identity.findByEmail = vi.fn().mockResolvedValue({ id: '1', email: 'e', passwordHash: 'h' })
    const badPw = await loginPatient(identity, sessions, { email: 'a@b.c', password: 'pw' }, { hash: async () => 'h', verify: async () => false, newToken: () => 't' })
    expect(noUser.ok).toBe(false)
    expect(badPw.ok).toBe(false)
    if (!noUser.ok && !badPw.ok) expect(noUser.code).toBe(badPw.code)
  })
})

describe('logoutPatient', () => {
  it('deletes the session row for the given token', async () => {
    const { sessions } = stubStores()
    await logoutPatient(sessions, 'raw-token', { hashToken: (t) => `h(${t})` })
    expect(sessions.deleteByTokenHash).toHaveBeenCalledWith('h(raw-token)')
  })
})

describe('currentPatient', () => {
  it('returns null for an expired session (does not slide)', async () => {
    const { sessions } = stubStores()
    sessions.findValidAccount = vi.fn().mockResolvedValue(null)
    const account = await currentPatient(sessions, 't', { hashToken: () => 'h', now: () => new Date() })
    expect(account).toBeNull()
  })
})
```

- [ ] **Step 2: Run to verify failure**

```bash
npm test -- tests/auth-usecases.test.ts
```

Expected: FAIL — `patient-auth` module not found.

- [ ] **Step 3: Implement `lib/usecases/auth/patient-auth.ts`**

```typescript
import { hashToken, SESSION_TTL_MS } from './rules'
import type { PatientIdentityStore, PatientSessionStore } from './ports'

export type CryptoPort = {
  hash(plain: string): Promise<string>
  verify(plain: string, hash: string): Promise<boolean>
  newToken(): string
}

export type ConsentAuditPort = (accountId: string, consentType: string) => Promise<void>

export type PatientAuthResult =
  | { ok: true; accountId: string; email: string; sessionToken: string }
  | { ok: false; code: 'EMAIL_TAKEN' | 'INVALID_CREDENTIALS' }

export interface RegisterPatientInput {
  email: string
  password: string
  fullNameAr: string
  phone: string
  gender: 'male' | 'female'
}

export async function registerPatient(
  identity: PatientIdentityStore,
  sessions: PatientSessionStore,
  auditConsent: ConsentAuditPort,
  input: RegisterPatientInput,
  crypto: CryptoPort,
): Promise<PatientAuthResult> {
  const email = input.email.trim().toLowerCase()
  const existing = await identity.findByEmail(email)
  if (existing) return { ok: false, code: 'EMAIL_TAKEN' }

  const passwordHash = await crypto.hash(input.password)
  const account = await identity.createWithProfile({
    email,
    passwordHash,
    fullNameAr: input.fullNameAr,
    phone: input.phone,
    gender: input.gender === 'female' ? 'FEMALE' : 'MALE',
    cityAr: 'بنغازي',
  })

  const token = crypto.newToken()
  await sessions.create(account.id, hashToken(token), new Date(Date.now() + SESSION_TTL_MS))
  await auditConsent(account.id, 'privacy_policy')
  return { ok: true, accountId: account.id, email: account.email, sessionToken: token }
}

export async function loginPatient(
  identity: PatientIdentityStore,
  sessions: PatientSessionStore,
  input: { email: string; password: string },
  crypto: CryptoPort & { verify(plain: string, hash: string): Promise<boolean> },
): Promise<PatientAuthResult> {
  const account = await identity.findByEmail(input.email.trim().toLowerCase())
  if (!account) return { ok: false, code: 'INVALID_CREDENTIALS' }
  const valid = await crypto.verify(input.password, account.passwordHash)
  if (!valid) return { ok: false, code: 'INVALID_CREDENTIALS' }

  const token = crypto.newToken()
  await sessions.create(account.id, hashToken(token), new Date(Date.now() + SESSION_TTL_MS))
  return { ok: true, accountId: account.id, email: account.email, sessionToken: token }
}

export async function logoutPatient(
  sessions: PatientSessionStore,
  rawToken: string,
  clock: { hashToken(token: string): string },
): Promise<void> {
  await sessions.deleteByTokenHash(clock.hashToken(rawToken))
}

export async function currentPatient(
  sessions: PatientSessionStore,
  rawToken: string,
  clock: { hashToken(token: string): string; now(): Date },
): Promise<{ accountId: string; email: string } | null> {
  const row = await sessions.findValidAccount(clock.hashToken(rawToken), clock.now())
  return row ? { accountId: row.accountId, email: row.email } : null
}
```

- [ ] **Step 4: Run tests to green**

```bash
npm test -- tests/auth-usecases.test.ts
```

Expected: all passing.

- [ ] **Step 5: Commit**

```bash
git add lib/usecases/auth/patient-auth.ts tests/auth-usecases.test.ts
git commit -m "feat: patient auth use cases with injected stores"
```

---

### Task 4: Staff auth use cases (TDD)

**Files:**
- Create: `lib/usecases/auth/staff-auth.ts`
- Test: `tests/auth-usecases.test.ts` (append)

- [ ] **Step 1: Write the failing tests**

Append to `tests/auth-usecases.test.ts`:

```typescript
import { loginStaff, currentStaff } from '@/lib/usecases/auth/staff-auth'
import type { StaffIdentityStore, StaffSessionStore } from '@/lib/usecases/auth/ports'

function stubStaffStores() {
  const identity: StaffIdentityStore = {
    findByEmail: vi.fn().mockResolvedValue(null),
  }
  const sessions: StaffSessionStore = {
    create: vi.fn().mockResolvedValue(undefined),
    findValidUser: vi.fn().mockResolvedValue(null),
    deleteByTokenHash: vi.fn().mockResolvedValue(undefined),
  }
  return { identity, sessions }
}

describe('loginStaff', () => {
  it('refuses accounts without a password hash (Google-only staff)', async () => {
    const { identity, sessions } = stubStaffStores()
    identity.findByEmail = vi.fn().mockResolvedValue({ id: 's1', email: 's@k.t', passwordHash: null, role: 'ADMIN' })
    const result = await loginStaff(identity, sessions, { email: 's@k.t', password: 'pw' }, { verify: async () => true, newToken: () => 't' })
    expect(result).toEqual({ ok: false, code: 'INVALID_CREDENTIALS' })
    expect(sessions.create).not.toHaveBeenCalled()
  })

  it('creates a staff session on valid credentials', async () => {
    const { identity, sessions } = stubStaffStores()
    identity.findByEmail = vi.fn().mockResolvedValue({ id: 's1', email: 's@k.t', passwordHash: 'hashed', role: 'ADMIN' })
    const result = await loginStaff(identity, sessions, { email: 's@k.t', password: 'pw' }, { verify: async () => true, newToken: () => 't' })
    expect(result.ok).toBe(true)
    expect(sessions.create).toHaveBeenCalledWith('s1', expect.any(String), expect.any(Date))
  })
})

describe('currentStaff', () => {
  it('returns role with the session identity', async () => {
    const { sessions } = stubStaffStores()
    sessions.findValidUser = vi.fn().mockResolvedValue({ sessionId: 'x', userId: 's1', email: 's@k.t', role: 'ADMIN', expiresAt: new Date() })
    const staff = await currentStaff(sessions, 't', { hashToken: () => 'h', now: () => new Date() })
    expect(staff).toEqual({ userId: 's1', email: 's@k.t', role: 'ADMIN' })
  })
})
```

- [ ] **Step 2: Run to verify failure**

```bash
npm test -- tests/auth-usecases.test.ts
```

Expected: new cases FAIL (module missing).

- [ ] **Step 3: Implement `lib/usecases/auth/staff-auth.ts`**

```typescript
import { hashToken, SESSION_TTL_MS } from './rules'
import type { StaffIdentityStore, StaffSessionStore } from './ports'

export type StaffVerifyPort = {
  verify(plain: string, hash: string): Promise<boolean>
  newToken(): string
}

export type StaffAuthResult =
  | { ok: true; userId: string; email: string; role: 'STAFF' | 'ADMIN'; sessionToken: string }
  | { ok: false; code: 'INVALID_CREDENTIALS' }

export async function loginStaff(
  identity: StaffIdentityStore,
  sessions: StaffSessionStore,
  input: { email: string; password: string },
  crypto: StaffVerifyPort,
): Promise<StaffAuthResult> {
  const user = await identity.findByEmail(input.email.trim().toLowerCase())
  if (!user || !user.passwordHash) return { ok: false, code: 'INVALID_CREDENTIALS' }
  const valid = await crypto.verify(input.password, user.passwordHash)
  if (!valid) return { ok: false, code: 'INVALID_CREDENTIALS' }

  const token = crypto.newToken()
  await sessions.create(user.id, hashToken(token), new Date(Date.now() + SESSION_TTL_MS))
  return { ok: true, userId: user.id, email: user.email, role: user.role, sessionToken: token }
}

export async function currentStaff(
  sessions: StaffSessionStore,
  rawToken: string,
  clock: { hashToken(token: string): string; now(): Date },
): Promise<{ userId: string; email: string; role: 'STAFF' | 'ADMIN' } | null> {
  const row = await sessions.findValidUser(clock.hashToken(rawToken), clock.now())
  return row ? { userId: row.userId, email: row.email, role: row.role } : null
}

export async function logoutStaff(
  sessions: StaffSessionStore,
  rawToken: string,
  clock: { hashToken(token: string): string },
): Promise<void> {
  await sessions.deleteByTokenHash(clock.hashToken(rawToken))
}
```

- [ ] **Step 4: Run tests to green, commit**

```bash
npm test -- tests/auth-usecases.test.ts
git add lib/usecases/auth/staff-auth.ts tests/auth-usecases.test.ts
git commit -m "feat: staff auth use cases — no registration path"
```

---

### Task 5: Prisma adapters

**Files:**
- Create: `lib/adapters/prisma/patient-auth-adapter.ts`
- Create: `lib/adapters/prisma/staff-auth-adapter.ts`

- [ ] **Step 1: Implement the patient adapter**

```typescript
import { prisma } from '@/lib/prisma'
import type { PatientIdentityStore, PatientSessionStore } from '@/lib/usecases/auth/ports'

export const prismaPatientIdentity: PatientIdentityStore = {
  async findByEmail(email) {
    const row = await prisma.patientAccount.findUnique({ where: { email } })
    return row ? { id: row.id, email: row.email, passwordHash: row.passwordHash } : null
  },
  async createWithProfile(input) {
    const row = await prisma.patientAccount.create({
      data: {
        email: input.email,
        passwordHash: input.passwordHash,
        profile: {
          create: {
            fullNameAr: input.fullNameAr,
            fullNameEn: input.fullNameAr,
            phone: input.phone,
            gender: input.gender,
            cityAr: input.cityAr,
            cityEn: 'Benghazi',
            communicationPreferences: JSON.stringify({
              emailNotifications: true,
              whatsappAlerts: true,
              appointmentReminders: true,
              eyeDropScheduleAlerts: true,
              postOpCareGuides: true,
              newsletterSubscribed: false,
              newsletterTopics: [],
            }),
          },
        },
      },
      select: { id: true, email: true },
    })
    return row
  },
}

export const prismaPatientSessions: PatientSessionStore = {
  async create(accountId, tokenHash, expiresAt) {
    await prisma.patientSession.create({ data: { accountId, tokenHash, expiresAt } })
  },
  async findValidAccount(tokenHash, now) {
    const row = await prisma.patientSession.findUnique({
      where: { tokenHash },
      include: { account: { select: { id: true, email: true } } },
    })
    if (!row) return null
    if (row.expiresAt < now) {
      await prisma.patientSession.delete({ where: { id: row.id } })
      return null
    }
    // Sliding expiry (parity with the old session.ts behavior)
    await prisma.patientSession.update({
      where: { id: row.id },
      data: { expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) },
    })
    return { sessionId: row.id, accountId: row.account.id, email: row.account.email, expiresAt: row.expiresAt }
  },
  async deleteByTokenHash(tokenHash) {
    await prisma.patientSession.deleteMany({ where: { tokenHash } })
  },
}
```

- [ ] **Step 2: Implement the staff adapter**

```typescript
import { prisma } from '@/lib/prisma'
import type { StaffIdentityStore, StaffSessionStore } from '@/lib/usecases/auth/ports'

export const prismaStaffIdentity: StaffIdentityStore = {
  async findByEmail(email) {
    const row = await prisma.user.findUnique({ where: { email } })
    if (!row || row.role === 'PATIENT') return null
    return { id: row.id, email: row.email, passwordHash: row.passwordHash, role: row.role }
  },
}

export const prismaStaffSessions: StaffSessionStore = {
  async create(userId, tokenHash, expiresAt) {
    await prisma.session.create({ data: { userId, tokenHash, expiresAt } })
  },
  async findValidUser(tokenHash, now) {
    const row = await prisma.session.findUnique({
      where: { tokenHash },
      include: { user: { select: { id: true, email: true, role: true } } },
    })
    if (!row) return null
    if (row.expiresAt < now) {
      await prisma.session.delete({ where: { id: row.id } })
      return null
    }
    await prisma.session.update({
      where: { id: row.id },
      data: { expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) },
    })
    return { sessionId: row.id, userId: row.user.id, email: row.user.email, role: row.user.role, expiresAt: row.expiresAt }
  },
  async deleteByTokenHash(tokenHash) {
    await prisma.session.deleteMany({ where: { tokenHash } })
  },
}
```

Note: `row.role === 'PATIENT'` in `prismaStaffIdentity` is a **defensive type-level check** — after Task 1 the enum no longer contains `PATIENT`, so remove that line and let TypeScript prove the store can only see STAFF/ADMIN. Keep the adapter signature accepting the narrowed union.

- [ ] **Step 3: Typecheck**

```bash
npx tsc --noEmit 2>&1 | head -40
```

Expected: errors now confined to `app/api/auth/*`, `lib/auth/session.ts`, `lib/auth/guards.ts` (route rewrite pending in Task 6) and pre-existing `context/PatientAuthContext.tsx` usage.

- [ ] **Step 4: Commit**

```bash
git add lib/adapters/prisma/patient-auth-adapter.ts lib/adapters/prisma/staff-auth-adapter.ts
git commit -m "feat: prisma adapters for split identity stores"
```

---

### Task 6: New API routes + facade (TDD for the guard)

**Files:**
- Create: `lib/api/patient-route.ts`
- Create: `app/api/patient/auth/register/route.ts`
- Create: `app/api/patient/auth/login/route.ts`
- Create: `app/api/patient/auth/logout/route.ts`
- Create: `app/api/patient/auth/me/route.ts`
- Create: `app/api/staff/auth/login/route.ts`
- Create: `app/api/staff/auth/logout/route.ts`
- Create: `app/api/staff/auth/me/route.ts`
- Modify: `app/api/auth/login/route.ts` → facade
- Modify: `app/api/auth/logout/route.ts` → facade
- Modify: `app/api/auth/me/route.ts` → facade
- Delete: `app/api/auth/register/route.ts` (register moves; the portal AuthTab POSTs `/api/auth/register` until Phase 4 — see facade note below)
- Modify: `lib/auth/guards.ts` (staff guard now reads the staff cookie)

- [ ] **Step 1: Write the failing guard test**

`tests/patient-route.test.ts`:

```typescript
import { describe, expect, it } from 'vitest'
import { getPatientAccountFromToken } from '@/lib/api/patient-route'

describe('getPatientAccountFromToken', () => {
  it('returns null for garbage tokens without touching the store', async () => {
    const storeCalls = vi.fn()
    const sessions: { findValidAccount: (h: string, n: Date) => Promise<null> } = {
      findValidAccount: async () => { storeCalls(); return null },
    }
    const account = await getPatientAccountFromToken('nope!!', sessions)
    expect(account).toBeNull()
    expect(storeCalls).not.toHaveBeenCalled()
  })
})
```

Run: `npm test -- tests/patient-route.test.ts` → expected FAIL (module missing). Add `import { vi } from 'vitest'` to the top.

- [ ] **Step 2: Implement the guard + routes**

`lib/api/patient-route.ts`:

```typescript
import { tokenLooksValid, PATIENT_COOKIE } from '@/lib/usecases/auth/rules'
import { currentPatient } from '@/lib/usecases/auth/patient-auth'
import { prismaPatientSessions } from '@/lib/adapters/prisma/patient-auth-adapter'
import type { PatientSessionStore } from '@/lib/usecases/auth/ports'
import { cookies } from 'next/headers'

/** Patient APIs call this before any data leaves the server. */
export async function getPatientAccountFromToken(
  rawToken: string,
  sessions: PatientSessionStore = prismaPatientSessions,
): Promise<{ accountId: string; email: string } | null> {
  if (!tokenLooksValid(rawToken)) return null
  return currentPatient(sessions, rawToken, {
    hashToken: (t) => hashToken(t),
    now: () => new Date(),
  })
}

export async function getPatientAccount() {
  const cookieStore = await cookies()
  const token = cookieStore.get(PATIENT_COOKIE)?.value
  if (!token) return null
  return getPatientAccountFromToken(token)
}
```

(`hashToken` imported from `@/lib/usecases/auth/rules`.)

Routes follow the exact style of the existing ones — rate limit → validate → use case → respond, with `AUTH_MESSAGES` for AR/EN copy:

`app/api/patient/auth/register/route.ts` — same shape as the old register route, but calling `registerPatient(prismaPatientIdentity, prismaPatientSessions, auditConsent, …)` where `auditConsent = (accountId, type) => prisma.consentRecord.create({ data: { userId: accountId, consentType: type, consented: true } })` and cookie name `PATIENT_COOKIE`. Note: verify `consentRecord.userId` FK target after the migration — it must point at the **patient** table; if Prisma named the relation `userId` against `users`, update the FK in the migration to reference `patient_accounts.id` instead.

`app/api/patient/auth/login/route.ts` — calls `loginPatient`, sets `PATIENT_COOKIE` (httpOnly, secure in prod, sameSite lax, path `/`, maxAge `SESSION_TTL_MS / 1000`).

`app/api/patient/auth/logout/route.ts` — reads cookie, `logoutPatient`, deletes both cookie.

`app/api/patient/auth/me/route.ts` — `getPatientAccount()` → 401 if null; else `prisma.patientProfile.findUnique({ where: { accountId }, select: { …same fields as before… } })` → `apiSuccess`.

`app/api/staff/auth/login/route.ts` — calls `loginStaff`, sets `STAFF_COOKIE`. Same rate limiter as old login.

`app/api/staff/auth/logout/route.ts`, `app/api/staff/auth/me/route.ts` — mirror the patient ones against `STAFF_COOKIE` / `prismaStaffSessions`.

- [ ] **Step 3: Convert old `/api/auth/*` to facades**

`app/api/auth/login/route.ts` body becomes a two-line shim: import the new patient login handler logic by extracting it into `handlePatientLogin(request)` in `lib/api/patient-auth-handlers.ts` and re-exporting it; old route file: `export const POST = handlePatientLogin`. Same for `me` and `logout`. `app/api/auth/register/route.ts`: keep as facade to the new patient register (it serves `PatientAuthContext.registerWithServer` until Phase 4).

This keeps `PatientAuthContext` (old cookie name) broken ONLY at the cookie level — facades now set `konooz_patient_session`, but the old context reads the session via `/api/auth/me` which reads the new cookie, so existing UI keeps functioning. The old indicator cookie `konooz_auth` logic in `context/PatientAuthContext.tsx:183` still reads `konooz_auth` — set that same indicator cookie from the patient routes (it is not identity data, just a presence flag).

- [ ] **Step 4: `lib/auth/guards.ts` — staff guard reads staff cookie**

```typescript
import { getStaffFromToken } from '@/lib/api/staff-route-helpers'
// getStaffUser(): reads STAFF_COOKIE, resolves session, requires role ADMIN
```

Extract the staff handler logic into `lib/api/staff-route-helpers.ts` (`getStaffFromToken`, `getStaffUser`) so `lib/api/admin-route.ts:17` (`requireModuleAccess`) keeps its call site unchanged.

- [ ] **Step 5: Run the full test suite**

```bash
npm test
```

Expected: all green, including the new guard/use-case tests.

- [ ] **Step 6: Live check (both locales)**

```bash
npm run dev
```

Chrome-devtools: register a patient at the homepage portal modal → verify cookie `konooz_patient_session` exists, `konooz_auth=1` present, portal tabs still render from the facades. Log in as `staff@konooz.test` → verify dashboard still loads (staff gate). Check console + network for 4xx/5xx. Stress: CPU 4× + Slow 4G on `/ar`.

- [ ] **Step 7: Verification gate + commit**

```bash
npx eslint . && npx tsc --noEmit
npm run intel -- dead-code --changed-since main --format json
```

Expected: 0 errors/0 warnings; fallow flags only `lib/auth/session.ts` (now unimported after guards moved) — delete it with `--trace` verification, its behavior now lives in `lib/usecases/auth/rules.ts` + adapters.

```bash
git add -A && git commit -m "feat: split auth API namespaces (/api/patient/*, /api/staff/*) with legacy facades"
```

---

### Task 7: Seed scripts + docs

**Files:**
- Modify: `scripts/seed-ops.ts`, `scripts/seed-patient-flow.ts` (wherever `prisma.user.create` with role PATIENT appears)
- Modify: `docs/superpowers/plans/2026-09-05-desegregation-roadmap.md` (mark Phase 1 done)

- [ ] **Step 1: Update seeds** — any `role: 'PATIENT'` user creation becomes a `patientAccount.create`; staff seed unchanged. Run each seed script once and confirm exit 0.
- [ ] **Step 2: Fallow full pass** — `npx fallow --format json`; fix orphans created by the split (old imports of `@/lib/auth/session`).
- [ ] **Step 3: Final gate** — `npx eslint .` (0/0), `npx tsc --noEmit` (0), `npm test` (all green).
- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "chore: align seeds with identity split; phase 1 complete"
```

---

## Self-review notes

- Spec coverage: D4 (scoping rules live in use-case layer; guards read only their own cookie), D6 (two stores, two cookies, PATIENT removed from staff enum), BCK-026 consent logging preserved in the patient register use case. D2's "no staff registration" is structural: no register route exists under `/api/staff/auth/`.
- Known temporary debt (accepted, tracked): `context/PatientAuthContext.tsx` still holds `serverUser` for both roles until Phase 2 splits the contexts; `/api/auth/*` facades are deleted in Phase 5.
- Type consistency: store interfaces in Task 2 are the single source; adapters (Task 5) and route guards (Task 6) reference them by import only.
