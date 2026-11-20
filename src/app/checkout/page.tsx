import { Checkout } from '@/components/checkout';
import { isDemoMode } from '@/lib/demo-mode';
export default function CheckoutPage() {
  const demo = isDemoMode();
  const raw = process.env.SHIPPING_AMOUNT_PAISE;
  const shipping =
    raw !== undefined && raw !== '' && Number.isSafeInteger(Number(raw)) && Number(raw) >= 0
      ? Number(raw)
      : null;
  const enabled = Boolean(
    process.env.COD_ENABLED === 'true' &&
    process.env.CATALOG_SCHEMA_VERIFIED === 'true' &&
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    shipping !== null,
  );
  return (
    <>
      <div className="page-heading">
        <span className="eyebrow muted">ALMOST IN YOUR ROTATION</span>
        <h1>CHECKOUT.</h1>
      </div>
      <div className="page-content">
        <Checkout enabled={demo || enabled} shipping={demo ? 0 : shipping} demo={demo} />
      </div>
    </>
  );
}
