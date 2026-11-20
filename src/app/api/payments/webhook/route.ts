import { NextResponse } from 'next/server';
// Intentionally fails closed until a named provider, signed event contract,
// amount/currency checks, and replay-safe processing have been implemented.
export async function POST() {
  return NextResponse.json(
    { error: 'Online payment provider is not configured.' },
    { status: 503 },
  );
}
