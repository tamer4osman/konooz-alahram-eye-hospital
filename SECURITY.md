# Security Policy

## Supported versions

This project is in active development. Only the latest commit on `main` receives security fixes.

## Reporting a vulnerability

Do **not** open a public GitHub issue for security problems.

Contact the maintainers directly:

- Email: [info@konozealahram-eye.ly](mailto:info@konozealahram-eye.ly)
- Subject line: `[SECURITY] <short description>`

Include: affected area, reproduction steps, potential impact, and any proof-of-concept. You can expect an acknowledgement within 7 days.

## Scope notes specific to this project

- **No server-side patient data exists by design.** The patient portal stores profiles only in the visitor's browser (`localStorage` via `context/PatientAuthContext.tsx`). Reports about server-side data exposure of patient records should first confirm such storage actually exists — if it does, that itself is a violation of the project's honest-data-model invariant.
- **WhatsApp handoff** opens a pre-filled draft; nothing is ever sent automatically.
- The site is static-prerendered; there are currently no authenticated API routes.
- Environment variables are limited to public build-time values (see `.env.example`). Never commit real secrets.

## Hard rules for contributors

- Never introduce network calls that transmit user-entered medical or personal data without an explicit maintainer-approved design change and clear UI disclosure.
- Keep dependencies minimal; run `npm audit` before adding packages.
- All user-visible copy must remain truthful about what is stored where.
