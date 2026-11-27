import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/adminAuth';
import { listOrders, listStaff } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  const [orders, staff] = await Promise.all([listOrders({ limit: 300 }), listStaff()]);
  return NextResponse.json({ ok: true, orders, staff });
}
