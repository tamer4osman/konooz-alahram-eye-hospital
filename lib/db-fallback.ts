/**
 * Fail-soft wrapper for public-site DB reads. During the production image
 * build the database is unreachable (env vars and the db service do not exist
 * at build time), so prerender must degrade instead of failing. Runtime ISR
 * (revalidate=300) repopulates real data from the live database afterwards.
 * Never fabricates rows: the fallback is caller-declared (normally an empty
 * list) and every fallback hit is logged server-side.
 */
export async function withDbFallback<T>(
  label: string,
  fallback: T,
  read: () => Promise<T>,
): Promise<T> {
  try {
    return await read();
  } catch (error) {
    console.error(
      `[db-fallback] ${label} read failed; serving fallback until ISR revalidates:`,
      error instanceof Error ? error.message : error
    );
    return fallback;
  }
}
