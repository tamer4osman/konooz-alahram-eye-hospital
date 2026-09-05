import { prisma } from '@/lib/prisma';
import type { StaffIdentityStore, StaffSessionStore } from '@/lib/usecases/auth/ports';
import { SESSION_TTL_MS } from '@/lib/usecases/auth/rules';

// Prisma adapter for the staff identity store (D6). After the identity_split
// migration the users table physically cannot contain a patient row (enum
// lost PATIENT), so no runtime role filtering is needed here.

export const prismaStaffIdentity: StaffIdentityStore = {
  async findByEmail(email) {
    const row = await prisma.user.findUnique({ where: { email } });
    return row
      ? { id: row.id, email: row.email, passwordHash: row.passwordHash, role: row.role }
      : null;
  },
};

export const prismaStaffSessions: StaffSessionStore = {
  async create(userId, tokenHash, expiresAt) {
    await prisma.session.create({ data: { userId, tokenHash, expiresAt } });
  },
  async findValidUser(tokenHash, now) {
    const row = await prisma.session.findUnique({
      where: { tokenHash },
      include: { user: { select: { id: true, email: true, role: true } } },
    });
    if (!row) return null;
    if (row.expiresAt < now) {
      await prisma.session.delete({ where: { id: row.id } });
      return null;
    }
    await prisma.session.update({
      where: { id: row.id },
      data: { expiresAt: new Date(now.getTime() + SESSION_TTL_MS) },
    });
    return {
      sessionId: row.id,
      userId: row.user.id,
      email: row.user.email,
      role: row.user.role,
      expiresAt: row.expiresAt,
    };
  },
  async deleteByTokenHash(tokenHash) {
    await prisma.session.deleteMany({ where: { tokenHash } });
  },
};
