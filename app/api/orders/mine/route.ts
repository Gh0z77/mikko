import { NextResponse } from 'next/server';
import { ordersForTelegram } from '@/lib/db';
import { toPublic } from '@/lib/orderStatus';
import { verifyInitData } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

// Mini App: the signed Telegram initData proves who is asking.
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { initData?: string };
  const user = verifyInitData(body.initData ?? '', process.env.TELEGRAM_BOT_TOKEN ?? '');
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  return NextResponse.json({ ok: true, orders: (await ordersForTelegram(user.id, 10)).map(toPublic) });
}
