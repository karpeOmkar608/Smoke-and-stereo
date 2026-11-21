import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
for (const name of ['culture-hero-concept', 'independent-campaign-concept']) {
  await sharp(fileURLToPath(new URL(`../public/campaigns/${name}.png`, import.meta.url)))
    .resize({ width: 1920, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(fileURLToPath(new URL(`../public/campaigns/${name}.webp`, import.meta.url)));
}
console.log('Campaign WebP assets ready.');
