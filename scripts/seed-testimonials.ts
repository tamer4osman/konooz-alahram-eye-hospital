import { runSeed,
  loadSeedJson } from './seed-runner';

interface SeedTestimonial {
  id: string;
  patientNameAr: string;
  patientNameEn: string;
  cityAr: string;
  cityEn: string;
  procedureAr: string;
  procedureEn: string;
  doctorAr: string;
  doctorEn: string;
  commentAr: string;
  commentEn: string;
  rating: number;
  dateAr: string;
  dateEn: string;
}


runSeed(async (prisma) => {
  const items = loadSeedJson<SeedTestimonial[]>('testimonials.seed.json');

  for (const [idx, t] of items.entries()) {
    const data = {
      patientNameAr: t.patientNameAr,
      patientNameEn: t.patientNameEn,
      cityAr: t.cityAr,
      cityEn: t.cityEn,
      procedureAr: t.procedureAr,
      procedureEn: t.procedureEn,
      doctorAr: t.doctorAr,
      doctorEn: t.doctorEn,
      commentAr: t.commentAr,
      commentEn: t.commentEn,
      rating: t.rating,
      dateAr: t.dateAr,
      dateEn: t.dateEn,
      sortOrder: idx,
    };
    await prisma.testimonial.upsert({ where: { id: t.id }, update: data, create: { id: t.id, ...data } });
  }
  console.log(`seeded ${items.length} testimonials`);
});
