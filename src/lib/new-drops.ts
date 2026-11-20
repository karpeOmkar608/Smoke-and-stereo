import type { Product } from '@/types/commerce';

export function getNewDrops(products: Product[]): Product[] {
  const timestamp = (product: Product) => {
    const value = product.createdAt ? Date.parse(product.createdAt) : NaN;
    return Number.isFinite(value) ? value : 0;
  };

  return products
    .filter((product) => product.collections.includes('NEW DROPS'))
    .sort((a, b) => timestamp(b) - timestamp(a));
}
