import { prisma } from '@/lib/prisma';
import type {
  ConsentReader,
  SurveyTicketReader,
  SurveyWriter,
} from '@/lib/usecases/surveys';
import type { ResolvedSurveyCreate } from '@/lib/usecases/surveys';

// Prisma adapter implementing the survey use-case ports. Only the adapter
// knows Prisma error codes: P2002 on the unique ticket index is mapped to
// the typed SurveyAlreadySubmittedError.

export const prismaConsentReader: ConsentReader = {
  async hasActiveConsent(accountId: string, consentType: string): Promise<boolean> {
    const record = await prisma.consentRecord.findFirst({
      where: { userId: accountId, consentType, consented: true },
      select: { id: true },
    });
    return record !== null;
  },
};

export const prismaSurveyTicketReader: SurveyTicketReader = {
  async findOwnedTicketPatientRef(
    ticketNumber: string,
    accountId: string,
  ): Promise<string | null> {
    const row = await prisma.appointment.findFirst({
      where: {
        ticketNumber,
        patient: { accountId },
      },
      select: { patient: { select: { id: true } } },
    });
    return row?.patient?.id ?? null;
  },
};

export const prismaSurveyWriter: SurveyWriter = {
  async create(resolved: ResolvedSurveyCreate): Promise<void> {
    try {
      await prisma.patientSurvey.create({ data: resolved });
    } catch (err) {
      const code = (err as { code?: string }).code;
      if (code === 'P2002') {
        const { SurveyAlreadySubmittedError } = await import(
          '@/lib/usecases/surveys'
        );
        throw new SurveyAlreadySubmittedError();
      }
      throw err;
    }
  },
};
