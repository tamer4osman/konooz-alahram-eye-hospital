import { describe, expect, it } from 'vitest';
import { healthResponse } from '@/lib/health/rules';

describe('healthResponse', () => {
  it('reports ok/up with HTTP 200 when the database answers', () => {
    expect(healthResponse(true)).toEqual({
      httpStatus: 200,
      body: { status: 'ok', db: 'up' },
    });
  });

  it('reports error/down with HTTP 503 when the database is unreachable', () => {
    expect(healthResponse(false)).toEqual({
      httpStatus: 503,
      body: { status: 'error', db: 'down' },
    });
  });

  it('never includes exception details in the body (no data leak)', () => {
    const body = JSON.stringify(healthResponse(false).body);
    expect(body).not.toMatch(/error:|stack|connection/i);
  });
});
