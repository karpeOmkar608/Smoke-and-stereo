'use client';
import { Asterisk } from 'lucide-react';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="section empty-state">
      <span className="large-star" aria-hidden="true">
        <Asterisk className="ui-icon" size="1em" strokeWidth={1} />
      </span>
      <h1>THE SIGNAL DROPPED.</h1>
      <p>Something interrupted this page. Give it another try.</p>
      <button className="button acid" onClick={reset}>
        TRY AGAIN
      </button>
    </div>
  );
}
