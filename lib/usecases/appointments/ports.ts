import type {
  DoctorLookupResult,
  LiveAppointmentStatus,
  ResolvedAppointmentCreate,
  ResolvedStatusPatch,
} from './types';

// Per-use-case minimal ports (ISP): the doctor reader resolves the snapshot,
// the writer persists the resolved record and retries ticket collisions, the
// status patcher updates one appointment's lifecycle state. Prisma types never
// cross this boundary.

export interface DoctorReader {
  findSnapshot(doctorId: string): Promise<DoctorLookupResult>;
}

export interface AppointmentWriter {
  /** Persist the resolved record; retry internally on ticket-number collision. */
  createWithRetry(resolved: ResolvedAppointmentCreate, maxAttempts?: number): Promise<string>;
}

export interface AppointmentStatusReader {
  /** Current status of one appointment, or null if it does not exist. */
  findStatus(id: string): Promise<LiveAppointmentStatus | null>;
}

export interface AppointmentStatusWriter {
  applyStatusPatch(id: string, patch: ResolvedStatusPatch): Promise<void>;
}
