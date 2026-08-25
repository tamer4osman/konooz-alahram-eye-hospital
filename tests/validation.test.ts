import { describe, expect, it } from 'vitest';
import { appointmentRequestSchema } from '@/lib/validation/appointments';

const VALID = {
  patientName: 'سالم الفيتوري',
  phone: '0912345678',
  specialtyId: 'cataract',
};

describe('appointmentRequestSchema', () => {
  it('accepts the minimal booking payload', () => {
    const res = appointmentRequestSchema.safeParse(VALID);
    expect(res.success).toBe(true);
  });

  it('requires patientName of at least 2 characters', () => {
    const res = appointmentRequestSchema.safeParse({ ...VALID, patientName: 'س' });
    expect(res.success).toBe(false);
  });

  it('requires a phone of at least 7 characters', () => {
    const res = appointmentRequestSchema.safeParse({ ...VALID, phone: '091' });
    expect(res.success).toBe(false);
  });

  it('rejects an empty specialtyId', () => {
    const res = appointmentRequestSchema.safeParse({ ...VALID, specialtyId: '' });
    expect(res.success).toBe(false);
  });

  it('accepts an empty-string email (optional field) but rejects malformed non-empty email', () => {
    expect(appointmentRequestSchema.safeParse({ ...VALID, email: '' }).success).toBe(true);
    expect(appointmentRequestSchema.safeParse({ ...VALID, email: 'not-an-email' }).success).toBe(false);
    expect(appointmentRequestSchema.safeParse({ ...VALID, email: 'a@b.ly' }).success).toBe(true);
  });

  it('caps notes at 2000 characters', () => {
    const res = appointmentRequestSchema.safeParse({ ...VALID, notes: 'x'.repeat(2001) });
    expect(res.success).toBe(false);
  });

  it('ignores unknown keys instead of failing the whole payload', () => {
    const res = appointmentRequestSchema.safeParse({ ...VALID, injectedField: '<script>' });
    expect(res.success).toBe(true);
    if (res.success) expect('injectedField' in res.data).toBe(false);
  });
});
