import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getContent } from '@/lib/content';
import { publishedStories } from '@/lib/editorial';
import { CampaignImage, campaignAssets } from '@/components/editorial';
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const content = await getContent();
  const story = publishedStories(content.editorialStories).find((s) => s.slug === slug);
  return { title: story?.title || 'Culture', description: story?.excerpt };
}
export default async function Story({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const content = await getContent();
  const story = publishedStories(content.editorialStories).find((s) => s.slug === slug);
  if (!story) notFound();
  return (
    <>
      <header className="page-heading article-heading">
        <Link href="/culture" className="text-link">
          FREQUENCY / CULTURE
        </Link>
        <div className="journal-meta">
          <span>{story.category}</span>
          <time dateTime={story.publishedAt}>
            {new Date(story.publishedAt).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
              timeZone: 'Asia/Kolkata',
            })}
          </time>
        </div>
        <h1>{story.title}</h1>
        <p>{story.excerpt}</p>
      </header>
      <div className="article-image">
        <CampaignImage
          src={story.image || content.campaignImage || campaignAssets.campaign}
          alt={story.title}
        />
      </div>
      <article className="article-body">
        {story.body
          .split(/\n\s*\n/)
          .filter(Boolean)
          .map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        <Link href="/culture" className="text-link">
          BACK TO THE JOURNAL
        </Link>
      </article>
    </>
  );
}
