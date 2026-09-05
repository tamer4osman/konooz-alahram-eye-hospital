import { hashPassword } from '../lib/auth/password';
import { runSeed } from './seed-runner';

// Dev/demo admin account with full dashboard permission.
// Credentials come from SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD in .env —
// never hardcode them here. Other staff may exist as STAFF members without
// dashboard access; password management and permission assignment are future work.
runSeed(async (prisma) => {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error(
      'SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD missing — copy values from .env.example into .env and run `npm run seed:staff`.',
    );
  }
  const passwordHash = await hashPassword(password);
  await prisma.user.upsert({
    where: { email },
    update: { role: 'ADMIN', passwordHash },
    create: { email, passwordHash, role: 'ADMIN' },
  });
  console.log(`admin account ready: ${email} (ADMIN)`);
});
