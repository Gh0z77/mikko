import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { getOrder } from '@/lib/db';
import { toPublic } from '@/lib/orderStatus';

export const dynamic = 'force-dynamic';

// Customers track a site order with the private token they got at checkout.
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = new URL(request.url).searchParams.get('t') ?? '';
  const order = await getOrder(id);
  const ok = order && token.length === order.token.length && timingSafeEqual(Buffer.from(token), Buffer.from(order.token));
  if (!order || !ok) return NextResponse.json({ ok: false }, { status: 404 });
  return NextResponse.json({ ok: true, order: toPublic(order) });
}
