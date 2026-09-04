import type { DoctorLookupResult, ResolvedAppointmentCreate } from './types';

// Per-use-case minimal ports (ISP): the doctor reader resolves the snapshot,
// the writer persists the resolved record and retries ticket collisions.
// Prisma types never cross this boundary.

export interface DoctorReader {
  findSnapshot(doctorId: string): Promise<DoctorLookupResult>;
}

export interface AppointmentWriter {
  /** Persist the resolved record; retry internally on ticket-number collision. */
  createWithRetry(resolved: ResolvedAppointmentCreate, maxAttempts?: number): Promise<string>;
}
