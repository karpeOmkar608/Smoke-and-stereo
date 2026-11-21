'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Product } from '@/types/commerce';
import { Shop } from './products';
import { CampaignImage } from './editorial';

export function DropBrowser({
  current,
  archive,
  upcoming,
}: {
  current: Product[];
  archive: Product[];
  upcoming: { title: string; date: string; image: string; copy: string };
}) {
  const [tab, setTab] = useState('current');
  const [now, setNow] = useState<number | null>(null);
  const release = Date.parse(upcoming.date);
  const hasDate = Number.isFinite(release);
  useEffect(() => {
    if (!hasDate) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [hasDate, release]);
  const remaining = hasDate && now !== null ? Math.max(0, release - now) : null;
  const units =
    remaining === null
      ? null
      : [
          Math.floor(remaining / 86400000),
          Math.floor(remaining / 3600000) % 24,
          Math.floor(remaining / 60000) % 60,
          Math.floor(remaining / 1000) % 60,
        ];
  const tabs = ['current', 'upcoming', 'archive'];
  return (
    <>
      <div className="drop-tabs" role="tablist" aria-label="Drop releases">
        {tabs.map((value, index) => (
          <button
            key={value}
            id={`drop-tab-${value}`}
            role="tab"
            aria-selected={tab === value}
            aria-controls={`drop-panel-${value}`}
            tabIndex={tab === value ? 0 : -1}
            onClick={() => setTab(value)}
            onKeyDown={(event) => {
              if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
              event.preventDefault();
              const next =
                tabs[(index + (event.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
              setTab(next);
              document.getElementById(`drop-tab-${next}`)?.focus();
            }}
          >
            {value.toUpperCase()}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`drop-panel-${tab}`} aria-labelledby={`drop-tab-${tab}`}>
        {tab === 'current' &&
          (current.length ? (
            <Shop products={current} />
          ) : (
            <div className="empty-state">
              <h2>
                THE NEXT FREQUENCY
                <br />
                IS BUILDING.
              </h2>
              <p>Get first access when the next release lands.</p>
              <Link href="/#frequency" className="button light">
                JOIN THE FREQUENCY
              </Link>
            </div>
          ))}
        {tab === 'archive' &&
          (archive.length ? (
            <Shop products={archive} />
          ) : (
            <div className="empty-state">
              <span className="eyebrow muted">PAST EXPRESSIONS.</span>
              <h2>THE ARCHIVE IS QUIET.</h2>
              <p>Archived collections will appear here when published.</p>
              <Link href="/collections" className="text-link">
                EXPLORE COLLECTIONS
              </Link>
            </div>
          ))}
        {tab === 'upcoming' &&
          (upcoming.title || hasDate ? (
            <div className="release-card">
              {upcoming.image && (
                <CampaignImage src={upcoming.image} alt={upcoming.title || 'Upcoming campaign'} />
              )}
              <div>
                <span className="eyebrow muted">UPCOMING RELEASE</span>
                <h2>{upcoming.title || 'THE NEXT DROP.'}</h2>
                {upcoming.copy && <p>{upcoming.copy}</p>}
                {hasDate && (
                  <>
                    <time dateTime={upcoming.date}>
                      {new Date(release).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        timeZone: 'Asia/Kolkata',
                      })}{' '}
                      IST
                    </time>
                    {units && remaining !== null && remaining > 0 && (
                      <div className="release-countdown" aria-label="Time until release">
                        {units.map((unit) => String(unit).padStart(2, '0')).join(' : ')}
                        <span className="eyebrow muted">DAYS / HOURS / MINUTES / SECONDS</span>
                      </div>
                    )}
                  </>
                )}
                <Link href="/#frequency" className="button light">
                  GET FIRST ACCESS
                </Link>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <span className="eyebrow muted">ON OUR OWN TIMING.</span>
              <h2>
                GOOD THINGS
                <br />
                TAKE THEIR TIME.
              </h2>
              <p>No upcoming release has been announced. Join the list for the first word.</p>
              <Link href="/#frequency" className="button light">
                STAY IN THE FREQUENCY
              </Link>
            </div>
          ))}
      </div>
    </>
  );
}
