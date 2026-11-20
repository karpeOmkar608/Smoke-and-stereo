'use client';
import Link from 'next/link';
import { Minus, Plus } from 'lucide-react';
import { useStore } from '@/components/store-provider';
import { money } from '@/types/commerce';
export default function Cart() {
  const { lines, quantity } = useStore();
  const subtotal = lines.reduce((n, l) => n + l.price * l.quantity, 0);
  return (
    <>
      <div className="page-heading">
        <span className="eyebrow muted">GOOD TASTE. GOOD ROTATION.</span>
        <h1>
          YOUR BAG<span className="acid-text">.</span>
        </h1>
      </div>
      <div className="page-content">
        {!lines.length ? (
          <div className="empty-state">
            <span className="large-star">✳</span>
            <h2>MAKE SOME ROOM FOR CULTURE.</h2>
            <p>Your bag is waiting for its first drop.</p>
            <Link href="/shop" className="button acid">
              EXPLORE THE ROTATION
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            <div>
              {lines.map((line) => (
                <div key={line.sku} className="cart-row">
                  {line.image ? <img src={line.image} alt={line.name} /> : <div />}
                  <div>
                    <h2>{line.name}</h2>
                    <p className="small muted">{line.variant}</p>
                    <div className="quantity">
                      <button
                        onClick={() => quantity(line.sku, line.quantity - 1)}
                        aria-label={`Decrease ${line.name}`}
                      >
                        <Minus size={15} />
                      </button>
                      <span>{line.quantity}</span>
                      <button
                        onClick={() => quantity(line.sku, line.quantity + 1)}
                        aria-label={`Increase ${line.name}`}
                      >
                        <Plus size={15} />
                      </button>
                    </div>
                    <button className="text-link" onClick={() => quantity(line.sku, 0)}>
                      REMOVE
                    </button>
                  </div>
                  <span className="small">{money(line.price * line.quantity)}</span>
                </div>
              ))}
              <Link href="/shop" className="text-link">
                CONTINUE SHOPPING
              </Link>
            </div>
            <aside className="summary-box">
              <h2>THE LINEUP</h2>
              <div className="summary-line">
                <span>Subtotal</span>
                <span>{money(subtotal)}</span>
              </div>
              <div className="summary-line">
                <span>Shipping</span>
                <span>At checkout</span>
              </div>
              <p className="small muted">
                Prices and stock are rechecked securely before your order is placed.
              </p>
              <Link href="/checkout" className="button acid full">
                PROCEED TO CHECKOUT
              </Link>
            </aside>
          </div>
        )}
      </div>
    </>
  );
}
