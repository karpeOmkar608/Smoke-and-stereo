import Link from 'next/link';
import type { SiteContent } from '@/lib/content';
import { Wordmark } from './navigation';
import { ArrowUp } from 'lucide-react';

export function Footer({ content }: { content: SiteContent }) {
  return (
    <footer className="site-footer">
      <div className="footer-statement">
        <span className="eyebrow">BUILT FROM CULTURE. DRIVEN BY SOUND.</span>
        <p>
          WORN WITHOUT
          <br />
          <span>PERMISSION.</span>
        </p>
      </div>
      <div className="footer-top">
        <div>
          <Link href="/" aria-label="Smoke and Stereo home">
            <Wordmark />
          </Link>
          <p>
            DHH × Indian streets ×<br />
            contemporary streetwear.
            <br />
            Independent. Always.
          </p>
          <a className="text-link" href="/#frequency">
            JOIN THE FREQUENCY
          </a>
        </div>
        <div>
          <span className="eyebrow">EXPLORE</span>
          <Link href="/shop">Shop all</Link>
          <Link href="/new-drops">New drops</Link>
          <Link href="/collections">Collections</Link>
          <Link href="/culture">Culture</Link>
          <Link href="/about">Our story</Link>
        </div>
        <div>
          <span className="eyebrow">SUPPORT</span>
          <Link href="/info/shipping">Shipping</Link>
          <Link href="/info/returns">Returns & refunds</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/info/faq">FAQs</Link>
          <Link href="/account">Your account</Link>
        </div>
        <div>
          <span className="eyebrow">STAY CONNECTED</span>
          {content.instagram && (
            <a href={content.instagram} target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
          )}
          {content.youtube && (
            <a href={content.youtube} target="_blank" rel="noopener noreferrer">
              YouTube
            </a>
          )}
          <Link href="/wishlist">Wishlist</Link>
          <span className="footer-origin">
            ROOTED IN INDIA.
            <br />
            TUNED TO THE UNDERGROUND.
          </span>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} SMOKE & STEREO</span>
        <span>ALL CULTURE. NO COMPROMISE.</span>
        <div>
          <Link href="/info/privacy">Privacy</Link>
          <Link href="/info/terms">Terms</Link>
          <a className="back-to-top" href="#main">
            BACK TO TOP{' '}
            <ArrowUp
              className="ui-icon"
              size={14}
              strokeWidth={1.5}
              aria-hidden="true"
              focusable="false"
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
