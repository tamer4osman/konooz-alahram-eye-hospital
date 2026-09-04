export type AttendanceStatus =
  | 'present'
  | 'absent'
  | 'on_leave'
  | 'late'
  | 'present_ontime'
  | 'in_surgery'
  | 'on_call';

export type StaffCategory =
  | 'surgeon'
  | 'consultant'
  | 'resident'
  | 'nurse'
  | 'technician'
  | 'admin';

export type ShiftType = 'morning' | 'evening' | 'night_call' | 'full_day';

export interface CreateAttendanceInput {
  staffId?: string;
  staffNameAr: string;
  staffNameEn?: string;
  roleAr?: string;
  roleEn?: string;
  avatar?: string;
  category?: StaffCategory;
  departmentAr?: string;
  departmentEn?: string;
  shiftType: ShiftType;
  shiftNameAr?: string;
  shiftNameEn?: string;
  shiftTiming?: string;
  scheduledTime?: string;
  badgeCode?: string;
}

export interface AttendancePatch {
  checkInTime?: string | null;
  checkOutTime?: string | null;
  status?: AttendanceStatus;
  notesAr?: string | null;
  notesEn?: string | null;
  overtimeHours?: number;
}

export class AttendanceNotFoundError extends Error {
  constructor() {
    super('Attendance record not found');
    this.name = 'AttendanceNotFoundError';
  }
}

/** Fully-resolved create payload the adapter persists verbatim. */
export interface ResolvedAttendanceCreate {
  staffId: string | null;
  staffNameAr: string;
  staffNameEn: string | null;
  roleAr: string;
  roleEn: string | null;
  avatar: string;
  category: StaffCategory;
  departmentAr: string;
  departmentEn: string | null;
  shiftType: ShiftType;
  shiftNameAr: string;
  shiftNameEn: string | null;
  shiftTiming: string;
  scheduledTime: string;
  badgeCode: string;
  date: Date;
}
