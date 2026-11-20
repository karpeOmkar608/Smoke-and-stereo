import { describe, it, expect } from 'vitest';
import { checkoutSchema, validateLines } from '../src/lib/validation';
import type { Product } from '../src/types/commerce';
// Synthetic test fixtures are never imported by application code.
const product: Product = {
  sku: 'TEST-PARENT',
  name: 'Test fixture',
  description: 'Test only',
  images: [],
  collections: [],
  variants: [
    { sku: 'TEST-L', label: 'L', available: true, stock: 2, price: 150000 },
    { sku: 'TEST-S', label: 'S', available: false, price: 140000 },
  ],
};
const valid = {
  idempotencyKey: 'f67cd803-b5ec-40d7-87e9-b93ed1b1b340',
  customer: {
    name: 'Test Customer',
    email: 'test@example.com',
    phone: '9876543210',
    address: 'Test address 123',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
  },
  items: [{ sku: 'TEST-L', quantity: 2 }],
  paymentMethod: 'cod',
};
describe('checkout validation', () => {
  it('accepts a valid COD request', () =>
    expect(checkoutSchema.safeParse(valid).success).toBe(true));
  it.each(['000000', '12345', 'abcdef'])('rejects PIN %s', (pincode) =>
    expect(
      checkoutSchema.safeParse({ ...valid, customer: { ...valid.customer, pincode } }).success,
    ).toBe(false),
  );
  it('rejects online payments', () =>
    expect(checkoutSchema.safeParse({ ...valid, paymentMethod: 'online' }).success).toBe(false));
  it('rejects client total injection', () =>
    expect(checkoutSchema.safeParse({ ...valid, total: 1 }).success).toBe(false));
  it.each([0, -1, 1.5, 11])('rejects quantity %i', (quantity) =>
    expect(
      checkoutSchema.safeParse({ ...valid, items: [{ sku: 'TEST-L', quantity }] }).success,
    ).toBe(false),
  );
  it('requires a valid idempotency key', () =>
    expect(checkoutSchema.safeParse({ ...valid, idempotencyKey: 'bad' }).success).toBe(false));
});
describe('server catalogue validation', () => {
  it('uses current catalogue prices', () =>
    expect(validateLines([{ sku: 'TEST-L', quantity: 2 }], [product])[0].total).toBe(300000));
  it('rejects unknown SKU', () =>
    expect(() => validateLines([{ sku: 'UNKNOWN', quantity: 1 }], [product])).toThrow());
  it('rejects unavailable size', () =>
    expect(() => validateLines([{ sku: 'TEST-S', quantity: 1 }], [product])).toThrow());
  it('rejects insufficient stock', () =>
    expect(() => validateLines([{ sku: 'TEST-L', quantity: 3 }], [product])).toThrow());
  it('rejects duplicate SKUs', () =>
    expect(() =>
      validateLines(
        [
          { sku: 'TEST-L', quantity: 1 },
          { sku: 'TEST-L', quantity: 1 },
        ],
        [product],
      ),
    ).toThrow());
  it('rejects invalid currency amounts', () =>
    expect(() =>
      validateLines(
        [{ sku: 'TEST-L', quantity: 1 }],
        [{ ...product, variants: [{ ...product.variants[0], price: 1.5 }] }],
      ),
    ).toThrow());
});
