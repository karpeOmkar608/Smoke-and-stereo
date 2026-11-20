import { getContent } from '@/lib/content';
export const metadata = { title: 'Contact' };
export default async function Contact() {
  const c = await getContent();
  return (
    <>
      <div className="page-heading">
        <span className="eyebrow muted">LET’S TALK</span>
        <h1>ON YOUR FREQUENCY.</h1>
        <p>Questions about a drop, an order, or a collaboration? We’re listening.</p>
      </div>
      <div className="page-content prose">
        {c.contactEmail ? (
          <a className="button acid" href={`mailto:${c.contactEmail}`}>
            {c.contactEmail}
          </a>
        ) : (
          <p>
            Our support channel will be announced before the first drop. Check back here for contact
            details.
          </p>
        )}
      </div>
    </>
  );
}
