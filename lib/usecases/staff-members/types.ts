export type MemberCategory =
  | 'surgeon'
  | 'consultant'
  | 'resident'
  | 'nurse'
  | 'technician'
  | 'admin';

export interface CreateStaffMemberInput {
  nameAr?: unknown;
  nameEn?: unknown;
  roleAr?: unknown;
  roleEn?: unknown;
  category?: unknown;
  departmentAr?: unknown;
  departmentEn?: unknown;
  status?: unknown;
  shift?: unknown;
  phone?: unknown;
  email?: unknown;
}

export interface ResolvedStaffMemberCreate {
  nameAr: string;
  nameEn: string | null;
  roleAr: string;
  roleEn: string | null;
  category: MemberCategory;
  departmentAr: string;
  departmentEn: string | null;
  status: string;
  shift: string;
  phone: string | null;
  email: string | null;
  sortOrder: number;
}

export class StaffMemberNameRequiredError extends Error {
  constructor() {
    super('Staff name is required');
    this.name = 'StaffMemberNameRequiredError';
  }
}
