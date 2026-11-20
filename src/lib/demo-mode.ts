import 'server-only';

export function isDemoMode() {
  return process.env.DEMO_CATALOG_ENABLED === 'true' && process.env.VERCEL_ENV !== 'production';
}

export function isDemoSku(sku: string) {
  return sku.toUpperCase().startsWith('DEMO-');
}
