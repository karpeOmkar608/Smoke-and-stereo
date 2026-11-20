import { NextResponse } from 'next/server';
import { sessionClient } from '@/lib/supabase/server';
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = await sessionClient();
    const {
      data: { user },
    } = await db.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
    const { data, error } = await db
      .from('orders')
      .select(
        'id,order_number,total_amount,order_status,integration_status,payment_status,created_at,order_items(*)',
      )
      .eq('id', id)
      .eq('user_id', user.id)
      .maybeSingle();
    if (error || !data) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Orders unavailable' }, { status: 503 });
  }
}
