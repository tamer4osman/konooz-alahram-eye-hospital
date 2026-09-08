import { runSeed } from './seed-runner';
import { auditRetentionCutoff } from '../lib/usecases/maintenance/rules';

// Retention prune for the append-only staff audit trail. The application
// layer never deletes audit rows; this script is the single sanctioned
// exception, run deliberately from ops (default: keep 730 days, override
// with AUDIT_RETENTION_DAYS, minimum 30 enforced).
runSeed(async (prisma) => {
  const daysRaw = process.env.AUDIT_RETENTION_DAYS;
  const days = daysRaw ? Number(daysRaw) : undefined;
  const cutoff = auditRetentionCutoff(new Date(), days);
  const result = await prisma.staffAuditLog.deleteMany({
    where: { createdAt: { lt: cutoff } },
  });
  console.log(`audit rows pruned (retention ${days ?? 'default(730)'} days): ${result.count}`);
});
