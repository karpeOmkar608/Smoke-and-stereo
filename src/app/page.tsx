import Link from 'next/link';
import { SoundArt } from '@/components/sound-art';
import { Newsletter } from '@/components/newsletter';
import { catalogState } from '@/lib/catalog';
import { getContent } from '@/lib/content';
import { ProductCard } from '@/components/products';
export default async function Home() {
  const [catalog, content] = await Promise.all([catalogState(), getContent()]);
  const featured = catalog.products.filter((p) => p.featured);
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="mini-star">✳</span> INDEPENDENT INDIAN STREETWEAR
          </div>
          <h1>
            {content.heroTitle.split(' ').map((word, i) => (
              <span key={i} className={i === 2 ? 'outline-text' : ''}>
                {word}{' '}
              </span>
            ))}
          </h1>
          <p>{content.heroCopy}</p>
          <div className="hero-actions">
            <Link className="button acid" href="/new-drops">
              EXPLORE THE DROP
            </Link>
            <Link className="text-link" href="/about">
              DISCOVER THE CULTURE
            </Link>
          </div>
          <div className="hero-footnote">
            <span>
              ROOTED IN SOUND.
              <br />
              WORN WITH INTENT.
            </span>
            <span className="sound-wave">▂▅▃▇▆▂▅▇▃▅▂▆▇▃▁</span>
          </div>
        </div>
        {content.heroImage ? (
          <div
            className="hero-image"
            style={{ backgroundImage: `url(${JSON.stringify(content.heroImage)})` }}
            role="img"
            aria-label="Smoke and Stereo campaign"
          />
        ) : (
          <SoundArt />
        )}
      </section>
      <div className="ticker">
        <div>
          DESI HIP-HOP <b>✳</b> STREET CULTURE <b>✳</b> INDEPENDENT EXPRESSION <b>✳</b> SMOKE &
          STEREO <b>✳</b> A DIFFERENT FREQUENCY <b>✳</b>
        </div>
      </div>
      <section className="section drop-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow muted">THE CURRENT ROTATION</span>
            <h2>
              FRESH FREQUENCIES<span className="acid-text">.</span>
            </h2>
          </div>
          <Link className="text-link" href="/shop">
            SHOP ALL DROPS
          </Link>
        </div>
        {featured.length ? (
          <div className="product-grid">
            {featured.slice(0, 4).map((p) => (
              <ProductCard key={p.sku} product={p} />
            ))}
          </div>
        ) : (
          <div className="drop-empty">
            <div className="drop-symbol">✳</div>
            <div>
              <span className="eyebrow">SOMETHING IS BUILDING.</span>
              <h3>
                THE NEXT DROP
                <br />
                IS ON ITS WAY.
              </h3>
              <p>
                Good things take their own time.
                <br />
                Get on the list. Be first in the room.
              </p>
            </div>
            <a href="#frequency" className="button light">
              GET FIRST ACCESS
            </a>
          </div>
        )}
      </section>
      <section className="culture-section">
        <div className="culture-label">
          <span className="eyebrow">THIS IS SMOKE & STEREO</span>
          <span className="culture-asterisk">✳</span>
        </div>
        <div>
          <h2>
            MORE THAN
            <br />
            WHAT YOU <em>WEAR.</em>
          </h2>
          <p>{content.about}</p>
          <Link className="text-link" href="/about">
            MEET THE CULTURE
          </Link>
        </div>
        <div className="culture-bottom">
          <span>DHH × STREET CULTURE × CONTEMPORARY STREETWEAR</span>
          <span>INDEPENDENT. ALWAYS.</span>
        </div>
      </section>
      <section
        className="campaign section"
        style={
          content.campaignImage
            ? {
                backgroundImage: `linear-gradient(90deg, #0b0b0be6, #0b0b0b33), url(${JSON.stringify(content.campaignImage)})`,
              }
            : undefined
        }
      >
        <div className="campaign-lines" aria-hidden="true">
          S&S
          <br />
          S&S
          <br />
          S&S
        </div>
        <div className="campaign-copy">
          <span className="eyebrow">FOR THE ONES ON THEIR OWN WAVELENGTH.</span>
          <h2>
            NOT MADE
            <br />
            TO FIT IN.
          </h2>
          <p>
            No borrowed identity. No permission needed.
            <br />
            Just your sound. Your streets. Your expression.
          </p>
          <Link className="button light" href="/collections">
            FIND YOUR FREQUENCY
          </Link>
        </div>
        <span className="campaign-mark">
          SMOKE & STEREO®
          <br />
          CULTURE IN EVERY THREAD.
        </span>
      </section>
      <section id="frequency" className="newsletter section">
        <div>
          <span className="eyebrow muted">DON’T MISS THE SIGNAL.</span>
          <h2>
            STAY IN THE
            <br />
            <em>FREQUENCY.</em>
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
