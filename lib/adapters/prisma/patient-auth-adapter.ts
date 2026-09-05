import { prisma } from '@/lib/prisma';
import type { PatientIdentityStore, PatientSessionStore } from '@/lib/usecases/auth/ports';
import { SESSION_TTL_MS } from '@/lib/usecases/auth/rules';

// Prisma adapter for the patient identity store (D6). Only the adapter knows
// Prisma types; the use-case layer sees the ports only.

export const prismaPatientIdentity: PatientIdentityStore = {
  async findByEmail(email) {
    const row = await prisma.patientAccount.findUnique({ where: { email } });
    return row ? { id: row.id, email: row.email, passwordHash: row.passwordHash } : null;
  },
  async createWithProfile(input) {
    return prisma.patientAccount.create({
      data: {
        email: input.email,
        passwordHash: input.passwordHash,
        profile: {
          create: {
            fullNameAr: input.fullNameAr,
            fullNameEn: input.fullNameAr,
            phone: input.phone,
            gender: input.gender,
            cityAr: input.cityAr,
            cityEn: 'Benghazi',
            communicationPreferences: JSON.stringify({
              emailNotifications: true,
              whatsappAlerts: true,
              appointmentReminders: true,
              eyeDropScheduleAlerts: true,
              postOpCareGuides: true,
              newsletterSubscribed: false,
              newsletterTopics: [],
            }),
          },
        },
      },
      select: { id: true, email: true },
    });
  },
};

export const prismaPatientSessions: PatientSessionStore = {
  async create(accountId, tokenHash, expiresAt) {
    await prisma.patientSession.create({ data: { accountId, tokenHash, expiresAt } });
  },
  async findValidAccount(tokenHash, now) {
    const row = await prisma.patientSession.findUnique({
      where: { tokenHash },
      include: { account: { select: { id: true, email: true } } },
    });
    if (!row) return null;
    if (row.expiresAt < now) {
      await prisma.patientSession.delete({ where: { id: row.id } });
      return null;
    }
    // Sliding expiry — parity with the pre-split session behavior.
    await prisma.patientSession.update({
      where: { id: row.id },
      data: { expiresAt: new Date(now.getTime() + SESSION_TTL_MS) },
    });
    return {
      sessionId: row.id,
      accountId: row.account.id,
      email: row.account.email,
      expiresAt: row.expiresAt,
    };
  },
  async deleteByTokenHash(tokenHash) {
    await prisma.patientSession.deleteMany({ where: { tokenHash } });
  },
};
