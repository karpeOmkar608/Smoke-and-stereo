import { describe, it, expect } from 'vitest';
import { parseStories, publishedStories } from '../src/lib/editorial';
const story = {
  slug: 'test-story',
  title: 'Test editorial fixture',
  category: 'Culture',
  excerpt: 'Test excerpt',
  body: 'First paragraph.\n\nSecond paragraph.',
  image: '',
  publishedAt: '2026-11-20',
  published: true,
};
describe('CMS editorial content', () => {
  it('publishes only explicitly published stories in date order', () => {
    const raw = JSON.stringify([
      { ...story, slug: 'draft', published: false },
      { ...story, slug: 'older', publishedAt: '2026-01-01' },
      story,
    ]);
    expect(publishedStories(raw).map((s) => s.slug)).toEqual(['test-story', 'older']);
  });
  it('fails closed for malformed content and invalid publication dates', () => {
    expect(parseStories('invalid')).toEqual([]);
    expect(parseStories(JSON.stringify([{ ...story, publishedAt: 'unknown' }]))).toEqual([]);
  });
  it('rejects duplicate story URLs', () => {
    expect(parseStories(JSON.stringify([story, story]))).toEqual([]);
  });
  it.each(['javascript:alert(1)', 'http://images.example/test.jpg'])(
    'rejects unsafe image URLs %s',
    (image) => {
      expect(parseStories(JSON.stringify([{ ...story, image }]))).toEqual([]);
    },
  );
});
