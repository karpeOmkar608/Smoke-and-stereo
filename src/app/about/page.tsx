import Link from 'next/link';
import { getContent } from '@/lib/content';
import { CampaignImage, campaignAssets } from '@/components/editorial';
export const metadata = { title: 'Our story' };
export default async function About() {
  const content = await getContent();
  return (
    <>
      <div className="page-heading">
        <span className="eyebrow muted">A CULTURE. AN ATTITUDE. A FREQUENCY.</span>
        <h1 className="about-title">
          BUILT FROM CULTURE.
          <br />
          <span className="outline-text">DRIVEN BY SOUND.</span>
        </h1>
      </div>
      <div className="page-content about-editorial">
        <div className="about-image-sticky">
          <CampaignImage
            src={content.heroImage || campaignAssets.hero}
            alt="Smoke & Stereo campaign concept in an industrial Indian urban setting"
            sizes="(max-width: 760px) 100vw, 50vw"
          />
        </div>
        <div className="prose">
          <h2>
            WE DIDN’T FOLLOW IT.
            <br />
            WE GREW UP IN IT.
          </h2>
          <p>{content.about}</p>
          <p>
            We come from the same places as the music. The late-night sessions, the local cyphers,
            the voices finding their own language. Desi Hip-Hop is a way of seeing the world. We
            translate that perspective into what you wear.
          </p>
          <h2>
            NOT RAP MERCH.
            <br />A WAY OF LIFE.
          </h2>
          <p>
            Independent identity. Bold expression. Room to move. Every drop belongs to a culture
            that keeps writing its own story.
          </p>
          <p>
            From the underground to the everyday. Rooted in India, tuned to the people who make
            their own way.
          </p>
          <Link className="button light" href="/shop">
            FIND YOUR FREQUENCY
          </Link>
          <div className="culture-topics">
            <span>DHH</span>
            <span>STREET CULTURE</span>
            <span>INDEPENDENT EXPRESSION</span>
          </div>
        </div>
      </div>
    </>
  );
}
