# Smoke & Stereo

Next.js App Router / React / TypeScript / Tailwind / Supabase storefront for an independent Indian streetwear label. Includes responsive editorial pages, catalogue-driven shop and product views, guest bag, checkout, accounts, saved addresses, order history, wishlist, admin content and merchandising tools, auditable supplier submissions, SQL migrations and tests.

## Current state — read before launch

This is a locally runnable implementation, **not a live, order-ready store**. No credentials, catalogue response, approved product photography, shipping rules, final policies, payment provider, or deployment account were supplied. Product data is deliberately absent. Nothing simulates a purchase or supplier acceptance.

The exact supplier response schema is unknown. `src/lib/catalog.ts` deliberately rejects mapping until a real redacted `/catalog` response is inspected and its mapper is implemented and tested. Setting the environment flag alone does not bypass this. The supplied create-order request contract is implemented; supplier success/duplicate/lookup semantics remain unverified, so responses are retained for manual reconciliation. Do not enable COD until these contracts are complete.

## Local setup

### Dummy data for testing

Set `DEMO_CATALOG_ENABLED=true` in `.env.local`, then restart `npm run dev`. The local workspace is configured with this flag for testing. Set it to `false` and restart to return to the real catalogue integration.

Demo mode supplies eight fictional products, original labelled SVG garment illustrations, multiple sizes, low stock and sold-out variants, featured products and collection assignments. Test shop search/filter/sort, product galleries, quick view, size selection, wishlist, cart persistence and checkout validation without external credentials. The checkout form has fictional prefilled details and a **Run demo checkout** button. Its confirmation is a dry-run result; no order, payment, email or supplier submission occurs, and customer details are not stored. Demo bags and wishlists use separate device storage and never synchronize to Supabase accounts.

Fixtures never enter the live catalogue cache. All demo SKUs are rejected by real checkout even after demo mode is disabled. The flag also enables explicitly requested hosted demos, including Vercel Production deployments. Keep it disabled on any storefront accepting real orders. Accounts and admin continue to require real Supabase configuration; they are not mocked by this switch.

For a GitHub-connected Vercel demo, add `DEMO_CATALOG_ENABLED` with value `true` to the deployment's environment (Production for the main domain, Preview for preview URLs), then redeploy the latest source. This flag alone enables the dummy catalogue, local demo bag/wishlist, and dry-run checkout; Supabase and supplier keys are not needed for these test flows. Environment changes do not update already-built pages. No `NEXT_PUBLIC_` prefix is required. The full application requires a Next.js server host; GitHub Pages alone cannot run its API routes and checkout.

Artwork sources are in `public/demo-products/`; regenerate with `node --experimental-strip-types scripts/generate-demo-assets.mjs`. These illustrations are test fixtures, not real product photography or catalogue inventory.

Requires Node 22.14+ and npm. Dependencies are pinned by `package-lock.json`.

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Open http://127.0.0.1:3000. Without configuration, editorial pages work and the shop has an honest prelaunch empty state. Accounts, newsletter and checkout return clear unavailable states.

## Supabase setup

1. Create a Supabase project. Apply `supabase/migrations/202611200001_initial.sql`, then `supabase/seed.sql` through SQL editor or Supabase CLI.
2. Populate `.env.local` from `.env.example`. Keep service-role and supplier credentials server-only. Never paste secrets into tracked files or chat.
3. Configure Auth site URL and redirect allowlist for `/auth/callback` on local and production domains. Enable email confirmations, configure SMTP, and set a minimum password length of 12.
4. Create a user through registration. Assign `app_metadata.role = admin` using a trusted Supabase administrative environment. User-editable `user_metadata` is never trusted for authorization. Reauthenticate after changing a role.
5. Create a public `brand-assets` Storage bucket for approved campaign images. Restrict writes to trusted administrators through Supabase. Set uploaded HTTPS URLs in `/admin`. Provider catalogue images remain authoritative for products. Image upload tooling is not included in the website admin.

All sensitive tables have RLS. Customers read only their own orders and items and cannot write prices or payment states. Service operations use the protected service role. Admin authorization is verified on every API action. Guest orders use a cryptographically derived private capability token; treat their links as private. There is no access by guessed order number or email alone.

## Complete the Indian Dropshippers integration

Documentation supplied: https://app.indiandropshippers.in/dashboard/docs (not accessible during development). Base: `https://indiandropshippers.com/api/external`.

1. Fetch `/catalog` privately using the `x-api-key` header. Save only a redacted fixture outside live source data. Never log the key.
2. Document the actual JSON envelope and fields for product SKU, variant SKU, name, image URLs, currency units, sizes, timestamps, availability, stock and pricing. Define exact TypeScript types plus runtime validation from that response.
3. Implement `mapProviderCatalog` and add schema contract tests. Reject missing SKUs, malformed prices and duplicate variant SKUs; handle optional fields without inventing availability. Internal prices are whole **paise**, never floats. Do not infer product price from unverified fields.
4. Verify what constitutes order acceptance, explicit rejection, timeout, duplicate protection, and whether lookup by website order number is supported. Add exact response validation and safe retry/reconciliation logic from those documented contracts. Current code conservatively holds all results for reconciliation and never blindly retries.
5. Set `CATALOG_SCHEMA_VERIFIED=true` only after the mapper and contract tests pass. Catalogue cache is 120 seconds; checkout always bypasses it. Admin can invalidate cache.

Merchandising stores only external SKU associations, editorial text, featured/hidden flags and collection assignments. It never copies the external catalogue or overrides provider pricing.

## Checkout and payments

The server validates delivery data, live variant availability and current catalogue prices. It ignores client price snapshots. Shipping is a configured nonnegative integer paise value, with explicit `0` for free shipping. No invented shipping rate or promotion is applied.

Order creation is a single Postgres transaction, guarded by an advisory lock and unique idempotency key. A SHA-256 request fingerprint detects reused keys with altered payloads. Items and totals commit together; numbers use a database sequence (`W-1001`, etc.). Supplier submission uses an atomic pending-to-processing claim and records an integration attempt before any network request. Ambiguous outcomes require supplier dashboard reconciliation. Admins can record an acceptance/rejection with evidence; they cannot blindly resubmit. Process interruption can leave `pending` or `processing` records; these must be reviewed before any manual action.

Online payments remain disabled, including the webhook endpoint. A provider secret alone never enables them. A named gateway needs verified signed webhooks, currency/amount/order matching, replay protection, provider-side payment verification, refund handling and end-to-end sandbox tests. Discount tables/redemption flows are intentionally not implemented without business rules.

Set `COD_ENABLED=true` only after provider acceptance is verified, policies are approved, integrations pass staging tests, and `SHIPPING_AMOUNT_PAISE` is configured. No real supplier orders were created during development.

Optional order emails use Resend with a verified sender (`RESEND_API_KEY`, `ORDER_EMAIL_FROM`). Delivery state is recorded. Email provider credentials absent means `not_sent`, never fake delivery. Automated email retries and newsletter unsubscribe/double-opt-in delivery flows still require completion before marketing launch.

## Admin

`/admin` supports recent-order metrics (latest 500), current month recorded paid sales, best-selling recorded SKUs, customer/order inspection, filters, CSV export (up to 10,000 orders, amounts in paise), evidence-based manual status/reconciliation, content editing, merchandising, and catalogue invalidation. Website-specific collections are comma-separated SKU associations.

CSV exports neutralize spreadsheet formula prefixes. Audit events record intended admin mutations. Admin image uploads use Supabase dashboard. Detailed persistent catalogue sync history, paginated full-order analytics, newsletter management, automated retries and discount management are not implemented. COD collection/payment reconciliation is manual; status updates do not invent a paid transaction.

## Validation

```powershell
npm run typecheck
npm test
npm run build
```

Tests exercise customer validation, injection rejection, quantities, server price/stock validation, unavailable and duplicate SKUs, missing supplier credentials, HTTP errors, unknown schemas, supplier payload shape, atomic claim behavior and timeout reconciliation. Fixtures are synthetic test-only data and are not shown in the storefront.

See `docs/TESTING.md` for staging integration/RLS/browser checks requiring external services. A passing build is not proof of a connected production integration.

## Vercel deployment

1. Push this directory to a private repository. Never commit `.env.local`.
2. Import into Vercel as Next.js, Node 22+, default `npm run build`. Set environment variables separately for preview and production.
3. Apply migrations to the intended Supabase project. Set production URL in Vercel environment and Supabase Auth allowlist. Configure verified SMTP and email sender.
4. Run the staging acceptance checklist with sandbox services, approved policies and real catalogue contract. Keep `COD_ENABLED=false` until complete.
5. Deploy, verify HTTPS, auth redirects, RLS, catalogue caching, checkout validation and order observability. Add durable rate limiting (Vercel firewall or shared store), monitoring, alerting, database backups, and reconciliation operations before accepting public traffic.

Sites hosting was not used: this project follows the explicitly requested full Next.js/Vercel runtime rather than converting server handlers to a static export or Cloudflare Worker. No deployment was performed without configured services or a deployment account.
