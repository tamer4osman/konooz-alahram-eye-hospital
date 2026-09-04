import type {
  CreateStaffMemberInput,
  MemberCategory,
  ResolvedStaffMemberCreate,
} from './types';
import { StaffMemberNameRequiredError } from './types';

// Pure business rules.

const CATEGORIES: MemberCategory[] = [
  'surgeon',
  'consultant',
  'resident',
  'nurse',
  'technician',
  'admin',
];

export const DEFAULT_CATEGORY: MemberCategory = 'nurse';
export const DEFAULT_STATUS = 'on_duty';
export const DEFAULT_SHIFT = 'morning';
const DEACTIVATED_STATUS = 'off_duty';

/** Unknown or missing categories fall back to nurse (defensive default). */
export function parseCategory(value: unknown): MemberCategory {
  return CATEGORIES.includes(value as MemberCategory) ? (value as MemberCategory) : DEFAULT_CATEGORY;
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function asStringOrNull(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

/**
 * Resolve staff-member create: name required, defensive string coercion on
 * every optional field, category fallback, status/shift defaults.
 * Sort order is assigned by the writer (max + 1).
 */
export function resolveStaffMemberCreate(
  body: CreateStaffMemberInput,
  nextSortOrder: number,
): ResolvedStaffMemberCreate {
  const nameAr = asStringOrNull(body.nameAr);
  if (!nameAr) {
    throw new StaffMemberNameRequiredError();
  }
  return {
    nameAr,
    nameEn: asStringOrNull(body.nameEn),
    roleAr: asString(body.roleAr),
    roleEn: asStringOrNull(body.roleEn),
    category: parseCategory(body.category),
    departmentAr: asString(body.departmentAr),
    departmentEn: asStringOrNull(body.departmentEn),
    status: asString(body.status) || DEFAULT_STATUS,
    shift: asString(body.shift) || DEFAULT_SHIFT,
    phone: asStringOrNull(body.phone),
    email: asStringOrNull(body.email),
    sortOrder: nextSortOrder,
  };
}

/** Soft-delete rule: deactivate keeps history, flips status to off_duty. */
export function resolveDeactivation(): { isActive: boolean; status: string } {
  return { isActive: false, status: DEACTIVATED_STATUS };
}
