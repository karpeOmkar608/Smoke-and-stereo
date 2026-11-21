'use client';
import Link from 'next/link';
import { Minus, Plus } from 'lucide-react';
import { useStore } from './store-provider';
import { Modal } from './modal';
import { money } from '@/types/commerce';

export function CartDrawer({ onClose }: { onClose: () => void }) {
  const { lines, quantity } = useStore();
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = lines.reduce((sum, line) => sum + line.quantity * line.price, 0);
  return (
    <Modal
      label="Your shopping bag"
      className="bag-drawer"
      closeLabel="Close shopping bag"
      onClose={onClose}
    >
      <div className="drawer-heading">
        <span className="eyebrow muted">GOOD TASTE. GOOD ROTATION.</span>
        <h2>
          YOUR BAG <span>({count})</span>
        </h2>
      </div>
      {!lines.length ? (
        <div className="drawer-empty">
          <span aria-hidden="true">S/S</span>
          <h3>
            MAKE ROOM
            <br />
            FOR CULTURE.
          </h3>
          <p>Your next frequency is waiting.</p>
          <Link href="/shop" className="button light" onClick={onClose}>
            EXPLORE THE ROTATION
          </Link>
        </div>
      ) : (
        <>
          <div className="drawer-items">
            {lines.map((line) => (
              <div key={line.sku} className="drawer-item">
                {line.image ? (
                  <img src={line.image} alt={line.name} />
                ) : (
                  <div className="drawer-image-empty" />
                )}
                <div>
                  <h3>{line.name}</h3>
                  <p className="small muted">
                    {line.variant} / {money(line.price)}
                  </p>
                  <div className="quantity">
                    <button
                      aria-label={`Decrease ${line.name}`}
                      onClick={() => quantity(line.sku, line.quantity - 1)}
                    >
                      <Minus size={14} />
                    </button>
                    <span>{line.quantity}</span>
                    <button
                      aria-label={`Increase ${line.name}`}
                      onClick={() => quantity(line.sku, line.quantity + 1)}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <button className="text-link" onClick={() => quantity(line.sku, 0)}>
                    REMOVE
                  </button>
                </div>
                <span>{money(line.price * line.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="drawer-summary">
            <div className="summary-line">
              <span>SUBTOTAL</span>
              <strong>{money(subtotal)}</strong>
            </div>
            <p className="small muted">
              Shipping, prices and availability are checked at checkout.
            </p>
            <Link href="/checkout" className="button light full" onClick={onClose}>
              PROCEED TO CHECKOUT
            </Link>
            <Link href="/cart" className="text-link" onClick={onClose}>
              VIEW YOUR BAG
            </Link>
          </div>
        </>
      )}
    </Modal>
  );
}
