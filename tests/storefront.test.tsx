// @vitest-environment jsdom
import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StoreProvider, useStore } from '../src/components/store-provider';
import { ProductDetail, ProductCard, Shop } from '../src/components/products';
import { Checkout } from '../src/components/checkout';
import type { Product } from '../src/types/commerce';
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, initial, animate, ...props }: any) => <div {...props}>{children}</div>,
  },
}));
const product: Product = {
  sku: 'TEST-PARENT',
  name: 'Fixture tee',
  description: 'Synthetic fixture, never storefront data',
  images: [],
  collections: [],
  variants: [
    { sku: 'TEST-M', label: 'M', available: true, price: 150000 },
    { sku: 'TEST-S', label: 'S', available: false, price: 150000 },
  ],
};
function BagProbe() {
  const { lines, quantity } = useStore();
  return (
    <>
      <output aria-label="Bag count">{lines.reduce((n, l) => n + l.quantity, 0)}</output>
      <button onClick={() => quantity('TEST-M', 0)}>Remove test item</button>
    </>
  );
}
function wrap(children: React.ReactNode) {
  return render(<StoreProvider>{children}</StoreProvider>);
}
beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
});
afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});
describe('storefront behavior', () => {
  it('requires an available variant before adding, then persists and removes a bag line', async () => {
    const user = userEvent.setup();
    wrap(
      <>
        <ProductDetail product={product} />
        <BagProbe />
      </>,
    );
    expect((screen.getByRole('button', { name: 'ADD TO BAG' }) as HTMLButtonElement).disabled).toBe(
      true,
    );
    expect((screen.getByRole('button', { name: /^S$/ }) as HTMLButtonElement).disabled).toBe(true);
    await user.click(screen.getByRole('button', { name: /^M$/ }));
    await user.click(screen.getByRole('button', { name: 'ADD TO BAG' }));
    expect(screen.getByLabelText('Bag count').textContent).toBe('1');
    await waitFor(() =>
      expect(JSON.parse(localStorage.getItem('ss-bag') || '[]')[0].sku).toBe('TEST-M'),
    );
    await user.click(screen.getByRole('button', { name: 'Remove test item' }));
    expect(screen.getByLabelText('Bag count').textContent).toBe('0');
  });
  it('restores a guest bag after remount', async () => {
    localStorage.setItem(
      'ss-bag',
      JSON.stringify([
        { sku: 'TEST-M', name: 'Fixture tee', variant: 'M', quantity: 2, price: 150000 },
      ]),
    );
    wrap(<BagProbe />);
    await waitFor(() => expect(screen.getByLabelText('Bag count').textContent).toBe('2'));
  });
  it('does not reveal a previous signed-in customer’s device snapshot', async () => {
    localStorage.setItem('ss-bag-owner', 'different-customer');
    localStorage.setItem(
      'ss-bag',
      JSON.stringify([
        { sku: 'TEST-M', name: 'Private fixture', variant: 'M', quantity: 2, price: 150000 },
      ]),
    );
    wrap(<BagProbe />);
    await waitFor(() => expect(screen.getByLabelText('Bag count').textContent).toBe('0'));
  });
  it('opens quick view and closes it with Escape', async () => {
    const user = userEvent.setup();
    wrap(<ProductCard product={product} />);
    await user.click(screen.getByRole('button', { name: 'QUICK VIEW / ADD' }));
    expect(screen.getByRole('dialog', { name: 'Fixture tee' })).toBeTruthy();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'QUICK VIEW / ADD' }));
  });
  it('filters catalogue by text and renders the no-results state', async () => {
    const user = userEvent.setup();
    wrap(<Shop products={[product]} />);
    await user.type(screen.getByPlaceholderText('SEARCH THE ROTATION'), 'unmatched');
    await waitFor(() => expect(screen.getByText('NO SIGNAL FOUND.')).toBeTruthy());
  });
  it('blocks checkout when integrations are unavailable', async () => {
    localStorage.setItem(
      'ss-bag',
      JSON.stringify([
        { sku: 'TEST-M', name: 'Fixture tee', variant: 'M', quantity: 1, price: 150000 },
      ]),
    );
    wrap(<Checkout enabled={false} shipping={null} />);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'PLACE COD ORDER' })).toBeTruthy(),
    );
    expect(
      (screen.getByRole('button', { name: 'PLACE COD ORDER' }) as HTMLButtonElement).disabled,
    ).toBe(true);
    expect(screen.getByText('Online payment — currently unavailable')).toBeTruthy();
  });
});
