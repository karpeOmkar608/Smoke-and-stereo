import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
const db = vi.hoisted(() => ({ serviceClient: vi.fn(), sessionClient: vi.fn() }));
vi.mock('../src/lib/supabase/server', () => db);
import { POST as demoCheckout } from '../src/app/api/demo/checkout/route';
import { POST as realCheckout } from '../src/app/api/checkout/route';
import { demoProducts } from '../src/lib/demo/catalog';
import { getCatalog, provider } from '../src/lib/catalog';
import { isDemoMode } from '../src/lib/demo-mode';
const input = {
  idempotencyKey: 'f67cd803-b5ec-40d7-87e9-b93ed1b1b340',
  customer: {
    name: 'Demo Customer',
    email: 'demo@example.invalid',
    phone: '9876543210',
    address: '123 Test Street',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
  },
  items: [{ sku: 'DEMO-FREQUENCY-M', quantity: 1 }],
  paymentMethod: 'cod',
};
function request(value: unknown = input) {
  return new Request('http://localhost:3000/api/demo/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', origin: 'http://localhost:3000' },
    body: JSON.stringify(value),
  });
}
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('DEMO_CATALOG_ENABLED', 'true');
  vi.stubEnv('VERCEL_ENV', 'preview');
  vi.stubEnv('COD_ENABLED', 'true');
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
describe('isolated demo catalogue', () => {
  it('returns eight fictional products without using the database', async () => {
    expect(await getCatalog()).toEqual(demoProducts);
    expect(demoProducts).toHaveLength(8);
    expect(
      demoProducts.every(
        (p) => p.sku.startsWith('DEMO-') && p.variants.every((v) => v.sku.startsWith('DEMO-')),
      ),
    ).toBe(true);
    expect(db.serviceClient).not.toHaveBeenCalled();
  });
  it('disables demo mode for production Vercel deployments', () => {
    vi.stubEnv('VERCEL_ENV', 'production');
    expect(isDemoMode()).toBe(false);
  });
  it('blocks supplier calls in demo mode', async () => {
    const fetcher = vi.fn();
    vi.stubGlobal('fetch', fetcher);
    await expect(provider('/orders', { method: 'POST' })).rejects.toThrow('blocked in demo mode');
    expect(fetcher).not.toHaveBeenCalled();
  });
  it('validates demo checkout without storing customer data', async () => {
    const response = await demoCheckout(request());
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toMatchObject({ demo: true, total: 149900, shipping: 0 });
    expect(data.customer).toBeUndefined();
    expect(data.order_id).toBeUndefined();
    expect(db.serviceClient).not.toHaveBeenCalled();
    expect(db.sessionClient).not.toHaveBeenCalled();
  });
  it('rejects sold-out sizes', async () => {
    expect(
      (
        await demoCheckout(
          request({ ...input, items: [{ sku: 'DEMO-FREQUENCY-XXL', quantity: 1 }] }),
        )
      ).status,
    ).toBe(400);
  });
  it('rejects quantities above available stock', async () => {
    expect(
      (await demoCheckout(request({ ...input, items: [{ sku: 'DEMO-FREQUENCY-L', quantity: 3 }] })))
        .status,
    ).toBe(400);
  });
  it('rejects invalid customer data', async () => {
    expect(
      (await demoCheckout(request({ ...input, customer: { ...input.customer, pincode: 'bad' } })))
        .status,
    ).toBe(400);
  });
  it('hides the demo endpoint unless explicitly enabled', async () => {
    vi.stubEnv('DEMO_CATALOG_ENABLED', 'false');
    expect((await demoCheckout(request())).status).toBe(404);
  });
  it('blocks real checkout in demo mode before database access', async () => {
    expect((await realCheckout(request())).status).toBe(403);
    expect(db.serviceClient).not.toHaveBeenCalled();
  });
  it('rejects demo SKUs in real checkout even after demo mode is disabled', async () => {
    vi.stubEnv('DEMO_CATALOG_ENABLED', 'false');
    expect((await realCheckout(request())).status).toBe(400);
    expect(db.serviceClient).not.toHaveBeenCalled();
  });
});
