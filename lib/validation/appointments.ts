import { z } from 'zod'

// Every field is bounded: this endpoint is public (no auth), so unbounded
// strings are a free storage-DoS channel into the appointments table
// (audit 2026-09-08: 10 KB name + 100 KB intakeData were accepted before).

export const appointmentRequestSchema = z.object({
  patientName: z.string().min(2).max(120),
  phone: z.string().min(7).max(20),
  email: z.string().email().max(254).optional().or(z.literal('')),
  specialtyId: z.string().min(1).max(100),
  doctorId: z.string().max(64).optional(),
  conditionTitleAr: z.string().max(200).optional(),
  conditionTitleEn: z.string().max(200).optional(),
  preferredDate: z.string().max(40).optional(),
  preferredTime: z.string().max(40).optional(),
  ageGroup: z.string().max(40).optional(),
  gender: z.string().max(20).optional(),
  affectedEye: z.string().max(40).optional(),
  symptomDuration: z.string().max(40).optional(),
  notes: z.string().max(2000).optional(),
  /** Schema-driven intake data collected via department intakeSchema */
  intakeData: z
    .record(
      z.string().max(60),
      z.union([z.string().max(500), z.number(), z.boolean()]),
    )
    .optional(),
})
