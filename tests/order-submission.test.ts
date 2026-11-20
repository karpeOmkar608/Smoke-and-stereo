import { beforeEach, describe, it, expect, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ provider: vi.fn(), serviceClient: vi.fn() }));
vi.mock('../src/lib/catalog', () => ({ provider: mocks.provider }));
vi.mock('../src/lib/supabase/server', () => ({ serviceClient: mocks.serviceClient }));
import { submitOrder } from '../src/lib/orders';
function database(claim: unknown) {
  const updates: { table: string; value: Record<string, unknown> }[] = [];
  const db = {
    from(table: string) {
      const chain: any = {
        update(value: Record<string, unknown>) {
          updates.push({ table, value });
          return chain;
        },
        insert() {
          return chain;
        },
        eq() {
          return chain;
        },
        select() {
          return chain;
        },
        maybeSingle: async () => ({ data: claim, error: null }),
        single: async () => ({ data: { id: 'attempt' }, error: null }),
        then(resolve: (value: unknown) => unknown) {
          return Promise.resolve({ error: null }).then(resolve);
        },
      };
      return chain;
    },
  };
  mocks.serviceClient.mockReturnValue(db);
  return updates;
}
const order = {
  id: 'test-order',
  order_number: 'W-TEST',
  customer_name: 'Test',
  address: 'Test address',
  city: 'Test',
  state: 'Test',
  pincode: '400001',
  customer_phone: '9876543210',
  order_items: [{ external_sku: 'TEST-L', quantity: 2 }],
};
beforeEach(() => vi.clearAllMocks());
describe('supplier submission safety', () => {
  it('does not resubmit an order that cannot be atomically claimed', async () => {
    database(null);
    await submitOrder('test-order');
    expect(mocks.provider).not.toHaveBeenCalled();
  });
  it('sends only documented request fields and holds unverified acceptance', async () => {
    const updates = database(order);
    mocks.provider.mockResolvedValue({ test: 'unverified response' });
    await submitOrder('test-order');
    expect(mocks.provider).toHaveBeenCalledTimes(1);
    const body = JSON.parse(mocks.provider.mock.calls[0][1].body);
    expect(body.order_id).toBe('W-TEST');
    expect(body.items).toEqual([{ sku: 'TEST-L', quantity: 2 }]);
    expect(updates.some((u) => u.value.integration_status === 'reconciliation_required')).toBe(
      true,
    );
    expect(updates.some((u) => u.value.integration_status === 'submitted')).toBe(false);
  });
  it('never retries an ambiguous timeout', async () => {
    const updates = database(order);
    mocks.provider.mockRejectedValue(new Error('Timed out'));
    await submitOrder('test-order');
    expect(mocks.provider).toHaveBeenCalledTimes(1);
    expect(updates.some((u) => u.value.integration_status === 'reconciliation_required')).toBe(
      true,
    );
  });
});
