import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/adminAuth';
import { applyStatus } from '@/lib/order';
import { isStatus } from '@/lib/orderStatus';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as { status?: unknown };
  if (!isStatus(body.status)) return NextResponse.json({ ok: false, error: 'bad_status' }, { status: 400 });
  const order = await applyStatus(id, body.status, 'Admin panel');
  if (!order) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
  return NextResponse.json({ ok: true, order });
}
