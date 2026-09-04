import type {
  ResolvedSurgeryCreate,
  SurgeryPatch,
} from './types';
import type { ScheduledSurgery as SurgeryDTO } from '@/data/dashboardData';

// Per-use-case minimal ports (ISP).

export interface SurgeryReader {
  list(): Promise<SurgeryDTO[]>;
}

export interface SurgeryWriter {
  create(resolved: ResolvedSurgeryCreate): Promise<SurgeryDTO>;
  update(id: string, patch: SurgeryPatch): Promise<SurgeryDTO>;
  delete(id: string): Promise<void>;
}
