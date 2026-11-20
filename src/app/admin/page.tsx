import Link from 'next/link';
import { requireAdmin, serviceClient } from '@/lib/supabase/server';
import { getContent } from '@/lib/content';
import { catalogState } from '@/lib/catalog';
import { Admin } from '@/components/admin';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Studio admin', robots: { index: false, follow: false } };
export default async function AdminPage() {
  try {
    await requireAdmin();
  } catch {
    return (
      <div className="section empty-state">
        <h1>STUDIO ACCESS.</h1>
        <p>Sign in with an authorized administrator account to enter.</p>
        <Link href="/account" className="button acid">
          SIGN IN
        </Link>
      </div>
    );
  }
  const [content, catalog, result] = await Promise.all([
    getContent(),
    catalogState(),
    serviceClient()
      .from('orders')
      .select('*,order_items(*)')
      .order('created_at', { ascending: false })
      .limit(500),
  ]);
  return (
    <>
      <div className="page-heading">
        <span className="eyebrow acid-text">SMOKE & STEREO / STUDIO</span>
        <h1>CONTROL THE SIGNAL.</h1>
      </div>
      <div className="page-content">
        {result.error ? (
          <p className="error-message">
            Orders could not be loaded. Check your database migrations and connection.
          </p>
        ) : (
          <Admin
            content={content}
            orders={result.data || []}
            productCount={catalog.products.length}
          />
        )}
      </div>
    </>
  );
}
