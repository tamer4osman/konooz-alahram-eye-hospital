import { describe, it, expect } from 'vitest';
import { createHmac } from 'node:crypto';
import {
  computeDpaySignature,
  verifyDpaySignature,
} from '@/lib/security/dpay-signature';

const SECRET = 'whsec_test_secret';
const BODY = JSON.stringify({
  event: 'payment.paid',
  session_id: 42,
  status: 'paid',
  amount: 100,
});

function signAt(timestamp: string, body: string, secret = SECRET): string {
  return computeDpaySignature(timestamp, body, secret);
}

const NOW = new Date('2026-09-08T23:00:00.000Z');

function tsOffsetSeconds(offsetMs: number): string {
  return String(Math.floor((NOW.getTime() + offsetMs) / 1000));
}

describe('computeDpaySignature', () => {
  it('matches the documented formula hmac_sha256(timestamp + "." + body, secret)', () => {
    const timestamp = tsOffsetSeconds(0);
    const expected = createHmac('sha256', SECRET)
      .update(`${timestamp}.${BODY}`)
      .digest('hex');
    expect(computeDpaySignature(timestamp, BODY, SECRET)).toBe(expected);
  });
});

describe('verifyDpaySignature', () => {
  const base = {
    rawBody: BODY,
    secret: SECRET,
    now: NOW,
  };

  it('accepts a valid current signature', () => {
    const timestamp = tsOffsetSeconds(0);
    expect(
      verifyDpaySignature({
        ...base,
        timestamp,
        signature: signAt(timestamp, BODY),
      }),
    ).toEqual({ valid: true });
  });

  it('accepts a signature inside the 5-minute window', () => {
    const timestamp = tsOffsetSeconds(-4 * 60 * 1000);
    expect(
      verifyDpaySignature({
        ...base,
        timestamp,
        signature: signAt(timestamp, BODY),
      }),
    ).toEqual({ valid: true });
  });

  it('accepts a small clock skew (future timestamp within 60s)', () => {
    const timestamp = tsOffsetSeconds(30 * 1000);
    expect(
      verifyDpaySignature({
        ...base,
        timestamp,
        signature: signAt(timestamp, BODY),
      }),
    ).toEqual({ valid: true });
  });

  it('accepts an uppercase-hex signature (case-insensitive compare)', () => {
    const timestamp = tsOffsetSeconds(0);
    const sig = signAt(timestamp, BODY).toUpperCase();
    expect(
      verifyDpaySignature({ ...base, timestamp, signature: sig }),
    ).toEqual({ valid: true });
  });

  // ── Worst-case scenarios ────────────────────────────────────────────────

  it('rejects a tampered body', () => {
    const timestamp = tsOffsetSeconds(0);
    const sig = signAt(timestamp, BODY);
    const tampered = BODY.replace('"amount":100', '"amount":999999');
    const result = verifyDpaySignature({
      ...base,
      rawBody: tampered,
      timestamp,
      signature: sig,
    });
    expect(result).toEqual({ valid: false, reason: 'signature_mismatch' });
  });

  it('rejects a signature computed with a different secret', () => {
    const timestamp = tsOffsetSeconds(0);
    const sig = signAt(timestamp, BODY, 'attacker-secret');
    const result = verifyDpaySignature({ ...base, timestamp, signature: sig });
    expect(result).toEqual({ valid: false, reason: 'signature_mismatch' });
  });

  it('rejects a timestamp older than 5 minutes (replay attack)', () => {
    const timestamp = tsOffsetSeconds(-6 * 60 * 1000);
    const sig = signAt(timestamp, BODY);
    const result = verifyDpaySignature({ ...base, timestamp, signature: sig });
    expect(result).toEqual({ valid: false, reason: 'stale_timestamp' });
  });

  it('rejects a far-future timestamp (clock-shift replay)', () => {
    const timestamp = tsOffsetSeconds(10 * 60 * 1000);
    const sig = signAt(timestamp, BODY);
    const result = verifyDpaySignature({ ...base, timestamp, signature: sig });
    expect(result).toEqual({ valid: false, reason: 'stale_timestamp' });
  });

  it('rejects missing timestamp header', () => {
    const timestamp = tsOffsetSeconds(0);
    expect(
      verifyDpaySignature({
        ...base,
        timestamp: null,
        signature: signAt(timestamp, BODY),
      }),
    ).toEqual({ valid: false, reason: 'missing_fields' });
  });

  it('rejects missing signature header', () => {
    const timestamp = tsOffsetSeconds(0);
    expect(
      verifyDpaySignature({
        ...base,
        timestamp,
        signature: null,
      }),
    ).toEqual({ valid: false, reason: 'missing_fields' });
  });

  it('rejects a non-numeric timestamp (header injection attempt)', () => {
    const result = verifyDpaySignature({
      ...base,
      timestamp: '1729598400; DROP TABLE sessions',
      signature: 'a'.repeat(64),
    });
    expect(result).toEqual({ valid: false, reason: 'stale_timestamp' });
  });

  it('rejects a wrong-length signature without throwing', () => {
    const timestamp = tsOffsetSeconds(0);
    const result = verifyDpaySignature({
      ...base,
      timestamp,
      signature: 'short',
    });
    expect(result).toEqual({ valid: false, reason: 'signature_mismatch' });
  });

  it('rejects a huge forged signature without throwing', () => {
    const timestamp = tsOffsetSeconds(0);
    const result = verifyDpaySignature({
      ...base,
      timestamp,
      signature: 'f'.repeat(10_000),
    });
    expect(result).toEqual({ valid: false, reason: 'signature_mismatch' });
  });
});
