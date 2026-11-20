import Link from 'next/link';
export default function NotFound() {
  return (
    <div className="section empty-state">
      <span className="eyebrow acid-text">404 / OFF FREQUENCY</span>
      <h1>LOST IN THE STATIC.</h1>
      <p>This page isn’t in the rotation.</p>
      <Link className="button acid" href="/">
        BACK TO THE CULTURE
      </Link>
    </div>
  );
}
