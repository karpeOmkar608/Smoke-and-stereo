// @vitest-environment jsdom
import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { ProductGallery } from '../src/components/product-gallery';
import { CartDrawer } from '../src/components/cart-drawer';
import { DropBrowser } from '../src/components/drop-browser';
import { StoreProvider, useStore } from '../src/components/store-provider';
import { ProductDetail } from '../src/components/products';
import type { Product } from '../src/types/commerce';
const navigation = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => navigation }));
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));
vi.mock('next/image', () => ({
  default: ({ fill, preload, unoptimized, ...props }: any) => <img {...props} />,
}));
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, initial, animate, ...props }: any) => <div {...props}>{children}</div>,
  },
}));
const product: Product = {
  sku: 'TEST-REDESIGN',
  name: 'Test garment',
  description: 'Test only',
  images: ['/test-front.jpg', '/test-back.jpg'],
  collections: ['NEW DROPS'],
  variants: [{ sku: 'TEST-M', label: 'M', available: true, stock: 3, price: 150000 }],
};
beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  vi.clearAllMocks();
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
});
afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});
function BagHarness() {
  const { add } = useStore();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => {
          add({ sku: 'TEST-M', name: 'Test garment', variant: 'M', quantity: 1, price: 150000 });
          setOpen(true);
        }}
      >
        ADD FIXTURE
      </button>
      {open && <CartDrawer onClose={() => setOpen(false)} />}
    </>
  );
}
describe('redesigned shopping interactions', () => {
  it('supports gallery controls, keyboard navigation, zoom, and thumbnails', async () => {
    const user = userEvent.setup();
    render(<ProductGallery images={product.images} name={product.name} />);
    await user.click(screen.getByRole('button', { name: 'Next product image' }));
    expect(screen.getByAltText('Test garment — view 2').getAttribute('src')).toBe('/test-back.jpg');
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByAltText('Test garment — view 1')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Toggle image zoom' }));
    expect(
      screen.getByRole('button', { name: 'Toggle image zoom' }).getAttribute('aria-pressed'),
    ).toBe('true');
    await user.click(screen.getByRole('button', { name: 'Image 2' }));
    expect(
      screen.getByRole('button', { name: 'Toggle image zoom' }).getAttribute('aria-pressed'),
    ).toBe('false');
  });
  it('updates bag quantities and removal using the existing store, then restores focus', async () => {
    const user = userEvent.setup();
    render(
      <StoreProvider>
        <BagHarness />
      </StoreProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'ADD FIXTURE' }));
    expect(screen.getByRole('dialog', { name: 'Your shopping bag' })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Increase Test garment' }));
    await waitFor(() =>
      expect(JSON.parse(localStorage.getItem('ss-bag') || '[]')[0].quantity).toBe(2),
    );
    expect(screen.getByRole('link', { name: 'PROCEED TO CHECKOUT' }).getAttribute('href')).toBe(
      '/checkout',
    );
    await user.click(screen.getByRole('button', { name: 'REMOVE' }));
    expect(screen.getByText('Your next frequency is waiting.')).toBeTruthy();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'ADD FIXTURE' }));
  });
  it('hands Buy Now to the client router with the selected SKU already in the bag', async () => {
    const user = userEvent.setup();
    render(
      <StoreProvider>
        <ProductDetail product={product} />
      </StoreProvider>,
    );
    await user.click(screen.getByRole('button', { name: /^M$/ }));
    await user.click(screen.getByRole('button', { name: 'BUY NOW' }));
    expect(navigation.push).toHaveBeenCalledWith('/checkout');
    await waitFor(() =>
      expect(JSON.parse(localStorage.getItem('ss-bag') || '[]')[0].sku).toBe('TEST-M'),
    );
  });
  it('does not invent upcoming releases or an archive when neither is configured', async () => {
    const user = userEvent.setup();
    render(
      <StoreProvider>
        <DropBrowser
          current={[product]}
          archive={[]}
          upcoming={{ title: '', date: '', image: '', copy: '' }}
        />
      </StoreProvider>,
    );
    await user.click(screen.getByRole('tab', { name: 'UPCOMING' }));
    expect(
      screen.getByText('No upcoming release has been announced. Join the list for the first word.'),
    ).toBeTruthy();
    expect(screen.queryByLabelText('Time until release')).toBeNull();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'ARCHIVE' }).getAttribute('aria-selected')).toBe('true');
    expect(screen.getByText('THE ARCHIVE IS QUIET.')).toBeTruthy();
  });
  it('shows a countdown only for an explicitly configured future release', async () => {
    const user = userEvent.setup();
    render(
      <StoreProvider>
        <DropBrowser
          current={[]}
          archive={[]}
          upcoming={{
            title: 'Test release',
            date: '2099-01-01T18:00:00+05:30',
            image: '',
            copy: 'Test-only scheduled release',
          }}
        />
      </StoreProvider>,
    );
    await user.click(screen.getByRole('tab', { name: 'UPCOMING' }));
    expect(screen.getByLabelText('Time until release')).toBeTruthy();
  });
});
