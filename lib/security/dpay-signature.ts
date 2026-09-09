import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * DPay webhook signature verification.
 *
 * Per https://dpay.ly/docs/api — Merchant Webhooks:
 *   signature = hmac_sha256(timestamp + '.' + raw_body, secret)
 *   Headers: X-DPAY-Timestamp (unix seconds), X-DPAY-Signature (64 hex chars).
 * Reject requests whose timestamp is more than 5 minutes old (replay window).
 * Comparison is constant-time to avoid timing oracles.
 */

const DPAY_MAX_TIMESTAMP_AGE_MS = 5 * 60 * 1000;
/** Small allowance for clock skew between DPay and our server. */
const FUTURE_SKEW_MS = 60 * 1000;

export type DpaySignatureFailureReason =
  | 'missing_fields'
  | 'stale_timestamp'
  | 'signature_mismatch';

export type DpaySignatureResult =
  | { valid: true }
  | { valid: false; reason: DpaySignatureFailureReason };

export function computeDpaySignature(
  timestamp: string,
  rawBody: string,
  secret: string,
): string {
  return createHmac('sha256', secret)
    .update(`${timestamp}.${rawBody}`)
    .digest('hex');
}

function safeEqualHex(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function verifyDpaySignature(params: {
  timestamp: string | null;
  signature: string | null;
  rawBody: string;
  secret: string;
  now?: Date;
}): DpaySignatureResult {
  const { timestamp, signature, rawBody, secret } = params;
  const now = params.now ?? new Date();

  if (!timestamp || !signature) {
    return { valid: false, reason: 'missing_fields' };
  }

  const tsSeconds = Number(timestamp);
  if (!Number.isFinite(tsSeconds)) {
    return { valid: false, reason: 'stale_timestamp' };
  }

  const ageMs = now.getTime() - tsSeconds * 1000;
  if (ageMs > DPAY_MAX_TIMESTAMP_AGE_MS || ageMs < -FUTURE_SKEW_MS) {
    return { valid: false, reason: 'stale_timestamp' };
  }

  const expected = computeDpaySignature(timestamp, rawBody, secret);
  if (!safeEqualHex(expected, signature.toLowerCase())) {
    return { valid: false, reason: 'signature_mismatch' };
  }

  return { valid: true };
}
