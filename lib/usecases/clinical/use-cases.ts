import type { ClinicalConsultationRecord as ClinicalDTO } from '@/data/dashboardData';
import type { CreateClinicalInput } from './types';
import type { ClinicalReader, ClinicalWriter } from './ports';
import { resolveClinicalCreate } from './rules';

// Use cases: orchestration only. Actor email is supplied by the route from
// the auth gate; the writer stores it as the audit trail.

export async function listClinicalRecords(reader: ClinicalReader): Promise<ClinicalDTO[]> {
  return reader.list();
}

export async function createClinicalRecord(
  writer: ClinicalWriter,
  input: CreateClinicalInput,
  actorEmail: string,
  now: Date = new Date(),
): Promise<ClinicalDTO> {
  return writer.create(resolveClinicalCreate(input, now), actorEmail);
}
