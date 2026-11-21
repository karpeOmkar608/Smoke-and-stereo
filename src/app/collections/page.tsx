import { catalogState } from '@/lib/catalog';
import { getContent } from '@/lib/content';
import { CollectionPanels, campaignAssets } from '@/components/editorial';
export const metadata = { title: 'Collections' };
export default async function Collections() {
  const [catalog, content] = await Promise.all([catalogState(), getContent()]);
  return (
    <>
      <div className="page-heading collections-intro">
        <div>
          <span className="eyebrow muted">DIFFERENT EXPRESSIONS. THE SAME SPIRIT.</span>
          <h1>
            FIND YOUR
            <br />
            <span className="outline-text">FREQUENCY.</span>
          </h1>
        </div>
        <p>
          For the sound you carry.
          <br />
          The streets you come from.
          <br />
          The way you choose to show up.
        </p>
      </div>
      <div className="page-content collections-page">
        <CollectionPanels
          products={catalog.products}
          heroImage={content.heroImage || campaignAssets.hero}
          campaignImage={content.campaignImage || campaignAssets.campaign}
        />
      </div>
    </>
  );
}
