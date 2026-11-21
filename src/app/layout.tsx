import type { Metadata } from 'next';
import '@fontsource/anton/latin-400.css';
import '@fontsource/space-grotesk/latin-400.css';
import '@fontsource/space-grotesk/latin-500.css';
import '@fontsource/space-grotesk/latin-700.css';
import './globals.css';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
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
                ? 'DEMO MODE / FICTIONAL PRODUCTS / NO REAL ORDERS OR PAYMENTS'
                : content.announcement
            }
          />
          <main id="main">{children}</main>
          <Footer content={content} />
        </StoreProvider>
      </body>
    </html>
  );
}
