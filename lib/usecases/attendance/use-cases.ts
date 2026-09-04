import type { StaffAttendanceRecord as AttendanceDTO } from '@/data/dashboardData';
import type {
  AttendancePatch,
  CreateAttendanceInput,
} from './types';
import type { AttendanceReader, AttendanceWriter } from './ports';
import { resolveAttendanceCreate, resolveAttendancePatch } from './rules';

// Use cases: orchestration only. Typed errors (AttendanceNotFoundError)
// propagate from the adapter.

export async function listAttendance(
  reader: AttendanceReader,
): Promise<AttendanceDTO[]> {
  return reader.list();
}

export async function createAttendance(
  writer: AttendanceWriter,
  input: CreateAttendanceInput,
  now: Date = new Date(),
): Promise<AttendanceDTO> {
  return writer.create(resolveAttendanceCreate(input, now));
}

export async function updateAttendance(
  writer: AttendanceWriter,
  id: string,
  patch: AttendancePatch,
): Promise<AttendanceDTO> {
  return writer.update(id, resolveAttendancePatch(patch));
}

export async function deleteAttendance(
  writer: AttendanceWriter,
  id: string,
): Promise<void> {
  await writer.delete(id);
}
