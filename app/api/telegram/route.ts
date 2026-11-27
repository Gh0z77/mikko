import { NextResponse } from 'next/server';
import { placeOrder } from '@/lib/order';
import { verifyInitData } from '@/lib/telegram';

interface OrderPayload {
  type?: 'order';
  name?: string;
  phone?: string;
  address?: string;
  region?: string;
  comment?: string;
  delivery?: 'courier' | 'pickup';
  payment?: 'cash' | 'card';
  items?: { slug: string; size: string; color: string; qty: number }[];
  branchId?: string;
  lat?: number;
  lon?: number;
  /** Present when the order comes from the Telegram Mini App. */
  initData?: string;
}

// shortcut: in-memory rate limit, resets on redeploy and is per-instance; use Upstash/Redis if spam appears.
const hits = new Map<string, number[]>();
function limited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((time) => now - time < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 5;
}

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  if (limited(ip)) {
    return NextResponse.json({ ok: false, error: 'too_many_requests' }, { status: 429 });
  }

  let payload: OrderPayload;
  try {
    payload = (await request.json()) as OrderPayload;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }
  if (!payload || typeof payload !== 'object') {
    return NextResponse.json({ ok: false, error: 'invalid_payload' }, { status: 400 });
  }

  if (payload.type !== 'order') {
    return NextResponse.json({ ok: false, error: 'unknown_type' }, { status: 400 });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN ?? '';
  const customer = payload.initData ? verifyInitData(payload.initData, token) : null;
  const result = await placeOrder({
    ...payload,
    items: Array.isArray(payload.items) ? payload.items : [],
    customer,
    source: customer ? 'miniapp' : 'site',
  });

  if (result.ok) return NextResponse.json({ ok: true, orderId: result.id, token: result.token });
  const status = { missing_contact: 400, empty_cart: 400, save_failed: 500 }[result.error];
  return NextResponse.json({ ok: false, error: result.error }, { status });
}
