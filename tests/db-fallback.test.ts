import { describe, it, expect, vi, afterEach } from 'vitest';
import { withDbFallback } from '@/lib/db-fallback';

describe('withDbFallback', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('passes through the read result on success', async () => {
    const result = await withDbFallback('read', ['fallback'], async () => ['real']);
    expect(result).toEqual(['real']);
  });

  it('returns the declared fallback when the read throws', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const result = await withDbFallback('read', [], async () => {
      throw new Error('DATABASE_URL is not set');
    });
    expect(result).toEqual([]);
  });

  it('logs the failing label without rethrowing', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    await withDbFallback('getDoctors', 'safe', async () => {
      throw new Error('connection refused');
    });
    expect(errorSpy).toHaveBeenCalledTimes(1);
    const [first, second] = errorSpy.mock.calls[0] as unknown as [string, unknown];
    expect(first).toContain('getDoctors');
    expect(second).toBe('connection refused');
  });

  it('never fabricates data: fallback must be caller-declared', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const result = await withDbFallback('read', null, async () => {
      throw new Error('no db');
    });
    expect(result).toBeNull();
  });
});
