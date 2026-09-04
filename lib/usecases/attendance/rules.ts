import type {
  AttendancePatch,
  CreateAttendanceInput,
  ResolvedAttendanceCreate,
} from './types';

// Pure business rules.

/** Default staff category when the caller does not classify the person. */
export const DEFAULT_CATEGORY: ResolvedAttendanceCreate['category'] = 'consultant';

/**
 * Resolve attendance create: empty-string defaults for display fields,
 * consultant as default category, record dated "now" (today's roll call).
 */
export function resolveAttendanceCreate(
  input: CreateAttendanceInput,
  now: Date,
): ResolvedAttendanceCreate {
  return {
    staffId: input.staffId ?? null,
    staffNameAr: input.staffNameAr,
    staffNameEn: input.staffNameEn ?? null,
    roleAr: input.roleAr ?? '',
    roleEn: input.roleEn ?? null,
    avatar: input.avatar ?? '',
    category: input.category ?? DEFAULT_CATEGORY,
    departmentAr: input.departmentAr ?? '',
    departmentEn: input.departmentEn ?? null,
    shiftType: input.shiftType,
    shiftNameAr: input.shiftNameAr ?? '',
    shiftNameEn: input.shiftNameEn ?? null,
    shiftTiming: input.shiftTiming ?? '',
    scheduledTime: input.scheduledTime ?? '',
    badgeCode: input.badgeCode ?? '',
    date: now,
  };
}

/**
 * Attendance patch carries no automatic transitions today: check-in/out and
 * status are independent clinic operations. The rule exists as the single
 * place to add derivations (e.g. late = checkIn after scheduledTime).
 */
export function resolveAttendancePatch(patch: AttendancePatch): AttendancePatch {
  return { ...patch };
}
