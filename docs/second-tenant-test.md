# Second-Tenant Test — Al-Nakhil Dental Clinic

**Objective**: Prove the platform claim — spin up a completely fictional non-eye tenant using ONLY config + seeds, touching zero code.

**Fictional tenant**: عيادة النخيل لطب الأسنان (Al-Nakhil Dental Clinic)

## Test scenario

### Step 1: Config file

Create `config/tenant-al-nakhil.ts` with clinic-specific identity, teal palette, and reduced capabilities (no beds/surgeries):

```ts
export const tenantConfig: TenantConfig = {
  slug: 'al-nakhil-dental',
  profile: 'clinic',
  identity: {
    nameAr: 'عيادة النخيل لطب الأسنان',
    nameEn: 'Al-Nakhil Dental Clinic',
    shortNameAr: 'النخيل',
    shortNameEn: 'Al-Nakhil',
    orgTypeAr: 'عيادة',
    orgTypeEn: 'Clinic',
    taglineAr: 'ابتسامتك تبدأ من هنا.. أحدث تقنيات طب الأسنان',
    taglineEn: 'Your smile starts here.. Latest dental technology',
  },
  seo: { ... },
  contacts: { addressAr: 'شارع جمال عبد الناصر، بنغازي', primaryWhatsApp: '+218911111111', ... },
  urls: { baseUrl: 'https://al-nakhil-dental.ly', ... },
  geo: { regionCode: 'LY-BA', placename: 'Benghazi', lat: 32.12, lng: 20.08, medicalSpecialty: 'Dentistry' },
  theme: {
    primary: { '50': '#f0fdfa', '900': '#134e4a', ... }, // teal
    surface: { '50': '#f8fafc', ... },
    text: { '900': '#0f172a', ... },
    accent: { '500': '#f59e0b', ... },
  },
  capabilities: { visionTest: false, costCalculator: false, dashboard: true },
};
```

### Step 2: Seed departments

Two departments (not six — clinics are smaller):

| id | titleAr | titleEn | intakeSchema |
|---|---|---|---|
| `general-dentistry` | طب الأسنان العام | General Dentistry | teeth type select, pain level radio |
| `cosmetic-dentistry` | تجميل الأسنان | Cosmetic Dentistry | procedure select (whitening/veneers) |

### Step 3: Seed doctors

2-3 doctors with dental specialties (e.g., "استشاري تقويم الأسنان" / "Orthodontist").

### Step 4: Deploy

```bash
npx tsx deploy/rollout.ts al-nakhil-dental
```

### Step 5: Verify

| Check | Expected |
|---|---|
| Theme | Teal palette, NOT pine/bone |
| Identity | "عيادة النخيل" in header/footer |
| orgType | "عيادة" (not "مستشفى") |
| Departments | 2 dental specialties |
| Booking form | Schema-driven (teeth type + pain level) |
| Vision test | GONE (capability off) |
| Cost calculator | GONE (capability off) |
| Dashboard | Accessible to admin |
| Privacy page | /ar/privacy renders |
| Lang switch | /en shows English identity |

### Step 6: Manager permission test

1. Login as admin → full dashboard access
2. Create staff account → assign "receptionist" preset
3. Login as receptionist → only sees overview + rooms + beds + personnel tabs

## Pass criteria

All checks pass → **platform claim proven**. The platform is ready for real clients.
