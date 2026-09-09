import { createDpayClient, type DpayClient } from './client';

// Environment-driven client factory. Sandbox vs live is a single env var —
// no code change needed at go-live:
//   DPAY_BASE_URL=https://dpay.ly/api/sandbox  (sandbox)
//   DPAY_BASE_URL=https://dpay.ly/api          (live)
//
// Missing credentials are fatal at use time, not import time, so builds and
// non-payment routes keep working on machines without the integration.

let cachedConfigError: string | null = null;

export function getDpayClient(): DpayClient {
  const baseUrl = process.env.DPAY_BASE_URL;
  const token = process.env.DPAY_API_TOKEN;
  if (!baseUrl || !token) {
    cachedConfigError =
      'DPAY_BASE_URL and DPAY_API_TOKEN must both be set';
    throw new Error(cachedConfigError);
  }
  return createDpayClient({ baseUrl, token });
}

export function getDpayWebhookSecret(): string {
  const secret = process.env.DPAY_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error('DPAY_WEBHOOK_SECRET must be set');
  }
  return secret;
}
