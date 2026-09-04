import type {
  CreateSurgeryInput,
  ResolvedSurgeryCreate,
  SurgeryPatch,
} from './types';
import { SurgeryNameRequiredError } from './types';

// Pure business rules.

/** Default surgical duration (minutes) when the scheduler does not estimate one. */
export const DEFAULT_DURATION_MIN = 60;

/** Default procedure label when neither language supplies one. */
export const FALLBACK_PROCEDURE_AR = 'إجراء جراحي';

/**
 * Resolve surgery create:
 * - patient name required in at least one language (bilingual fallback fills the other)
 * - procedure bilingual fallback, generic AR label when absent
 * - default duration 60min, priority elective, status scheduled, scheduledAt = now
 */
export function resolveSurgeryCreate(
  input: CreateSurgeryInput,
  now: Date,
): ResolvedSurgeryCreate {
  const patientAr = input.patientNameAr ?? input.patientNameEn ?? null;
  const patientEn = input.patientNameEn ?? input.patientNameAr ?? null;
  if (!patientAr && !patientEn) {
    throw new SurgeryNameRequiredError();
  }
  return {
    procedureAr: input.procedureAr ?? input.procedureEn ?? FALLBACK_PROCEDURE_AR,
    procedureEn: input.procedureEn ?? input.procedureAr ?? null,
    scheduledAt: now,
    durationMin: input.estimatedDurationMin ?? DEFAULT_DURATION_MIN,
    status: 'scheduled',
    patientNameAr: patientAr!,
    patientNameEn: patientEn,
    patientPhone: input.patientPhone ?? '',
    patientAge: input.patientAge ?? null,
    gender: input.gender === 'female' ? 'FEMALE' : 'MALE',
    surgeonNameAr: input.surgeonAr ?? '',
    surgeonNameEn: input.surgeonEn ?? null,
    specialtyId: input.specialtyId ?? '',
    roomCode: input.roomCode ?? '',
    time: input.time ?? '',
    priority: input.priority ?? 'elective',
    anesthesiaTypeAr: input.anesthesiaTypeAr ?? '',
    anesthesiaTypeEn: input.anesthesiaTypeEn ?? null,
  };
}

/**
 * Surgery status transitions carry no automatic side effects today (OR
 * timestamps are managed by the patient-flow module). Single place to add
 * derivations later (e.g. in_or → reserve recovery bed).
 */
export function resolveSurgeryPatch(patch: SurgeryPatch): SurgeryPatch {
  return { ...patch };
}
