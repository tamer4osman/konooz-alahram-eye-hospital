import { describe, expect, it } from 'vitest';
import { safeJsonLd } from '@/lib/security/jsonld';

describe('safeJsonLd', () => {
  it('serializes ordinary content as valid JSON', () => {
    const out = safeJsonLd({ name: 'د. سالم', rating: 5 });
    expect(JSON.parse(out)).toEqual({ name: 'د. سالم', rating: 5 });
  });

  it('escapes script-tag breakouts inside values', () => {
    const out = safeJsonLd({ name: '</script><script>alert(1)</script>' });
    expect(out).not.toContain('</script>');
    expect(out).not.toContain('<script>');
    expect(JSON.parse(out)).toEqual({ name: '</script><script>alert(1)</script>' });
  });

  it('escapes raw < > & anywhere in the payload', () => {
    const out = safeJsonLd({ a: '<b>&amp;', b: '>' });
    expect(out).not.toMatch(/(?<!\\u003c)</);
    expect(out).toContain('\\u003c');
    expect(out).toContain('\\u003e');
    expect(out).toContain('\\u0026');
  });

  it('escapes U+2028 / U+2029 line separators', () => {
    const out = safeJsonLd({ a: 'line\u2028sep\u2029end' });
    expect(out).not.toContain('\u2028');
    expect(out).not.toContain('\u2029');
  });

  it('round-trips arrays and nested objects used by schema.org payloads', () => {
    const value = { '@type': 'Hospital', departments: [{ name: 'LASIK' }] };
    expect(JSON.parse(safeJsonLd(value))).toEqual(value);
  });
});
