'use client';
import Link from 'next/link';
import { Menu, Search, UserRound, ShoppingBag, X } from 'lucide-react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useStore } from './store-provider';
export function Wordmark() {
  return (
    <span className="wordmark">
      SMOKE<span className="amp">&</span>STEREO<span className="brand-star">✳</span>
    </span>
  );
}
export function Navigation({ announcement }: { announcement: string }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const { lines } = useStore();
  const links = [
    ['Home', '/'],
    ['Shop', '/shop'],
    ['New drops', '/new-drops'],
    ['Collections', '/collections'],
    ['The culture', '/about'],
  ];
  return (
    <>
      <div className="announcement">
        <span>{announcement}</span>
        <span className="announcement-right">FROM THE STREETS. FOR THE CULTURE.</span>
      </div>
      <header className="nav">
        <Link href="/" aria-label="Smoke and Stereo home">
          <Wordmark />
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map(([name, url]) => (
            <Link
              key={name}
              className={path === url ? 'active' : ''}
              aria-current={path === url ? 'page' : undefined}
              href={url}
            >
              {name}
            </Link>
          ))}
        </nav>
        <div className="nav-tools">
          <Link href="/shop?search=1" aria-label="Search products">
            <Search size={20} />
          </Link>
          <Link href="/account" aria-label="Your account">
            <UserRound size={20} />
          </Link>
          <Link
            className="bag-link"
            href="/cart"
            aria-label={`Bag, ${lines.reduce((n, l) => n + l.quantity, 0)} items`}
          >
            <ShoppingBag size={20} />
            <span>{lines.reduce((n, l) => n + l.quantity, 0)}</span>
          </Link>
          <button
            className="mobile-menu"
            onClick={() => setOpen(!open)}
            aria-label="Toggle navigation"
            aria-expanded={open}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      {open && (
        <nav className="mobile-nav" aria-label="Mobile navigation">
          {links.map(([name, url]) => (
            <Link
              onClick={() => setOpen(false)}
              key={name}
              href={url}
              aria-current={path === url ? 'page' : undefined}
            >
              {name}
            </Link>
          ))}
          <Link onClick={() => setOpen(false)} href="/account">
            Your account
          </Link>
          <Link onClick={() => setOpen(false)} href="/wishlist">
            Wishlist
          </Link>
        </nav>
      )}
    </>
  );
}
