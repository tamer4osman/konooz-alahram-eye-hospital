import type { ClinicalConsultationRecord as ClinicalDTO } from '@/data/dashboardData';
import type { CreateClinicalInput } from './types';
import type { ClinicalReader, ClinicalWriter, LinkedProfileReader } from './ports';
import { resolveClinicalCreate, resolveAccountLink } from './rules';

// Use cases: orchestration only. Actor email is supplied by the route from
// the auth gate; the writer stores it as the audit trail.

export async function listClinicalRecords(reader: ClinicalReader): Promise<ClinicalDTO[]> {
  return reader.list();
}

/**
 * D5: staff pick a portal *account* in the UI; the record links to the
 * patient *profile* (the FK target). An account that resolves to nothing
 * means the picker was fed a stale id — that is an honest 404-class failure,
 * not a silent unlinked write.
 */
export async function createClinicalRecord(
  writer: ClinicalWriter,
  links: LinkedProfileReader,
  input: CreateClinicalInput,
  actorEmail: string,
  now: Date = new Date(),
): Promise<ClinicalDTO> {
  const accountId = resolveAccountLink(input.patientRefId);
  let patientRefId: string | null = null;
  if (accountId) {
    patientRefId = await links.profileIdForAccount(accountId);
    if (!patientRefId) throw new PatientLinkNotFoundError();
  }
  return writer.create(resolveClinicalCreate({ ...input, patientRefId: patientRefId ?? undefined }, now), actorEmail);
}

export class PatientLinkNotFoundError extends Error {
  constructor() {
    super('The selected patient account could not be linked');
    this.name = 'PatientLinkNotFoundError';
  }
}
