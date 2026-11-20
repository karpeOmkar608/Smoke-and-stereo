export default function Loading() {
  return (
    <div className="section" role="status" aria-label="Loading">
      <div className="loading-grid">
        {[0, 1, 2, 3].map((i) => (
          <div className="skeleton" key={i} />
        ))}
      </div>
      <p className="small muted">TUNING IN…</p>
    </div>
  );
}
