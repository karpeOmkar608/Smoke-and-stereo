'use client';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="section empty-state">
      <span className="large-star">✳</span>
      <h1>THE SIGNAL DROPPED.</h1>
      <p>Something interrupted this page. Give it another try.</p>
      <button className="button acid" onClick={reset}>
        TRY AGAIN
      </button>
    </div>
  );
}
