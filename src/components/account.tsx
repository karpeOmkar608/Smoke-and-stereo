'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { browserClient } from '@/lib/supabase/client';
import { money } from '@/types/commerce';
type Order = {
  id: string;
  order_number: string;
  created_at: string;
  total_amount: number;
  order_status: string;
};
export function Account({ reset = false }: { reset?: boolean }) {
  const [mode, setMode] = useState(reset ? 'reset' : 'login');
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<
    { id: string; label: string; address: string; city: string; pincode: string }[]
  >([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
    const db = browserClient();
    void db.auth.getUser().then(async ({ data: { user } }) => {
      setUser(user);
      if (user) {
        const [o, p, a] = await Promise.all([
          db
            .from('orders')
            .select('id,order_number,created_at,total_amount,order_status')
            .order('created_at', { ascending: false }),
          db.from('profiles').select('full_name,phone').eq('id', user.id).maybeSingle(),
          db.from('saved_addresses').select('*').eq('user_id', user.id),
        ]);
        setOrders(o.data || []);
        setName(p.data?.full_name || '');
        setPhone(p.data?.phone || '');
        setAddresses(a.data || []);
      }
    });
  }, []);
  async function submit(form: HTMLFormElement) {
    setBusy(true);
    setMessage('');
    try {
      const db = browserClient();
      const values = new FormData(form);
      const email = String(values.get('email') || '');
      const password = String(values.get('password') || '');
      if (mode === 'profile' && user) {
        const { error } = await db.from('profiles').upsert({ id: user.id, full_name: name, phone });
        if (error) throw error;
        setMessage('Profile saved.');
      } else if (mode === 'reset') {
        const { error } = await db.auth.updateUser({ password });
        if (error) throw error;
        setMessage('Password updated. You can sign in now.');
        setMode('login');
      } else if (mode === 'forgot') {
        const { error } = await db.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback?next=/account/reset-password`,
        });
        if (error) throw error;
        setMessage('If an account exists, a reset link is on its way.');
      } else if (mode === 'register') {
        const { error } = await db.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) throw error;
        setMessage('Check your email to confirm your account.');
      } else {
        const { error } = await db.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.location.reload();
      }
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="account-tabs">
        {user && !reset ? (
          <>
            {['profile', 'orders', 'addresses'].map((v) => (
              <button key={v} className={mode === v ? 'selected' : ''} onClick={() => setMode(v)}>
                {v.toUpperCase()}
              </button>
            ))}
            <Link href="/wishlist" className="text-link">
              WISHLIST
            </Link>
            <button
              onClick={async () => {
                await browserClient().auth.signOut();
                window.location.reload();
              }}
            >
              LOG OUT
            </button>
          </>
        ) : (
          !reset &&
          ['login', 'register', 'forgot'].map((v) => (
            <button
              className={mode === v ? 'selected' : ''}
              key={v}
              onClick={() => {
                setMode(v);
                setMessage('');
              }}
            >
              {v === 'forgot' ? 'FORGOT PASSWORD' : v.toUpperCase()}
            </button>
          ))
        )}
      </div>
      {user && !reset && (mode === 'orders' || mode === 'login') ? (
        <>
          <h2>YOUR ORDER HISTORY</h2>
          {orders.length ? (
            orders.map((o) => (
              <Link
                href={`/orders/${o.id}`}
                className="order-card"
                style={{ display: 'block' }}
                key={o.id}
              >
                <b>{o.order_number}</b>
                <div className="summary-line">
                  <span>
                    {new Date(o.created_at).toLocaleDateString('en-IN')} · {o.order_status}
                  </span>
                  <span>{money(o.total_amount)}</span>
                </div>
              </Link>
            ))
          ) : (
            <p className="muted">No orders yet. Your first frequency is waiting.</p>
          )}
        </>
      ) : user && mode === 'addresses' ? (
        <>
          <h2>SAVED ADDRESSES</h2>
          {addresses.map((a) => (
            <div className="order-card" key={a.id}>
              <b>{a.label}</b>
              <p>
                {a.address}, {a.city} {a.pincode}
              </p>
              <button
                className="text-link"
                onClick={async () => {
                  const { error } = await browserClient()
                    .from('saved_addresses')
                    .delete()
                    .eq('id', a.id);
                  if (!error) setAddresses((v) => v.filter((x) => x.id !== a.id));
                }}
              >
                REMOVE
              </button>
            </div>
          ))}
          <form
            className="form-stack"
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              const form = e.currentTarget;
              const values = Object.fromEntries(new FormData(form));
              const { data, error } = await browserClient()
                .from('saved_addresses')
                .insert({ ...values, user_id: user.id })
                .select('*')
                .single();
              setBusy(false);
              if (error) setMessage(error.message);
              else {
                setAddresses((v) => [...v, data]);
                form.reset();
              }
            }}
          >
            {['label', 'address', 'city', 'state', 'pincode', 'phone'].map((k) => (
              <label key={k}>
                {k.toUpperCase()}
                <input name={k} required maxLength={k === 'address' ? 500 : 100} />
              </label>
            ))}
            <button className="button acid" disabled={busy}>
              SAVE ADDRESS
            </button>
          </form>
        </>
      ) : (
        <form
          className="form-stack"
          onSubmit={(e) => {
            e.preventDefault();
            void submit(e.currentTarget);
          }}
        >
          <h2>
            {mode === 'profile'
              ? 'YOUR DETAILS'
              : mode === 'register'
                ? 'JOIN THE CULTURE.'
                : mode === 'forgot'
                  ? 'RESET YOUR PASSWORD.'
                  : mode === 'reset'
                    ? 'CHOOSE A NEW PASSWORD.'
                    : 'WELCOME BACK.'}
          </h2>
          {mode === 'profile' ? (
            <>
              <label>
                Full name
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={100}
                  required
                />
              </label>
              <label>
                Phone
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  pattern="[6-9][0-9]{9}"
                />
              </label>
            </>
          ) : (
            <>
              {mode !== 'reset' && (
                <label>
                  Email address
                  <input name="email" type="email" autoComplete="email" required />
                </label>
              )}
              {mode !== 'forgot' && (
                <label>
                  Password
                  <input
                    name="password"
                    type="password"
                    minLength={12}
                    required
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  />
                </label>
              )}
            </>
          )}
          <button className="button acid" disabled={busy}>
            {busy
              ? 'PLEASE WAIT…'
              : mode === 'profile'
                ? 'SAVE DETAILS'
                : mode === 'forgot'
                  ? 'SEND RESET LINK'
                  : mode === 'register'
                    ? 'CREATE ACCOUNT'
                    : mode === 'reset'
                      ? 'UPDATE PASSWORD'
                      : 'SIGN IN'}
          </button>
        </form>
      )}
      {message && (
        <p className="notice" role="status">
          {message}
        </p>
      )}
    </>
  );
}
