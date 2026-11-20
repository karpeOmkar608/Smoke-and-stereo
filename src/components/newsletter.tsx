'use client';
import { useState } from 'react';
export function Newsletter() {
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="newsletter-form"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
          const response = await fetch('/api/newsletter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: new FormData(e.currentTarget).get('email') }),
          });
          const data = await response.json();
          setMessage(response.ok ? 'You’re on the list. Stay tuned.' : data.error);
        } catch {
          setMessage('Connection interrupted. Please try again.');
        } finally {
          setBusy(false);
        }
      }}
    >
      <label className="sr-only" htmlFor="newsletter-email">
        Email address
      </label>
      <div className="email-row">
        <input
          id="newsletter-email"
          name="email"
          type="email"
          placeholder="YOUR EMAIL ADDRESS"
          required
          maxLength={254}
        />
        <button disabled={busy}>{busy ? 'JOINING…' : 'TUNE IN'}</button>
      </div>
      <p className="small" role="status">
        {message || 'Only the good stuff. No noise. Unsubscribe anytime.'}
      </p>
    </form>
  );
}
