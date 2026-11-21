import Link from 'next/link';
import type { EditorialStory } from '@/lib/editorial';
import { CampaignImage } from './editorial';

export function JournalPreview({ stories, image }: { stories: EditorialStory[]; image: string }) {
  if (!stories.length)
    return (
      <div className="journal-manifesto">
        <CampaignImage
          src={image}
          alt="Independent Indian streetwear campaign concept"
          sizes="(max-width: 760px) 100vw, 50vw"
        />
        <div>
          <span className="eyebrow">THE CULTURE BEHIND THE CLOTHES.</span>
          <h3>
            THE STREETS
            <br />
            HAVE A SOUND.
          </h3>
          <p>
            A space for Desi Hip-Hop, independent art, and the communities moving culture forward.
            Our journal begins with the things we stand for.
          </p>
          <Link href="/about" className="text-link">
            READ OUR STORY
          </Link>
          <span className="journal-footnote">A BRAND PERSPECTIVE. ALWAYS INDEPENDENT.</span>
        </div>
      </div>
    );
  return (
    <div className="journal-grid">
      {stories.map((story) => (
        <article key={story.slug}>
          <Link href={`/culture/${story.slug}`}>
            <CampaignImage
              src={story.image || image}
              alt={story.title}
              sizes="(max-width: 760px) 100vw, 33vw"
            />
            <div className="journal-meta">
              <span>{story.category}</span>
              <time dateTime={story.publishedAt}>
                {new Date(story.publishedAt).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  timeZone: 'Asia/Kolkata',
                })}
              </time>
            </div>
            <h3>{story.title}</h3>
            <p>{story.excerpt}</p>
            <span className="text-link">READ STORY</span>
          </Link>
        </article>
      ))}
    </div>
  );
}
