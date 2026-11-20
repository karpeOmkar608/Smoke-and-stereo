import { requireAdmin, serviceClient } from '@/lib/supabase/server';
import { apiError } from '@/lib/http';
export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return apiError(new Error('Administrator access required'), 403);
  }
  const { data, error } = await serviceClient()
    .from('orders')
    .select(
      'order_number,created_at,customer_name,customer_email,order_status,integration_status,total_amount',
    )
    .order('created_at', { ascending: false })
    .limit(10000);
  if (error) return apiError(new Error('Export unavailable'), 503);
  const keys = [
    'order_number',
    'created_at',
    'customer_name',
    'customer_email',
    'order_status',
    'integration_status',
    'total_amount',
  ];
  const cell = (v: unknown) =>
    `"${String(v ?? '')
      .replace(/^[=+@\-\t\r]/, "'$&")
      .replaceAll('"', '""')}"`;
  const csv = [
    keys.join(','),
    ...(data || []).map((row) =>
      keys.map((k) => cell((row as Record<string, unknown>)[k])).join(','),
    ),
  ].join('\r\n');
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="smoke-stereo-orders.csv"',
      'Cache-Control': 'no-store',
    },
  });
}
