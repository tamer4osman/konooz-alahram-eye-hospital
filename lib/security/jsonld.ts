// JSON-LD embedding is an HTML-injection sink: JSON.stringify output placed
// inside <script> must not be able to break out of the script context.
// Escaping U+2028/U+2029 also guards JSON validity under JS string-literal
// semantics (both are valid JSON but illegal in pre-ES2019 JS strings).

/**
 * Serialize a value as JSON that is safe to embed inside a
 * `<script type="application/ld+json">` element: closes `<`/`>`, `&`,
 * U+2028/U+2029, and line-separator characters so content sourced from the
 * database (doctor names, FAQ text) cannot terminate the script tag or inject
 * markup. Use for every dangerouslySetInnerHTML JSON-LD sink.
 */
export function safeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}
