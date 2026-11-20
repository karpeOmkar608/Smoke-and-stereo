import { NextResponse } from 'next/server';
import { sessionClient } from '@/lib/supabase/server';
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const next =
    url.searchParams.get('next') === '/account/reset-password'
      ? '/account/reset-password'
      : '/account';
  if (code) {
    const db = await sessionClient();
    const { error } = await db.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, url.origin));
  }
  return NextResponse.redirect(new URL('/account?error=confirmation-failed', url.origin));
}
