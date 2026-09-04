import type { ResolvedClinicalCreate } from './types';
import type { ClinicalConsultationRecord as ClinicalDTO } from '@/data/dashboardData';

// Per-use-case minimal ports (ISP).

export interface ClinicalReader {
  list(): Promise<ClinicalDTO[]>;
}

export interface ClinicalWriter {
  create(resolved: ResolvedClinicalCreate, actorEmail: string): Promise<ClinicalDTO>;
}
