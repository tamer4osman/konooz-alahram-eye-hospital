# New Tenant Onboarding Checklist

## 1. Pre-flight (you + hospital)

- [ ] Contract signed (closed-source license + annual support)
- [ ] Hospital provides: name AR/EN, logo, address, phones, Facebook page
- [ ] Hospital provides: doctor list (names, titles, specialties, photos)
- [ ] Hospital provides: department/specialty list
- [ ] Hospital confirms: working hours, emergency number

## 2. Config file

Copy `config/tenant.ts` → edit for the new tenant:

```ts
export const tenantConfig: TenantConfig = {
  slug: 'new-tenant-slug',
  profile: 'hospital' | 'polyclinic' | 'clinic',
  identity: { nameAr, nameEn, orgTypeAr, orgTypeEn, ... },
  seo: { titleAr, titleEn, descriptionAr, descriptionEn, keywords, ... },
  contacts: { addressAr, primaryWhatsApp, phoneNumbers, ... },
  urls: { baseUrl: 'https://new-tenant.ly', ... },
  geo: { regionCode, lat, lng, ... },
  theme: { primary: { ... }, surface: { ... }, text: { ... }, accent: { ... } },
  capabilities: { visionTest, costCalculator, dashboard },
};
```

## 3. Seed content

AI-draft seed content from hospital's Facebook/brochures:
1. Run `scripts/seed-runner.ts` pattern with tenant-specific JSON
2. Populate: departments, doctors, testimonials, FAQs, trust stats
3. Add hospital photos to `public/images/`

## 4. Deploy

```bash
# Create instance directory
mkdir -p deploy/<slug>
cp docker-compose.yml deploy/<slug>/
cp .env.example deploy/<slug>/.env

# Edit deploy/<slug>/.env with:
# - DATABASE_URL (new Postgres DB)
# - AUTH_SECRET (new random string)
# - NEXTAUTH_URL (https://<domain>)

# Deploy
npx tsx deploy/rollout.ts <slug>
```

## 5. Sign-off

- [ ] Hospital reviews AR site (all sections, booking flow, doctor profiles)
- [ ] Hospital reviews EN site
- [ ] Hospital confirms working hours, contact info, emergency number
- [ ] Hospital confirms department list and descriptions
- [ ] Hospital confirms doctor profiles and photos
- [ ] Hospital signs off on privacy policy (BCK-026)
- [ ] Hospital manager receives ADMIN login credentials
- [ ] Hospital manager tests dashboard access

## 6. Post-launch

- [ ] DNS configured (A record → VPS IP)
- [ ] SSL certificate active (Caddy auto-TLS)
- [ ] Google Maps embed working
- [ ] WhatsApp booking flow tested end-to-end
- [ ] Hospital staff trained on dashboard basics

## Demo rule

A tenant holding real patient data is NEVER a demo surface. Sales demos use the Konooz instance (synthetic data) or a dedicated demo tenant with fabricated data.
