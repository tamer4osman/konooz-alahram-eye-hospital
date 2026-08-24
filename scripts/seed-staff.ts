import { hashPassword } from '../lib/auth/password';
import { runSeed } from './seed-runner';


// Dev/demo admin account with full dashboard permission.
// Email: staff@konooz.test  Password: Staff@12345  Role: ADMIN
// Other staff may exist as STAFF members without dashboard access;
// password management and permission assignment are future work.
runSeed(async (prisma) => {
  const passwordHash = await hashPassword('Staff@12345');
  await prisma.user.upsert({
    where: { email: 'staff@konooz.test' },
    update: { role: 'ADMIN', passwordHash },
    create: { email: 'staff@konooz.test', passwordHash, role: 'ADMIN' },
  });
  console.log('admin account ready: staff@konooz.test / Staff@12345 (ADMIN)');
});
