import type { ResolvedStaffMemberCreate } from './types';

// Per-use-case minimal ports (ISP). The directory reader lists active
// members; the directory writer persists with next-position ordering.

export interface StaffDirectoryReader {
  listActive(): Promise<Array<Record<string, unknown>>>;
}

export interface StaffDirectoryWriter {
  /** Returns the current max sortOrder (or -1 when empty). */
  maxSortOrder(): Promise<number>;
  create(resolved: ResolvedStaffMemberCreate): Promise<Record<string, unknown>>;
  updateStatus(id: string, status: string): Promise<Record<string, unknown>>;
  deactivate(id: string): Promise<void>;
}
