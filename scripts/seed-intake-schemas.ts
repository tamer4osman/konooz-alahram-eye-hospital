/**
 * One-time migration: seed intakeSchema on eye departments to match
 * the current hardcoded BookingModal triage fields.
 * Run with: npx tsx scripts/seed-intake-schemas.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const eyeIntakeSchema = [
  {
    id: 'condition',
    type: 'select',
    labelAr: 'الحالة المرضية *',
    labelEn: 'Patient Condition *',
    required: true,
    options: [
      { value: 'lasik', labelAr: 'ضعف نظر / رغبة في الليزك', labelEn: 'Blurry Vision / Want LASIK', emoji: '👓' },
      { value: 'cataract', labelAr: 'مياه بيضاء / غشاوة وضبابية', labelEn: 'Cataract / Cloudy Vision', emoji: '🌫️' },
      { value: 'retina-diabetes', labelAr: 'اعتلال سكري / خيوط أو فلاشات', labelEn: 'Diabetes / Retina Floaters', emoji: '🩺' },
      { value: 'glaucoma', labelAr: 'ضغط العين / مياه زرقاء', labelEn: 'High Eye Pressure / Glaucoma', emoji: '💧' },
      { value: 'cornea', labelAr: 'قرنية مخروطية / احمرار وجفاف', labelEn: 'Keratoconus / Severe Dryness', emoji: '👁️' },
      { value: 'pediatric', labelAr: 'حَوَل أو كسل عين للأطفال', labelEn: 'Child Squint / Lazy Eye', emoji: '👶' },
      { value: 'injury', labelAr: 'إصابة طارئة / دخول جسم غريب', labelEn: 'Eye Trauma / Foreign Body', emoji: '🚨' },
      { value: 'general', labelAr: 'فحص دوري شامل / استشارة', labelEn: 'General Checkup / Consultation', emoji: '📋' },
    ],
  },
  {
    id: 'gender',
    type: 'radio-group',
    labelAr: 'الجنس *',
    labelEn: 'Gender *',
    required: true,
    options: [
      { value: 'male', labelAr: 'ذكر', labelEn: 'Male', emoji: '👨' },
      { value: 'female', labelAr: 'أنثى', labelEn: 'Female', emoji: '👩' },
    ],
  },
  {
    id: 'ageGroup',
    type: 'radio-group',
    labelAr: 'الفئة العمرية *',
    labelEn: 'Age Group *',
    required: true,
    options: [
      { value: 'child', labelAr: 'طفل / أقل من 16 سنة', labelEn: 'Child / Under 16', emoji: '👶' },
      { value: 'adult', labelAr: 'بالغ / 16 - 50 سنة', labelEn: 'Adult / 16 - 50', emoji: '🧑' },
      { value: 'senior', labelAr: 'كبير سن / 50+ سنة', labelEn: 'Senior / 50+', emoji: '🧓' },
    ],
  },
  {
    id: 'affectedEye',
    type: 'radio-group',
    labelAr: 'العين المتأثرة',
    labelEn: 'Affected Eye',
    options: [
      { value: 'both', labelAr: 'كلتا العينين', labelEn: 'Both Eyes', emoji: '👀' },
      { value: 'right', labelAr: 'العين اليمنى', labelEn: 'Right Eye (OD)', emoji: '👁️' },
      { value: 'left', labelAr: 'العين اليسرى', labelEn: 'Left Eye (OS)', emoji: '👁️' },
    ],
  },
  {
    id: 'symptomDuration',
    type: 'radio-group',
    labelAr: 'مدة الأعراض',
    labelEn: 'Symptom Duration',
    options: [
      { value: 'recent', labelAr: 'طارئة / حديثة', labelEn: 'Recent / Sudden', emoji: '⚡' },
      { value: 'gradual', labelAr: 'تدريجية', labelEn: 'Gradual', emoji: '⏳' },
      { value: 'chronic', labelAr: 'متابعة دورية', labelEn: 'Routine Checkup', emoji: '🔄' },
    ],
  },
  {
    id: 'notes',
    type: 'textarea',
    labelAr: 'ملاحظات إضافية',
    labelEn: 'Additional Notes',
    placeholderAr: 'صِف أعراضك أو أي تفاصيل إضافية...',
    placeholderEn: 'Describe your symptoms or any additional details...',
    maxLength: 2000,
  },
];

async function main() {
  const departments = await prisma.department.findMany({
    where: { id: { in: ['refractive-lasik', 'cataract-phaco', 'retina-vitreous', 'cornea-keratoconus', 'pediatric-strabismus', 'oculoplastics'] } },
  });

  for (const dept of departments) {
    await prisma.department.update({
      where: { id: dept.id },
      data: { intakeSchema: eyeIntakeSchema },
    });
    console.log(`✓ ${dept.id} intakeSchema set`);
  }

  console.log(`\nSeeded intakeSchema on ${departments.length} eye departments`);
}

main()
  .catch((e) => { console.error(e); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
