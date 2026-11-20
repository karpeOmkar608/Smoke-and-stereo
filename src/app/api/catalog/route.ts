import { NextResponse } from 'next/server';
import { getCatalog } from '@/lib/catalog';
export async function GET() {
  try {
    return NextResponse.json({ products: await getCatalog() });
  } catch {
    return NextResponse.json(
      { products: [], error: 'The catalogue is not available yet.' },
      { status: 503 },
    );
  }
}
