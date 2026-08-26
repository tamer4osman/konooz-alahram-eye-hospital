import { z } from 'zod'

export const registerSchema = z.object({
  fullNameAr: z.string().min(2, 'الاسم مطلوب'),
  email: z.string().email('بريد إلكتروني غير صالح'),
  password: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'),
  phone: z.string().min(8).optional(),
  cityAr: z.string().optional(),
  gender: z.enum(['male', 'female']).optional(),
  /** Patient must consent to data collection before account creation (BCK-026) */
  consent: z.literal(true, { message: 'يجب الموافقة على سياسة الخصوصية' }),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})
