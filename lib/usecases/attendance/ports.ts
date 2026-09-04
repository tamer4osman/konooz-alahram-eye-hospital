import type { ResolvedAttendanceCreate, AttendancePatch } from './types';
import type { StaffAttendanceRecord as AttendanceDTO } from '@/data/dashboardData';

// Per-use-case minimal ports (ISP).

export interface AttendanceReader {
  list(): Promise<AttendanceDTO[]>;
}

export interface AttendanceWriter {
  create(resolved: ResolvedAttendanceCreate): Promise<AttendanceDTO>;
  update(id: string, patch: AttendancePatch): Promise<AttendanceDTO>;
  delete(id: string): Promise<void>;
}
