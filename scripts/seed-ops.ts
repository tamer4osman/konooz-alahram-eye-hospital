import { SterileSetStatus } from '@prisma/client';
import { runSeed } from './seed-runner';

// DEMO SEED — ops telemetry that has no production writer yet (CSSD tray
// lifecycle, ops activity feed). Replace these rows with real event data
// when the system goes live; the dashboard reads whatever is in the tables.

const STERILE_SETS: Array<{ nameAr: string; nameEn: string; status: SterileSetStatus }> = [
  ...Array.from({ length: 26 }, (_, i) => ({
    nameAr: `طقم جراحة ${i + 1}`,
    nameEn: `Surgical Tray ${i + 1}`,
    status: 'ready' as SterileSetStatus,
  })),
  { nameAr: 'طقم فاكو إضافي', nameEn: 'Extra Phaco Tray', status: 'in_use' as SterileSetStatus },
  { nameAr: 'طقم ترقيع ملتحمة', nameEn: 'Conjunctival Graft Tray', status: 'in_use' as SterileSetStatus },
  { nameAr: 'طقم تحت التعقيم', nameEn: 'Tray Under Sterilization', status: 'sterilizing' as SterileSetStatus },
];

const ACTIVITY: Array<{ messageAr: string; messageEn: string; level: 'info' | 'success' | 'warning'; minutesAgo: number }> = [
  { messageAr: 'اكتمال تعقيم جناح العمليات 2', messageEn: 'OR 2 sterilization cycle completed', level: 'success', minutesAgo: 8 },
  { messageAr: 'بدء جراحة شبكية عاجلة (OR-1)', messageEn: 'Urgent retina surgery started (OR-1)', level: 'warning', minutesAgo: 18 },
  { messageAr: 'إعادة تشغيل جهاز الفاكو بعد الصيانة', messageEn: 'Phaco device back online after service', level: 'success', minutesAgo: 45 },
  { messageAr: 'استلام 20 عدسة IOL جديدة في المخزن', messageEn: '20 new IOL lenses received in stock', level: 'info', minutesAgo: 90 },
  { messageAr: 'أسرة PACU جاهزة بعد التعقيم', messageEn: 'PACU bed ready after cleaning', level: 'info', minutesAgo: 130 },
];

runSeed(async (prisma) => {
  const now = new Date();

  await prisma.sterileSet.deleteMany({});
  await prisma.sterileSet.createMany({
    data: STERILE_SETS.map((s) => ({
      ...s,
      sterilizedAt: s.status === 'ready' ? new Date(now.getTime() - 6 * 3_600_000) : null,
    })),
  });

  await prisma.opsActivityLog.deleteMany({});
  await prisma.opsActivityLog.createMany({
    data: ACTIVITY.map((a) => ({
      messageAr: a.messageAr,
      messageEn: a.messageEn,
      level: a.level,
      createdAt: new Date(now.getTime() - a.minutesAgo * 60_000),
    })),
  });

  console.log(`seeded ${STERILE_SETS.length} sterile sets + ${ACTIVITY.length} activity events`);
});
