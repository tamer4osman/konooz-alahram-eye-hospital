# Security Policy

## Supported versions

This project is in active development. Only the latest commit on `main` receives security fixes.

## Reporting a vulnerability

Do **not** open a public GitHub issue for security problems.

Contact the maintainers directly:

- Email: [info@konozealahram-eye.ly](mailto:info@konozealahram-eye.ly)
- Subject line: `[SECURITY] <short description>`

Include: affected area, reproduction steps, potential impact, and any proof-of-concept. You can expect an acknowledgement within 7 days.

## Data model reality (2026-09-08 audit revision)

The earlier "patient data is device-local only" statement is **out of date**.
Since the 2026-09-05 Patient Portal ⇄ Operations Hub desegregation, the
application maintains **server-side patient accounts and profiles**:

- Patient accounts (`patient_accounts`) and profiles (`patient_profiles`)
  live in the server PostgreSQL database. Registration is self-serve with an
  explicit privacy-policy consent record (BCK-026) before any write.
- Sessions are DB-backed with **hashed** session tokens (`sha256`), disjoint
  httpOnly cookies (`konooz_patient_session` vs `konooz_staff_session`), and
  30-day TTL. Tokens never leave the DB in raw form.
- Staff identity (`users`, role ADMIN/STAFF) is separate from patient
  identity by mechanism: separate tables, separate cookies, and route-level
  gates (`requireAdmin` / `requireModuleAccess`) that read only the staff
  cookie. A patient session can never authenticate a staff API.
- Patient-editable fields are whitelisted (`PATCH /api/patient/profile`);
  clinical fields are staff-authored and never patient-writable.
- Booking requests remain labeled "reception confirms via WhatsApp" —
  nothing implies automatic delivery, and no outbound notification system
  exists.

Any change that moves more patient data server-side, or implies delivery,
requires a maintainer-approved design change and clear UI disclosure.

## Hard rules for contributors

- Never add network calls that transmit user-entered medical or personal data beyond the endpoints that already exist, without an explicit maintainer-approved design change and clear UI disclosure.
- Keep dependencies minimal; run `npm audit` before adding packages.
- All user-visible copy must remain truthful about what is stored where.
- Rate limiting reads the client IP from the **last** `x-forwarded-for`
  entry (appended by our own reverse proxy); do not revert to first-entry
  parsing — that reintroduces the 2026-09-08 spoofing bypass.
- JSON-LD sinks must use `safeJsonLd` from `lib/security/jsonld.ts`, never
  raw `JSON.stringify` inside `dangerouslySetInnerHTML`.
