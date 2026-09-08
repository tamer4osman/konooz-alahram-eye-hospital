import { NextRequest } from 'next/server';
import { loginStaff, logoutStaff } from '@/lib/usecases/auth/staff-auth';
import { prismaStaffIdentity, prismaStaffSessions } from '@/lib/adapters/prisma/staff-auth-adapter';
import { apiSuccess, apiError } from '@/lib/api/response';
import { AUTH_MESSAGES } from '@/data/authMessages';
import { STAFF_COOKIE, hashToken, STAFF_SESSION_TTL_MS } from '@/lib/usecases/auth/rules';
import { verifyPassword } from '@/lib/auth/password';
import { randomBytes } from 'crypto';
import { loginRateLimiter, getClientIp, tooManyRequests } from '@/lib/api/rate-limit';
import { loginSchema } from '@/lib/api/patient-auth-handlers';

// Staff auth handlers (D2: NO registration route exists — accounts are
// admin-provisioned via the staff-members flow; D6: staff session cookie).
// Shared by /api/staff/auth/* and the temporary /api/auth/login facade.

function newSessionToken(): string {
  return randomBytes(32).toString('base64url');
}

function setStaffSessionCookie(response: Response, token: string): Response {
  const headers = new Headers(response.headers);
  const secureFlag = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  headers.append(
    'Set-Cookie',
    `${STAFF_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${STAFF_SESSION_TTL_MS / 1000}${secureFlag}`,
  );
  return new Response(response.body, { status: response.status, headers });
}

function clearStaffSessionCookie(response: Response): Response {
  const headers = new Headers(response.headers);
  const secureFlag = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  headers.append(
    'Set-Cookie',
    `${STAFF_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secureFlag}`,
  );
  return new Response(response.body, { status: response.status, headers });
}

export async function handleStaffLogin(req: NextRequest): Promise<Response> {
  const limiter = loginRateLimiter(getClientIp(req));
  if (!limiter.allowed) return tooManyRequests(limiter.retryAfterSeconds);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError(400, 'INVALID_JSON', 'صيغة الطلب غير صالحة', 'Invalid request payload');
  }

  // Same shape as patient login — reuse the shared schema.
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(400, 'VALIDATION_ERROR', 'بيانات غير صالحة', 'Invalid input');
  }

  try {
    const result = await loginStaff(prismaStaffIdentity, prismaStaffSessions, parsed.data, {
      verify: verifyPassword,
      newToken: newSessionToken,
    });
    if (!result.ok) {
      return apiError(401, 'INVALID_CREDENTIALS', AUTH_MESSAGES.invalidCredentials.ar, AUTH_MESSAGES.invalidCredentials.en);
    }
    return setStaffSessionCookie(
      apiSuccess({ user: { id: result.userId, email: result.email, role: result.role } }),
      result.sessionToken,
    );
  } catch {
    return apiError(500, 'LOGIN_FAILED', 'تعذر تسجيل الدخول، حاول مجدداً', 'Could not sign in, please retry');
  }
}

export async function handleStaffLogout(): Promise<Response> {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  const token = cookieStore.get(STAFF_COOKIE)?.value;
  if (token) {
    await logoutStaff(prismaStaffSessions, token, { hashToken });
  }
  return clearStaffSessionCookie(apiSuccess({ ok: true }));
}
