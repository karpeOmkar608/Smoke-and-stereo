# Validation and launch acceptance

## Automated local coverage

Run `npm test`, `npm run typecheck`, and `npm run build`. All external network calls in tests are mocked. Never run a real fulfilment order as a test without explicit authorization.

## Required staging tests (external services)

These are pending until Supabase, supplier credentials, a verified mapper and provider contracts are available. Local mock tests do not prove RLS or provider compatibility.

| Area               | Acceptance                                                                                                                                            |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Catalogue          | Real published response maps names, prices in verified currency units, images, parent/variant SKUs and availability correctly                         |
| Schema             | Empty response, missing optional fields, missing SKU, duplicate SKU, unsupported fields and malformed prices fail safely                              |
| Authentication     | Registration, confirmation, login, logout, expired token refresh, forgot/reset password and rejected callbacks                                        |
| Customer isolation | User A cannot read user B's orders, items, wishlist, addresses or saved cart                                                                          |
| Guest isolation    | Missing/wrong order capability token returns 404; private link is noindex with no-referrer                                                            |
| Write protection   | Anon and customers cannot insert/update totals, payment states, supplier responses, audit rows or site settings                                       |
| Admin              | User metadata role is ignored; only server-verified app metadata role grants access                                                                   |
| Atomicity          | Parallel same-key checkout creates one order and one item set; altered payload is rejected; rollback leaves no partial order                          |
| Supplier           | Validate success and rejection response semantics with official docs and explicitly authorized sandbox requests                                       |
| Ambiguity          | Lost response/timeout/worker interruption cannot cause repeat supplier submissions; manual reconciliation preserves evidence                          |
| Email              | Verified sender, delivery error, request replay, no forged order confirmation                                                                         |
| Cart               | Refresh persists, selecting unavailable variant is blocked, quantity capped, sign-in loads own cart, sign-out does not expose another customer's data |
| UI                 | Home, shop search/sort/filters, quick view, product image zoom, size selection, cart, checkout, empty and unavailable states                          |
| Responsive         | 360px, 768px, 1440px; no horizontal overflow; legible text and touch targets                                                                          |
| Accessibility      | Keyboard navigation, focus return/trap in dialogs, live validation status, reduced motion and labelled forms                                          |
| Policies           | Brand-approved shipping, returns, privacy and terms published before data collection and sales                                                        |

## Payment gateway completion

Online payments are intentionally unavailable. Before enabling a named gateway: test valid and invalid webhook signatures, replayed events, wrong amounts/currency, mismatched order IDs, delayed capture, declined payment, concurrent callbacks, verified refunds and provider lookup. Never mark paid from a browser response.
