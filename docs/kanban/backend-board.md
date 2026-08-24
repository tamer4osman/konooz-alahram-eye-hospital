# Backend Kanban Board — Patient Accounts + Full HMS

> **Scope:** Replace device-local patient profiles with real server-backed accounts (email+password + Google sign-in), then persist all hospital operational data currently hardcoded in `dashboardData.ts` and `hospitalData.ts`.
> **Total cards:** 56 · **Epics:** 10 · **Phases:** 0–8 + Security

---

## Executor Constitution

These rules apply to **every card automatically** — individual cards do not repeat them.

### Language & Content

- Every user-facing string must have Arabic + English variants. Bilingual strings live **only** in `data/` files. Never hardcode copy in components or route handlers.
- Arabic is the default language. Use logical Tailwind properties: `ms-*`, `me-*`, `ps-*`, `pe-*`, `text-start`, `text-end`. Never use `ml`, `mr`, `pl`, `pr`, `left`, `right`.
- All data is bilingual with AR required / EN optional unless otherwise specified.

### TypeScript & Code Quality

- TypeScript strict mode. No `any` escapes in domain types.
- No code comments. The code must explain itself.
- No `console.log` statements in any file that ships.
- No new dependencies without explicit card instruction. Check `package.json` before assuming.
- Use existing utilities from `lib/` before creating new ones.

### Architecture

- All modals use the shared `components/ui/Modal.tsx` primitive (focus trap, Escape, scroll lock, `aria-modal`). Register new modals with conditional render + `next/dynamic`.
- Every API route returns `{ code: string, messageAr: string, messageEn: string }` on error. Success returns `{ data: T }`.
- Patient data consent: registration requires explicit consent checkbox. Privacy policy page must exist before accounts go live.
- Phone numbers are **non-unique** — families may share a number. Staff disambiguate by patient name.

### Database

- Baseline is **3NF**. Every non-3NF construct carries an inline justification comment + promotion trigger.
- Every many-to-many resolves through a named associative/junction table. Relationships carrying data get attribute columns.
- All timestamps use `timestamptz`. Display in Africa/Tripoli locale.
- Every domain entity includes `createdAt DateTime @default(now())` and `updatedAt DateTime @updatedAt`.
- Audit trail: clinical/prescription records include `createdBy` field.

### Testing & Verification

- After every change: `npx eslint .` (0 errors, 0 warnings) + `npx tsc --noEmit` (0 errors).
- API cards: include curl verification commands with expected output.
- Frontend cards: manual QA in both RTL and LTR directions. Keyboard + screen-reader path tested.

---

## Architecture Snapshot

```
┌─ VPS (Docker Compose) ─────────────────────────┐
│  caddy ──▶ web (Next.js 15 standalone)         │
│               │  API Routes + Prisma ORM        │
│               ▼                                │
│            db (Postgres 16 alpine)              │
│                                                  │
│  nightly pg_dump → /backups → rclone offsite    │
└────────────────────────────────────────────────┘

GitHub Actions ──▶ GHCR ──▶ SSH compose pull/up
```

**Stack:** Next.js 15 (App Router) · React 19 · TypeScript strict · Tailwind v4 · Prisma ORM · PostgreSQL 16 · Caddy (auto-TLS) · Docker Compose · GitHub Actions CI/CD

---

## Definition of Done

A card is **Done** only when ALL of:

- [ ] `npx eslint .` — 0 errors, 0 warnings
- [ ] `npx tsc --noEmit` — 0 errors
- [ ] Acceptance criteria below: verified (curl output, screenshot, or manual check)
- [ ] All new AR/EN strings exist in `data/` files only
- [ ] No `console.log`, no code comments, no hardcoded user-facing strings
- [ ] Logical Tailwind properties used (no `ml/mr/pl/pr/left/right`)
- [ ] Modal.tsx reused for any new dialogs (no duplicate modal implementations)

---

## Phase Mapping

| Phase | Cards | Gate |
|---|---|---|
| 0 Foundations | BCK-001 – BCK-005 | Docker build + compose up locally |
| 1 DB + Auth | BCK-010 – BCK-015 | curl auth endpoints |
| 2 Frontend Patients | BCK-020 – BCK-028 | RTL/LTR QA + a11y |
| 3 Go-live v1 | BCK-030 – BCK-034 | HTTPS live + backup restored |
| 4 Core Resources | BCK-040 – BCK-046 | CRUD verified for Doctor/Room/Surgery |
| 5 Ops Domains | BCK-050 – BCK-055 | Equipment/Beds/Flow/Consumables seeded |
| 6 People & Clinical | BCK-060 – BCK-063 | Attendance + clinical records CRUD |
| 7 Money & Imaging | BCK-070 – BCK-074 | ⚠️ blocked-on:hospital-input |
| 8 Dashboard Live | BCK-080 – BCK-084, BCK-095 | All tabs read live DB |
| 9 Security | BCK-090 – BCK-092 | Email verify + uptime + security review |

---

## Board Columns

```
📥 Backlog        🔧 Ready         🚧 In Progress    👀 Review      ✅ Done
(Epics 1–9)       (Epic 0)         max 2             verify AC      commit-scoped
```

---

# 🧱 Epic 0 — Foundations

---

### BCK-001 · Environment & Secrets Scaffolding
`epic:foundations` `phase:0` `type:infra` `complexity:S` `est:1h`
Depends: — (first card)

#### Context
No backend infrastructure exists yet. This card creates the foundation every other card builds on.

#### Create/modify these exact files

1. **`.env.example`** — append these lines:
   ```
   DATABASE_URL="postgresql://konooz:konooz_password@localhost:5432/konooz"
   AUTH_SECRET="<generate-with: openssl rand -hex 32>"
   GOOGLE_CLIENT_ID=""
   GOOGLE_CLIENT_SECRET=""
   NEXT_PUBLIC_SITE_URL="http://localhost:3000"
   ```
2. **`package.json`** — add to dependencies:
   - `"@prisma/client": "^6.x"` (latest stable at time of writing)
   - `"zod": "^3.23.x"`
   - `"argon2": "^0.41.x"` (or `"@node-rs/argon2": "^1.x"` — pick one, not both)
   - `"google-auth-library": "^9.x"`
   - `"resend": "^4.x"` (free tier SMTP alternative)
3. **`package.json`** — add to devDependencies:
   - `"prisma": "^6.x"` (CLI)
4. **`lib/`** directory — create empty placeholder: `mkdir -p lib/auth lib/api lib/validation`
5. **`app/api/`** directory — create: `mkdir -p app/api/auth/register app/api/auth/login app/api/auth/logout app/api/auth/me app/api/auth/google app/api/auth/google/callback`

#### Do NOT
- Install any package not listed here
- Modify any existing component or page
- Run `prisma init` yet (BCK-010 does that)
- Touch `next.config.ts`

#### Verify
```bash
npm ls prisma zod google-auth-library 2>/dev/null | grep -E "prisma|zod|google" | wc -l
# expect: 3 (each listed once)
npx tsc --noEmit  # expect: no output
```

---

### BCK-002 · Multi-Stage Dockerfile
`epic:foundations` `phase:0` `type:infra` `complexity:M` `est:2h`
Depends: BCK-001

#### Context
`next.config.ts` uses `output: 'standalone'`. The Dockerfile must use multi-stage build for smallest possible production image.

#### Create these exact files

1. **`Dockerfile`** — multi-stage:
   - Stage 1 (`deps`): `node:20-alpine` — copy package*.json, `npm ci`
   - Stage 2 (`builder`): `node:20-alpine` — copy deps, copy source, `npx prisma generate`, `npm run build`
   - Stage 3 (`runner`): `node:20-alpine` — copy standalone output + public + static, create non-root user `nodeuser`, expose 3000, CMD `node server.js`
   - Non-root: `USER nodeuser`
   - `HEALTHCHECK CMD wget -qO- http://localhost:3000/api/health || exit 1` (BCK-011 adds the `/api/health` endpoint)
   - Accept `ARG NODE_ENV=production` as env var
2. **`.dockerignore`**:
   ```
   node_modules
   .next
   .git
   *.md
   !README.md
   docs/
   .env*
   ```

#### Do NOT
- Use `FROM node:latest` — pin `node:20-alpine`
- Run as root in final stage
- Skip `prisma generate` in builder stage

#### Verify
```bash
docker build -t konooz-web:test .
# expect: builds without errors, image exists
docker images konooz-web:test --format "{{.Size}}"
# expect: < 250 MB
```

---

### BCK-003 · Docker Compose + Dev Profile
`epic:foundations` `phase:0` `type:infra` `complexity:M` `est:2h`
Depends: BCK-002

#### Context
Three services: `web`, `db`, `caddy`. Dev profile runs only `db` for fast local development.

#### Create these exact files

1. **`compose.yml`**:
   ```yaml
   services:
     web:
       build: .
       ports:
         - "3000:3000"
       env_file: .env
       depends_on:
         db:
           condition: service_healthy
       restart: unless-stopped
     db:
       image: postgres:16-alpine
       environment:
         POSTGRES_USER: konooz
         POSTGRES_PASSWORD: konooz_password
         POSTGRES_DB: konooz
       volumes:
         - pgdata:/var/lib/postgresql/data
       ports:
         - "5432:5432"
       healthcheck:
         test: ["CMD-SHELL", "pg_isready -U konooz"]
         interval: 5s
         timeout: 3s
         retries: 5
       restart: unless-stopped
     caddy:
       image: caddy:2-alpine
       ports:
         - "80:80"
         - "443:443"
       volumes:
         - ./Caddyfile:/etc/caddy/Caddyfile:ro
         - caddy_data:/data
       depends_on:
         - web
       restart: unless-stopped
   volumes:
     pgdata:
     caddy_data:
   ```
2. **`compose.dev.yml`** (override for `docker compose -f compose.yml -f compose.dev.yml up`):
   ```yaml
   services:
     web:
       build: null
       image: null
       build:
         context: .
         dockerfile: Dockerfile
         target: deps
       command: "sleep infinity"
       volumes:
         - .:/app
         - /app/node_modules
       ports:
         - "3000:3000"
     caddy:
       profiles: ["full"]
   ```
   Daily dev: `docker compose -f compose.yml -f compose.dev.yml up db -d`
   Full integration: `docker compose up`
3. **`Caddyfile`**:
   ```
   :80 {
     reverse_proxy web:3000
   }
   ```
   (Production version with TLS added later in BCK-030.)

#### Do NOT
- Use `image: postgres:latest` — pin `postgres:16-alpine`
- Expose port 5432 in production compose (only dev)
- Add volumes for source code in production compose

#### Verify
```bash
docker compose -f compose.yml -f compose.dev.yml up db -d
docker compose ps
# expect: db running, healthy
docker compose down
```

---

### BCK-004 · Caddyfile Production Config
`epic:foundations` `phase:0` `type:infra` `complexity:S` `est:0.5h`
Depends: BCK-003

#### Context
Dev Caddyfile exists from BCK-003. This adds production domain + TLS template.

#### Create/modify these exact files

1. **`Caddyfile`** — overwrite with:
   ```
   konozealahram-eye.ly {
     reverse_proxy web:3000
   }

   www.konozealahram-eye.ly {
     redir https://konozealahram-eye.ly{uri} permanent
   }
   ```
   Caddy auto-fetches Let's Encrypt certs on first production `docker compose up`.

#### Do NOT
- Add certbot scripts — Caddy handles TLS automatically
- Hardcode IP addresses

#### Verify
```bash
grep -c "redir" Caddyfile
# expect: 1
```

---

### BCK-005 · Operator Prerequisites Checklist
`epic:foundations` `phase:0` `type:operator` `complexity:S` `est:1h`
Depends: — (can run in parallel with 001-004)

#### Context
Operator (Tamer) must complete these tasks in hPanel / Google Cloud Console before Phase 1 begins.

#### Checklist

- [ ] **Verify VPS:** hPanel → confirm KVM class, ≥4 GB RAM, Ubuntu 22.04+
- [ ] **Install Docker:** `curl -fsSL https://get.docker.com | sh && sudo usermod -aG docker $USER`
- [ ] **DNS:** A-records for `konozealahram-eye.ly` and `www` → VPS public IP
- [ ] **Firewall:** `sudo ufw allow 22/tcp && sudo ufw allow 80/tcp && sudo ufw allow 443/tcp && sudo ufw enable`
- [ ] **Google Cloud Console:** Create OAuth 2.0 credentials (Web application type)
  - Authorized redirect URIs:
    - `http://localhost:3000/api/auth/google/callback` (dev)
    - `https://konozealahram-eye.ly/api/auth/google/callback` (prod)
- [ ] **Resend or Brevo free account:** Obtain SMTP API key for password-reset emails

#### Do NOT
- Skip VPS RAM check — 2 GB is not enough for Postgres + Node

#### Verify
```bash
ssh <deploy-user>@<vps-ip> "docker --version && free -h | grep Mem"
# expect: Docker version output, ≥3.6G Mem
```

---

# 🔐 Epic 1 — Database & Auth API

---

### BCK-010 · Prisma Schema + First Migration
`epic:db-auth` `phase:1` `type:backend` `complexity:M` `est:3h`
Depends: BCK-001

#### Context
All entities from `dashboardData.ts` and `hospitalData.ts` must be modeled. Normalization baseline: 3NF with three documented exceptions. Run `npx prisma init` first.

#### Create these exact files

1. **`prisma/schema.prisma`** — full schema:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ──────────────────────────────────────────────
// AUTHENTICATION & SESSIONS
// ──────────────────────────────────────────────

enum UserRole {
  PATIENT
  STAFF
}

model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String?  // null for Google-only accounts
  googleId     String?  @unique
  role         UserRole @default(PATIENT)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  patientProfile PatientProfile?
  sessions       Session[]

  @@map("users")
}

model Session {
  id        String   @id @default(cuid())
  tokenHash String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  createdAt DateTime @default(now())

  @@index([userId])
  @@map("sessions")
}

// ──────────────────────────────────────────────
// PATIENT DATA
// ──────────────────────────────────────────────

enum Gender {
  MALE
  FEMALE
  OTHER
}

model PatientProfile {
  id        String @id @default(cuid())
  userId    String @unique
  user      User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Personal — AR required, EN optional
  fullNameAr     String
  fullNameEn     String?
  phone          String   // NON-UNIQUE: families share phones
  whatsappNumber String?
  dateOfBirth    String?
  gender         Gender   @default(MALE)
  bloodGroup     String?
  cityAr         String?
  cityEn         String?

  // Clinical
  allergiesAr          String[]   // Exception 3: arrays for tag-like lists; promotes to PatientAllergy table if structured metadata needed
  allergiesEn          String[]
  chronicConditionsAr  String[]
  chronicConditionsEn  String[]

  // Refractive data — Exception 2: JSON value object read/written as unit
  refractiveData Json?

  // Emergency contact
  emergencyContact Json?  // { name, relationAr, relationEn, phone }

  // Communication preferences — Exception 2: JSON value object
  communicationPreferences Json?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  appointments  Appointment[]
  prescriptions Prescription[]

  @@index([phone])
  @@map("patient_profiles")
}

// ──────────────────────────────────────────────
// APPOINTMENTS & PRESCRIPTIONS
// ──────────────────────────────────────────────

enum AppointmentStatus {
  scheduled
  confirmed
  in_queue
  completed
  cancelled
}

enum AppointmentSource {
  PATIENT_REQUEST
  STAFF_ENTRY
}

model Appointment {
  id           String            @id @default(cuid())
  patientId    String
  patient      PatientProfile    @relation(fields: [patientId], references: [id], onDelete: Cascade)
  doctorId     String?
  doctor       Doctor?           @relation(fields: [doctorId], references: [id])
  roomId       String?
  room         Room?             @relation(fields: [roomId], references: [id])
  ticketNumber String            @unique
  // Snapshot at booking time (Exception 1: snapshot semantics)
  doctorDisplayNameAr String?
  doctorDisplayNameEn String?
  specialtyAr  String?
  specialtyEn  String?
  date         DateTime
  time         String
  status       AppointmentStatus @default(scheduled)
  source       AppointmentSource @default(PATIENT_REQUEST)
  locationAr   String?
  locationEn   String?
  instructionsAr String?
  instructionsEn String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([patientId])
  @@index([doctorId])
  @@index([date])
  @@map("appointments")
}

model Prescription {
  id        String         @id @default(cuid())
  patientId String
  patient   PatientProfile @relation(fields: [patientId], references: [id], onDelete: Cascade)
  doctorId  String?
  doctor    Doctor?        @relation(fields: [doctorId], references: [id])
  medicationNameAr String?
  medicationNameEn String?
  dosageAr  String?
  dosageEn  String?
  instructionsAr String?
  instructionsEn String?
  issuedDate DateTime
  expiryDate DateTime?
  notesAr   String?
  notesEn   String?
  createdBy String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([patientId])
  @@map("prescriptions")
}

// ──────────────────────────────────────────────
// HOSPITAL RESOURCES — Epic 4
// ──────────────────────────────────────────────

enum StaffCategory {
  surgeon
  consultant
  resident
  nurse
  technician
  admin
}

model Doctor {
  id           String        @id @default(cuid())
  fullNameAr   String
  fullNameEn   String?
  specialtyAr  String
  specialtyEn  String?
  category     StaffCategory @default(consultant)
  phone        String?
  email        String?
  isAvailable  Boolean       @default(true)
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  appointments Appointment[]
  surgeries    ScheduledSurgery[] @relation("SurgeonSurgeries")
  prescriptions Prescription[]

  @@map("doctors")
}

enum RoomType {
  operating_theater
  outpatient_clinic
  diagnostic_suite
  recovery_ward
  laser_room
}

enum RoomStatus {
  occupied_surgery
  in_consultation
  ready_clean
  sterilizing
  maintenance
}

model Room {
  id          String     @id @default(cuid())
  nameAr      String
  nameEn      String?
  type        RoomType
  status      RoomStatus @default(ready_clean)
  floor       String?
  capacity    Int        @default(1)
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  appointments Appointment[]
  surgeries    ScheduledSurgery[]

  @@map("rooms")
}

// ──────────────────────────────────────────────
// SURGERIES — Epic 4
// ──────────────────────────────────────────────

enum SurgeryStatus {
  scheduled
  in_progress
  completed
  cancelled
}

model ScheduledSurgery {
  id          String         @id @default(cuid())
  patientId   String?
  patient     PatientProfile? @relation(fields: [patientId], references: [id])
  surgeonId   String
  surgeon     Doctor         @relation("SurgeonSurgeries", fields: [surgeonId], references: [id])
  roomId      String?
  room        Room?          @relation(fields: [roomId], references: [id])
  procedureAr String
  procedureEn String?
  scheduledAt DateTime
  durationMin Int            @default(60)
  status      SurgeryStatus  @default(scheduled)
  notesAr     String?
  notesEn     String?
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  consumables SurgeryConsumableUsage[]

  @@index([surgeonId])
  @@index([scheduledAt])
  @@map("scheduled_surgeries")
}

// ──────────────────────────────────────────────
// OPS DOMAINS — Epic 5
// ──────────────────────────────────────────────

enum DeviceStatus {
  operational
  in_use
  under_calibration
  maintenance_scheduled
  offline_alert
}

model Equipment {
  id            String       @id @default(cuid())
  nameAr        String
  nameEn        String?
  modelNumber   String?
  status        DeviceStatus @default(operational)
  locationAr    String?
  locationEn    String?
  calibrationDue DateTime?
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  @@map("equipment")
}

enum WardType {
  pacu_recovery
  daycare_suite
  vip_inpatient
}

enum BedStatus {
  occupied
  ready_clean
  dirty_cleaning
  reserved
}

model Bed {
  id        String     @id @default(cuid())
  wardType  WardType
  label     String
  status    BedStatus  @default(ready_clean)
  patientId String?
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  @@map("beds")
}

enum PatientFlowStageType {
  reception
  triage
  consultation
  procedure
  waiting_discharge
  discharged
}

model PatientFlowStage {
  id          String              @id @default(cuid())
  patientId   String
  stageType   PatientFlowStageType
  enteredAt   DateTime            @default(now())
  exitedAt    DateTime?
  notesAr     String?
  notesEn     String?
  createdAt   DateTime            @default(now())
  updatedAt   DateTime            @updatedAt

  @@index([patientId])
  @@map("patient_flow_stages")
}

enum ConsumableCategory {
  iol_lens
  viscoelastic
  laser_pack
  surgical_gas
  microsuture
  phaco_pack
}

model ConsumableType {
  id         String            @id @default(cuid())
  nameAr     String
  nameEn     String?
  category   ConsumableCategory
  unitAr     String
  unitEn     String?
  stockLevel Int               @default(0)
  lowStockThreshold Int        @default(10)
  createdAt  DateTime          @default(now())
  updatedAt  DateTime          @updatedAt

  usages SurgeryConsumableUsage[]

  @@map("consumable_types")
}

model SurgeryConsumableUsage {
  id              String         @id @default(cuid())
  surgeryId       String
  surgery         ScheduledSurgery @relation(fields: [surgeryId], references: [id], onDelete: Cascade)
  consumableTypeId String
  consumableType  ConsumableType  @relation(fields: [consumableTypeId], references: [id])
  quantityUsed    Int            @default(1)
  createdAt       DateTime       @default(now())

  @@unique([surgeryId, consumableTypeId])
  @@map("surgery_consumable_usage")
}

// ──────────────────────────────────────────────
// PEOPLE & CLINICAL — Epic 6
// ──────────────────────────────────────────────

enum ShiftType {
  morning
  evening
  night_call
  full_day
}

enum AttendanceStatus {
  present
  absent
  on_leave
  late
}

model StaffAttendanceRecord {
  id         String           @id @default(cuid())
  staffName  String
  staffId    String?
  shiftType  ShiftType
  date       DateTime
  status     AttendanceStatus @default(present)
  checkInTime String?
  checkOutTime String?
  notesAr    String?
  notesEn    String?
  createdAt  DateTime         @default(now())
  updatedAt  DateTime         @updatedAt

  @@index([date])
  @@map("staff_attendance_records")
}

model ClinicalConsultationRecord {
  id          String   @id @default(cuid())
  patientId   String
  patientNameAr String
  patientNameEn String?
  doctorNameAr String
  doctorNameEn String?
  date        DateTime
  chiefComplaintAr String?
  chiefComplaintEn String?
  diagnosisAr String?
  diagnosisEn String?
  notesAr     String?
  notesEn     String?
  createdBy   String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  items OphthalmicPrescriptionItem[]

  @@index([patientId])
  @@map("clinical_consultation_records")
}

model OphthalmicPrescriptionItem {
  id             String   @id @default(cuid())
  consultationId String
  consultation   ClinicalConsultationRecord @relation(fields: [consultationId], references: [id], onDelete: Cascade)
  odSphere  String?
  odCyl     String?
  odAxis    String?
  osSphere  String?
  osCyl     String?
  osAxis    String?
  addition  String?
  ipd       String?
  notesAr   String?
  notesEn   String?
  createdAt DateTime @default(now())

  @@map("ophthalmic_prescription_items")
}

// ──────────────────────────────────────────────
// MONEY & IMAGING — Epic 7
// ──────────────────────────────────────────────

model InsuranceProvider {
  id        String   @id @default(cuid())
  nameAr    String
  nameEn    String?
  phone     String?
  email     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  policies InsurancePolicy[]

  @@map("insurance_providers")
}

model InsurancePolicy {
  id         String   @id @default(cuid())
  patientId  String
  patient    PatientProfile @relation(fields: [patientId], references: [id], onDelete: Cascade)
  providerId String
  provider   InsuranceProvider @relation(fields: [providerId], references: [id])
  policyNo   String
  expiryDate DateTime?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@unique([patientId, providerId])
  @@map("insurance_policies")
}

enum InvoiceStatus {
  pending
  paid
  partially_paid
  cancelled
}

model HospitalBillingInvoice {
  id         String        @id @default(cuid())
  patientId  String
  patientNameAr String?
  patientNameEn String?
  serviceAr  String
  serviceEn  String?
  amount     Decimal
  currency   String        @default("LYD")
  status     InvoiceStatus @default(pending)
  issuedDate DateTime
  paidDate   DateTime?
  notesAr    String?
  notesEn    String?
  createdBy  String?
  createdAt  DateTime      @default(now())
  updatedAt  DateTime      @updatedAt

  @@index([patientId])
  @@map("hospital_billing_invoices")
}

enum PacsOrderStatus {
  ordered
  in_progress
  completed
  cancelled
}

model DiagnosticPacsOrder {
  id          String          @id @default(cuid())
  patientId   String
  patientNameAr String
  patientNameEn String?
  examTypeAr  String
  examTypeEn  String?
  bodyPartAr  String?
  bodyPartEn  String?
  status      PacsOrderStatus @default(ordered)
  orderedByAr String
  orderedByEn String?
  orderedAt   DateTime        @default(now())
  completedAt DateTime?
  notesAr     String?
  notesEn     String?
  createdBy   String?
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt

  @@index([patientId])
  @@map("diagnostic_pacs_orders")
}

// ──────────────────────────────────────────────
// NEWSLETTER — BCK-025
// ──────────────────────────────────────────────

model NewsletterSubscriber {
  id        String   @id @default(cuid())
  email     String
  whatsapp  String?
  nameAr    String?
  nameEn    String?
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("newsletter_subscribers")
}

// ──────────────────────────────────────────────
// CONSENT — BCK-026
// ──────────────────────────────────────────────

model ConsentRecord {
  id        String   @id @default(cuid())
  userId    String
  consentType String  // "data_collection", "privacy_policy"
  consented Boolean @default(false)
  ipAddress String?
  createdAt DateTime @default(now())

  @@index([userId])
  @@map("consent_records")
}
```

#### Do NOT
- Use enums that aren't in the card above
- Add models not listed here (the schema covers Epics 1–9)
- Skip `@@map` directives (snake_case table names)
- Use `@default(uuid())` — use `@default(cuid())` for IDs

#### Verify
```bash
npx prisma generate    # expect: Prisma Client generated
npx prisma migrate dev --name init  # expect: migration applied
npx tsc --noEmit       # expect: no output
```

---

### BCK-011 · API Response Helpers + Zod Validators
`epic:db-auth` `phase:1` `type:backend` `complexity:S` `est:1.5h`
Depends: BCK-010

#### Context
Every API route needs consistent response shapes and Zod validation. Create shared utilities once.

#### Create these exact files

1. **`lib/prisma.ts`**:
   ```ts
   import { PrismaClient } from '@prisma/client'
   const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
   export const prisma = globalForPrisma.prisma || new PrismaClient()
   if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
   ```

2. **`lib/api/response.ts`**:
   ```ts
   import { NextResponse } from 'next/server'

   export function apiSuccess<T>(data: T, status = 200) {
     return NextResponse.json({ data }, { status })
   }

   export function apiError(status: number, code: string, messageAr: string, messageEn: string) {
     return NextResponse.json({ error: { code, messageAr, messageEn } }, { status })
   }
   ```

3. **`lib/validation/auth.ts`**:
   ```ts
   import { z } from 'zod'

   export const registerSchema = z.object({
     fullNameAr: z.string().min(2, 'الاسم مطلوب'),
     email: z.string().email('بريد إلكتروني غير صالح'),
     password: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'),
     phone: z.string().min(8).optional(),
     cityAr: z.string().optional(),
     gender: z.enum(['male', 'female']).optional(),
   })

   export const loginSchema = z.object({
     email: z.string().email(),
     password: z.string().min(1),
   })
   ```

4. **`app/api/health/route.ts`** — simple health check:
   ```ts
   export async function GET() {
     return Response.json({ status: 'ok' })
   }
   ```

#### Do NOT
- Add error handling middleware beyond what's listed
- Install new packages (zod is in BCK-001)
- Create route handlers (BCK-012 does that)

#### Verify
```bash
npx tsc --noEmit       # expect: no output
npx eslint .           # expect: 0 problems
```

---

### BCK-012 · Auth API Core Routes
`epic:db-auth` `phase:1` `type:backend` `complexity:M` `est:4h`
Depends: BCK-011

#### Context
`lib/prisma.ts` exports `prisma`. `lib/api/response.ts` exports `apiSuccess` and `apiError`. `lib/validation/auth.ts` has `registerSchema` and `loginSchema`.

#### Create these exact files

1. **`lib/auth/password.ts`**:
   ```ts
   import { hash, verify } from '@node-rs/argon2'

   export async function hashPassword(plain: string): Promise<string> {
     return hash(plain)
   }

   export async function verifyPassword(plain: string, storedHash: string): Promise<boolean> {
     return verify(storedHash, plain)
   }
   ```

2. **`lib/auth/session.ts`**:
   ```ts
   import { randomBytes, createHash } from 'crypto'
   import { cookies } from 'next/headers'
   import { prisma } from '@/lib/prisma'

   const COOKIE_NAME = 'konooz_session'
   const MAX_AGE = 60 * 60 * 24 * 30 // 30 days

   function sha256(input: string): string {
     return createHash('sha256').update(input).digest('hex')
   }

   export async function createSession(userId: string): Promise<string> {
     const token = randomBytes(32).toString('base64url')
     const tokenHash = sha256(token)
     const expiresAt = new Date(Date.now() + MAX_AGE * 1000)

     await prisma.session.create({ data: { tokenHash, userId, expiresAt } })

     const cookieStore = await cookies()
     cookieStore.set(COOKIE_NAME, token, {
       httpOnly: true,
       secure: process.env.NODE_ENV === 'production',
       sameSite: 'lax',
       path: '/',
       maxAge: MAX_AGE,
     })

     return token
   }

   export async function getSessionUser() {
     const cookieStore = await cookies()
     const token = cookieStore.get(COOKIE_NAME)?.value
     if (!token) return null

     const tokenHash = sha256(token)
     const session = await prisma.session.findUnique({
       where: { tokenHash },
       include: { user: true },
     })

     if (!session || session.expiresAt < new Date()) {
       if (session) await prisma.session.delete({ where: { id: session.id } })
       return null
     }

     // Sliding expiry
     await prisma.session.update({
       where: { id: session.id },
       data: { expiresAt: new Date(Date.now() + MAX_AGE * 1000) },
     })

     return session.user
   }

   export async function destroySession() {
     const cookieStore = await cookies()
     const token = cookieStore.get(COOKIE_NAME)?.value
     if (token) {
       await prisma.session.deleteMany({ where: { tokenHash: sha256(token) } })
     }
     cookieStore.delete(COOKIE_NAME)
   }
   ```

3. **`app/api/auth/register/route.ts`**:
   ```ts
   import { NextRequest } from 'next/server'
   import { prisma } from '@/lib/prisma'
   import { registerSchema } from '@/lib/validation/auth'
   import { hashPassword } from '@/lib/auth/password'
   import { createSession } from '@/lib/auth/session'
   import { apiSuccess, apiError } from '@/lib/api/response'

   export async function POST(req: NextRequest) {
     const body = await req.json()
     const parsed = registerSchema.safeParse(body)
     if (!parsed.success) {
       return apiError(400, 'VALIDATION_ERROR', parsed.error.issues[0].message, parsed.error.issues[0].message)
     }

     const { fullNameAr, email, password } = parsed.data

     const existing = await prisma.user.findUnique({ where: { email } })
     if (existing) {
       return apiError(409, 'EMAIL_TAKEN', 'هذا البريد مسجل مسبقاً', 'This email is already registered')
     }

     const passwordHash = await hashPassword(password)
     const user = await prisma.user.create({
       data: {
         email,
         passwordHash,
         patientProfile: {
           create: {
             fullNameAr,
             fullNameEn: fullNameAr,
             phone: parsed.data.phone || '',
             gender: parsed.data.gender === 'female' ? 'FEMALE' : 'MALE',
             cityAr: parsed.data.cityAr || 'بنغازي',
             cityEn: 'Benghazi',
             communicationPreferences: JSON.stringify({
               emailNotifications: true,
               whatsappAlerts: true,
               appointmentReminders: true,
               eyeDropScheduleAlerts: true,
               postOpCareGuides: true,
               queueTurnAlerts: true,
               newsletterSubscribed: false,
               newsletterTopics: [],
             }),
           },
         },
       },
       select: { id: true, email: true },
     })

     await createSession(user.id)
     return apiSuccess({ user }, 201)
   }
   ```

4. **`app/api/auth/login/route.ts`**:
   ```ts
   import { NextRequest } from 'next/server'
   import { prisma } from '@/lib/prisma'
   import { loginSchema } from '@/lib/validation/auth'
   import { verifyPassword } from '@/lib/auth/password'
   import { createSession } from '@/lib/auth/session'
   import { apiSuccess, apiError } from '@/lib/api/response'

   export async function POST(req: NextRequest) {
     const body = await req.json()
     const parsed = loginSchema.safeParse(body)
     if (!parsed.success) {
       return apiError(400, 'VALIDATION_ERROR', 'بيانات غير صالحة', 'Invalid input')
     }

     const { email, password } = parsed.data
     const user = await prisma.user.findUnique({ where: { email } })

     if (!user || !user.passwordHash) {
       return apiError(401, 'INVALID_CREDENTIALS', 'البريد الإلكتروني أو كلمة المرور غير صحيحة', 'Incorrect email or password')
     }

     const valid = await verifyPassword(password, user.passwordHash)
     if (!valid) {
       return apiError(401, 'INVALID_CREDENTIALS', 'البريد الإلكتروني أو كلمة المرور غير صحيحة', 'Incorrect email or password')
     }

     await createSession(user.id)
     return apiSuccess({ user: { id: user.id, email: user.email } })
   }
   ```

5. **`app/api/auth/logout/route.ts`**:
   ```ts
   import { destroySession } from '@/lib/auth/session'
   import { apiSuccess } from '@/lib/api/response'

   export async function POST() {
     await destroySession()
     return apiSuccess({ ok: true })
   }
   ```

6. **`app/api/auth/me/route.ts`**:
   ```ts
   import { getSessionUser } from '@/lib/auth/session'
   import { prisma } from '@/lib/prisma'
   import { apiSuccess, apiError } from '@/lib/api/response'

   export async function GET() {
     const user = await getSessionUser()
     if (!user) return apiError(401, 'NOT_AUTHENTICATED', 'غير مسجل الدخول', 'Not authenticated')

     const profile = await prisma.patientProfile.findUnique({
       where: { userId: user.id },
     })
     return apiSuccess({ user: { id: user.id, email: user.email, role: user.role }, profile })
   }
   ```

#### Do NOT
- Return `passwordHash` or `tokenHash` in any response
- Add rate limiting here (BCK-014 handles that)
- Use `console.log` for debugging

#### Copy-paste strings (for `data/authMessages.ts` — create if needed)
```ts
export const AUTH_MESSAGES = {
  invalidCredentials: { ar: 'البريد الإلكتروني أو كلمة المرور غير صحيحة', en: 'Incorrect email or password' },
  emailTaken: { ar: 'هذا البريد مسجل مسبقاً', en: 'This email is already registered' },
  notAuthenticated: { ar: 'غير مسجل الدخول', en: 'Not authenticated' },
  registerSuccess: { ar: 'تم إنشاء الحساب بنجاح', en: 'Account created successfully' },
  loginSuccess: { ar: 'تم تسجيل الدخول بنجاح', en: 'Logged in successfully' },
  logoutSuccess: { ar: 'تم تسجيل الخروج', en: 'Logged out successfully' },
}
```

#### Verify
```bash
npx tsc --noEmit
npx eslint .
# Register
curl -sf -X POST http://localhost:3000/api/auth/register \
  -H 'content-type: application/json' \
  -d '{"fullNameAr":"مريض تجربة","email":"test@example.com","password":"password123"}' \
  | grep '"id"'
# Login
curl -sf -X POST http://localhost:3000/api/auth/login \
  -H 'content-type: application/json' \
  -d '{"email":"test@example.com","password":"password123"}' \
  | grep '"id"'
# Me (use cookie from login)
# Logout then GET /me must return 401
```

---

### BCK-013 · Google OAuth
`epic:db-auth` `phase:1` `type:backend` `complexity:M` `est:3h`
Depends: BCK-012

#### Context
BCK-012 provides `createSession`, `getSessionUser`, and session helpers. Google Cloud Console credentials are set in `.env` (BCK-005).

#### Create these exact files

1. **`lib/auth/google.ts`**:
   ```ts
   import { OAuth2Client } from 'google-auth-library'

   const client = new OAuth2Client(
     process.env.GOOGLE_CLIENT_ID,
     process.env.GOOGLE_CLIENT_SECRET,
     `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/google/callback`
   )

   export function getGoogleAuthUrl(state: string) {
     return client.generateAuthUrl({
       access_type: 'offline',
       scope: ['openid', 'email', 'profile'],
       state,
     })
   }

   export async function verifyGoogleToken(code: string) {
     const { tokens } = await client.getToken(code)
     const ticket = await client.verifyIdToken({
       idToken: tokens.id_token!,
       audience: process.env.GOOGLE_CLIENT_ID,
     })
     return ticket.getPayload()
   }
   ```

2. **`app/api/auth/google/route.ts`**:
   ```ts
   import { redirect } from 'next/navigation'
   import { getGoogleAuthUrl } from '@/lib/auth/google'
   import { randomBytes } from 'crypto'

   export async function GET() {
     const state = randomBytes(16).toString('hex')
     // Store state in cookie for CSRF verification
     const { cookies } = await import('next/headers')
     const cookieStore = await cookies()
     cookieStore.set('google_oauth_state', state, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 600 })
     redirect(getGoogleAuthUrl(state))
   }
   ```

3. **`app/api/auth/google/callback/route.ts`**:
   ```ts
   import { NextRequest } from 'next/server'
   import { cookies } from 'next/headers'
   import { prisma } from '@/lib/prisma'
   import { verifyGoogleToken } from '@/lib/auth/google'
   import { createSession } from '@/lib/auth/session'
   import { apiError, apiSuccess } from '@/lib/api/response'

   export async function GET(req: NextRequest) {
     const code = req.nextUrl.searchParams.get('code')
     const state = req.nextUrl.searchParams.get('state')
     const cookieStore = await cookies()
     const savedState = cookieStore.get('google_oauth_state')?.value
     cookieStore.delete('google_oauth_state')

     if (!code || !state || state !== savedState) {
       return apiError(400, 'INVALID_STATE', 'طلب غير صالح', 'Invalid request')
     }

     const payload = await verifyGoogleToken(code)
     if (!payload?.email) {
       return apiError(401, 'GOOGLE_AUTH_FAILED', 'فشل التحقق من Google', 'Google verification failed')
     }

     // Upsert by googleId or email
     let user = await prisma.user.findFirst({
       where: { OR: [{ googleId: payload.sub }, { email: payload.email }] },
     })

     if (!user) {
       user = await prisma.user.create({
         data: {
           email: payload.email,
           googleId: payload.sub,
           patientProfile: {
             create: {
               fullNameAr: payload.name || '',
               fullNameEn: payload.name || '',
               phone: '',
               gender: 'MALE',
               communicationPreferences: JSON.stringify({
                 emailNotifications: true, whatsappAlerts: true,
                 appointmentReminders: true, eyeDropScheduleAlerts: true,
                 postOpCareGuides: true, queueTurnAlerts: true,
                 newsletterSubscribed: false, newsletterTopics: [],
               }),
             },
           },
         },
       })
     } else if (!user.googleId) {
       user = await prisma.user.update({ where: { id: user.id }, data: { googleId: payload.sub } })
     }

     await createSession(user.id)

     // Check if phone is missing → profileIncomplete
     const profile = await prisma.patientProfile.findUnique({ where: { userId: user.id } })
     const needsProfileCompletion = !profile?.phone

     const redirectUrl = needsProfileCompletion ? '/?profile=complete' : '/'
     return apiSuccess({ user: { id: user.id, email: user.email }, needsProfileCompletion }, 200)
   }
   ```

#### Do NOT
- Skip CSRF state verification
- Create accounts without `patientProfile`
- Store Google tokens in database

#### Verify
```bash
npx tsc --noEmit
# Manually: visit http://localhost:3000/api/auth/google → redirects to Google consent screen
```

---

### BCK-014 · Rate Limiting + Security Headers
`epic:db-auth` `phase:1` `type:backend` `complexity:S` `est:1.5h`
Depends: BCK-012

#### Context
Login endpoint needs brute-force protection. All mutation endpoints need origin verification.

#### Create these exact files

1. **`lib/api/rateLimit.ts`**:
   ```ts
   const hits = new Map<string, { count: number; resetAt: number }>()

   export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
     const now = Date.now()
     const entry = hits.get(key)
     if (!entry || entry.resetAt < now) {
       hits.set(key, { count: 1, resetAt: now + windowMs })
       return true
     }
     if (entry.count >= limit) return false
     entry.count++
     return true
   }
   ```

2. **`lib/api/security.ts`**:
   ```ts
   import { NextRequest } from 'next/server'

   export function verifyOrigin(req: NextRequest): boolean {
     const origin = req.headers.get('origin')
     const host = req.headers.get('host')
     if (!origin || !host) return false
     try {
       return new URL(origin).host === host
     } catch {
       return false
     }
   }
   ```

3. **Modify `app/api/auth/login/route.ts`** — add rate limit at top of POST:
   ```ts
   import { checkRateLimit } from '@/lib/api/rateLimit'
   // Inside POST, before validation:
   const ip = req.headers.get('x-forwarded-for') || 'unknown'
   if (!checkRateLimit(`login:${ip}`, 5, 60_000)) {
     return apiError(429, 'RATE_LIMITED', 'محاولات كثيرة جداً، حاول لاحقاً', 'Too many attempts, try again later')
   }
   ```

#### Do NOT
- Store rate-limit state in database (in-memory is fine for single-instance)
- Add global middleware (keep it per-route for simplicity)

#### Verify
```bash
npx tsc --noEmit && npx eslint .
# Send 6 rapid login attempts — 6th should return 429
```

---

### BCK-015 · API Smoke-Test Documentation
`epic:db-auth` `phase:1` `type:docs` `complexity:S` `est:1h`
Depends: BCK-013

#### Create `docs/api-notes.md` with curl sequences proving every endpoint works.

#### Verify
- File exists and is readable
- Covers: register, login, logout, me, google initiate

---

# 🖥️ Epic 2 — Frontend Patient Integration

---

### BCK-020 · Typed API Client
`epic:frontend` `phase:2` `type:frontend` `complexity:S` `est:1h`
Depends: BCK-011

#### Create `lib/api-client.ts` — typed fetch wrapper.

- Export `apiGet<T>(path: string): Promise<T>` and `apiPost<T>(path: string, body: unknown): Promise<T>`
- Throws `{ code, messageAr, messageEn }` on non-2xx responses
- Sets `Content-Type: application/json`
- Does NOT send credentials by default — add `{ credentials: 'same-origin' }` so cookies are sent

---

### BCK-021 · PatientAuthContext Server Rewiring
`epic:frontend` `phase:2` `type:frontend` `complexity:L` `est:6h`
Depends: BCK-020

#### Context
Current `PatientAuthContext.tsx` reads/writes `localStorage`. Replace with server calls while preserving the same interface shape exported to consuming components.

#### Key changes
- Remove `useSyncExternalStore` + `subscribePatientStorage` + `getPatientSnapshot` + `getPatientServerSnapshot`
- Replace with: `const [currentPatient, setCurrentPatient] = useState<PatientProfile | null>(null)` + `useEffect(() => { apiGet('/api/auth/me').then(setCurrentPatient).catch(() => {}) }, [])`
- `createLocalProfile` → calls `apiPost('/api/auth/register', ...)` then `setCurrentPatient`
- `logout` → calls `apiPost('/api/auth/logout')` then `setCurrentPatient(null)`
- Keep all modal state management unchanged
- Keep `openWhatsAppAlert` unchanged (no server dependency)

#### Do NOT
- Change the `PatientAuthContextType` interface signature — consuming components must not break
- Remove `newsletterSubscribers` (BCK-025 handles that separately)

---

### BCK-022 · Local Profile Migration Dialog
`epic:frontend` `phase:2` `type:frontend` `complexity:M` `est:3h`
Depends: BCK-021

#### Context
Users who created device-local profiles before accounts exist need to import that data.

#### Create these exact files

1. **`components/MigrateLocalProfileModal.tsx`**:
   - Reads `konooz_patient_profile` from localStorage
   - If present AND user is newly registered (no existing profile data from server): show bilingual modal
   - Two buttons: "نقل البيانات / Import Data" and "تخطي / Skip"
   - On import: `apiPost('/api/profile/import', localData)` then clear localStorage
   - Use existing `Modal.tsx` primitive
   - Register with `next/dynamic`

2. **`app/api/profile/import/route.ts`**:
   - Accepts local profile JSON
   - Validates with Zod
   - Merges into existing `PatientProfile` (overwrite nulls only, never clobber non-empty server values)
   - Returns updated profile

---

### BCK-023 · Honest Bilingual Copy Overhaul
`epic:frontend` `phase:2` `type:content` `complexity:S` `est:2h`
Depends: BCK-021

#### Modify `data/patientPortalData.ts`

Replace all "device-local" references with accurate server-storage descriptions. Examples:

- Old: `messageAr: 'بياناتك محفوظة على هذا الجهاز فقط'`
- New: `messageAr: 'بياناتك محفوظة على خوادمنا المشفرة بشكل آمن'`
- Old: `messageEn: 'Your data is stored on this device only'`
- New: `messageEn: 'Your data is stored securely on our encrypted servers'`

Add privacy notice strings:
```ts
privacyNoticeAr: 'نحن نحترم خصوصيتك. لا نشارك بياناتك مع أي طرف ثالث.'
privacyNoticeEn: 'We respect your privacy. Your data is never shared with third parties.'
```

---

### BCK-024 · RTL/LTR + A11y QA Pass
`epic:frontend` `phase:2` `type:qa` `complexity:S` `est:2h`
Depends: BCK-022, BCK-023

Manual verification:
- [ ] Arabic mode (default): all text renders RTL, logical margins correct
- [ ] English mode (`?lang=en`): all text renders LTR
- [ ] Both directions: tab through entire patient portal — focus visible, order logical
- [ ] Screen reader: announce modal titles, error messages, success confirmations
- [ ] No `ml/mr/pl/pr/left/right` in any modified file (grep check)

---

### BCK-025 · Newsletter Persistence
`epic:frontend` `phase:2` `type:backend+frontend` `complexity:S` `est:2h`
Depends: BCK-010 (NewsletterSubscriber model exists)

#### Create these exact files

1. **`app/api/newsletter/route.ts`** — POST to subscribe, GET to list:
   - POST: validate {email, whatsapp?, name?}, upsert into `newsletter_subscribers`
   - GET: return all active subscribers (staff access check later)

2. **Modify `PatientAuthContext.tsx`** — replace `newsletterSubscribers` useState:
   - On load: `apiGet('/api/newsletter')` → set subscribers
   - `subscribeNewsletter`: call `apiPost('/api/newsletter', ...)` then refresh list

#### Do NOT
- Remove the newsletter UI components in the portal — only change data source

---

### BCK-026 · Consent & Privacy Policy
`epic:frontend` `phase:2` `type:content+frontend` `complexity:S` `est:2h`
Depends: BCK-020

#### Create these exact files

1. **`app/privacy/page.tsx`** — static bilingual page with privacy policy content in `data/`
2. **`data/privacyContent.ts`** — bilingual privacy policy text (data collection, storage, rights)
3. **Modify register flow** — add consent checkbox before submit:
   - Checkbox label: "أوافق على سياسة الخصوصية وتخزين بياناتي / I agree to the privacy policy and data storage"
   - Must be checked to submit
   - On submit: POST to `/api/consent` endpoint to record consent

---

### BCK-027 · Password Reset + Email Infrastructure
`epic:frontend` `phase:2` `type:backend+frontend` `complexity:M` `est:3h`
Depends: BCK-012

#### Create these exact files

1. **`lib/email.ts`** — Resend client (or Brevo):
   ```ts
   import { Resend } from 'resend'
   const resend = new Resend(process.env.RESEND_API_KEY)
   export async function sendEmail(to: string, subject: string, html: string) {
     return resend.emails.send({ from: 'noreply@konozealahram-eye.ly', to, subject, html })
   }
   ```

2. **`app/api/auth/forgot-password/route.ts`** — generates 6-digit code, stores hash in DB, sends email
3. **`app/api/auth/reset-password/route.ts`** — validates code + new password, updates `passwordHash`
4. **Bilingual email templates** in `data/emailTemplates.ts`

---

### BCK-028 · Account Deletion
`epic:frontend` `phase:2` `type:backend+frontend` `complexity:S` `est:1.5h`
Depends: BCK-020

#### Create these exact files

1. **`app/api/account/delete/route.ts`** — DELETE method:
   - Requires authentication (getSessionUser)
   - Cascades: sessions → profile → appointments → prescriptions → account
   - Returns confirmation message

2. **Modify portal** — add "حذف الحساب / Delete Account" button with confirmation modal:
   - "هل أنت متأكد؟ لا يمكن التراجع عن هذا الإجراء. / Are you sure? This action cannot be undone."
   - Only appears on profile tab

---

# 🚀 Epic 3 — Go-live v1

---

### BCK-030 · VPS Provisioning Runbook
`epic:go-live` `phase:3` `type:operator` `complexity:M` `est:2h`
Depends: BCK-003, BCK-004, BCK-005

#### Operator executes on VPS:

```bash
# 1. Install Docker (if not done)
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# 2. Clone repo
git clone <repo-url> /opt/konooz
cd /opt/konooz

# 3. Configure env
cp .env.example .env
# Edit .env with production values

# 4. Start
docker compose up -d

# 5. Verify
curl -sf http://localhost:3000/api/health
# expect: {"status":"ok"}
```

---

### BCK-031 · GitHub Actions CI Pipeline
`epic:go-live` `phase:3` `type:infra` `complexity:S` `est:1h`
Depends: BCK-001

#### Create `.github/workflows/ci.yml`:
- Triggers on push to `main` and on PRs
- Steps: checkout → setup-node → npm ci → npx eslint . → npx tsc --noEmit → npm run build

---

### BCK-032 · GitHub Actions CD Pipeline
`epic:go-live` `phase:3` `type:infra` `complexity:M` `est:2h`
Depends: BCK-030, BCK-031

#### Create `.github/workflows/deploy.yml`:
- Triggers on push to `main` (after CI passes)
- Steps:
  1. Build Docker image
  2. Push to GHCR: `ghcr.io/<owner>/konooz-web:<sha>`
  3. SSH to VPS
  4. `docker compose pull && docker compose up -d`
  5. Health check: `curl -sf http://localhost:3000/api/health`

#### Rollback: redeploy previous image tag via GitHub Actions UI

---

### BCK-033 · Backup Cron + Restore Drill
`epic:go-live` `phase:3` `type:infra` `complexity:S` `est:1h`
Depends: BCK-030

#### On VPS:

```bash
# Create backup script
cat > /opt/konooz/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR=/opt/konooz/backups
DATE=$(date +%F)
docker exec konooz-db-1 pg_dump -U konooz konooz | gzip > $BACKUP_DIR/konooz-$DATE.sql.gz
# Keep only 14 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +14 -delete
# Offsite copy (rclone to any free cloud storage)
rclone copy $BACKUP_DIR/konooz-$DATE.sql.gz <remote>:konooz-backups/
EOF
chmod +x /opt/konooz/backup.sh

# Add cron (nightly at 2 AM)
echo "0 2 * * * /opt/konooz/backup.sh" | crontab -
```

#### Restore drill (run once to verify):
```bash
docker exec -i konooz-db-1 psql -U konooz konooz < backups/konooz-<date>.sql.gz
```

---

### BCK-034 · Documentation Updates
`epic:go-live` `phase:3` `type:docs` `complexity:S` `est:1h`
Depends: BCK-032

#### Modify these files:

- `README.md` — update architecture diagram, env table, add production deploy section
- `CHANGELOG.md` — create with v1.0.0 entry
- `docs/runbook.md` — operational procedures (deploy, rollback, backup, restore)

---

# 🏥 Epic 4 — Core Resources

---

### BCK-040 · Doctor Entity Backfill
`epic:resources` `phase:4` `type:backend` `complexity:S` `est:1h`
Depends: BCK-034

#### Create `scripts/seed-doctors.ts`:
- Import `DOCTORS` from `data/hospitalData.ts`
- For each doctor: `prisma.doctor.create({ data: { fullNameAr, fullNameEn, specialtyAr, specialtyEn, category } })`
- Map existing specialty strings to `StaffCategory` enum
- Run once: `npx tsx scripts/seed-doctors.ts`

---

### BCK-041 · Room Entity + Seed
`epic:resources` `phase:4` `type:backend` `complexity:S` `est:1h`
Depends: BCK-040

#### Create `scripts/seed-rooms.ts`:
- Seed rooms from existing `DUMMY_ROOMS` in `dashboardData.ts`
- Map `RoomType` and `RoomStatus` enums

---

### BCK-042 · ScheduledSurgery Entity
`epic:resources` `phase:4` `type:backend` `complexity:S` `est:1h`
Depends: BCK-041

Schema already defined in BCK-010. Create seed script `scripts/seed-surgeries.ts`.

---

### BCK-043 · Appointments FK Upgrade
`epic:resources` `phase:4` `type:backend` `complexity:S` `est:1h`
Depends: BCK-040

#### Appointments table already has `doctorId` FK from BCK-010. This card:
- Writes backfill script: match `doctorDisplayNameAr` to `Doctor.fullNameAr` → set `doctorId`
- **Deletes** `specialtyAr`/`specialtyEn` columns from Appointments (derivable via Doctor join)
- Updates BCK-012 appointment creation to require `doctorId` instead of string names

---

### BCK-044 · Resource CRUD APIs
`epic:resources` `phase:4` `type:backend` `complexity:M` `est:3h`
Depends: BCK-042, BCK-043

#### Create route handlers:
- `app/api/staff/doctors/route.ts` — GET list, POST create
- `app/api/staff/doctors/[id]/route.ts` — GET one, PATCH update, DELETE
- `app/api/staff/rooms/route.ts` — same pattern
- `app/api/staff/surgeries/route.ts` — same pattern
- All endpoints require `role === 'STAFF'` check (getSessionUser → reject PATIENT)

---

### BCK-045 · Staff Page v2
`epic:resources` `phase:4` `type:frontend` `complexity:L` `est:4h`
Depends: BCK-044

#### Modify `components/dashboard/` components:
- Replace all `DUMMY_*` imports with API calls
- Add doctor/room/surgery management tabs
- Keep bilingual throughout
- Reuse existing Modal.tsx for create/edit forms

---

### BCK-046 · Data-Entry Owner Signoff
`epic:resources` `phase:4` `type:operator` `complexity:S` `est:0.5h`
Depends: BCK-045

#### Operator confirms with hospital staff:
- Who enters doctor data? → __________
- Who assigns rooms to appointments? → __________
- Who schedules surgeries? → __________

Record answers in `docs/data-entry-owners.md`

---

# ⚙️ Epic 5 — Operations Domains

---

### BCK-050 · Equipment Entity + APIs
`epic:ops` `phase:5` `type:backend+frontend` `complexity:M` `est:3h`
Depends: BCK-034

#### Seed from `DUMMY_EQUIPMENT`, create CRUD routes under `app/api/staff/equipment/`, wire dashboard "Equipment" tab.

---

### BCK-051 · Bed/Ward Entities
`epic:ops` `phase:5` `type:backend+frontend` `complexity:M` `est:3h`
Depends: BCK-050

#### Seed from `DUMMY_BEDS`, create CRUD routes under `app/api/staff/beds/`, wire dashboard "Beds" tab.

---

### BCK-052 · Patient Flow Tracking
`epic:ops` `phase:5` `type:backend` `complexity:S` `est:2h`
Depends: BCK-051

#### Create `app/api/staff/patient-flow/route.ts` — POST (record stage entry/exit), GET (current flow).

---

### BCK-053 · Consumables Inventory + M:N Junction
`epic:ops` `phase:5` `type:backend+frontend` `complexity:M` `est:3h`
Depends: BCK-052

#### Seed `ConsumableType` from `DUMMY_CONSUMABLES_STOCK`. Create `SurgeryConsumableUsage` CRUD (BCK-010 schema includes junction). Wire "Consumables" dashboard tab. Low-stock alert threshold: highlight rows where `stockLevel < lowStockThreshold`.

---

### BCK-054 · Consolidated Ops CRUD Guard
`epic:ops` `phase:5` `type:backend` `complexity:S` `est:1h`
Depends: BCK-050–053

#### Audit all Epics 5 routes: verify role guard, Zod validation, bilingual error responses, no hardcoded strings.

---

### BCK-055 · Ops Data-Entry Owner Signoffs
`epic:ops` `phase:5` `type:operator` `complexity:S` `est:0.5h`
Depends: BCK-054

#### Operator confirms:
- Who updates equipment status? → __________
- Who manages bed/ward assignments? → __________
- Who tracks patient flow stages? → __________
- Who maintains consumable stock levels? → __________

---

# 👥 Epic 6 — People & Clinical

---

### BCK-060 · Attendance/Shift Records
`epic:people` `phase:6` `type:backend+frontend` `complexity:M` `est:3h`
Depends: BCK-034

#### Create `app/api/staff/attendance/route.ts` + wire dashboard "Attendance" tab.

---

### BCK-061 · Clinical Consultation Records
`epic:people` `phase:6` `type:backend+frontend` `complexity:M` `est:3h`
Depends: BCK-060

#### Create `app/api/staff/consultations/route.ts` + "Clinical" dashboard tab. Link to PatientProfile and Prescription.

---

### BCK-062 · Clinical CRUD with Audit
`epic:people` `phase:6` `type:backend` `complexity:S` `est:1h`
Depends: BCK-061

#### Verify: all clinical endpoints record `createdBy` from session user. Audit trail complete.

---

### BCK-063 · Clinical Data-Entry Signoff
`epic:people` `phase:6` `type:operator` `complexity:S` `est:0.5h`
Depends: BCK-062

#### Operator confirms: who enters consultation records? → __________

---

# 💰 Epic 7 — Money & Imaging ⚠️

---

### BCK-070 · 🔴 Hospital Decision: Insurance Model
`epic:money` `phase:7` `type:blocked` `complexity:S` `est:0h`
Depends: —
**Status:** `blocked-on:hospital-input`

#### Question for hospital admin:
- How many insurance providers do you work with?
- Do patients have multiple policies simultaneously?
- What fields per policy? (provider, policy number, expiry, coverage %)

Cannot code until answered.

---

### BCK-071 · InsuranceProvider + InsurancePolicy
`epic:money` `phase:7` `type:backend` `complexity:S` `est:2h`
Depends: BCK-070

Schema exists from BCK-010. Seed + CRUD + dashboard tab.

---

### BCK-072 · Billing Invoices
`epic:money` `phase:7` `type:backend+frontend` `complexity:M` `est:3h`
Depends: BCK-071

Wire `HospitalBillingInvoice` CRUD + dashboard "Billing" tab.

---

### BCK-073 · 🔴 Hospital Decision: PACS Workflow
`epic:money` `phase:7` `type:blocked` `complexity:S` `est:0h`
Depends: —
**Status:** `blocked-on:hospital-input`

#### Questions:
- Do you have a PACS system? Which vendor?
- What data does each order need?
- Who enters orders — doctors or technicians?

---

### BCK-074 · DiagnosticPacsOrder Entity
`epic:money` `phase:7` `type:backend+frontend` `complexity:M` `est:3h`
Depends: BCK-073

Wire `DiagnosticPacsOrder` CRUD + dashboard "Diagnostics" tab.

---

# 📊 Epic 8 — Dashboard Live

---

### BCK-080 · Dashboard Data Layer
`epic:dashboard` `phase:8` `type:frontend` `complexity:M` `est:3h`
Depends: BCK-054, BCK-062

#### Create `hooks/useDashboardData.ts`:
- Generic typed hook: `useDashboardData<T>(endpoint: string)`
- Returns `{ data: T | null, loading: boolean, error: string | null }`
- Fetches with credentials
- Replaces all `DUMMY_*` imports across dashboard components

---

### BCK-081 · Tab Rewiring (One PR per Tab)
`epic:dashboard` `phase:8` `type:frontend` `complexity:L` `est:5h`
Depends: BCK-080

#### For each dashboard tab, replace `DUMMY_*` constant with `useDashboardData` hook:
- Staff → `GET /api/staff/doctors`
- Rooms → `GET /api/staff/rooms`
- Equipment → `GET /api/staff/equipment`
- Surgeries → `GET /api/staff/surgeries`
- Billing → `GET /api/staff/billing`

One PR per tab to keep diffs reviewable.

---

### BCK-082 · Analytics Aggregation Endpoints
`epic:dashboard` `phase:8` `type:backend` `complexity:M` `est:2h`
Depends: BCK-080

#### Create `app/api/staff/analytics/route.ts`:
- Aggregate real counts: total patients, today's appointments, occupancy rate, etc.
- Replace static `ANALYTICS_DATA` constant

---

### BCK-083 · Honest Empty-States
`epic:dashboard` `phase:8` `type:frontend` `complexity:S` `est:2h`
Depends: BCK-081

#### For each dashboard tab, add empty-state UI:
- Arabic: "لا توجد بيانات مسجلة بعد"
- English: "No data recorded yet"
- Never show fake/placeholder data when DB is empty

---

### BCK-084 · Final QA Pass
`epic:dashboard` `phase:8` `type:qa` `complexity:S` `est:2h`
Depends: BCK-082, BCK-083

#### Full verification:
- [ ] All dashboard tabs read live DB
- [ ] RTL/LTR both directions
- [ ] Keyboard navigation through entire dashboard
- [ ] Bundle size sanity: `npm run build` output checked
- [ ] `npx eslint .` + `npx tsc --noEmit` clean

---

### BCK-095 · Public Doctors/Specialties from DB
`epic:dashboard` `phase:8` `type:frontend` `complexity:M` `est:3h`
Depends: BCK-040

#### Single-source-of-truth: public doctor listings read from DB via ISR.

1. **Create `app/api/public/doctors/route.ts`** — public GET endpoint, no auth required
2. **Modify `components/` that import `DOCTORS` from `data/hospitalData.ts`** — replace with ISR fetch from API
3. **Delete `DOCTORS` array from `data/hospitalData.ts`** — DRY: doctor data exists once in DB
4. **Keep `SPECIALTIES` in `data/hospitalData.ts`** — specialties are marketing content, not operational data; promoting to DB is optional (add BCK-096 if desired)

---

# 🔒 Epic 9 — Security Hardening

---

### BCK-090 · Email Verification Flow
`epic:security` `phase:2` `type:backend+frontend` `complexity:M` `est:3h`
Depends: BCK-027

#### After BCK-027 establishes Resend/Brevo infrastructure:

1. **`app/api/auth/verify-email/route.ts`** — sends verification email with 6-digit code
2. **`app/api/auth/verify-email/confirm/route.ts`** — validates code, marks `emailVerified` on User
3. **Modify register flow** — send verification email after registration
4. **Portal** — show "بريدك غير موثق / Your email is not verified" warning until verified

---

### BCK-091 · Uptime Monitor
`epic:security` `phase:3` `type:infra` `complexity:S` `est:0.5h`
Depends: BCK-032

#### Setup free-tier uptime monitor (e.g., UptimeRobot, Better Stack):
- Monitor `https://konozealahram-eye.ly/api/health`
- Alert via email when downtime detected

---

### BCK-092 · Pre-Launch Security Review
`epic:security` `phase:3` `type:security` `complexity:M` `est:2h`
Depends: BCK-014

#### Run security-reviewer agent over all auth/session code:
- [ ] No timing leaks in password comparison
- [ ] Session tokens are cryptographically random
- [ ] Cookies set correctly (httpOnly, secure, sameSite)
- [ ] Rate limiting functional
- [ ] No SQL injection vectors (Prisma parameterizes by default — verify)
- [ ] CORS headers appropriate
- [ ] No sensitive data in error responses
- [ ] No `console.log` with sensitive data
