'use client';
import { useState } from 'react';
import { money } from '@/types/commerce';
import type { SiteContent } from '@/lib/content';
type AdminOrder = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  total_amount: number;
  order_status: string;
  payment_status: string;
  integration_status: string;
  integration_error: string | null;
  external_response: unknown;
  created_at: string;
  order_items: { external_sku: string; quantity: number; unit_price: number }[];
};
export function Admin({
  content,
  orders,
  productCount,
}: {
  content: SiteContent;
  orders: AdminOrder[];
  productCount: number;
}) {
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [date, setDate] = useState('');
  async function act(input: unknown) {
    setBusy(true);
    setMessage('');
    try {
      const r = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      setMessage('Saved. Refresh to see updated records.');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Action failed.');
    } finally {
      setBusy(false);
    }
  }
  const paid = orders.filter((o) => o.payment_status === 'paid');
  const month = new Date().toISOString().slice(0, 7);
  const best = Object.entries(
    orders
      .filter((o) => !['cancelled', 'refunded', 'pending_payment'].includes(o.order_status))
      .flatMap((o) => o.order_items)
      .reduce<Record<string, number>>((acc, i) => {
        acc[i.external_sku] = (acc[i.external_sku] || 0) + i.quantity;
        return acc;
      }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  return (
    <>
      <div className="admin-metrics">
        {[
          ['RECENT ORDERS', orders.length],
          ['RECORDED PAID SALES', money(paid.reduce((n, o) => n + o.total_amount, 0))],
          [
            'PENDING / PROCESSING',
            orders.filter((o) => ['pending_payment', 'processing'].includes(o.order_status)).length,
          ],
          [
            'INTEGRATION ATTENTION',
            orders.filter((o) =>
              ['failed', 'reconciliation_required'].includes(o.integration_status),
            ).length,
          ],
        ].map(([label, value]) => (
          <div className="metric" key={label}>
            <span className="eyebrow muted">{label}</span>
            <b>{value}</b>
          </div>
        ))}
      </div>
      <p className="small muted">
        Metrics cover the latest 500 orders. This month’s recorded paid revenue:{' '}
        {money(
          paid
            .filter((o) => o.created_at.startsWith(month))
            .reduce((n, o) => n + o.total_amount, 0),
        )}
        . Confirmed orders: {orders.filter((o) => o.order_status === 'confirmed').length}.
      </p>
      {message && (
        <p role="status" className="notice">
          {message}
        </p>
      )}
      <section className="admin-section">
        <h2>ORDERS & INTEGRATION</h2>
        <div className="shop-toolbar">
          <input
            placeholder="Search order or customer"
            aria-label="Search orders"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            aria-label="Filter order status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All statuses</option>
            {[
              'confirmed',
              'processing',
              'shipped',
              'delivered',
              'cancelled',
              'refunded',
              'pending_payment',
            ].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <input
            type="date"
            aria-label="Filter date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <a className="button light" href="/api/admin/export">
            EXPORT CSV
          </a>
        </div>
        {orders
          .filter(
            (o) =>
              `${o.order_number} ${o.customer_name}`.toLowerCase().includes(search.toLowerCase()) &&
              (!status || status === o.order_status) &&
              (!date || o.created_at.startsWith(date)),
          )
          .map((o) => (
            <details key={o.id}>
              <summary>
                {o.order_number} / {o.customer_name} / {money(o.total_amount)} / {o.order_status} /{' '}
                {o.integration_status}
              </summary>
              <p>
                {o.customer_email} · {o.customer_phone}
                <br />
                {o.address}, {o.city}, {o.state} {o.pincode}
                <br />
                Payment: {o.payment_status}
              </p>
              <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12 }}>
                {JSON.stringify(
                  {
                    items: o.order_items,
                    supplier: o.external_response,
                    error: o.integration_error,
                  },
                  null,
                  2,
                )}
              </pre>
              <form
                className="form-stack"
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  void act({
                    action: 'status',
                    id: o.id,
                    status: f.get('status'),
                    evidence: f.get('evidence'),
                  });
                }}
              >
                <label>
                  Order status
                  <select name="status" defaultValue={o.order_status}>
                    {[
                      'confirmed',
                      'processing',
                      'shipped',
                      'delivered',
                      'cancelled',
                      'refunded',
                    ].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Verified evidence / reason
                  <textarea name="evidence" minLength={20} required />
                </label>
                <button className="button light" disabled={busy}>
                  UPDATE STATUS
                </button>
              </form>
              {['reconciliation_required', 'processing'].includes(o.integration_status) && (
                <form
                  className="form-stack"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const f = new FormData(e.currentTarget);
                    void act({
                      action: 'reconcile',
                      id: o.id,
                      resolution: f.get('resolution'),
                      evidence: f.get('evidence'),
                    });
                  }}
                >
                  <p className="notice">
                    Verify this order in the supplier dashboard before recording a resolution.
                    Automatic resubmission is blocked because supplier duplicate protection is
                    unverified.
                  </p>
                  <select name="resolution" aria-label="Supplier resolution">
                    <option value="accepted">Supplier confirms accepted</option>
                    <option value="not_accepted">Supplier confirms not accepted</option>
                  </select>
                  <label>
                    Supplier evidence
                    <textarea required minLength={20} name="evidence" />
                  </label>
                  <button className="button light" disabled={busy}>
                    RECORD RECONCILIATION
                  </button>
                </form>
              )}
            </details>
          ))}
        {!orders.length && <p className="muted">No recorded orders.</p>}
      </section>
      <section className="admin-section">
        <h2>CATALOGUE CONNECTION</h2>
        <p className="muted">
          {productCount} verified published products. Catalogue cache lifetime: 120 seconds.
          Supplier credentials are managed through deployment environment variables.
        </p>
        <button className="button light" disabled={busy} onClick={() => act({ action: 'refresh' })}>
          REFRESH CATALOGUE CACHE
        </button>
        <h3 style={{ fontSize: 24, marginTop: 30 }}>BEST SELLERS</h3>
        {best.length ? (
          best.map(([sku, n]) => (
            <p key={sku}>
              {sku} / {n} units
            </p>
          ))
        ) : (
          <p className="muted">Available after orders are recorded.</p>
        )}
      </section>
      <section className="admin-section">
        <h2>PRODUCT MERCHANDISING</h2>
        <p className="muted">
          Associate editorial content with a published product SKU. Prices and variant SKUs remain
          controlled by Indian Dropshippers.
        </p>
        <form
          className="form-grid"
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            void act({
              action: 'merchandise',
              value: {
                external_sku: f.get('sku'),
                featured: f.get('featured') === 'on',
                hidden: f.get('hidden') === 'on',
                collections: String(f.get('collections'))
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean),
                editorial_description: f.get('description'),
                size_guide: f.get('sizeGuide'),
              },
            });
          }}
        >
          <label>
            External product SKU
            <input name="sku" required />
          </label>
          <label>
            Collections, comma separated
            <input name="collections" placeholder="GRAPHIC TEES, NEW DROPS" />
          </label>
          <label>
            Editorial description
            <textarea name="description" />
          </label>
          <label>
            Size guide
            <textarea name="sizeGuide" />
          </label>
          <label>
            <span>
              <input type="checkbox" name="featured" /> Featured
            </span>
          </label>
          <label>
            <span>
              <input type="checkbox" name="hidden" /> Hidden from storefront
            </span>
          </label>
          <button className="button light" disabled={busy}>
            SAVE MERCHANDISING
          </button>
        </form>
      </section>
      <section className="admin-section">
        <h2>BRAND & CONTENT</h2>
        <form
          className="form-grid"
          onSubmit={(e) => {
            e.preventDefault();
            void act({
              action: 'content',
              value: Object.fromEntries(new FormData(e.currentTarget)),
            });
          }}
        >
          {Object.entries(content).map(([key, value]) => (
            <label
              key={key}
              className={
                [
                  'about',
                  'shippingPolicy',
                  'returnsPolicy',
                  'privacyPolicy',
                  'termsPolicy',
                ].includes(key)
                  ? 'span-two'
                  : ''
              }
            >
              {key.replace(/([A-Z])/g, ' $1').toUpperCase()}
              {value.length > 150 || key.endsWith('Policy') || key === 'about' ? (
                <textarea name={key} defaultValue={value} />
              ) : (
                <input name={key} defaultValue={value} />
              )}
            </label>
          ))}
          <button className="button acid" disabled={busy}>
            SAVE CONTENT
          </button>
        </form>
      </section>
    </>
  );
}
