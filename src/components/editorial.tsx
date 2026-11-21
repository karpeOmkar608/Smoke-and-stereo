import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Product } from '@/types/commerce';
import { Plus } from 'lucide-react';

export const campaignAssets = {
  hero: '/campaigns/culture-hero-concept.webp',
  campaign: '/campaigns/independent-campaign-concept.webp',
};

export function CampaignImage({
  src,
  alt,
  className = '',
  priority = false,
  sizes = '100vw',
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <div className={`campaign-image ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        preload={priority}
        unoptimized={!src.startsWith('/')}
      />
    </div>
  );
}

export function SectionTitle({
  label,
  title,
  href,
  linkLabel,
  light = false,
}: {
  label: string;
  title: ReactNode;
  href?: string;
  linkLabel?: string;
  light?: boolean;
}) {
  return (
    <div className={`section-heading ${light ? 'on-light' : ''}`}>
      <div>
        <span className="eyebrow muted">{label}</span>
        <h2>{title}</h2>
      </div>
      {href && (
        <Link href={href} className="text-link">
          {linkLabel || 'EXPLORE'}
        </Link>
      )}
    </div>
  );
}

export const collectionDefinitions = [
  { name: 'NEW DROPS', copy: 'The latest in your rotation.', href: '/new-drops' },
  {
    name: 'GRAPHIC TEES',
    copy: 'Expression. In its loudest form.',
    href: '/shop?collection=GRAPHIC%20TEES',
  },
  {
    name: 'OVERSIZED ESSENTIALS',
    copy: 'Room to move. Space to be.',
    href: '/shop?collection=OVERSIZED%20ESSENTIALS',
  },
  {
    name: 'LIMITED EDITIONS',
    copy: 'Individual pieces. Independent spirit.',
    href: '/shop?collection=LIMITED%20EDITIONS',
  },
  { name: 'BESTSELLERS', copy: 'A place in the rotation.', href: '/shop?collection=BESTSELLERS' },
];

export function CollectionPanels({
  products,
  heroImage,
  campaignImage,
  limit,
}: {
  products: Product[];
  heroImage: string;
  campaignImage: string;
  limit?: number;
}) {
  const selected = new Set<string>();
  return (
    <div className="collection-panels">
      {collectionDefinitions.slice(0, limit).map((collection, index) => {
        const matches = products.filter(
          (p) => p.collections.includes(collection.name) && p.images.length,
        );
        const preview = matches.find((p) => !selected.has(p.sku)) || matches[0];
        if (preview) selected.add(preview.sku);
        const image = preview?.images[0];
        return (
          <Link
            href={collection.href}
            className={`collection-panel ${image ? 'has-product' : ''}`}
            key={collection.name}
          >
            <CampaignImage
              src={image || (index % 2 ? campaignImage : heroImage)}
              alt={
                image
                  ? `${collection.name} collection preview`
                  : 'Smoke & Stereo campaign styling concept'
              }
              sizes="(max-width: 760px) 100vw, 50vw"
            />
            <div className="collection-panel-top">
              <span className="eyebrow">SMOKE & STEREO</span>
              <span className="panel-cross" aria-hidden="true">
                <Plus className="ui-icon" size="1em" strokeWidth={1} />
              </span>
            </div>
            <div className="collection-panel-copy">
              <span className="eyebrow">{collection.copy}</span>
              <h3>{collection.name}</h3>
              <span className="text-link">EXPLORE COLLECTION</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export function CampaignSection({ image }: { image: string }) {
  return (
    <section className="campaign-banner">
      <CampaignImage src={image} alt="Smoke & Stereo independent streetwear campaign concept" />
      <div className="campaign-banner-copy">
        <span className="eyebrow">A DIFFERENT FREQUENCY.</span>
        <h2>
          NO APOLOGIES.
          <br />
          NO PERMISSION.
        </h2>
        <Link className="button light" href="/about">
          EXPLORE THE WORLD OF S&S
        </Link>
      </div>
      <div className="campaign-banner-caption">
        <span>BUILT FROM CULTURE.</span>
        <span>SMOKE & STEREO / CAMPAIGN STUDY</span>
      </div>
    </section>
  );
}
