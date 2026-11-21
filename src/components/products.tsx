'use client';
import Link from 'next/link';
import { Heart, Minus, Plus } from 'lucide-react';
import { useEffect, useMemo, useState, useId } from 'react';
import { motion } from 'framer-motion';
import { type Product, money } from '@/types/commerce';
import { useStore } from './store-provider';
import { Modal } from './modal';
import { ProductGallery } from './product-gallery';
import { useRouter } from 'next/navigation';
export function ProductCard({ product }: { product: Product }) {
  const [quick, setQuick] = useState(false);
  const { wishlist, toggleWish } = useStore();
  return (
    <article className="product-card">
      <div className="product-photo">
        <Link href={`/product/${encodeURIComponent(product.sku)}`}>
          {product.images[0] ? (
            <img src={product.images[0]} alt={product.name} loading="lazy" />
          ) : (
            <div className="image-unavailable">IMAGE UNAVAILABLE</div>
          )}
          {product.images[1] && (
            <img className="secondary-photo" src={product.images[1]} alt="" loading="lazy" />
          )}
        </Link>
        {!product.variants.some((variant) => variant.available) && (
          <span className="product-availability">UNAVAILABLE</span>
        )}
        <button
          className="wish-button"
          onClick={() => toggleWish(product.sku)}
          aria-label={`Save ${product.name}`}
          aria-pressed={wishlist.includes(product.sku)}
        >
          <Heart size={19} fill={wishlist.includes(product.sku) ? 'currentColor' : 'none'} />
        </button>
        <button className="quick-add" onClick={() => setQuick(true)}>
          QUICK VIEW / ADD
        </button>
      </div>
      <div className="product-meta">
        <Link href={`/product/${encodeURIComponent(product.sku)}`}>{product.name}</Link>
        <span>{money(Math.min(...product.variants.map((v) => v.price)))}</span>
      </div>
      <p className="small muted">{product.variants.map((v) => v.label).join(' / ')}</p>
      {quick && (
        <Modal label={product.name} onClose={() => setQuick(false)}>
          <ProductDetail product={product} compact />
        </Modal>
      )}
    </article>
  );
}
export function ProductDetail({
  product,
  compact = false,
}: {
  product: Product;
  compact?: boolean;
}) {
  const [selected, setSelected] = useState('');
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const sizeGuideId = useId();
  const { add, notify, wishlist, toggleWish } = useStore();
  const variant = product.variants.find((v) => v.sku === selected);
  useEffect(() => {
    try {
      const recent: string[] = JSON.parse(localStorage.getItem('ss-recent') || '[]');
      localStorage.setItem(
        'ss-recent',
        JSON.stringify([product.sku, ...recent.filter((s) => s !== product.sku)].slice(0, 8)),
      );
    } catch {}
  }, [product.sku]);
  function addItem() {
    if (!variant?.available) {
      notify('Choose an available size first.');
      return false;
    }
    add({
      sku: variant.sku,
      name: product.name,
      image: product.images[0],
      variant: variant.label,
      quantity: qty,
      price: variant.price,
    });
    return true;
  }
  return (
    <div className={`product-detail ${compact ? 'compact' : ''}`}>
      <ProductGallery images={product.images} name={product.name} />
      <div className="product-information">
        <span className="eyebrow muted">{product.category || 'SMOKE & STEREO'}</span>
        <h1>{product.name}</h1>
        <p className="detail-price">
          {money(variant?.price ?? Math.min(...product.variants.map((v) => v.price)))}
        </p>
        <p className="product-description">{product.description}</p>
        <div className="selection-label">
          <span>SELECT YOUR SIZE / VARIANT</span>
          {product.sizeGuide && (
            <a
              href={`#${sizeGuideId}`}
              onClick={() => document.getElementById(sizeGuideId)?.setAttribute('open', '')}
            >
              SIZE GUIDE
            </a>
          )}
        </div>
        <div className="sizes">
          {product.variants.map((v) => (
            <button
              key={v.sku}
              disabled={!v.available}
              className={selected === v.sku ? 'selected' : ''}
              onClick={() => {
                setSelected(v.sku);
                setQty(1);
              }}
            >
              {v.label}
            </button>
          ))}
        </div>
        <div className="quantity">
          <button aria-label="Decrease quantity" onClick={() => setQty(Math.max(1, qty - 1))}>
            <Minus size={16} />
          </button>
          <span>{qty}</span>
          <button
            aria-label="Increase quantity"
            onClick={() => setQty(Math.min(10, variant?.stock ?? 10, qty + 1))}
          >
            <Plus size={16} />
          </button>
        </div>
        <p className="stock-note">
          {variant
            ? variant.available
              ? 'AVAILABLE IN YOUR SELECTED VARIANT'
              : 'THIS VARIANT IS UNAVAILABLE'
            : 'CHOOSE AN AVAILABLE SIZE TO CONTINUE'}
        </p>
        <div className="purchase-bar">
          <button className="button light full" disabled={!variant?.available} onClick={addItem}>
            ADD TO BAG
          </button>
        </div>
        <div className="detail-actions">
          <button
            className="text-link"
            disabled={!variant?.available}
            onClick={() => {
              if (addItem()) router.push('/checkout');
            }}
          >
            BUY NOW
          </button>
          <button className="text-link" onClick={() => toggleWish(product.sku)}>
            {wishlist.includes(product.sku) ? 'SAVED TO WISHLIST' : 'SAVE TO WISHLIST'}
          </button>
        </div>
        <p className="small muted">SKU: {variant?.sku || product.sku}</p>
        {[
          ['DETAILS', product.description],
          ['FABRIC & FIT', [product.fabric, product.fit].filter(Boolean).join(' · ')],
          ['SIZE GUIDE', product.sizeGuide],
        ]
          .filter(([, v]) => v)
          .map(([label, value]) => (
            <details key={label} id={label === 'SIZE GUIDE' ? sizeGuideId : undefined}>
              <summary>{label}</summary>
              <p>{value}</p>
            </details>
          ))}
        <details>
          <summary>SHIPPING & RETURNS</summary>
          <p>
            Read our <Link href="/info/shipping">shipping policy</Link> and{' '}
            <Link href="/info/returns">returns policy</Link> before ordering.
          </p>
        </details>
      </div>
    </div>
  );
}
export function Shop({
  products,
  initialQuery = '',
  initialSort = 'newest',
  collection,
  wishlistOnly = false,
}: {
  products: Product[];
  initialQuery?: string;
  initialSort?: string;
  collection?: string;
  wishlistOnly?: boolean;
}) {
  const { wishlist } = useStore();
  const [query, setQuery] = useState(initialQuery);
  const [debounced, setDebounced] = useState(initialQuery);
  const [sort, setSort] = useState(initialSort);
  const [size, setSize] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState(false);
  const [maxPrice, setMaxPrice] = useState('');
  const [page, setPage] = useState(1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('ss-searches') || '[]');
      if (Array.isArray(saved))
        setRecentSearches(saved.filter((s) => typeof s === 'string').slice(0, 5));
    } catch {}
  }, []);
  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(query);
      setPage(1);
      if (query.trim()) {
        try {
          const recent: string[] = JSON.parse(localStorage.getItem('ss-searches') || '[]');
          localStorage.setItem(
            'ss-searches',
            JSON.stringify([query, ...recent.filter((s) => s !== query)].slice(0, 5)),
          );
        } catch {}
      }
    }, 250);
    return () => clearTimeout(t);
  }, [query]);
  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))];
  const sizes = [...new Set(products.flatMap((p) => p.variants.map((v) => v.label)))];
  const filtered = useMemo(
    () =>
      products
        .filter(
          (p) =>
            (!wishlistOnly || wishlist.includes(p.sku)) &&
            (!collection || p.collections.includes(collection)) &&
            (!category || p.category === category) &&
            (!size || p.variants.some((v) => v.label === size)) &&
            (!stock || p.variants.some((v) => v.available)) &&
            (!maxPrice || p.variants.some((v) => v.price <= Number(maxPrice) * 100)) &&
            `${p.name} ${p.sku} ${p.variants.map((v) => v.sku).join(' ')} ${p.collections.join(' ')}`
              .toLowerCase()
              .includes(debounced.toLowerCase()),
        )
        .sort((a, b) =>
          sort === 'low'
            ? Math.min(...a.variants.map((v) => v.price)) -
              Math.min(...b.variants.map((v) => v.price))
            : sort === 'high'
              ? Math.min(...b.variants.map((v) => v.price)) -
                Math.min(...a.variants.map((v) => v.price))
              : sort === 'az'
                ? a.name.localeCompare(b.name)
                : (b.createdAt || '').localeCompare(a.createdAt || ''),
        ),
    [
      products,
      wishlistOnly,
      wishlist,
      collection,
      category,
      size,
      stock,
      maxPrice,
      debounced,
      sort,
    ],
  );
  return (
    <>
      <div className="shop-toolbar">
        <label className="search-field">
          <span className="sr-only">Search name, SKU, or collection</span>
          <input
            autoFocus={initialQuery !== ''}
            placeholder="SEARCH THE ROTATION"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <label>
          <span className="sr-only">Sort products</span>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="newest">NEWEST FIRST</option>
            <option value="low">PRICE: LOW TO HIGH</option>
            <option value="high">PRICE: HIGH TO LOW</option>
            <option value="az">A—Z</option>
          </select>
        </label>
      </div>
      {!query && recentSearches.length > 0 && (
        <div className="filters">
          <span className="eyebrow muted">RECENT SEARCHES</span>
          {recentSearches.map((term) => (
            <button className="text-link" key={term} onClick={() => setQuery(term)}>
              {term}
            </button>
          ))}
        </div>
      )}
      {query && products.length > 0 && (
        <div className="filters" aria-label="Search suggestions">
          {products
            .filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 3)
            .map((p) => (
              <Link
                className="text-link"
                key={p.sku}
                href={`/product/${encodeURIComponent(p.sku)}`}
              >
                {p.name}
              </Link>
            ))}
        </div>
      )}
      <div className="filters">
        {categories.length > 0 && (
          <label>
            Category{' '}
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All</option>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
        )}
        {sizes.length > 0 && (
          <label>
            Size{' '}
            <select value={size} onChange={(e) => setSize(e.target.value)}>
              <option value="">All</option>
              {sizes.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
        )}
        <label>
          Max price ₹{' '}
          <input
            type="number"
            min="0"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Any"
          />
        </label>
        <label>
          <input type="checkbox" checked={stock} onChange={(e) => setStock(e.target.checked)} /> In
          stock
        </label>
        <span className="small muted">{filtered.length} ITEMS</span>
      </div>
      {filtered.length ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="product-grid">
          {filtered.slice(0, page * 12).map((p) => (
            <ProductCard key={p.sku} product={p} />
          ))}
        </motion.div>
      ) : (
        <div className="empty-state">
          <span className="large-star">✳</span>
          <h2>{products.length ? 'NO SIGNAL FOUND.' : 'THE NEXT DROP IS COMING.'}</h2>
          <p>
            {products.length
              ? 'Try another search or filter.'
              : 'Independent takes its own time. Join the frequency for first access.'}
          </p>
          <Link className="button light" href="/#frequency">
            STAY IN THE FREQUENCY
          </Link>
        </div>
      )}
      {filtered.length > page * 12 && (
        <button className="button light" onClick={() => setPage(page + 1)}>
          LOAD MORE
        </button>
      )}
    </>
  );
}
export function RecentlyViewed({ products }: { products: Product[] }) {
  const [skus, setSkus] = useState<string[]>([]);
  useEffect(() => {
    try {
      const value = JSON.parse(localStorage.getItem('ss-recent') || '[]');
      if (Array.isArray(value)) setSkus(value.filter((s) => typeof s === 'string'));
    } catch {}
  }, []);
  const recent = skus
    .map((sku) => products.find((p) => p.sku === sku))
    .filter((p): p is Product => Boolean(p))
    .slice(0, 4);
  if (!recent.length) return null;
  return (
    <section style={{ marginTop: 60 }}>
      <div className="section-heading">
        <h2>BACK IN YOUR ROTATION.</h2>
      </div>
      <div className="product-grid">
        {recent.map((p) => (
          <ProductCard key={p.sku} product={p} />
        ))}
      </div>
    </section>
  );
}
