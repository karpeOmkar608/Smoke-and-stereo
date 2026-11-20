import 'server-only';
import { createHash } from 'node:crypto';
import { serviceClient } from './supabase/server';
import { provider } from './catalog';
export function guestToken(key: string) {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) throw new Error('Orders are not configured');
  return createHash('sha256').update(`${secret}:${key}`).digest('hex');
}
export function tokenHash(token: string) {
  return createHash('sha256').update(token).digest('hex');
}
export async function submitOrder(id: string) {
  const db = serviceClient();
  const { data: order, error: claimError } = await db
    .from('orders')
    .update({ integration_status: 'processing', integration_error: null })
    .eq('id', id)
    .eq('integration_status', 'pending')
    .select('*,order_items(*)')
    .maybeSingle();
  if (claimError) throw claimError;
  if (!order) return;
  const { data: attempt, error: attemptError } = await db
    .from('integration_attempts')
    .insert({ order_id: id, status: 'processing' })
    .select('id')
    .single();
  if (attemptError) {
    await db
      .from('orders')
      .update({
        integration_status: 'failed',
        integration_error: 'Attempt could not be recorded; no supplier request sent.',
      })
      .eq('id', id);
    throw attemptError;
  }
  try {
    const response = await provider('/orders', {
      method: 'POST',
      body: JSON.stringify({
        order_id: order.order_number,
        customer: {
          name: order.customer_name,
          address: order.address,
          city: order.city,
          state: order.state,
          pincode: order.pincode,
          phone: order.customer_phone,
        },
        items: order.order_items.map((i: { external_sku: string; quantity: number }) => ({
          sku: i.external_sku,
          quantity: i.quantity,
        })),
      }),
    });
    // A 2xx alone does not establish business acceptance. Until provider success
    // semantics are verified, hold even a JSON response for manual reconciliation.
    const { error } = await db
      .from('orders')
      .update({
        integration_status: 'reconciliation_required',
        external_response: response,
        integration_error:
          'Supplier response received. Verify acceptance against documented response semantics.',
        order_status: 'processing',
      })
      .eq('id', id);
    if (error) throw error;
    await db
      .from('integration_attempts')
      .update({
        status: 'reconciliation_required',
        response,
        completed_at: new Date().toISOString(),
      })
      .eq('id', attempt.id);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown supplier result';
    await db
      .from('orders')
      .update({ integration_status: 'reconciliation_required', integration_error: message })
      .eq('id', id);
    await db
      .from('integration_attempts')
      .update({
        status: 'reconciliation_required',
        error: message,
        completed_at: new Date().toISOString(),
      })
      .eq('id', attempt.id);
  }
}
export async function sendConfirmation(
  order: { id: string; order_number: string; customer_email: string },
  token: string,
) {
  if (!process.env.RESEND_API_KEY || !process.env.ORDER_EMAIL_FROM) return;
  const db = serviceClient();
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': `confirmation-${order.id}`,
      },
      body: JSON.stringify({
        from: process.env.ORDER_EMAIL_FROM,
        to: order.customer_email,
        subject: `Your Smoke & Stereo order ${order.order_number}`,
        text: `We've received your order ${order.order_number}. Track its current status: ${process.env.NEXT_PUBLIC_SITE_URL}/orders/${order.id}?token=${token}\nSupplier acceptance is shown separately from order receipt.`,
      }),
      signal: AbortSignal.timeout(10000),
    });
    await db
      .from('orders')
      .update({ email_status: r.ok ? 'sent' : 'failed' })
      .eq('id', order.id);
  } catch {
    await db.from('orders').update({ email_status: 'failed' }).eq('id', order.id);
  }
}
