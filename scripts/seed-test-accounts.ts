import { PrismaClient } from '@prisma/client';
import { hash } from '@node-rs/argon2';

const prisma = new PrismaClient();

async function main() {
  // 1. Test patient account — lives in the patient identity store (D6)
  const patientEmail = 'patient@test.com';
  const patientPassword = 'Test1234!';
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
  console.log(`✓ Patient: ${patientEmail} / ${patientPassword} (id: ${patientAccount.id})`);

  // 2. Test staff account (ADMIN)
  const staffEmail = 'admin@test.com';
  const staffPassword = 'Admin1234!';
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
  console.log(`✓ Staff:  ${staffEmail} / ${staffPassword} (id: ${staffUser.id})`);

  // 3. Test staff account (STAFF with clinician permissions)
  const clinicianEmail = 'clinician@test.com';
  const clinicianPassword = 'Clinic1234!';
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
  console.log(`✓ Clinician: ${clinicianEmail} / ${clinicianPassword} (id: ${clinicianUser.id})`);

  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
