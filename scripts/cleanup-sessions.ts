import { runSeed } from './seed-runner';
import { expiredSessionFilter } from '../lib/usecases/maintenance/rules';

// Housekeeping for expired auth sessions (staff `sessions` + patient
// `patient_sessions`). Nothing here touches live tokens — only rows whose
// expiry has already passed. Intended to run daily from a VPS systemd timer;
// see docs/security/2026-09-08-security-assessment.md §6. `runSeed` is
// generic plumbing (client creation, teardown, exit codes) reused here.
runSeed(async (prisma) => {
  const filter = expiredSessionFilter(new Date());
  const staff = await prisma.session.deleteMany({ where: filter });
  const patients = await prisma.patientSession.deleteMany({ where: filter });
  console.log(`expired sessions removed: staff=${staff.count} patient=${patients.count}`);
});
