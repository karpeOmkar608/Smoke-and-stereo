import { z } from 'zod';
import { NextResponse } from 'next/server';
import { serviceClient } from '@/lib/supabase/server';
import { sameOrigin, apiError } from '@/lib/http';
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const { email } = z.object({ email: z.email().max(254) }).parse(await request.json());
    const { error } = await serviceClient()
      .from('newsletter_subscribers')
      .upsert({ email: email.toLowerCase() }, { onConflict: 'email', ignoreDuplicates: true });
    if (error) throw new Error('Subscription unavailable. Please try again later.');
    return NextResponse.json({ ok: true });
  } catch {
    return apiError(new Error('Subscriptions are not available yet. Please check back soon.'), 503);
  }
}
