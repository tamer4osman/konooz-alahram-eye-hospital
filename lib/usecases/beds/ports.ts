import type { BedPatch, ResolvedBedCreate } from './types';
import type { HospitalBed as BedDTO } from '@/data/dashboardData';

// Per-use-case minimal ports (ISP).

export interface BedReader {
  list(): Promise<BedDTO[]>;
}

export interface BedWriter {
  create(resolved: ResolvedBedCreate): Promise<BedDTO>;
  update(id: string, patch: BedPatch): Promise<BedDTO>;
}
