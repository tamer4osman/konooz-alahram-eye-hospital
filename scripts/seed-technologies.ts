import { runSeed } from './seed-runner'

const technologies = [
  {
    id: 'femto-lasik',
    titleAr: 'ليزك الفمتو',
    titleEn: 'Femto LASIK',
    categoryAr: 'علاج العيون بالليزر',
    categoryEn: 'Laser Eye Surgery',
    descAr: 'تقنية الليزر الحديثة لتصحيح العيوب الانكسارية بدقة عالية',
    descEn: 'Advanced laser technique for refractive error correction with high precision',
    featuresAr: ['بدون مشرط', 'تعافي سريع', 'دقة عالية'],
    featuresEn: ['Bladeless', 'Fast recovery', 'High precision'],
    precision: '0.25 ميكرون',
    imageSeed: 'femto-lasik',
    sortOrder: 1,
  },
  {
    id: 'cataract-phaco',
    titleAr: 'استبدال عدسة العين',
    titleEn: 'Cataract Phacoemulsification',
    categoryAr: 'جراحات العدسات',
    categoryEn: 'Lens Surgery',
    descAr: 'استبدال العدسة المعتمة بالعدسة الصناعية عبر شق صغير',
    descEn: 'Replacing the cloudy lens with an artificial lens through a small incision',
    featuresAr: ['شق صغير', 'بدون غرز', 'تعافي سريع'],
    featuresEn: ['Small incision', 'No stitches', 'Fast recovery'],
    precision: '2.2 مم شق',
    imageSeed: 'cataract-phaco',
    sortOrder: 2,
  },
  {
    id: 'retinal-laser',
    titleAr: 'ليزر الشبكية',
    titleEn: 'Retinal Laser',
    categoryAr: 'علاج الشبكية',
    categoryEn: 'Retinal Treatment',
    descAr: 'علاج مشاكل الشبكية بالليزر لمنع تدهور الرؤية',
    descEn: 'Laser treatment for retinal problems to prevent vision deterioration',
    featuresAr: ['غير جراحي', 'دقيقة', 'وقائي'],
    featuresEn: ['Non-surgical', 'Precise', 'Preventive'],
    precision: 'مايكرو واط',
    imageSeed: 'retinal-laser',
    sortOrder: 3,
  },
  {
    id: 'oct-scan',
    titleAr: 'تصوير الشبكية OCT',
    titleEn: 'OCT Retinal Scan',
    categoryAr: 'التشخيص',
    categoryEn: 'Diagnostics',
    descAr: 'تصوير مقطعي محوسبة للشبكية للكشف المبكر عن الأمراض',
    descEn: 'Optical Coherence Tomography for early disease detection',
    featuresAr: ['تصوير مقطعي', 'كشف مبكر', 'غير مؤلم'],
    featuresEn: ['Cross-sectional imaging', 'Early detection', 'Painless'],
    precision: '5 ميكرون',
    imageSeed: 'oct-scan',
    sortOrder: 4,
  },
]

runSeed(async (prisma) => {
  for (const tech of technologies) {
    await prisma.technology.upsert({
      where: { id: tech.id },
      update: tech,
      create: tech,
    })
  }
  console.log(`seeded ${technologies.length} technologies`)
})
