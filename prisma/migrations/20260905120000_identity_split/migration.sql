-- Identity split (D6, 2026-09-05): patients move from the shared `users`
-- table into a dedicated `patient_accounts` store. Staff identity stays on
-- `users` with a STAFF/ADMIN-only enum. Session rows are NOT portable —
-- patient sessions are dropped; patients re-login (roadmap risk register).
-- `UserRole` drops the PATIENT variant so a staff-table row can never be a
-- patient again.

-- 1. Patient identity store
CREATE TABLE "patient_accounts" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_accounts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "patient_accounts_email_key" ON "patient_accounts"("email");

-- 2. Patient session store
CREATE TABLE "patient_sessions" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patient_sessions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "patient_sessions_tokenHash_key" ON "patient_sessions"("tokenHash");

CREATE INDEX "patient_sessions_accountId_idx" ON "patient_sessions"("accountId");

-- 3. Migrate patient users (ids, emails, hashes preserved → consent_records
--    keep resolving, they are plain string columns with no FK)
INSERT INTO "patient_accounts" ("id", "email", "passwordHash", "createdAt", "updatedAt")
SELECT "id", "email", "passwordHash", "createdAt", "updatedAt"
FROM "users"
WHERE "role" = 'PATIENT';

-- 4. Patient sessions are not portable
DELETE FROM "sessions"
WHERE "userId" IN (SELECT "id" FROM "users" WHERE "role" = 'PATIENT');

-- 5. Repoint patient_profiles: add column, backfill, then constrain
ALTER TABLE "patient_profiles" ADD COLUMN "accountId" TEXT;

UPDATE "patient_profiles" SET "accountId" = "userId";

ALTER TABLE "patient_profiles" ALTER COLUMN "accountId" SET NOT NULL;
CREATE UNIQUE INDEX "patient_profiles_accountId_key" ON "patient_profiles"("accountId");

-- 6. Drop the old user relation
ALTER TABLE "patient_profiles" DROP CONSTRAINT "patient_profiles_userId_fkey";
ALTER TABLE "patient_profiles" DROP COLUMN "userId";

ALTER TABLE "patient_profiles" ADD CONSTRAINT "patient_profiles_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "patient_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 7. Drop migrated patient rows, then rebuild the enum without PATIENT
--    (PostgreSQL has no ALTER TYPE ... DROP VALUE — create/swap/rename dance)
DELETE FROM "users" WHERE "role" = 'PATIENT';

CREATE TYPE "UserRole_new" AS ENUM ('STAFF', 'ADMIN');

ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "UserRole_new" USING "role"::text::"UserRole_new";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'STAFF';

DROP TYPE "UserRole";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
