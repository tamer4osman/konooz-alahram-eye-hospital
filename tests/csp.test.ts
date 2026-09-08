import { describe, it, expect } from 'vitest';
import { buildCsp } from '@/lib/security/csp';

describe('buildCsp', () => {
  it('includes the per-request nonce in script-src', () => {
    const csp = buildCsp({ nonce: 'abc123' });
    expect(csp).toContain("script-src 'self' 'nonce-abc123' 'strict-dynamic'");
  });

  it('keeps the hard directives from the previous static policy', () => {
    const csp = buildCsp({ nonce: 'abc123' });
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("form-action 'self'");
  });

  it('allows google maps frames only', () => {
    const csp = buildCsp({ nonce: 'abc123' });
    expect(csp).toContain(
      'frame-src https://maps.google.com https://www.google.com'
    );
  });

  it('keeps style-src unsafe-inline for UI style attributes', () => {
    const csp = buildCsp({ nonce: 'abc123' });
    expect(csp).toContain("style-src 'self' 'unsafe-inline'");
  });

  it('adds unsafe-eval and unsafe-inline only in dev', () => {
    const dev = buildCsp({ nonce: 'abc123', isDev: true });
    expect(dev).toContain("'unsafe-eval'");
    expect(dev).toContain("'unsafe-inline'");
    const prod = buildCsp({ nonce: 'abc123', isDev: false });
    expect(prod).not.toContain("'unsafe-eval'");
    // prod script-src directive itself must not weaken with unsafe-inline
    const scriptSrcDirective = prod
      .split('; ')
      .find((directive) => directive.startsWith('script-src '));
    expect(scriptSrcDirective).not.toContain("'unsafe-inline'");
  });
});
