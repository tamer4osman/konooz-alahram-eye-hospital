import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../lib/auth/password';

const prisma = new PrismaClient();

// Dev/demo staff account for the operations dashboard.
// Email: staff@konooz.test  Password: Staff@12345  Role: STAFF
async function main() {
  const passwordHash = await hashPassword('Staff@12345');
  await prisma.user.upsert({
    where: { email: 'staff@konooz.test' },
    update: { role: 'STAFF', passwordHash },
    create: { email: 'staff@konooz.test', passwordHash, role: 'STAFF' },
  });
  console.log('staff account ready: staff@konooz.test / Staff@12345');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
