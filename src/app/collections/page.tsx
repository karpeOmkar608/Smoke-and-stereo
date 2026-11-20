import Link from 'next/link';
export const metadata = { title: 'Collections' };
export default function Collections() {
  return (
    <>
      <div className="page-heading">
        <span className="eyebrow muted">PICK YOUR FREQUENCY</span>
        <h1>
          COLLECTIONS<span className="acid-text">.</span>
        </h1>
        <p>Different expressions. The same independent spirit.</p>
      </div>
      <div className="page-content collection-grid">
        {[
          'NEW DROPS',
          'GRAPHIC TEES',
          'OVERSIZED ESSENTIALS',
          'LIMITED EDITIONS',
          'BESTSELLERS',
        ].map((name) => (
          <Link
            className="collection-card"
            href={
              name === 'NEW DROPS' ? '/new-drops' : `/shop?collection=${encodeURIComponent(name)}`
            }
            key={name}
          >
            <span className="eyebrow muted">SMOKE & STEREO</span>
            <h2>{name}</h2>
            <span aria-hidden="true">✳</span>
          </Link>
        ))}
      </div>
    </>
  );
}
