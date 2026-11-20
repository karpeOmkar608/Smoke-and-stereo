import type { Metadata } from 'next';
import Link from 'next/link';
import { catalogState } from '@/lib/catalog';
import { getNewDrops } from '@/lib/new-drops';
import { Shop } from '@/components/products';
import { money } from '@/types/commerce';

export const metadata: Metadata = {
  title: 'New Drops',
  description:
    'The latest Smoke & Stereo releases. New streetwear, independent expression, and a different frequency.',
  alternates: { canonical: '/new-drops' },
};

export default async function NewDropsPage() {
  const { products } = await catalogState();
  const drops = getNewDrops(products);
  const latest = drops[0];

  return (
    <>
      <section className="new-drops-hero" aria-labelledby="new-drops-title">
        <div className="new-drops-copy">
          <span className="eyebrow acid-text">JUST ENTERED THE ROTATION</span>
          <h1 id="new-drops-title">
            NEW
            <br />
            <span>DROPS.</span>
          </h1>
          <p>
            Fresh expressions. Same independent spirit.
            <br />
            Meet the latest additions to your frequency.
          </p>
          {latest ? (
            <a className="button acid" href="#drop-lineup">
              EXPLORE THE LATEST
            </a>
          ) : (
            <Link className="button acid" href="/#frequency">
              GET FIRST ACCESS
            </Link>
          )}
          <div className="new-drops-note">
            <span className="eyebrow muted">
              CULTURE KEEPS MOVING.
              <br />
              SO DOES THE ROTATION.
            </span>
            <span aria-hidden="true">✳</span>
          </div>
        </div>
        {latest ? (
          <Link
            className="new-drops-feature"
            href={`/product/${encodeURIComponent(latest.sku)}`}
            aria-label={`Explore ${latest.name}`}
          >
            <span className="new-drops-label eyebrow">IN THE SPOTLIGHT</span>
            {latest.images[0] ? (
              <img src={latest.images[0]} alt={latest.name} fetchPriority="high" />
            ) : (
              <div className="new-drops-art" aria-hidden="true">
                ✳
              </div>
            )}
            <div className="new-drops-feature-meta">
              <div>
                <span className="eyebrow">LATEST RELEASE</span>
                <h2>{latest.name}</h2>
              </div>
              <span>{money(Math.min(...latest.variants.map((variant) => variant.price)))}</span>
            </div>
          </Link>
        ) : (
          <div className="new-drops-pending">
            <span className="new-drops-art" aria-hidden="true">
              ✳
            </span>
            <span className="eyebrow">THE NEXT FREQUENCY IS BUILDING.</span>
            <p>Be first to hear when the next drop lands.</p>
          </div>
        )}
      </section>
      <section className="section" id="drop-lineup" aria-labelledby="drop-lineup-title">
        <div className="section-heading">
          <div>
            <span className="eyebrow muted">FRESH OFF THE FREQUENCY</span>
            <h2 id="drop-lineup-title">
              THE LATEST LINEUP<span className="acid-text">.</span>
            </h2>
          </div>
          <Link href="/shop" className="text-link">
            SHOP THE FULL ROTATION
          </Link>
        </div>
        {drops.length ? (
          <Shop products={drops} initialSort="newest" />
        ) : (
          <div className="empty-state">
            <h2>THE NEXT DROP IS ON ITS WAY.</h2>
            <p>Get on the list for first access to the next release.</p>
            <Link className="button light" href="/#frequency">
              STAY IN THE FREQUENCY
            </Link>
          </div>
        )}
      </section>
    </>
  );
}
