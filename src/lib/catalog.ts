import 'server-only';
import { unstable_cache } from 'next/cache';
import type { Product } from '@/types/commerce';
import { serviceClient } from './supabase/server';
import { isDemoMode } from './demo-mode';
import { demoProducts } from './demo/catalog';
export class CatalogError extends Error {}
// Intentionally no guessed provider interface. This boundary must be implemented
// from a redacted real catalogue response before CATALOG_SCHEMA_VERIFIED is enabled.
export function mapProviderCatalog(_raw: unknown): Product[] {
  throw new CatalogError('Catalogue schema has not been verified.');
}
export async function provider(path: string, init: RequestInit = {}) {
  if (isDemoMode()) throw new CatalogError('Supplier calls are blocked in demo mode.');
  const key = process.env.INDIAN_DROPSHIPPERS_API_KEY;
  if (!key) throw new CatalogError('Catalogue connection is being prepared.');
  const base =
    process.env.INDIAN_DROPSHIPPERS_BASE_URL || 'https://indiandropshippers.com/api/external';
  if (!base.startsWith('https://')) throw new CatalogError('Provider requires HTTPS');
  const response = await fetch(`${base}${path}`, {
    ...init,
    headers: { 'x-api-key': key, 'Content-Type': 'application/json', ...init.headers },
    signal: AbortSignal.timeout(15000),
    cache: 'no-store',
  });
  if (!response.ok) throw new CatalogError(`Provider returned HTTP ${response.status}`);
  return response.json() as Promise<unknown>;
}
async function fetchProducts() {
  if (process.env.CATALOG_SCHEMA_VERIFIED !== 'true')
    throw new CatalogError('Our next drop is being tuned. Join the list for first access.');
  const products = mapProviderCatalog(await provider('/catalog'));
  const db = serviceClient();
  const { data, error } = await db.from('product_merchandising').select('*');
  if (error) throw new CatalogError('Merchandising is temporarily unavailable');
  return products
    .filter((p) => !data?.some((m) => m.external_sku === p.sku && m.hidden))
    .map((p) => {
      const m = data?.find((m) => m.external_sku === p.sku);
      return {
        ...p,
        collections: m?.collections || [],
        featured: m?.featured || false,
        description: m?.editorial_description || p.description,
        sizeGuide: m?.size_guide || p.sizeGuide,
      };
    });
}
const getLiveCatalog = unstable_cache(fetchProducts, ['external-catalog'], {
  revalidate: 120,
  tags: ['catalog'],
});
export const getCatalog = () => (isDemoMode() ? Promise.resolve(demoProducts) : getLiveCatalog());
export const freshCatalog = () => (isDemoMode() ? Promise.resolve(demoProducts) : fetchProducts());
export async function catalogState() {
  if (isDemoMode())
    return { products: demoProducts, message: 'Demo catalogue — fictional test products.' };
  if (process.env.CATALOG_SCHEMA_VERIFIED !== 'true') {
    return {
      products: [] as Product[],
      message: 'Our next drop is being tuned. Join the list for first access.',
    };
  }
  try {
    return { products: await getCatalog(), message: '' };
  } catch (e) {
    console.error('Catalogue unavailable:', e instanceof Error ? e.message : 'Unknown');
    return {
      products: [] as Product[],
      message: 'Our next drop is being tuned. Join the list for first access.',
    };
  }
}
