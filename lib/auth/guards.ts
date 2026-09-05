import { getStaffAccount } from '@/lib/api/patient-route';
import { prisma } from '@/lib/prisma';

// Dashboard APIs must call this before any data leaves the server. The staff
// gate reads ONLY the staff session cookie (D6) — a patient session can never
// authenticate a staff route. Only ADMIN holds dashboard permission today;
// STAFF accounts exist as members without access (granular authorization is
// admin-assigned permissions, already modeled in users.permissions).

export interface StaffUser {
  id: string;
  email: string;
  role: 'STAFF' | 'ADMIN';
  permissions: unknown;
}

export async function getStaffUser(): Promise<StaffUser | null> {
  const staff = await getStaffAccount();
  if (!staff || staff.role !== 'ADMIN') return null;

  const user = await prisma.user.findUnique({
    where: { id: staff.userId },
    select: { id: true, email: true, role: true, permissions: true },
  });
  return user;
}
