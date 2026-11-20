# Validation record

New Drops page update: dedicated `/new-drops` route verified in the production build and desktop/mobile browser. The page shows four assigned demo releases, with a latest-release spotlight, search/filter/sort and product actions. Header navigation, the New Drops collection card, homepage CTA, footer and sitemap point to the dedicated route. TypeScript and all 47 tests pass; release-selection tests cover collection membership, missing dates and source-catalogue preservation. Mobile DOM width was within the viewport; the temporary viewport override was reset.

Demo catalogue update: TypeScript and all 44 tests pass. Eight fictional products and 16 labelled local SVG illustrations support catalogue/cart testing; demo checkout validates without database, supplier, payment or email calls. Tests cover mode gating, real-checkout rejection of demo SKUs, supplier-call blocking, stock limits, invalid details, and Vercel production exclusion.

Verified locally on 20 November 2026:

- Next.js 16.4.6 production compilation, TypeScript checks, all 22 static pages, and route generation succeeded using Webpack. Turbopack encountered a local worker-process panic, so dev/build scripts explicitly select Webpack. Build concurrency is capped at two workers after the machine exhausted memory with eleven workers.
- 34 automated tests pass across four suites. Includes client variant selection, bag add/remove/persistence and device snapshot isolation, quick-view Escape and focus return, debounced search, disabled checkout, and server validation/submission behavior.
- Browser: desktop homepage rendered; homepage-to-shop navigation succeeded; 390px mobile homepage and shop reviewed without horizontal overflow; mobile menu opened and returned home; empty bag and account page rendered; signed-out admin view denied access. Temporary viewport override was reset after verification.
- Local homepage returned HTTP 200.
- No real supplier orders, payments, emails, customer accounts, or database writes were performed.

Pending external configuration: live catalogue schema mapping; Supabase migrations and RLS integration tests; supplier acceptance/idempotency contracts; gateway verification; email delivery; approved imagery/policies; deployment and production acceptance. See TESTING.md and README.md.
