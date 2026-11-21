'use client';
import type { EditorialStory } from '@/lib/editorial';

export function EditorialEditor({
  stories,
  onChange,
}: {
  stories: EditorialStory[];
  onChange: (stories: EditorialStory[]) => void;
}) {
  function update(index: number, key: keyof EditorialStory, value: string | boolean) {
    onChange(stories.map((story, i) => (i === index ? { ...story, [key]: value } : story)));
  }
  return (
    <div className="span-two">
      <h3 style={{ fontSize: 30 }}>FREQUENCY / CULTURE JOURNAL</h3>
      <p className="small muted">
        Publish your own editorial stories. Drafts are private; only published stories appear in the
        journal. Save all content below when finished.
      </p>
      {stories.map((story, index) => (
        <div className="admin-story" key={index}>
          <header>
            <h3>{story.title || 'UNTITLED DRAFT'}</h3>
            <button
              type="button"
              className="text-link"
              onClick={() => onChange(stories.filter((_, i) => i !== index))}
            >
              REMOVE STORY
            </button>
          </header>
          <div className="form-grid">
            <label>
              Title
              <input
                required
                maxLength={180}
                value={story.title}
                onChange={(e) => update(index, 'title', e.target.value)}
              />
            </label>
            <label>
              URL slug
              <input
                required
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                maxLength={120}
                value={story.slug}
                onChange={(e) => update(index, 'slug', e.target.value)}
              />
            </label>
            <label>
              Category
              <input
                required
                maxLength={80}
                value={story.category}
                onChange={(e) => update(index, 'category', e.target.value)}
              />
            </label>
            <label>
              Publication date
              <input
                required
                type="date"
                value={story.publishedAt.slice(0, 10)}
                onChange={(e) => update(index, 'publishedAt', e.target.value)}
              />
            </label>
            <label className="span-two">
              Image URL (HTTPS)
              <input
                type="url"
                value={story.image}
                onChange={(e) => update(index, 'image', e.target.value)}
              />
            </label>
            <label className="span-two">
              Excerpt
              <textarea
                maxLength={500}
                value={story.excerpt}
                onChange={(e) => update(index, 'excerpt', e.target.value)}
              />
            </label>
            <label className="span-two">
              Story body
              <textarea
                maxLength={20000}
                value={story.body}
                onChange={(e) => update(index, 'body', e.target.value)}
              />
            </label>
            <label>
              <span>
                <input
                  type="checkbox"
                  checked={story.published}
                  onChange={(e) => update(index, 'published', e.target.checked)}
                />{' '}
                Published
              </span>
            </label>
          </div>
        </div>
      ))}
      <button
        type="button"
        className="button light"
        style={{ marginTop: 20 }}
        disabled={stories.length >= 30}
        onClick={() =>
          onChange([
            ...stories,
            {
              slug: '',
              title: '',
              category: '',
              excerpt: '',
              body: '',
              image: '',
              publishedAt: '',
              published: false,
            },
          ])
        }
      >
        ADD EDITORIAL STORY
      </button>
      <input type="hidden" name="editorialStories" value={JSON.stringify(stories)} />
    </div>
  );
}
