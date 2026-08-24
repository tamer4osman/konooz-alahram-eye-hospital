import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PrismaClient } from '@prisma/client';

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

const prisma = new PrismaClient();

async function main() {
  const items = JSON.parse(
    readFileSync(join(__dirname, 'testimonials.seed.json'), 'utf8'),
  ) as SeedTestimonial[];

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
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
