import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import type {
  AppointmentWriter,
  DoctorReader,
  DoctorLookupResult,
  ResolvedAppointmentCreate,
} from '@/lib/usecases/appointments';
import { generateTicket } from '@/lib/usecases/appointments';

// Prisma adapter implementing the appointment use-case ports. This is the
// only place the booking flow touches the driver: the P2002 ticket-collision
// retry lives here because only the adapter knows Prisma error codes.

export const prismaDoctorReader: DoctorReader = {
  async findSnapshot(doctorId: string): Promise<DoctorLookupResult> {
    const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
    if (!doctor) return null;
    return {
      displayNameAr: doctor.fullNameAr,
      displayNameEn: doctor.fullNameEn,
      specialtyAr: doctor.specialtyAr,
      specialtyEn: doctor.specialtyEn,
    };
  },
};

export const prismaAppointmentWriter: AppointmentWriter = {
  async createWithRetry(
    resolved: ResolvedAppointmentCreate,
    maxAttempts = 5,
  ): Promise<string> {
    let lastError: unknown;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const created = await prisma.appointment.create({
          data: {
            ticketNumber: attempt === 0 ? resolved.ticketNumber : generateTicket(),
            date: resolved.date,
            time: resolved.time,
            status: resolved.status,
            source: resolved.source,
            doctorDisplayNameAr: resolved.doctorDisplayNameAr,
            doctorDisplayNameEn: resolved.doctorDisplayNameEn,
            specialtyAr: resolved.specialtyAr,
            specialtyEn: resolved.specialtyEn,
            instructionsAr: resolved.instructionsAr,
            instructionsEn: resolved.instructionsEn,
            locationAr: resolved.locationAr,
            locationEn: resolved.locationEn,
            intakeData: resolved.intakeData as unknown as Prisma.InputJsonValue | undefined,
          },
        });
        return created.ticketNumber;
      } catch (err) {
        lastError = err;
        const code = (err as { code?: string }).code;
        if (code === 'P2002' && attempt < maxAttempts - 1) continue;
        throw err;
      }
    }
    throw lastError;
  },
};
