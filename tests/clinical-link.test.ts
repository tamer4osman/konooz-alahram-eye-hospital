import { describe, expect, it } from 'vitest';
import { resolveAccountLink } from '@/lib/usecases/clinical/rules';

// D5: staff-authored records may link to a portal account at entry time.
// The link is optional — walk-ins without an account stay unlinked, and an
// empty/whitespace value is treated as "no link" rather than an error.

describe('resolveAccountLink', () => {
  it('passes through a non-empty account id', () => {
    expect(resolveAccountLink('acc_123')).toBe('acc_123');
  });

  it('trims surrounding whitespace', () => {
    expect(resolveAccountLink('  acc_123  ')).toBe('acc_123');
  });

  it('maps empty string to null', () => {
    expect(resolveAccountLink('')).toBeNull();
  });

  it('maps whitespace-only to null', () => {
    expect(resolveAccountLink('   ')).toBeNull();
  });

  it('maps undefined to null', () => {
    expect(resolveAccountLink(undefined)).toBeNull();
  });
});

import { vi, beforeEach } from 'vitest';
import { createClinicalRecord, PatientLinkNotFoundError } from '@/lib/usecases/clinical';
import type { ClinicalWriter, LinkedProfileReader } from '@/lib/usecases/clinical';

let writer: ClinicalWriter;

beforeEach(() => {
  writer = {
    create: vi.fn(async (resolved) => ({ id: 'r1', patientRefId: resolved.patientRefId } as never)),
  };
});

function links(resolvesTo: string | null): LinkedProfileReader {
  return { profileIdForAccount: vi.fn().mockResolvedValue(resolvesTo) };
}

describe('createClinicalRecord account linking (D5)', () => {
  it('resolves accountId -> profileId before writing', async () => {
    const l = links('prof_1');
    await createClinicalRecord(writer, l, { patientNameAr: 'x', patientRefId: 'acc_1' }, 'a@b.c');
    expect(l.profileIdForAccount).toHaveBeenCalledWith('acc_1');
    expect(writer.create).toHaveBeenCalledWith(expect.objectContaining({ patientRefId: 'prof_1' }), 'a@b.c');
  });

  it('writes an unlinked record when no account is supplied (walk-in)', async () => {
    const l = links('prof_1');
    await createClinicalRecord(writer, l, { patientNameAr: 'x' }, 'a@b.c');
    expect(l.profileIdForAccount).not.toHaveBeenCalled();
    expect(writer.create).toHaveBeenCalledWith(expect.objectContaining({ patientRefId: null }), 'a@b.c');
  });

  it('throws PatientLinkNotFoundError for an unresolvable account', async () => {
    await expect(
      createClinicalRecord(writer, links(null), { patientNameAr: 'x', patientRefId: 'ghost' }, 'a@b.c'),
    ).rejects.toBeInstanceOf(PatientLinkNotFoundError);
    expect(writer.create).not.toHaveBeenCalled();
  });
});
