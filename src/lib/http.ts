import { NextResponse } from 'next/server';
export function sameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin || origin !== new URL(request.url).origin) throw new Error('Invalid request origin');
}
export function apiError(error: unknown, status = 400) {
  return NextResponse.json(
    { error: error instanceof Error ? error.message : 'Request failed' },
    { status },
  );
}
