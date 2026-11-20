import { catalogState } from '@/lib/catalog';
import { notFound } from 'next/navigation';
import { ProductDetail } from '@/components/products';
import Link from 'next/link';
export async function generateMetadata({ params }: { params: Promise<{ sku: string }> }) {
  const { sku } = await params;
  const { products } = await catalogState();
  const p = products.find((p) => p.sku === sku);
  return { title: p?.name || 'Product', description: p?.description };
}
export default async function ProductPage({ params }: { params: Promise<{ sku: string }> }) {
  const { sku } = await params;
  const { products } = await catalogState();
  const product = products.find((p) => p.sku === sku);
  if (!product) notFound();
  return (
    <div className="page-content">
      <div className="small muted" style={{ paddingTop: 25 }}>
        <Link href="/shop">THE ROTATION</Link> / {product.name}
      </div>
      <ProductDetail product={product} />
    </div>
  );
}
