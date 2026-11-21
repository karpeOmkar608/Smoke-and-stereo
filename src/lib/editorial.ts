import { z } from 'zod';
const imageUrl = z.union([
  z.literal(''),
  z.url().refine((value) => value.startsWith('https://'), 'Use an HTTPS image URL'),
]);
export const storySchema = z.object({
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .max(120),
  title: z.string().trim().min(1).max(180),
  category: z.string().trim().min(1).max(80),
  excerpt: z.string().max(500),
  body: z.string().max(20000),
  image: imageUrl,
  publishedAt: z
    .string()
    .refine((value) => !Number.isNaN(Date.parse(value)), 'Enter a publication date'),
  published: z.boolean(),
});
export const storiesSchema = z
  .array(storySchema)
  .max(30)
  .refine(
    (items) => new Set(items.map((item) => item.slug)).size === items.length,
    'Story slugs must be unique',
  );
export type EditorialStory = z.infer<typeof storySchema>;
export function parseStories(raw: string): EditorialStory[] {
  try {
    const parsed = storiesSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : [];
  } catch {
    return [];
  }
}
export function publishedStories(raw: string) {
  return parseStories(raw)
    .filter((story) => story.published)
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
}
