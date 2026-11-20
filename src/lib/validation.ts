import { z } from 'zod';
export const checkoutSchema = z
  .object({
    idempotencyKey: z.uuid(),
    customer: z.object({
      name: z.string().trim().min(2).max(100),
      email: z.email().max(254),
      phone: z.string().regex(/^[6-9]\d{9}$/),
      address: z.string().trim().min(10).max(500),
      city: z.string().trim().min(2).max(100),
      state: z.string().trim().min(2).max(100),
      pincode: z.string().regex(/^[1-9]\d{5}$/),
    }),
    items: z
      .array(
        z.object({ sku: z.string().min(1).max(200), quantity: z.number().int().min(1).max(10) }),
      )
      .min(1)
      .max(30),
    paymentMethod: z.literal('cod'),
  })
  .strict();
export function validateLines(
  items: { sku: string; quantity: number }[],
  products: import('@/types/commerce').Product[],
) {
  const seen = new Set<string>();
  return items.map((line) => {
    if (seen.has(line.sku)) throw new Error('Duplicate SKU in bag');
    seen.add(line.sku);
    const product = products.find((p) => p.variants.some((v) => v.sku === line.sku));
    const variant = product?.variants.find((v) => v.sku === line.sku);
    if (
      !product ||
      !variant ||
      !variant.available ||
      (variant.stock !== undefined && variant.stock < line.quantity)
    )
      throw new Error('A selected item is unavailable. Please update your bag.');
    if (!Number.isSafeInteger(variant.price) || variant.price < 0)
      throw new Error('Invalid catalogue price');
    return { ...line, product, variant, total: variant.price * line.quantity };
  });
}
