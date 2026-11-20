'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useStore } from './store-provider';
import { money } from '@/types/commerce';
export function Checkout({
  enabled,
  shipping,
  demo = false,
}: {
  enabled: boolean;
  shipping: number | null;
  demo?: boolean;
}) {
  const { lines, clear } = useStore();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [result, setResult] = useState<{ reference: string; total: number } | null>(null);
  if (result)
    return (
      <div className="empty-state">
        <span className="eyebrow acid-text">DEMO CHECKOUT COMPLETE</span>
        <h2>TEST FLOW VERIFIED.</h2>
        <p>
          {result.reference} · Sample total {money(result.total)}
        </p>
        <p>
          No order was created, payment collected, or supplier contacted. Your demo bag is saved for
          another test.
        </p>
        <button className="button acid" onClick={() => setResult(null)}>
          TEST AGAIN
        </button>
      </div>
    );
  const subtotal = lines.reduce((n, l) => n + l.price * l.quantity, 0);
  if (!lines.length)
    return (
      <div className="empty-state">
        <h2>YOUR BAG IS EMPTY.</h2>
        <Link href="/shop" className="button acid">
          FIND YOUR FREQUENCY
        </Link>
      </div>
    );
  return (
    <div className="checkout-layout">
      <div>
        {demo && (
          <div className="notice">
            DEMO CHECKOUT — use the prefilled fictional details. This validates your bag without
            creating an order, taking payment, or saving personal details.
          </div>
        )}
        {!enabled && (
          <div className="notice">
            Orders are not open yet. We’re getting the next drop ready. Your bag is saved.
          </div>
        )}
        <form
          className="form-grid"
          onSubmit={async (e) => {
            e.preventDefault();
            if (busy || !enabled) return;
            setBusy(true);
            setMessage('');
            const form = new FormData(e.currentTarget);
            const customer = Object.fromEntries(
              ['name', 'email', 'phone', 'address', 'city', 'state', 'pincode'].map((k) => [
                k,
                form.get(k),
              ]),
            );
            try {
              const key = sessionStorage.getItem('ss-checkout-key') || crypto.randomUUID();
              sessionStorage.setItem('ss-checkout-key', key);
              const r = await fetch(demo ? '/api/demo/checkout' : '/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  idempotencyKey: key,
                  customer,
                  items: lines.map((l) => ({ sku: l.sku, quantity: l.quantity })),
                  paymentMethod: 'cod',
                }),
              });
              const data = await r.json();
              if (!r.ok) {
                if (data.retryWithNewKey) sessionStorage.removeItem('ss-checkout-key');
                throw new Error(data.error);
              }
              if (demo) {
                if (data.demo !== true) throw new Error('Invalid demo response.');
                setResult(data);
                setBusy(false);
                return;
              }
              clear();
              sessionStorage.removeItem('ss-checkout-key');
              window.location.assign(`/orders/${data.id}?token=${encodeURIComponent(data.token)}`);
            } catch (e) {
              setMessage(e instanceof Error ? e.message : 'Unable to place order.');
              setBusy(false);
            }
          }}
        >
          <h2 className="span-two">DELIVERY DETAILS</h2>
          {[
            { name: 'name', label: 'Full name', auto: 'name', type: 'text', wide: true },
            { name: 'email', label: 'Email address', auto: 'email', type: 'email', wide: true },
            {
              name: 'phone',
              label: 'Mobile number',
              auto: 'tel-national',
              type: 'tel',
              pattern: '[6-9][0-9]{9}',
            },
            {
              name: 'pincode',
              label: 'PIN code',
              auto: 'postal-code',
              type: 'text',
              pattern: '[1-9][0-9]{5}',
            },
            {
              name: 'address',
              label: 'Complete address',
              auto: 'street-address',
              type: 'text',
              wide: true,
            },
            { name: 'city', label: 'City', auto: 'address-level2', type: 'text' },
            { name: 'state', label: 'State', auto: 'address-level1', type: 'text' },
          ].map((field) => (
            <label key={field.name} className={field.wide ? 'span-two' : ''}>
              {field.label}
              <input
                name={field.name}
                autoComplete={field.auto}
                type={field.type}
                required
                pattern={field.pattern}
                maxLength={field.name === 'address' ? 500 : 254}
                defaultValue={
                  demo
                    ? (
                        {
                          name: 'Demo Customer',
                          email: 'demo@example.invalid',
                          phone: '9876543210',
                          address: '123 Test Street, Sample Building',
                          city: 'Mumbai',
                          state: 'Maharashtra',
                          pincode: '400001',
                        } as Record<string, string>
                      )[field.name]
                    : undefined
                }
              />
            </label>
          ))}
          <div className="span-two">
            <h2>PAYMENT</h2>
            <p className="notice">
              {demo ? (
                'Demo cash on delivery — no payment will be taken'
              ) : (
                <>Cash on delivery{!enabled ? ' — available when orders open' : ''}</>
              )}
            </p>
            <label>
              <input type="radio" disabled /> Online payment — currently unavailable
            </label>
            <p className="small muted">
              {demo ? 'For real purchases, review our ' : 'By placing an order you agree to our '}
              <Link href="/info/terms">terms</Link> and{' '}
              <Link href="/info/privacy">privacy policy</Link>.
            </p>
            <button className="button acid full" disabled={busy || !enabled}>
              {busy
                ? demo
                  ? 'VALIDATING TEST BAG…'
                  : 'SECURING YOUR ORDER…'
                : demo
                  ? 'RUN DEMO CHECKOUT'
                  : 'PLACE COD ORDER'}
            </button>
            {message && (
              <p className="error-message" role="alert">
                {message}
              </p>
            )}
          </div>
        </form>
      </div>
      <aside className="summary-box">
        <h2>YOUR ROTATION</h2>
        {lines.map((l) => (
          <div className="summary-line" key={l.sku}>
            <div>
              {l.name}
              <div className="small muted">
                {l.variant} × {l.quantity}
              </div>
            </div>
            <span>{money(l.price * l.quantity)}</span>
          </div>
        ))}
        <div className="summary-line">
          <span>Subtotal</span>
          <span>{money(subtotal)}</span>
        </div>
        <div className="summary-line">
          <span>Shipping</span>
          <span>{shipping === null ? 'Not configured' : money(shipping)}</span>
        </div>
        <div className="summary-line total">
          <span>Estimated total</span>
          <span>{money(subtotal + (shipping || 0))}</span>
        </div>
        <p className="small muted">Final prices and availability are verified on the server.</p>
      </aside>
    </div>
  );
}
