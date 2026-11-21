import type { Metadata } from 'next';
import Link from 'next/link';
import { catalogState } from '@/lib/catalog';
import { getContent } from '@/lib/content';
import { getNewDrops } from '@/lib/new-drops';
import { DropBrowser } from '@/components/drop-browser';
import { money } from '@/types/commerce';
export const metadata: Metadata = {
  title: 'New Drops',
  description:
    'The latest Smoke & Stereo releases. New streetwear, independent expression, and a different frequency.',
  alternates: { canonical: '/new-drops' },
};
export default async function NewDropsPage() {
  const [catalog, content] = await Promise.all([catalogState(), getContent()]);
  const current = getNewDrops(catalog.products);
  const latest = current[0];
  return (
    <>
      <header className="drop-heading">
        <div>
          <span className="eyebrow muted">FRESH OFF THE FREQUENCY.</span>
          <h1>
            THE NEW
            <br />
            <span className="outline-text">ROTATION.</span>
          </h1>
        </div>
        <div className="drop-heading-copy">
          <p>
            New expressions. Same independent spirit. Explore what just entered the Smoke & Stereo
            rotation.
          </p>
          <a href="#drop-lineup" className="text-link">
            EXPLORE THE DROP
          </a>
        </div>
      </header>
      {latest && (
        <section className="drop-spotlight">
          <Link
            className="drop-spotlight-photo"
            href={`/product/${encodeURIComponent(latest.sku)}`}
          >
            {latest.images[0] && (
              <img src={latest.images[0]} alt={latest.name} fetchPriority="high" />
            )}
          </Link>
          <div className="drop-spotlight-content">
            <span className="eyebrow">IN THE SPOTLIGHT / CURRENT DROP</span>
            <h2>{latest.name}</h2>
            <p>{money(Math.min(...latest.variants.map((variant) => variant.price)))}</p>
            <Link className="button" href={`/product/${encodeURIComponent(latest.sku)}`}>
              EXPLORE THE PIECE
            </Link>
          </div>
        </section>
      )}
      <section className="section" id="drop-lineup">
        <DropBrowser
          current={current}
          archive={catalog.products.filter((product) => product.collections.includes('ARCHIVE'))}
          upcoming={{
            title: content.upcomingDropTitle,
            date: content.upcomingDropDate,
            image: content.upcomingDropImage,
            copy: content.upcomingDropCopy,
          }}
        />
      </section>
    </>
  );
}
