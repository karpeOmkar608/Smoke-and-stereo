# Frontend redesign

## Plan

1. Preserve the normalized catalogue, variant identifiers, cart persistence, authentication, checkout, payment guards, order submission payload and database migrations.
2. Replace the visual system with industrial monochrome, self-hosted Anton / Space Grotesk typography, thin rules, oversized editorial composition and restrained motion.
3. Recompose the homepage around a cinematic campaign, manifesto, asymmetric product sequence, collection panels, CMS-managed culture journal, campaign and newsletter.
4. Refresh navigation, catalogue, product galleries, New Drops, collections, cart, account and admin styling; add an accessible bag drawer and mobile sticky purchase actions.
5. Extend only the existing JSON site-content contract for journal stories and an optional upcoming release. Do not create new database tables or fabricate publication/release dates.
6. Validate existing tests and critical demo shopping flows, check mobile/tablet/desktop layouts and production build. Live supplier, Supabase and payment verification remain subject to the pre-existing configuration limits documented in README.md.

## Reference and assets

Primary inspiration: [IRON THEORY by Phenomenon Studio](https://dribbble.com/shots/26791566-Brutalism-Ecommerce-Website-Design-IRON-THEORY). Its visual language informs composition; no reference branding, photography, product data, scarcity or discounts are copied.

Original campaign concept images were created with the built-in ImageGen tool. They illustrate styling and are separate from catalogue product photography. Existing demo fixtures remain explicitly enabled test data; real product components continue consuming the normalized catalogue.

Hero prompt: Original photorealistic monochrome campaign for Smoke & Stereo; a young adult Indian male model in a plain oversized washed-black tee, wide cargo trousers and heavy sneakers, standing in a brutalist concrete underpass at night. Hard flash, deep shadows, tactile grain, full body, center-right composition with negative space for website typography; no text, logos or UI. Brand styling concept, not a sale product.

Campaign prompt: Original monochrome independent Indian streetwear editorial; two young adult Indian models in an oversized hoodie and charcoal tee with wide trousers, beside concrete stairs and an industrial shutter. Documentary flash, deep shadows, full-length figures, tactile grain and negative space. No logos, article claims or catalogue-product implication.

Source PNGs: `public/campaigns/culture-hero-concept.png` and `public/campaigns/independent-campaign-concept.png`. Optimized web variants are used by the site; CMS image URLs take priority over bundled campaign concepts.

Final web assets: `public/campaigns/culture-hero-concept.webp` and `public/campaigns/independent-campaign-concept.webp`.

## Implementation and verification

- Replaced the global design system and storefront composition with the monochrome editorial direction. Added locally bundled Anton and Space Grotesk, an immersive scroll-layered hero, asymmetric product presentation, collection panels, a culture journal and a campaign-led footer.
- Refreshed product cards and product detail presentation while retaining normalized catalogue values. Gallery supports controls, thumbnails, keyboard navigation, pointer swipes and zoom; the information panel is sticky on desktop and the purchase bar is sticky on mobile.
- Added a focus-trapped bag drawer backed by the same cart store and a fullscreen mobile menu. Existing cart/account/admin/checkout views inherit the industrial design system.
- Added current/upcoming/archive drop tabs. Upcoming title, copy, image and confirmed date live in the existing `site_settings` content JSON. No confirmed date means no countdown; no archived SKU assignments means an honest empty archive.
- Added an editor for draft/published journal stories in the existing admin content form. Published stories alone are shown at `/culture` and `/culture/[slug]`. There are no fabricated interviews or news articles and no new database tables.
- Fixed a pre-existing Buy Now race by navigating through the Next.js client router, keeping the new cart line in shared state. Fixed local development origin normalization with a narrow loopback-only exception requiring the actual Host header, matching scheme and port. Production origin checking remains exact.
- Hash comparison confirmed catalogue fetching/mapping, supplier order payloads, checkout handlers, Supabase clients, newsletter handler, validation rules and SQL migration were unchanged. The content API was extended only to accept the new JSON content fields.
- TypeScript and 67 tests pass, covering existing commerce behavior plus gallery interaction, bag drawer state/focus, Buy Now routing, drop tab behavior, editorial publication validation and origin protection.
- The final Next.js production build passed, including all 25 static pages and dynamic route compilation.
- Browser checks covered desktop, 390px mobile and 768px tablet layouts; gallery navigation, size selection, adding to the bag, drawer quantity changes, mobile navigation, New Drops, collections, culture and successful demo checkout. No real orders, payments or emails were sent. Preview screenshot: `docs/redesign-home-desktop.jpg`.
- Hero WebP is about 182 KB and secondary campaign WebP about 142 KB. Below-the-fold imagery is lazy-loaded; fonts are self-hosted. No field Core Web Vitals benchmark was performed.

Live integration verification still requires the original project’s pending catalogue schema/credentials, Supabase setup, final policy/shipping rules and payment configuration. This frontend work does not enable or simulate those services. Run `npm run dev` to inspect the current local demo; use the existing deployment guide for Vercel.
