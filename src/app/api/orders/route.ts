import { NextResponse } from 'next/server';
import { sessionClient } from '@/lib/supabase/server';
export async function GET() {
  try {
    const db = await sessionClient();
    const {
      data: { user },
    } = await db.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
    const { data, error } = await db
      .from('orders')
      .select('id,order_number,total_amount,order_status,created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ orders: data }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Orders are unavailable' }, { status: 503 });
  }
}
