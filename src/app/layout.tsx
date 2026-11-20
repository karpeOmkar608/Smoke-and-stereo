import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import { Navigation, Wordmark } from '@/components/navigation';
import { StoreProvider } from '@/components/store-provider';
import { getContent } from '@/lib/content';
import { isDemoMode } from '@/lib/demo-mode';
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: { default: 'SMOKE & STEREO — Built from culture.', template: '%s | SMOKE & STEREO' },
  description:
    'Independent Indian streetwear. Desi Hip-Hop, street culture, and a different frequency.',
  openGraph: {
    title: 'SMOKE & STEREO',
    description: 'Built from culture. Independent Indian streetwear.',
    type: 'website',
  },
};
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const content = await getContent();
  const demo = isDemoMode();
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <StoreProvider demo={demo}>
          <a href="#main" className="skip-link">
            Skip to content
          </a>
          <Navigation
            announcement={
              demo
                ? 'DEMO MODE — FICTIONAL PRODUCTS. NO REAL ORDERS OR PAYMENTS.'
                : content.announcement
            }
          />
          <main id="main">{children}</main>
          <footer>
            <div className="footer-top">
              <div>
                <Link href="/">
                  <Wordmark />
                </Link>
                <p>
                  Independent by nature.
                  <br />
                  Rooted in the culture.
                </p>
              </div>
              <div>
                <span className="eyebrow">THE ROTATION</span>
                <Link href="/shop">Shop all</Link>
                <Link href="/new-drops">New drops</Link>
                <Link href="/collections">Collections</Link>
                <Link href="/about">Our story</Link>
                <Link href="/wishlist">Wishlist</Link>
              </div>
              <div>
                <span className="eyebrow">HERE TO HELP</span>
                <Link href="/info/shipping">Shipping</Link>
                <Link href="/info/returns">Returns & refunds</Link>
                <Link href="/contact">Contact</Link>
                <Link href="/info/faq">FAQs</Link>
              </div>
              <div>
                <span className="eyebrow">STAY CONNECTED</span>
                {content.instagram && (
                  <a href={content.instagram} rel="noopener noreferrer" target="_blank">
                    Instagram
                  </a>
                )}
                {content.youtube && (
                  <a href={content.youtube} rel="noopener noreferrer" target="_blank">
                    YouTube
                  </a>
                )}
                <Link href="/account">Your account</Link>
                <p>
                  DESIGNED IN INDIA.
                  <br />
                  MADE FOR YOUR FREQUENCY.
                </p>
              </div>
            </div>
            <div className="footer-bottom">
              <span>© {new Date().getFullYear()} SMOKE & STEREO</span>
              <span>ALL CULTURE. NO COMPROMISE.</span>
              <div>
                <Link href="/info/privacy">Privacy</Link>
                <Link href="/info/terms">Terms</Link>
              </div>
            </div>
          </footer>
        </StoreProvider>
      </body>
    </html>
  );
}
