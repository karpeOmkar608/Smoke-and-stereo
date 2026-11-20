import Link from 'next/link';
import { SoundArt } from '@/components/sound-art';
import { getContent } from '@/lib/content';
export const metadata = { title: 'The culture' };
export default async function About() {
  const content = await getContent();
  return (
    <>
      <div className="page-heading">
        <span className="eyebrow acid-text">A CULTURE. AN ATTITUDE. A FREQUENCY.</span>
        <h1 className="about-title">
          ROOTED IN SOUND.
          <br />
          <span className="outline-text">WORN WITH INTENT.</span>
        </h1>
      </div>
      <div className="page-content about-grid">
        <SoundArt small />
        <div className="prose">
          <h2>
            FROM THE STREETS.
            <br />
            FOR THE CULTURE.
          </h2>
          <p>{content.about}</p>
          <p>
            We come from the same places as the music. The late-night sessions, the local cyphers,
            the voices finding their own language. Desi Hip-Hop is a way of seeing the world. We
            translate that perspective into what you wear.
          </p>
          <p>
            Independent identity. Bold expression. Room to move. Every drop belongs to a culture
            that keeps writing its own story.
          </p>
          <h2>
            YOUR SOUND.
            <br />
            YOUR EXPRESSION.
          </h2>
          <Link href="/shop" className="button acid">
            EXPLORE THE ROTATION
          </Link>
        </div>
      </div>
    </>
  );
}
