import { PrismaClient } from '@prisma/client';
import { hash } from '@node-rs/argon2';

// Test/demo account seeds. All credentials are read from SEED_TEST_* env vars
// (see .env.example); nothing is hardcoded here.
const prisma = new PrismaClient();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} missing — copy values from .env.example into .env and rerun.`);
  }
  return value;
}

async function main() {
  // 1. Test patient account — lives in the patient identity store (D6)
  const patientEmail = requireEnv('SEED_TEST_PATIENT_EMAIL');
  const patientPassword = requireEnv('SEED_TEST_PATIENT_PASSWORD');
  const patientHash = await hash(patientPassword);

  const patientAccount = await prisma.patientAccount.upsert({
    where: { email: patientEmail },
    update: { passwordHash: patientHash },
    create: {
      email: patientEmail,
      passwordHash: patientHash,
      profile: {
        create: {
          fullNameAr: 'مريض تجريبي',
          fullNameEn: 'Test Patient',
          phone: '0912345678',
          gender: 'MALE',
          cityAr: 'بنغازي',
          cityEn: 'Benghazi',
        },
      },
    },
    include: { profile: true },
  });
  console.log(`✓ Patient: ${patientEmail} (id: ${patientAccount.id})`);

  // 2. Test staff account (ADMIN)
  const staffEmail = requireEnv('SEED_TEST_ADMIN_EMAIL');
  const staffPassword = requireEnv('SEED_TEST_ADMIN_PASSWORD');
  const staffHash = await hash(staffPassword);

  const staffUser = await prisma.user.upsert({
    where: { email: staffEmail },
    update: { passwordHash: staffHash, role: 'ADMIN' },
    create: {
      email: staffEmail,
      passwordHash: staffHash,
      role: 'ADMIN',
    },
  });
  console.log(`✓ Staff:  ${staffEmail} (id: ${staffUser.id})`);

  // 3. Test staff account (STAFF with clinician permissions)
  const clinicianEmail = requireEnv('SEED_TEST_CLINICIAN_EMAIL');
  const clinicianPassword = requireEnv('SEED_TEST_CLINICIAN_PASSWORD');
  const clinicianHash = await hash(clinicianPassword);

  const clinicianUser = await prisma.user.upsert({
    where: { email: clinicianEmail },
    update: { passwordHash: clinicianHash, role: 'STAFF', permissions: { overview: 'read', clinical: 'write', surgeries: 'read', rooms: 'read' } },
    create: {
      email: clinicianEmail,
      passwordHash: clinicianHash,
      role: 'STAFF',
      permissions: { overview: 'read', clinical: 'write', surgeries: 'read', rooms: 'read' },
    },
  });
  console.log(`✓ Clinician: ${clinicianEmail} (id: ${clinicianUser.id})`);

  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
