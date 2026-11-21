import Link from 'next/link';
import { Newsletter } from '@/components/newsletter';
import { catalogState } from '@/lib/catalog';
import { getContent } from '@/lib/content';
import { getNewDrops } from '@/lib/new-drops';
import { publishedStories } from '@/lib/editorial';
import { ProductCard } from '@/components/products';
import { CinematicHero } from '@/components/cinematic-hero';
import {
  CampaignSection,
  CollectionPanels,
  SectionTitle,
  campaignAssets,
} from '@/components/editorial';
import { JournalPreview } from '@/components/journal';

export default async function Home() {
  const [catalog, content] = await Promise.all([catalogState(), getContent()]);
  const drops = getNewDrops(catalog.products);
  const selection = (
    drops.length ? drops : catalog.products.filter((product) => product.featured)
  ).slice(0, 4);
  const heroImage = content.heroImage || campaignAssets.hero;
  const campaignImage = content.campaignImage || campaignAssets.campaign;
  return (
    <>
      <CinematicHero image={heroImage} title={content.heroTitle} copy={content.heroCopy} />
      <section className="manifesto section" id="manifesto">
        <div className="manifesto-meta">
          <span className="eyebrow">THE SMOKE & STEREO MANIFESTO</span>
          <span className="editorial-cross" aria-hidden="true">
            +
          </span>
        </div>
        <h2>
          WE DIDN’T FOLLOW
          <br />
          THE CULTURE.
          <br />
          <span>WE GREW UP IN IT.</span>
        </h2>
        <div className="manifesto-bottom">
          <span className="eyebrow">
            DESI HIP-HOP.
            <br />
            INDIAN STREETS.
            <br />
            INDEPENDENT EXPRESSION.
          </span>
          <div>
            <p>
              From the underground to the everyday. Inspired by the sound, the streets, and the
              people shaping a new expression of Indian hip-hop.
            </p>
            <Link className="text-link" href="/about">
              READ OUR STORY
            </Link>
          </div>
        </div>
      </section>
      <section className="latest-editorial section">
        <SectionTitle
          label="NEW ENERGY. SAME ROOTS."
          title={
            <>
              THE LATEST
              <br />
              <span className="outline-text">DROP.</span>
            </>
          }
          href="/new-drops"
          linkLabel="EXPLORE NEW DROPS"
        />
        {selection.length ? (
          <div className="editorial-product-grid">
            {selection.map((product) => (
              <ProductCard key={product.sku} product={product} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>
              THE NEXT FREQUENCY
              <br />
              IS BUILDING.
            </h3>
            <p>Be first to hear when the next drop lands.</p>
            <a href="#frequency" className="button light">
              GET FIRST ACCESS
            </a>
          </div>
        )}
        <div className="section-bottom">
          <span className="eyebrow muted">SILHOUETTES WITH SOMETHING TO SAY.</span>
          <Link className="text-link" href="/shop">
            VIEW ALL PRODUCTS
          </Link>
        </div>
      </section>
      <section className="collections-editorial section">
        <SectionTitle
          label="CHOOSE YOUR EXPRESSION"
          title={
            <>
              NOT ONE
              <br />
              OF THE SAME.
            </>
          }
          href="/collections"
          linkLabel="ALL COLLECTIONS"
        />
        <CollectionPanels
          limit={4}
          products={catalog.products}
          heroImage={heroImage}
          campaignImage={campaignImage}
        />
      </section>
      <section className="journal-section section">
        <SectionTitle
          label="SOUND / ART / COMMUNITY"
          title={
            <>
              FREQUENCY
              <br />
              <span className="outline-text">/ CULTURE</span>
            </>
          }
          href="/culture"
          linkLabel="ENTER THE JOURNAL"
        />
        <JournalPreview
          stories={publishedStories(content.editorialStories).slice(0, 3)}
          image={campaignImage}
        />
      </section>
      <CampaignSection image={campaignImage} />
      <section id="frequency" className="newsletter section">
        <div>
          <span className="eyebrow muted">LESS NOISE. MORE SIGNAL.</span>
          <h2>
            STAY IN THE
            <br />
            FREQUENCY.
          </h2>
          <p>
            First access to new drops, exclusive releases,
            <br />
            and everything inside Smoke & Stereo.
          </p>
        </div>
        <Newsletter />
      </section>
    </>
  );
}
