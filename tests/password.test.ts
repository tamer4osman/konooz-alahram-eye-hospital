import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from '@/lib/auth/password';

describe('password hashing (argon2)', () => {
  it('produces a hash that verifies against the original password', async () => {
    const stored = await hashPassword('correct-horse-battery-staple');
    expect(stored).not.toBe('correct-horse-battery-staple');
    expect(await verifyPassword('correct-horse-battery-staple', stored)).toBe(true);
  });

  it('rejects a wrong password without leaking timing-based truthiness', async () => {
    const stored = await hashPassword('correct-horse-battery');
    expect(await verifyPassword('wrong', stored)).toBe(false);
    expect(await verifyPassword('', stored)).toBe(false);
  });

  it('produces unique hashes for identical inputs (salted)', async () => {
    const a = await hashPassword('same-input');
    const b = await hashPassword('same-input');
    expect(a).not.toBe(b);
    expect(await verifyPassword('same-input', a)).toBe(true);
    expect(await verifyPassword('same-input', b)).toBe(true);
  });
});
