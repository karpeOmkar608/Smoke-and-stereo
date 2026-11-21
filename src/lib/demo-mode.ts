import 'server-only';

export function isDemoMode() {
  // Explicitly opt in on local, preview, or hosted demo deployments alike.
  // Checkout and supplier guards continue to prevent real transactions.
  return process.env.DEMO_CATALOG_ENABLED === 'true';
}

export function isDemoSku(sku: string) {
  return sku.toUpperCase().startsWith('DEMO-');
}
