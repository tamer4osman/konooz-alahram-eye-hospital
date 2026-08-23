# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned

- Backend integration: real accounts, live queue sync, automated notifications
- Replace native `alert()` calls with inline form errors
- Test infrastructure (unit + E2E)
- Lighthouse performance pass

## [0.1.0] - 2026-08-23

### Added

- Bilingual Arabic/English site with RTL-first layout, localStorage persistence, `?lang=` deep links, and pre-paint direction switching
- Accessible shared modal system (`components/ui/Modal.tsx`): focus trap, Escape handling, scroll lock, `aria-modal`
- Lazy-loaded modals and operations dashboard via `next/dynamic` (165 kB first-load JS)
- Device-local patient portal profile with appointments, prescriptions view, notification preferences, and newsletter topics
- Triage-informed booking flow handing off to WhatsApp pre-filled drafts
- Surgical cost and insurance co-pay calculator
- Vision self-screening tools (acuity check, Amsler grid)
- Honest visit-journey queue guidance (live tracking marked as coming soon)
- Accessibility toolbar: font scaling, high contrast, reading ruler
- SEO metadata, sitemap, robots, PWA manifest, bilingual content datasets under `data/`
