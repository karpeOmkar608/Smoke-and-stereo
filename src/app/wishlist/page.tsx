import { catalogState } from '@/lib/catalog';
import { Shop } from '@/components/products';
export default async function Wishlist() {
  const { products } = await catalogState();
  return (
    <>
      <div className="page-heading">
        <span className="eyebrow muted">KEEP IT IN YOUR ROTATION</span>
        <h1>YOUR WISHLIST.</h1>
      </div>
      <div className="page-content">
        <Shop products={products} wishlistOnly />
      </div>
    </>
  );
}
