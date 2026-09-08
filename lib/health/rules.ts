// Pure mapping from a database reachability check to the honest health
// payload. Deliberately minimal: a health endpoint is a liveness signal for
// uptime pingers, not telemetry — it must never leak exception text,
// versions, or infrastructure details.

export interface HealthBody {
  status: 'ok' | 'error';
  db: 'up' | 'down';
}

export function healthResponse(dbOk: boolean): {
  httpStatus: 200 | 503;
  body: HealthBody;
} {
  return dbOk
    ? { httpStatus: 200, body: { status: 'ok', db: 'up' } }
    : { httpStatus: 503, body: { status: 'error', db: 'down' } };
}
