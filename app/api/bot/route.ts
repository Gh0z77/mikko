import { timingSafeEqual } from 'node:crypto';
import { after, NextResponse } from 'next/server';
import { handleUpdate, type Update } from '@/lib/bot';
import { webhookSecret } from '@/lib/site';

// Telegram webhook (Vercel). Logic lives in lib/bot.ts; scripts/bot-poll.mjs uses it locally.
export const maxDuration = 30;

function secretOk(header: string | null): boolean {
  const secret = webhookSecret();
  if (!secret || !header) return false;
  const a = Buffer.from(header);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  if (!secretOk(request.headers.get('x-telegram-bot-api-secret-token'))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  let update: Update;
  try {
    update = (await request.json()) as Update;
  } catch {
    return NextResponse.json({ ok: true });
  }

  // Ack Telegram immediately (no retries, no "bot is slow" feeling); finish the work after the response.
  after(async () => {
    try {
      await handleUpdate(update);
    } catch (error) {
      console.error('[bot] update failed', error);
    }
  });
  return NextResponse.json({ ok: true });
}
