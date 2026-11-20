import { NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { checkoutSchema, validateLines } from '@/lib/validation';
import { freshCatalog } from '@/lib/catalog';
import { serviceClient, sessionClient } from '@/lib/supabase/server';
import { guestToken, tokenHash, submitOrder, sendConfirmation } from '@/lib/orders';
import { apiError, sameOrigin } from '@/lib/http';
import { isDemoMode, isDemoSku } from '@/lib/demo-mode';
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    if (isDemoMode())
      return apiError(new Error('Use demo checkout. Real orders are blocked in demo mode.'), 403);
    if (process.env.COD_ENABLED !== 'true')
      return apiError(new Error('Orders are not open yet'), 503);
    const input = checkoutSchema.parse(await request.json());
    if (input.items.some((item) => isDemoSku(item.sku)))
      return apiError(new Error('Demo products cannot be purchased.'), 400);
    const db = serviceClient();
    const token = guestToken(input.idempotencyKey);
    const fingerprint = createHash('sha256').update(JSON.stringify(input)).digest('hex');
    const { data: existing, error: lookupError } = await db
      .from('orders')
      .select('id,request_fingerprint')
      .eq('idempotency_key', input.idempotencyKey)
      .maybeSingle();
    if (lookupError) throw lookupError;
    if (existing) {
      if (existing.request_fingerprint !== fingerprint)
        return NextResponse.json(
          {
            error: 'Your bag or address changed. Submit again to start a new order.',
            retryWithNewKey: true,
          },
          { status: 409 },
        );
      return NextResponse.json({ id: existing.id, token });
    }
    const raw = process.env.SHIPPING_AMOUNT_PAISE;
    if (raw === undefined || raw === '' || !Number.isSafeInteger(Number(raw)) || Number(raw) < 0)
      throw new Error('Shipping is not configured');
    const lines = validateLines(input.items, await freshCatalog());
    const subtotal = lines.reduce((n, l) => n + l.total, 0);
    if (!Number.isSafeInteger(subtotal) || subtotal > 100000000)
      throw new Error('Order amount exceeds supported limit');
    const auth = await sessionClient();
    const {
      data: { user },
    } = await auth.auth.getUser();
    const { data, error } = await db.rpc('create_checkout_order', {
      p_key: input.idempotencyKey,
      p_fingerprint: fingerprint,
      p_user: user?.id || null,
      p_customer: input.customer,
      p_subtotal: subtotal,
      p_shipping: Number(raw),
      p_token_hash: tokenHash(token),
      p_items: lines.map((l) => ({
        external_sku: l.sku,
        product_name_snapshot: l.product.name,
        product_image_snapshot: l.product.images[0] || null,
        selected_variant: l.variant.label,
        quantity: l.quantity,
        unit_price: l.variant.price,
        total_price: l.total,
      })),
    });
    if (error)
      throw new Error('Could not securely record the order. Please try again with the same bag.');
    const order = data as { id: string; order_number: string; request_fingerprint: string };
    if (order.request_fingerprint !== fingerprint)
      return NextResponse.json(
        {
          error: 'Order request changed. Submit again to create a new order.',
          retryWithNewKey: true,
        },
        { status: 409 },
      );
    await submitOrder(order.id);
    await sendConfirmation({ ...order, customer_email: input.customer.email }, token);
    return NextResponse.json({ id: order.id, token }, { status: 201 });
  } catch (e) {
    console.error('Checkout:', e instanceof Error ? e.message : 'Unknown error');
    return apiError(
      new Error(
        e instanceof Error && e.name !== 'ZodError'
          ? e.message
          : 'Please check your delivery details and bag.',
      ),
    );
  }
}
