import Link from 'next/link';
import { getContent } from '@/lib/content';
import { publishedStories } from '@/lib/editorial';
import { JournalPreview } from '@/components/journal';
import { campaignAssets } from '@/components/editorial';
export const metadata = {
  title: 'Frequency / Culture',
  description:
    'The culture behind Smoke & Stereo. Desi Hip-Hop, independent expression and Indian street culture.',
};
export default async function Culture() {
  const content = await getContent();
  return (
    <>
      <div className="page-heading culture-heading">
        <span className="eyebrow muted">THE CULTURE BEHIND THE CLOTHES.</span>
        <h1>
          FREQUENCY
          <br />
          <span className="outline-text">/ CULTURE.</span>
        </h1>
        <div className="culture-topics">
          <span>DESI HIP-HOP</span>
          <span>INDEPENDENT ART</span>
          <span>STREET CULTURE</span>
          <span>CREATIVE COMMUNITIES</span>
        </div>
      </div>
      <div className="page-content">
        <JournalPreview
          stories={publishedStories(content.editorialStories)}
          image={content.campaignImage || campaignAssets.campaign}
        />
        <section className="culture-belief">
          <span className="eyebrow">WHAT WE STAND FOR.</span>
          <h2>
            OWN YOUR VOICE.
            <br />
            WEAR YOUR FREQUENCY.
          </h2>
          <p>{content.about}</p>
          <Link className="text-link" href="/about">
            THE SMOKE & STEREO STORY
          </Link>
        </section>
      </div>
    </>
  );
}
