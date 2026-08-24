import { z } from 'zod'

export const appointmentRequestSchema = z.object({
  patientName: z.string().min(2),
  phone: z.string().min(7),
  email: z.string().email().optional().or(z.literal('')),
  specialtyId: z.string().min(1),
  doctorId: z.string().optional(),
  conditionTitleAr: z.string().optional(),
  conditionTitleEn: z.string().optional(),
  preferredDate: z.string().optional(),
  preferredTime: z.string().optional(),
  ageGroup: z.string().optional(),
  gender: z.string().optional(),
  affectedEye: z.string().optional(),
  symptomDuration: z.string().optional(),
  notes: z.string().max(2000).optional(),
})

