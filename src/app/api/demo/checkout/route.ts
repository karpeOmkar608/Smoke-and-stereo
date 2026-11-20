import { NextResponse } from 'next/server';
import { isDemoMode } from '@/lib/demo-mode';
import { demoProducts } from '@/lib/demo/catalog';
import { checkoutSchema, validateLines } from '@/lib/validation';
import { sameOrigin, apiError } from '@/lib/http';

export async function POST(request: Request) {
  if (!isDemoMode())
    return NextResponse.json({ error: 'Demo mode is not enabled.' }, { status: 404 });
  try {
    sameOrigin(request);
    const input = checkoutSchema.parse(await request.json());
    const lines = validateLines(input.items, demoProducts);
    const subtotal = lines.reduce((sum, line) => sum + line.total, 0);
    // Dry run only: no database, supplier, payment, email, or personal data storage.
    return NextResponse.json({
      demo: true,
      reference: `DEMO-${input.idempotencyKey.slice(0, 8).toUpperCase()}`,
      subtotal,
      shipping: 0,
      total: subtotal,
    });
  } catch {
    return apiError(
      new Error('Check your test delivery details, sizes, and available quantities.'),
    );
  }
}
