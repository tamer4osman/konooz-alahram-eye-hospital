import { getDepartments } from '@/lib/departments';
import type { DepartmentsReader } from '@/lib/usecases/analytics';
import type { Specialty } from '@/data/hospitalData';

// Prisma-backed adapter: reuses the existing departments data function
// (lib/departments.ts) which maps DB rows to the Specialty DTO.

export const prismaDepartmentsReader: DepartmentsReader = {
  async listActive(): Promise<Specialty[]> {
    return getDepartments();
  },
};
