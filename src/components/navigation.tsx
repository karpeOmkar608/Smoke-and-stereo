'use client';
import Link from 'next/link';
import { Menu, Search, UserRound, ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useStore } from './store-provider';
import { Modal } from './modal';
import { CartDrawer } from './cart-drawer';

export function Wordmark() {
  return (
    <span className="wordmark">
      SMOKE<span>&</span>STEREO
      <span className="wordmark-symbol" aria-hidden="true">
        ®
      </span>
    </span>
  );
}
export function Navigation({ announcement }: { announcement: string }) {
  const [open, setOpen] = useState(false);
  const [bag, setBag] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const path = usePathname();
  const { lines } = useStore();
  const links = [
    ['SHOP', '/shop'],
    ['NEW DROPS', '/new-drops'],
    ['COLLECTIONS', '/collections'],
    ['CULTURE', '/culture'],
    ['ABOUT', '/about'],
  ];
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <>
      <div
        className={`nav-shell ${path === '/' ? 'over-hero' : ''} ${scrolled ? 'is-scrolled' : ''}`}
      >
        <div className="announcement">
          <span>{announcement}</span>
          <span className="announcement-right">INDEPENDENT. ALWAYS.</span>
        </div>
        <header className="nav">
          <Link href="/" aria-label="Smoke and Stereo home">
            <Wordmark />
          </Link>
          <nav className="desktop-nav" aria-label="Main navigation">
            {links.map(([name, url]) => (
              <Link
                key={url}
                href={url}
                className={path === url ? 'active' : ''}
                aria-current={path === url ? 'page' : undefined}
              >
                {name}
              </Link>
            ))}
          </nav>
          <div className="nav-tools">
            <Link href="/shop?search=1" aria-label="Search products">
              <Search size={19} />
            </Link>
            <Link className="account-link" href="/account" aria-label="Your account">
              <UserRound size={19} />
            </Link>
            <button
              className="bag-link"
              onClick={() => setBag(true)}
              aria-label={`Open bag, ${lines.reduce((sum, line) => sum + line.quantity, 0)} items`}
            >
              <ShoppingBag size={19} />
              <span>({lines.reduce((sum, line) => sum + line.quantity, 0)})</span>
            </button>
            <button
              className="mobile-menu"
              onClick={() => setOpen(true)}
              aria-label="Open navigation"
              aria-expanded={open}
            >
              <Menu size={23} />
            </button>
          </div>
        </header>
      </div>
      {open && (
        <Modal
          label="Main menu"
          className="menu-overlay"
          closeLabel="Close navigation"
          onClose={() => setOpen(false)}
        >
          <span className="eyebrow muted">TUNE INTO SOMETHING DIFFERENT.</span>
          <nav aria-label="Mobile navigation">
            {links.map(([name, url]) => (
              <Link
                key={url}
                href={url}
                onClick={() => setOpen(false)}
                aria-current={path === url ? 'page' : undefined}
              >
                {name}
              </Link>
            ))}
          </nav>
          <div className="menu-secondary">
            <Link href="/account" onClick={() => setOpen(false)}>
              YOUR ACCOUNT
            </Link>
            <Link href="/wishlist" onClick={() => setOpen(false)}>
              WISHLIST
            </Link>
            <Link href="/cart" onClick={() => setOpen(false)}>
              YOUR BAG ({lines.reduce((sum, line) => sum + line.quantity, 0)})
            </Link>
          </div>
          <p>
            BUILT FROM CULTURE.
            <br />
            WORN WITHOUT PERMISSION.
          </p>
        </Modal>
      )}
      {bag && <CartDrawer onClose={() => setBag(false)} />}
    </>
  );
}
