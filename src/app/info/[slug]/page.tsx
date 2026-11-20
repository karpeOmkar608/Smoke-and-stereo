import { getContent } from '@/lib/content';
import { notFound } from 'next/navigation';
import Link from 'next/link';
export default async function Info({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = await getContent();
  const pages: Record<string, [string, string]> = {
    shipping: ['SHIPPING', c.shippingPolicy],
    returns: ['RETURNS & REFUNDS', c.returnsPolicy],
    privacy: ['PRIVACY POLICY', c.privacyPolicy],
    terms: ['TERMS & CONDITIONS', c.termsPolicy],
    faq: ['FREQUENTLY ASKED QUESTIONS', 'Find answers about sizing, shopping, and your orders.'],
  };
  const page = pages[slug];
  if (!page) notFound();
  return (
    <>
      <div className="page-heading">
        <span className="eyebrow muted">HERE TO HELP</span>
        <h1>{page[0]}</h1>
      </div>
      <div className="page-content prose">
        <p>{page[1]}</p>
        {slug === 'faq' && (
          <>
            {[
              [
                'How do I choose a size?',
                'Use the size guide on each product page. Available sizes come directly from the current catalogue.',
              ],
              ['Can I check out as a guest?', 'Yes. An account is optional at checkout.'],
              [
                'Which payment methods are accepted?',
                'Available payment methods are displayed at checkout. Online payments open once a payment provider is connected and verified.',
              ],
              [
                'Where is my order?',
                'Sign in to view your order history. For guest orders, use the private order link provided after checkout.',
              ],
            ].map(([q, a]) => (
              <details key={q}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </>
        )}
        <Link href="/contact" className="text-link">
          CONTACT THE TEAM
        </Link>
      </div>
    </>
  );
}
