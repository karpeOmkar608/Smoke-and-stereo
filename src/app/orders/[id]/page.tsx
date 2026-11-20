import { notFound } from 'next/navigation';
import { serviceClient, sessionClient, configured } from '@/lib/supabase/server';
import { tokenHash } from '@/lib/orders';
import { money } from '@/types/commerce';
export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Your order',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};
export default async function Order({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  if (!configured()) notFound();
  const { id } = await params;
  const { token } = await searchParams;
  const db = serviceClient();
  const auth = await sessionClient();
  const {
    data: { user },
  } = await auth.auth.getUser();
  let query = db.from('orders').select('*,order_items(*)').eq('id', id);
  if (token) query = query.eq('guest_token_hash', tokenHash(token));
  else if (user) query = query.eq('user_id', user.id);
  else notFound();
  const { data: order, error } = await query.maybeSingle();
  if (error || !order) notFound();
  return (
    <>
      <div className="page-heading">
        <span className="eyebrow acid-text">ORDER RECEIVED</span>
        <h1>YOU’RE IN THE ROTATION.</h1>
        <p>Order {order.order_number}. Save this private link for updates.</p>
      </div>
      <div className="page-content prose">
        <div className="order-card">
          <div className="summary-line">
            <span>Order status</span>
            <strong>{order.order_status.replaceAll('_', ' ')}</strong>
          </div>
          <div className="summary-line">
            <span>Supplier integration</span>
            <strong>{order.integration_status.replaceAll('_', ' ')}</strong>
          </div>
          <div className="summary-line">
            <span>Payment</span>
            <strong>{order.payment_status} / COD</strong>
          </div>
          {order.order_items.map(
            (i: {
              id: string;
              product_name_snapshot: string;
              selected_variant: string;
              quantity: number;
              total_price: number;
            }) => (
              <div className="summary-line" key={i.id}>
                <span>
                  {i.product_name_snapshot} · {i.selected_variant} × {i.quantity}
                </span>
                <span>{money(i.total_price)}</span>
              </div>
            ),
          )}
          <div className="summary-line total">
            <span>Total</span>
            <strong>{money(order.total_amount)}</strong>
          </div>
        </div>
        {order.integration_status === 'reconciliation_required' && (
          <p className="notice">
            Your order is saved. Our team is verifying the supplier response. This is not a shipment
            confirmation.
          </p>
        )}
        <p className="small muted">Confirmation email: {order.email_status.replaceAll('_', ' ')}</p>
      </div>
    </>
  );
}
