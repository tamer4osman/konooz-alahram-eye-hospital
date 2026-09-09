import { describe, it, expect, vi } from 'vitest';
import { createDpayClient, DpayError } from '@/lib/adapters/dpay/client';

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function makeClient(overrides?: Partial<Parameters<typeof createDpayClient>[0]>) {
  const fetchStub = vi.fn();
  const client = createDpayClient({
    baseUrl: 'https://dpay.ly/api/sandbox',
    token: 'test-token',
    fetch: fetchStub as unknown as typeof fetch,
    idempotencyKeyFactory: () => 'fixed-key',
    ...overrides,
  });
  return { client, fetchStub };
}

const OPEN_RESPONSE = {
  message: 'Payment session created successfully',
  session_id: 1767,
  status: 'pending',
  amount: 100,
  fee: 0.2,
  fee_amount: 0.2,
  total: 100.2,
  pay_method: 'edfali',
  expired_at: '2026-09-08T22:26:26.000000Z',
  data: { konoozInvoiceNumber: 'INV-1' },
  sandbox: true,
};

describe('createDpayClient.openSession', () => {
  it('POSTs to the sandbox base URL with Bearer auth and idempotency key', async () => {
    const { client, fetchStub } = makeClient();
    fetchStub.mockResolvedValue(jsonResponse(200, OPEN_RESPONSE));

    await client.openSession({
      payMethod: 'edfali',
      amount: 100,
      customerMobile: '0912345678',
      data: { konoozInvoiceNumber: 'INV-1' },
    });

    expect(fetchStub).toHaveBeenCalledTimes(1);
    const callArgs = fetchStub.mock.calls[0] as unknown[];
    const url = callArgs[0] as string;
    const init = callArgs[1] as { method: string; headers: Record<string, string>; body: string; signal: AbortSignal };
    expect(url).toBe('https://dpay.ly/api/sandbox/payment/sessions/open');
    expect(init.method).toBe('POST');
    const headers = init.headers;
    expect(headers.Authorization).toBe('Bearer test-token');
    expect(headers['Content-Type']).toBe('application/json');
    expect(headers['Idempotency-Key']).toBe('fixed-key');
    const body = JSON.parse(init.body);
    expect(body).toEqual({
      pay_method: 'edfali',
      amount: 100,
      customer_mobile: '0912345678',
      data: { konoozInvoiceNumber: 'INV-1' },
    });
  });

  it('normalizes the session response including an optional payment link', async () => {
    const { client, fetchStub } = makeClient();
    fetchStub.mockResolvedValue(
      jsonResponse(200, {
        ...OPEN_RESPONSE,
        pay_method: 'moamalat',
        payment_link: 'https://dpay.ly/sandbox/moamalat-pay/1768/abc',
      }),
    );

    const result = await client.openSession({
      payMethod: 'moamalat',
      amount: 100,
    });

    expect(result).toMatchObject({
      sessionId: 1767,
      status: 'pending',
      amount: 100,
      total: 100.2,
      payMethod: 'moamalat',
      paymentLink: 'https://dpay.ly/sandbox/moamalat-pay/1768/abc',
    });
  });

  it('maps 422 validation errors to DpayError with field details', async () => {
    const { client, fetchStub } = makeClient();
    fetchStub.mockResolvedValue(
      jsonResponse(422, {
        message: 'The given data was invalid.',
        errors: {
          pay_method: ['The pay method field is required.'],
        },
      }),
    );

    const promise = client.openSession({ payMethod: '', amount: 100 });
    await expect(promise).rejects.toThrow(DpayError);
    await promise.catch((err: DpayError) => {
      expect(err.code).toBe('VALIDATION');
      expect(err.status).toBe(422);
      expect(err.fieldErrors).toEqual({
        pay_method: ['The pay method field is required.'],
      });
    });
  });

  it('maps 401 to an AUTH error', async () => {
    const { client, fetchStub } = makeClient();
    fetchStub.mockResolvedValue(
      jsonResponse(401, { message: 'Unauthenticated.' }),
    );
    await expect(
      client.openSession({ payMethod: 'edfali', amount: 1 }),
    ).rejects.toMatchObject({ code: 'AUTH', status: 401 });
  });

  it('wraps network failures as NETWORK errors, not raw exceptions', async () => {
    const { client, fetchStub } = makeClient();
    fetchStub.mockRejectedValue(new TypeError('fetch failed'));
    await expect(
      client.openSession({ payMethod: 'edfali', amount: 1 }),
    ).rejects.toMatchObject({ code: 'NETWORK' });
  });

  it('maps non-JSON error bodies to a GATEWAY error without crashing', async () => {
    const { client, fetchStub } = makeClient();
    fetchStub.mockResolvedValue(
      new Response('<html>boom</html>', { status: 500 }),
    );
    await expect(
      client.openSession({ payMethod: 'edfali', amount: 1 }),
    ).rejects.toMatchObject({ code: 'GATEWAY', status: 500 });
  });

  it('passes an abort signal so a hung gateway cannot block a request', async () => {
    const { client, fetchStub } = makeClient();
    fetchStub.mockResolvedValue(jsonResponse(200, OPEN_RESPONSE));
    await client.openSession({ payMethod: 'edfali', amount: 1 });
    const callArgs = fetchStub.mock.calls[0] as unknown[];
    const init = callArgs[1] as { signal: AbortSignal };
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it('treats an unparseable success body as a GATEWAY error, not a crash', async () => {
    const { client, fetchStub } = makeClient();
    fetchStub.mockResolvedValue(
      new Response('not json at all', { status: 200 }),
    );
    await expect(
      client.openSession({ payMethod: 'edfali', amount: 1 }),
    ).rejects.toMatchObject({ code: 'GATEWAY' });
  });
});

describe('createDpayClient.verifyOtp', () => {
  const VERIFY_RESPONSE = {
    message: 'Payment verified successfully',
    payment_id: 837,
    status: 'paid',
    amount: 100,
    pay_method: 'edfali',
    tx_id: 'sb_txn_abc123',
    sandbox: true,
  };

  it('POSTs sessionId + otp and normalizes the flat sandbox shape', async () => {
    const { client, fetchStub } = makeClient();
    fetchStub.mockResolvedValue(jsonResponse(200, VERIFY_RESPONSE));

    const result = await client.verifyOtp(1767, '111111');

    const callArgs = fetchStub.mock.calls[0] as unknown[];
    const url = callArgs[0] as string;
    const init = callArgs[1] as { method: string; headers: Record<string, string>; body: string; signal: AbortSignal };
    expect(url).toBe('https://dpay.ly/api/sandbox/payment/sessions/verify');
    expect(JSON.parse(init.body)).toEqual({
      session_id: 1767,
      otp: '111111',
    });
    expect(result).toEqual({
      status: 'paid',
      paymentId: 837,
      txId: 'sb_txn_abc123',
      receiptUrl: null,
    });
  });

  it('normalizes the documented nested live shape (payment object)', async () => {
    const { client, fetchStub } = makeClient();
    fetchStub.mockResolvedValue(
      jsonResponse(200, {
        message: 'Payment verified successfully',
        payment: {
          id: 101,
          status: 'completed',
          tx_id: 'txn_live_1',
        },
        payment_id: 101,
        status: 'paid',
        tx_id: 'txn_live_1',
        receipt_url: 'https://dpay.ly/receipt/42/abc',
      }),
    );

    const result = await client.verifyOtp(42, '123456');
    expect(result).toEqual({
      status: 'paid',
      paymentId: 101,
      txId: 'txn_live_1',
      receiptUrl: 'https://dpay.ly/receipt/42/abc',
    });
  });

  it('maps wrong-OTP / gateway business errors to DpayError with code GATEWAY', async () => {
    const { client, fetchStub } = makeClient();
    fetchStub.mockResolvedValue(
      jsonResponse(400, { message: 'Wrong OTP code.' }),
    );
    await expect(client.verifyOtp(1767, '000000')).rejects.toMatchObject({
      code: 'GATEWAY',
      status: 400,
    });
  });
});

describe('createDpayClient.getSession', () => {
  it('GETs the session and normalizes status + data metadata', async () => {
    const { client, fetchStub } = makeClient();
    fetchStub.mockResolvedValue(
      jsonResponse(200, {
        session_id: 1767,
        status: 'paid',
        amount: 100,
        pay_method: 'edfali',
        tx_id: 'sb_txn_abc123',
        expired_at: '2026-09-08T22:26:26.000000Z',
        data: { konoozInvoiceNumber: 'INV-1' },
        sandbox: true,
      }),
    );

    const result = await client.getSession(1767);

    const callArgs = fetchStub.mock.calls[0] as unknown[];
    const url = callArgs[0] as string;
    const init = callArgs[1] as { method: string; headers: Record<string, string>; body: string; signal: AbortSignal };
    expect(url).toBe('https://dpay.ly/api/sandbox/payment/sessions/1767');
    expect(init.method).toBe('GET');
    expect(result).toMatchObject({
      sessionId: 1767,
      status: 'paid',
      txId: 'sb_txn_abc123',
    });
  });

  it('propagates 404 for an unknown session as DpayError NOT_FOUND', async () => {
    const { client, fetchStub } = makeClient();
    fetchStub.mockResolvedValue(
      jsonResponse(404, { message: 'No query results for model' }),
    );
    await expect(client.getSession(999999)).rejects.toMatchObject({
      code: 'NOT_FOUND',
      status: 404,
    });
  });
});
