/**
 * DPay payment gateway HTTP client.
 *
 * Framework-free adapter (no next/* imports, injectable fetch) implementing
 * the session subset of https://dpay.ly/docs/api:
 *   POST {base}/payment/sessions/open
 *   POST {base}/payment/sessions/verify
 *   GET  {base}/payment/sessions/{id}
 *
 * The base URL switches between live (`https://dpay.ly/api`) and sandbox
 * (`https://dpay.ly/api/sandbox`) via env config — one env change to go live.
 *
 * Verified live against the sandbox (2026-09-08 spike):
 *  - Session open returns fee/total with the fee ADDED on top of `amount`.
 *  - `data` metadata round-trips (used for konoozInvoiceNumber correlation).
 *  - Sandbox verify returns the flat shape; live may return a nested
 *    `payment` object — both are normalized.
 *  - Sessions expire (expired_at); statuses: pending → paid/failed/expired.
 */

export type DpayErrorCode =
  | 'VALIDATION'
  | 'AUTH'
  | 'NOT_FOUND'
  | 'GATEWAY'
  | 'NETWORK';

export class DpayError extends Error {
  readonly code: DpayErrorCode;
  readonly status: number;
  readonly fieldErrors?: Record<string, string[]>;

  constructor(params: {
    code: DpayErrorCode;
    status: number;
    message: string;
    fieldErrors?: Record<string, string[]>;
  }) {
    super(params.message);
    this.name = 'DpayError';
    this.code = params.code;
    this.status = params.status;
    this.fieldErrors = params.fieldErrors;
  }
}

export interface DpayOpenSessionInput {
  payMethod: string;
  /** Amount in LYD, 2dp decimal-safe number. */
  amount: number;
  /** EDFali / Sadad — customer mobile (09XXXXXXXX). */
  customerMobile?: string;
  /** Sadad — 4-digit birth year, cross-checked against wallet registration. */
  birthYear?: string;
  description?: string;
  /** Custom metadata — DPay echoes it back on webhooks and session GET. */
  data?: Record<string, unknown>;
}

export interface DpayOpenSessionResult {
  sessionId: number;
  status: string;
  amount: number;
  total: number;
  payMethod: string;
  expiredAt: string | null;
  /** Moamalat only — hosted LightBox URL to redirect the customer to. */
  paymentLink: string | null;
  data: unknown;
}

export interface DpayVerifyResult {
  status: string;
  paymentId: number | null;
  txId: string | null;
  receiptUrl: string | null;
}

export interface DpaySessionResult {
  sessionId: number;
  status: string;
  amount: number;
  payMethod: string;
  txId: string | null;
  expiredAt: string | null;
  data: unknown;
}

export interface DpayClientConfig {
  baseUrl: string;
  token: string;
  fetch?: typeof fetch;
  idempotencyKeyFactory?: () => string;
  /** Request timeout in ms. Default 15s — DPay webhooks must answer < 15s. */
  timeoutMs?: number;
}

type FetchLike = typeof fetch;

/** Minimal request shape — structurally compatible with the DOM RequestInit. */
interface FetchInit {
  method: string;
  headers: Record<string, string>;
  body?: string;
  signal?: AbortSignal;
}

const DEFAULT_TIMEOUT_MS = 15_000;

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null
    ? (value as Record<string, unknown>)
    : {};
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function mapHttpStatus(status: number): DpayErrorCode {
  if (status === 401 || status === 403) return 'AUTH';
  if (status === 404) return 'NOT_FOUND';
  if (status === 422) return 'VALIDATION';
  return 'GATEWAY';
}

export function createDpayClient(config: DpayClientConfig) {
  const baseUrl = config.baseUrl.replace(/\/+$/, '');
  const doFetch: FetchLike = config.fetch ?? fetch;
  const idempotencyKeyFactory =
    config.idempotencyKeyFactory ?? (() => crypto.randomUUID());
  const timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
    return {
      Authorization: `Bearer ${config.token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...extra,
    };
  }

  async function request(
    url: string,
    init: FetchInit,
  ): Promise<Record<string, unknown>> {
    let response: Response;
    try {
      response = await doFetch(url, init);
    } catch {
      throw new DpayError({
        code: 'NETWORK',
        status: 0,
        message: 'DPay gateway is unreachable',
      });
    }

    const rawText = await response.text();
    let body: unknown = null;
    if (rawText.length > 0) {
      try {
        body = JSON.parse(rawText);
      } catch {
        body = null;
      }
    }

    if (!response.ok) {
      const record = asRecord(body);
      const fieldErrors =
        typeof record.errors === 'object' && record.errors !== null
          ? (record.errors as Record<string, string[]>)
          : undefined;
      throw new DpayError({
        code: mapHttpStatus(response.status),
        status: response.status,
        message:
          asString(record.message) ??
          `DPay request failed with status ${response.status}`,
        fieldErrors,
      });
    }

    if (body === null || typeof body !== 'object') {
      throw new DpayError({
        code: 'GATEWAY',
        status: response.status,
        message: 'DPay returned a malformed success response',
      });
    }

    return body as Record<string, unknown>;
  }

  function signal(): AbortSignal {
    return AbortSignal.timeout(timeoutMs);
  }

  return {
    openSession(input: DpayOpenSessionInput): Promise<DpayOpenSessionResult> {
      const payload: Record<string, unknown> = {
        pay_method: input.payMethod,
        amount: input.amount,
      };
      if (input.customerMobile) payload.customer_mobile = input.customerMobile;
      if (input.birthYear) payload.birth_year = input.birthYear;
      if (input.description) payload.description = input.description;
      if (input.data) payload.data = input.data;

      return request(`${baseUrl}/payment/sessions/open`, {
        method: 'POST',
        headers: authHeaders({ 'Idempotency-Key': idempotencyKeyFactory() }),
        body: JSON.stringify(payload),
        signal: signal(),
      }).then((body) => ({
        sessionId: Number(body.session_id),
        status: String(body.status ?? 'pending'),
        amount: Number(body.amount ?? input.amount),
        total: Number(body.total ?? input.amount),
        payMethod: String(body.pay_method ?? input.payMethod),
        expiredAt: asString(body.expired_at),
        paymentLink: asString(body.payment_link),
        data: body.data ?? null,
      }));
    },

    verifyOtp(sessionId: number, otp: string): Promise<DpayVerifyResult> {
      return request(`${baseUrl}/payment/sessions/verify`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ session_id: sessionId, otp }),
        signal: signal(),
      }).then((body) => {
        // Sandbox returns the flat shape; live docs add a nested `payment`.
        const nested = asRecord(body.payment);
        return {
          status: String(body.status ?? nested.status ?? 'unknown'),
          paymentId:
            Number(body.payment_id ?? nested.id) || null,
          txId: asString(body.tx_id) ?? asString(nested.tx_id),
          receiptUrl: asString(body.receipt_url),
        };
      });
    },

    getSession(sessionId: number): Promise<DpaySessionResult> {
      return request(
        `${baseUrl}/payment/sessions/${encodeURIComponent(String(sessionId))}`,
        { method: 'GET', headers: authHeaders(), signal: signal() },
      ).then((body) => ({
        sessionId: Number(body.session_id ?? sessionId),
        status: String(body.status ?? 'unknown'),
        amount: Number(body.amount ?? 0),
        payMethod: String(body.pay_method ?? ''),
        txId: asString(body.tx_id),
        expiredAt: asString(body.expired_at),
        data: body.data ?? null,
      }));
    },
  };
}

export type DpayClient = ReturnType<typeof createDpayClient>;
