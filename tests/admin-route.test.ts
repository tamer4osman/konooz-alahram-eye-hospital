import { describe, expect, it } from 'vitest';
import { prismaFailure, readJson } from '@/lib/api/admin-route';
import { z } from 'zod';

const NOT_FOUND = { code: 'X_NOT_FOUND', ar: 'غير موجود', en: 'Not found' };
const FAILURE = { code: 'X_FAILED', ar: 'فشل', en: 'Failed' };

describe('prismaFailure', () => {
  it('maps Prisma P2025 to the 404 not-found response', async () => {
    const res = prismaFailure({ code: 'P2025' }, { notFound: NOT_FOUND, failure: FAILURE });
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error.code).toBe('X_NOT_FOUND');
    expect(body.error.messageEn).toBe('Not found');
  });

  it('maps Prisma P2002 to the 409 conflict response', async () => {
    const CONFLICT = { code: 'X_TAKEN', ar: 'مستخدم', en: 'Taken' };
    const res = prismaFailure({ code: 'P2002' }, { conflict: CONFLICT, failure: FAILURE });
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error.code).toBe('X_TAKEN');
  });

  it('falls back to the 500 failure response for unknown errors', async () => {
    for (const err of [{ code: 'P9999' }, new Error('boom'), undefined]) {
      const res = prismaFailure(err, { notFound: NOT_FOUND, failure: FAILURE });
      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error.code).toBe('X_FAILED');
    }
  });

  it('treats P2025 as a generic failure when no notFound branch is configured', () => {
    const res = prismaFailure({ code: 'P2025' }, { failure: FAILURE });
    expect(res.status).toBe(500);
  });

  it('returns bilingual messages on every branch', async () => {
    const body = await prismaFailure({ code: 'P2025' }, { notFound: NOT_FOUND, failure: FAILURE }).json();
    expect(body.error.messageAr).toBe('غير موجود');
    expect(body.error.messageEn).toBe('Not found');
  });
});

describe('readJson', () => {
  const schema = z.object({ nameAr: z.string().min(1), age: z.number().int().optional() });

  const makeReq = (payload?: unknown) =>
    ({
      json: payload === undefined ? async () => { throw new Error('broken body'); } : async () => payload,
    }) as unknown as Parameters<typeof readJson>[0];

  it('returns parsed data for a valid payload', async () => {
    const res = await readJson(makeReq({ nameAr: 'سالم', age: 40 }), schema, 'بيانات ناقصة', 'Incomplete');
    expect(res).toEqual({ ok: true, data: { nameAr: 'سالم', age: 40 } });
  });

  it('returns a 400 INVALID_JSON response when the body cannot be parsed', async () => {
    const res = await readJson(makeReq(), schema, 'بيانات ناقصة', 'Incomplete');
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.response.status).toBe(400);
      const body = await res.response.json();
      expect(body.error.code).toBe('INVALID_JSON');
    }
  });

  it('returns a 422 VALIDATION_ERROR with per-route messages on schema mismatch', async () => {
    const res = await readJson(makeReq({ nameAr: '', age: 'x' }), schema, 'بيانات السرير غير مكتملة', 'Bed data incomplete');
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.response.status).toBe(422);
      const body = await res.response.json();
      expect(body.error.code).toBe('VALIDATION_ERROR');
      expect(body.error.messageAr).toBe('بيانات السرير غير مكتملة');
      expect(body.error.messageEn).toBe('Bed data incomplete');
    }
  });

  it('strips unknown keys through zod parsing', async () => {
    const res = await readJson(makeReq({ nameAr: 'ok', extra: 'nope' }), schema, 'a', 'b');
    expect(res).toEqual({ ok: true, data: { nameAr: 'ok' } });
  });
});
