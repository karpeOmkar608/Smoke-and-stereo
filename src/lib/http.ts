import { NextResponse } from 'next/server';
export function sameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  const target = new URL(request.url);
  if (origin === target.origin) return;
  // Next's local development server can normalize the request URL to localhost
  // while the browser uses its printed 127.0.0.1 URL. Require the actual Host
  // header, same scheme/port, and loopback hosts on both sides for this exception.
  if (origin && process.env.NODE_ENV === 'development') {
    try {
      const source = new URL(origin);
      const loopback = new Set(['localhost', '127.0.0.1', '[::1]']);
      if (
        loopback.has(source.hostname) &&
        loopback.has(target.hostname) &&
        source.protocol === target.protocol &&
        source.port === target.port &&
        source.host === request.headers.get('host') &&
        source.origin === origin
      )
        return;
    } catch {
      /* Malformed origins fail closed below. */
    }
  }
  throw new Error('Invalid request origin');
}
export function apiError(error: unknown, status = 400) {
  return NextResponse.json(
    { error: error instanceof Error ? error.message : 'Request failed' },
    { status },
  );
}
