import { catalogState } from '@/lib/catalog';
import { Shop, RecentlyViewed } from '@/components/products';
export const metadata = { title: 'Shop the rotation' };
export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const [catalog, params] = await Promise.all([catalogState(), searchParams]);
  return (
    <>
      <div className="page-heading">
        <span className="eyebrow muted">INDEPENDENT EXPRESSION. IN EVERY THREAD.</span>
        <h1>
          THE ROTATION<span className="acid-text">.</span>
        </h1>
        <p>Find what speaks your language.</p>
      </div>
      <div className="page-content">
        <Shop
          products={catalog.products}
          initialQuery={params.q || ''}
          initialSort={params.sort || 'newest'}
          collection={params.collection}
        />
        <RecentlyViewed products={catalog.products} />
      </div>
    </>
  );
}
