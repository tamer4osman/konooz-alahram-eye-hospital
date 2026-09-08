import { describe, expect, it } from 'vitest';
import {
  AUDIT_RETENTION_DAYS_DEFAULT,
  AUDIT_RETENTION_DAYS_MIN,
  auditRetentionCutoff,
  expiredSessionFilter,
} from '@/lib/usecases/maintenance/rules';

describe('expiredSessionFilter', () => {
  it('matches only rows whose expiry is before the given instant', () => {
    const now = new Date('2026-09-08T12:00:00.000Z');
    const filter = expiredSessionFilter(now);
    expect(filter.expiresAt.lt.getTime()).toBe(now.getTime());
  });

  it('returns a copy of the date, never the caller\'s instance', () => {
    const now = new Date('2026-09-08T12:00:00.000Z');
    const filter = expiredSessionFilter(now);
    expect(filter.expiresAt.lt).not.toBe(now);
  });
});

describe('auditRetentionCutoff', () => {
  it('subtracts the requested number of days', () => {
    const now = new Date('2026-09-08T12:00:00.000Z');
    expect(auditRetentionCutoff(now, 30).toISOString()).toBe('2026-08-09T12:00:00.000Z');
  });

  it('defaults to 2 years (730 days)', () => {
    const now = new Date('2026-09-08T12:00:00.000Z');
    expect(AUDIT_RETENTION_DAYS_DEFAULT).toBe(730);
    expect(auditRetentionCutoff(now).toISOString()).toBe('2024-09-08T12:00:00.000Z');
  });

  it('rejects retention shorter than the minimum', () => {
    expect(AUDIT_RETENTION_DAYS_MIN).toBe(30);
    expect(() => auditRetentionCutoff(new Date(), 7)).toThrow('>= 30');
    expect(() => auditRetentionCutoff(new Date(), Number.NaN)).toThrow();
  });
});
