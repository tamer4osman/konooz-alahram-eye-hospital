import { NextRequest } from 'next/server';
import { z } from 'zod';
import { registerPatient, loginPatient, logoutPatient } from '@/lib/usecases/auth/patient-auth';
import { prismaPatientIdentity, prismaPatientSessions } from '@/lib/adapters/prisma/patient-auth-adapter';
import { prisma } from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/api/response';
import { AUTH_MESSAGES } from '@/data/authMessages';
import { AUTH_INDICATOR_COOKIE } from '@/lib/api/patient-route';
import { PATIENT_COOKIE, hashToken, PATIENT_SESSION_TTL_MS, isPasswordAcceptable, WEAK_PASSWORD_MESSAGES, PASSWORD_MAX_LENGTH } from '@/lib/usecases/auth/rules';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { randomBytes } from 'crypto';
import { registerRateLimiter, loginRateLimiter, getClientIp, tooManyRequests } from '@/lib/api/rate-limit';

// Patient auth handlers (D2: self-serve signup/login; D6: patient session
// cookie). Shared by /api/patient/auth/* and the temporary /api/auth/*
// facades so the pre-Phase-4 UI keeps working unchanged.

const registerSchema = z.object({
  fullNameAr: z.string().min(2, 'الاسم مطلوب'),
  email: z.string().email('بريد إلكتروني غير صالح'),
  // F4: policy lives in isPasswordAcceptable (lib/usecases/auth/rules.ts) so
  // it stays pure and unit-tested; the refine marker maps to bilingual copy.
  password: z
    .string()
    .min(8, 'WEAK_PASSWORD')
    .max(PASSWORD_MAX_LENGTH, 'WEAK_PASSWORD')
    .refine(isPasswordAcceptable, { message: 'WEAK_PASSWORD' }),
  phone: z.string().min(8).optional(),
  cityAr: z.string().optional(),
  gender: z.enum(['male', 'female']).optional(),
  consent: z.literal(true, { message: 'يجب الموافقة على سياسة الخصوصية' }),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function setPatientSessionCookies(response: Response, token: string): Response {
  const headers = new Headers(response.headers);
  const secureFlag = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  headers.append(
    'Set-Cookie',
    `${PATIENT_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${PATIENT_SESSION_TTL_MS / 1000}${secureFlag}`,
  );
  headers.append(
    'Set-Cookie',
    `${AUTH_INDICATOR_COOKIE}=1; Path=/; SameSite=Lax; Max-Age=${PATIENT_SESSION_TTL_MS / 1000}${secureFlag}`,
  );
  return new Response(response.body, { status: response.status, headers });
}

function clearPatientSessionCookies(response: Response): Response {
  const headers = new Headers(response.headers);
  const secureFlag = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  headers.append(
    'Set-Cookie',
    `${PATIENT_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secureFlag}`,
  );
  headers.append(
    'Set-Cookie',
    `${AUTH_INDICATOR_COOKIE}=; Path=/; SameSite=Lax; Max-Age=0${secureFlag}`,
  );
  return new Response(response.body, { status: response.status, headers });
}

function newSessionToken(): string {
  return randomBytes(32).toString('base64url');
}

export async function handlePatientRegister(req: NextRequest): Promise<Response> {
  const limiter = registerRateLimiter(getClientIp(req));
  if (!limiter.allowed) return tooManyRequests(limiter.retryAfterSeconds);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError(400, 'INVALID_JSON', 'صيغة الطلب غير صالحة', 'Invalid request payload');
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    const issue0 = parsed.error.issues[0]?.message;
    if (issue0 === 'WEAK_PASSWORD') {
      return apiError(400, 'WEAK_PASSWORD', WEAK_PASSWORD_MESSAGES.ar, WEAK_PASSWORD_MESSAGES.en);
    }
    const msg = parsed.error.issues[0]?.message ?? 'Invalid input';
    return apiError(400, 'VALIDATION_ERROR', msg, msg);
  }

  const { fullNameAr, email, password, phone, gender } = parsed.data;

  try {
    const result = await registerPatient(
      prismaPatientIdentity,
      prismaPatientSessions,
      async (accountId, consentType) => {
        await prisma.consentRecord.create({
          data: { userId: accountId, consentType, consented: true },
        });
      },
      {
        email,
        password,
        fullNameAr,
        phone: phone ?? '',
        gender: gender ?? 'male',
      },
      {
        hash: hashPassword,
        verify: verifyPassword,
        newToken: newSessionToken,
      },
    );
    if (!result.ok) {
      return apiError(409, 'EMAIL_TAKEN', AUTH_MESSAGES.emailTaken.ar, AUTH_MESSAGES.emailTaken.en);
    }
    return setPatientSessionCookies(apiSuccess({ user: { id: result.accountId, email: result.email } }, 201), result.sessionToken);
  } catch {
    return apiError(500, 'REGISTER_FAILED', 'تعذر إنشاء الحساب، حاول مجدداً', 'Could not create account, please retry');
  }
}

export async function handlePatientLogin(req: NextRequest): Promise<Response> {
  const limiter = loginRateLimiter(getClientIp(req));
  if (!limiter.allowed) return tooManyRequests(limiter.retryAfterSeconds);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError(400, 'INVALID_JSON', 'صيغة الطلب غير صالحة', 'Invalid request payload');
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(400, 'VALIDATION_ERROR', 'بيانات غير صالحة', 'Invalid input');
  }

  try {
    const result = await loginPatient(
      prismaPatientIdentity,
      prismaPatientSessions,
      parsed.data,
      { hash: hashPassword, verify: verifyPassword, newToken: newSessionToken },
    );
    if (!result.ok) {
      return apiError(401, 'INVALID_CREDENTIALS', AUTH_MESSAGES.invalidCredentials.ar, AUTH_MESSAGES.invalidCredentials.en);
    }
    return setPatientSessionCookies(apiSuccess({ user: { id: result.accountId, email: result.email, role: 'PATIENT' } }), result.sessionToken);
  } catch {
    return apiError(500, 'LOGIN_FAILED', 'تعذر تسجيل الدخول، حاول مجدداً', 'Could not sign in, please retry');
  }
}

export async function handlePatientLogout(): Promise<Response> {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  const token = cookieStore.get(PATIENT_COOKIE)?.value;
  if (token) {
    await logoutPatient(prismaPatientSessions, token, { hashToken });
  }
  return clearPatientSessionCookies(apiSuccess({ ok: true }));
}
