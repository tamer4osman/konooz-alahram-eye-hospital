import { headers } from 'next/headers';

// Nonce-based CSP. The proxy generates a fresh nonce per document request,
// sets the Content-Security-Policy header, and forwards the nonce to server
// components via the `x-nonce` request header so custom inline sinks
// (JSON-LD <script> tags) can carry it.

const REQUEST_NONCE_HEADER = 'x-nonce';

export interface CspOptions {
  nonce: string;
  isDev?: boolean;
}

/**
 * Build the Content-Security-Policy header value.
 * - script-src: nonce + strict-dynamic (Next.js propagates the nonce to its
 *   own bootstrap scripts; strict-dynamic covers runtime-injected chunks).
 *   Dev adds 'unsafe-eval' for the dev tooling overlay.
 * - style-src keeps 'unsafe-inline': UI components set inline style
 *   attributes (modals, scroll lock) and style attributes are not an
 *   execution vector.
 */
export function buildCsp({ nonce, isDev = false }: CspOptions): string {
  const scriptSrc = [
    "'self'",
    `'nonce-${nonce}'`,
    "'strict-dynamic'",
    ...(isDev ? ["'unsafe-eval'", "'unsafe-inline'"] : []),
  ].join(' ');

  return [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-src https://maps.google.com https://www.google.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join('; ');
}

export function cspRequestHeaderName(): string {
  return REQUEST_NONCE_HEADER;
}

/**
 * Read the nonce the proxy generated for the current document request.
 * Returns undefined outside a proxied request (e.g. in unit tests); sinks
 * then render without the attribute, which the CSP would block — a visible
 * failure rather than a silent one.
 */
export async function getNonce(): Promise<string | undefined> {
  return (await headers()).get(REQUEST_NONCE_HEADER) ?? undefined;
}
